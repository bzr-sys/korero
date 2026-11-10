import { computed, ref, type Ref } from 'vue'
import { defineStore } from 'pinia'

import { bzr } from '@/bazaar'
import {
  arrayMirrorSubscribeListener,
  type DeepPartial,
  type User,
  type Org,
  type PermissionGroup,
  CollectionAPI,
  GranteeType,
  PermissionType,
  noSharingNotification,
  isNoPermissionError,
  BazaarContext,
  type Permission
} from '@bzr/bazaar'
import type { Channel, Config, Conversation, Message, Workspace } from '@/types'
import { dateStrToISO } from '@/date'

const CONFIG_COLLECTION = 'configs'
const CHANNEL_COLLECTION = 'channels'
const CONVERSATION_COLLECTION = 'conversations'
const MESSAGE_COLLECTION = 'messages'

const emptyUser: User = {
  id: '',
  email: '',
  name: '',
  handle: ''
}

const emptyGroup: PermissionGroup = {
  id: '',
  label: '',
  members: []
}

// The group reads messages, only its author changes one
async function grantMessagePermissions(bzrCtx: BazaarContext, teamId: string) {
  await bzrCtx.permissions.create(
    {
      collectionName: MESSAGE_COLLECTION,
      granteeType: GranteeType.ORG,
      granteeId: teamId,
      types: [PermissionType.READ],
      filter: { group: { $in: '$groups' } }
    },
    noSharingNotification
  )
  await bzrCtx.permissions.create(
    {
      collectionName: MESSAGE_COLLECTION,
      granteeType: GranteeType.ORG,
      granteeId: teamId,
      types: [PermissionType.INSERT, PermissionType.UPDATE, PermissionType.DELETE],
      filter: { group: { $in: '$groups' }, authorId: '$user' }
    },
    noSharingNotification
  )
}

// Older teams have one grant letting the group change anyone's messages. Grants
// add up, so it has to go. The new ones come first: nobody loses access meanwhile.
async function tightenMessagePermissions(bzrCtx: BazaarContext, teamId: string) {
  try {
    const grants = await bzrCtx.permissions.list({
      collectionName: MESSAGE_COLLECTION,
      granteeType: GranteeType.ORG,
      granteeId: teamId
    })
    const isAuthorOnly = (grant: Permission) => grant.filter?.authorId === '$user'
    const old = grants.filter(
      (grant) => grant.types.includes(PermissionType.UPDATE) && !isAuthorOnly(grant)
    )
    if (old.length === 0) {
      return
    }
    if (!grants.some(isAuthorOnly)) {
      await grantMessagePermissions(bzrCtx, teamId)
    }
    await Promise.all(old.map((grant) => bzrCtx.permissions.delete(grant.id)))
  } catch (e: unknown) {
    // Tried again on the next sign-in
    console.error('Could not tighten message permissions', e)
  }
}

// Only admins create collections. One signing in sets up all of them, so members
// never run into a missing one. False: a member has to wait for that.
async function setUpCollections(
  bzrCtx: BazaarContext,
  collections: [
    string,
    CollectionAPI<Channel> | CollectionAPI<Conversation> | CollectionAPI<Message>
  ][]
): Promise<boolean> {
  try {
    const existing = await bzrCtx.collections.list()
    for (const [name, collection] of collections) {
      if (!existing.includes(name)) {
        // Using a missing collection creates it and runs its onCreate
        await collection.getAll({}, { endOffset: 1 })
      }
    }
    return true
  } catch (e: unknown) {
    if (isNoPermissionError(e)) {
      return false
    }
    // Anything else shows up where the collection gets used
    console.error('Could not set up collections', e)
    return true
  }
}

export const useKoreroStore = defineStore('korero', () => {
  const loaded = ref(false)
  const authenticated = ref(false)

  const state: Ref<
    | {
        config: Config
        bzr: BazaarContext
        channelCollection: CollectionAPI<Channel>
        conversationCollection: CollectionAPI<Conversation>
        messageCollection: CollectionAPI<Message>
      }
    | undefined
  > = ref(undefined)

  const hasCompletedOnboarding = computed(() => !!state.value)

  // The workspace has collections missing, and this user can't create them
  const awaitingSetup = ref(false)

  const isSideBarExpanded = ref(false)

  function toggleSideBarExpanded(): void {
    isSideBarExpanded.value = !isSideBarExpanded.value
  }

  const user: Ref<User> = ref(emptyUser)
  const orgs: Ref<Org[]> = ref([])
  const users: Ref<{ [key: string]: User }> = ref({})
  const groups: Ref<{ [key: string]: PermissionGroup }> = ref({})

  async function setOrgs() {
    orgs.value = await bzr.orgs.list()
  }

  const activeOrgs = computed(() => orgs.value.filter((o) => o.active))

  function getOrg(id: string): Org | undefined {
    return orgs.value.find((o) => o.id === id)
  }

  function getUser(id: string): User {
    const user = users.value[id]
    if (user) {
      return user
    }
    cacheUser(id)
    return emptyUser
  }

  const currentWorkspace = computed<Workspace | null>(() => {
    if (!state.value) return null
    // Active workspace is personal user
    if (state.value.config.currentTeam === user.value.id) {
      return {
        id: user.value.id,
        name: 'Personal',
        handle: user.value.handle,
        type: 'user'
      }
    }
    // Active workspace is an org
    const activeOrg = getOrg(state.value.config.currentTeam)
    if (!activeOrg) return null
    return {
      id: activeOrg.id,
      name: activeOrg.name,
      handle: activeOrg.handle,
      type: 'org'
    }
  })

  function getGroup(id: string): PermissionGroup {
    const group = groups.value[id]
    if (group) {
      return group
    }
    cacheGroup(id)
    return emptyGroup
  }

  const configCollection = bzr.collection<Config>(CONFIG_COLLECTION)

  async function autoSignIn() {
    if (bzr.isLoggedIn()) {
      try {
        // TODO get all entities that can have channels (user, org, teams?)
        user.value = await bzr.social.getUser()

        // Get config
        const c = await configCollection.getAll()
        if (c.length) {
          await setState(c[0])

          // Get channels
          syncChannels()
          syncConversations()
        }

        // Get orgs
        orgs.value = await bzr.orgs.list()

        authenticated.value = true
        loaded.value = true
      } catch (e: unknown) {
        console.error('Error during auto-sign in', e)
      }
    } else {
      loaded.value = true
    }
  }

  async function setState(config: Config) {
    const bzrCtx = await bzr.createContext({ ownerId: config.currentTeam })
    const previous = state.value?.bzr
    const collections = {
      channelCollection: bzrCtx.collection<Channel>(CHANNEL_COLLECTION, {
        onCreate: async () => {
          // create permissions for group
          await bzrCtx.permissions.create(
            {
              collectionName: CHANNEL_COLLECTION,
              granteeType: GranteeType.ORG,
              granteeId: config.currentTeam,
              types: [
                PermissionType.INSERT,
                PermissionType.UPDATE,
                PermissionType.DELETE,
                PermissionType.READ
              ],
              filter: { group: { $in: '$groups' } }
            },
            noSharingNotification
          )
        }
      }),
      conversationCollection: bzrCtx.collection<Conversation>(CONVERSATION_COLLECTION, {
        onCreate: async () => {
          // create permissions for group
          await bzrCtx.permissions.create(
            {
              collectionName: CONVERSATION_COLLECTION,
              granteeType: GranteeType.ORG,
              granteeId: config.currentTeam,
              types: [
                PermissionType.INSERT,
                PermissionType.UPDATE,
                PermissionType.DELETE,
                PermissionType.READ
              ],
              filter: { group: { $in: '$groups' } }
            },
            noSharingNotification
          )
        }
      }),
      messageCollection: bzrCtx.collection<Message>(MESSAGE_COLLECTION, {
        onCreate: async () => {
          await grantMessagePermissions(bzrCtx, config.currentTeam)
          // TODO create permission to create backlinks
        }
      })
    }
    // Before state: the views use the collections as soon as it's there
    awaitingSetup.value = !(await setUpCollections(bzrCtx, [
      [CHANNEL_COLLECTION, collections.channelCollection],
      [CONVERSATION_COLLECTION, collections.conversationCollection],
      [MESSAGE_COLLECTION, collections.messageCollection]
    ]))
    state.value = { config: config, bzr: bzrCtx, ...collections }
    if (!awaitingSetup.value) {
      await tightenMessagePermissions(bzrCtx, config.currentTeam)
    }
    void previous?.close()
    // Reset
    channels.value = []
    conversations.value = []
    messages.value = []
    currentChannel.value = undefined
    currentConversation.value = undefined
    groups.value = {}
  }

  async function setTeam(teamId: string) {
    let config
    if (state.value) {
      if (!state.value.config.teams.includes(teamId)) {
        state.value.config.teams.push(teamId)
      }
      state.value.config.currentTeam = teamId
      await configCollection.updateOne(state.value.config.id, state.value.config)
      config = state.value.config
    } else {
      const newConfig = { currentTeam: teamId, teams: [teamId] }
      const configId = await configCollection.insertOne(newConfig)
      config = { id: configId, ...newConfig }
    }
    await syncChannels()
    await syncConversations()
    await setState(config)
  }

  async function checkSetup() {
    if (!state.value) {
      return
    }
    await setState(state.value.config)
    syncChannels()
    syncConversations()
  }

  //
  // Load and manage channels in a team
  //

  const channels: Ref<Channel[]> = ref([])

  async function syncChannels() {
    if (!state.value || awaitingSetup.value) {
      return
    }
    channels.value = await state.value.channelCollection.getAll()

    return
  }

  async function createChannel(name: string, members: string[]): Promise<string> {
    if (!state.value) {
      return ''
    }
    // Create group
    const newGroup = { label: 'channel-' + name, members: members }
    const { id } = await state.value.bzr.permissions.groups.create(newGroup)
    groups.value[id] = { id, ...newGroup }

    const channelId = await state.value.channelCollection.insertOne({
      name: name,
      description: '',
      archived: false,
      group: id
    })

    await syncChannels()

    return channelId
  }

  //
  // Load and manage conversations in a channel
  //

  const conversations: Ref<Conversation[]> = ref([])
  let unsubscribeConversations: (() => Promise<string>) | undefined = undefined

  async function syncConversations() {
    if (!state.value || awaitingSetup.value) {
      return
    }

    if (unsubscribeConversations) {
      unsubscribeConversations()
      unsubscribeConversations = undefined
    }

    conversations.value = []
    unsubscribeConversations = await state.value.conversationCollection.subscribeAll(
      {},
      arrayMirrorSubscribeListener<Conversation>(conversations.value)
    )
  }

  const currentChannel: Ref<Channel | undefined> = ref(undefined)
  async function setChannel(id: string) {
    if (!state.value) {
      return
    }
    if (currentChannel.value && currentChannel.value.id === id) {
      return
    }
    currentChannel.value = channels.value.find((c) => {
      return c.id === id
    })

    if (!currentChannel.value) {
      currentChannel.value = (await state.value.channelCollection.getOne(id)) ?? undefined
    }
  }

  function getChannel(id: string): Channel {
    return (
      channels.value.find((c) => c.id === id) || {
        id: '',
        name: 'Unknown Channel',
        description: '',
        archived: false,
        group: ''
      }
    )
  }

  function getChannelName(channelId: string): string {
    const channel = channels.value.find((c) => c.id === channelId)
    return channel?.name || ''
  }

  async function createConversation(conversation: Omit<Conversation, 'id'>) {
    if (state.value) {
      return state.value.conversationCollection.insertOne(conversation)
    }
  }

  function editConversation(conversationId: string | undefined) {
    return async (text: string) => {
      if (!currentConversation.value || currentConversation.value.id !== conversationId) {
        return
      }
      if (state.value) {
        const history = currentConversation.value.editHistory || []
        history.push({
          authorId: user.value.id,
          ts: dateStrToISO(),
          message: currentConversation.value.message
        })
        await state.value.conversationCollection.updateOne(conversationId, {
          message: text,
          editHistory: history
        })
        return
      }
    }
  }

  //
  // Load and manage messages in a conversation
  //

  const currentConversation = ref(undefined as Conversation | undefined)
  let unsubscribeConversation: (() => Promise<string>) | undefined = undefined

  const messages = ref([] as Message[])

  const orderedMessages = computed(() =>
    messages.value.sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime())
  )

  let unsubscribeMessages: (() => Promise<string>) | undefined = undefined

  async function setConversation(id: string) {
    if (!state.value) {
      return
    }
    if (currentConversation.value && currentConversation.value.id === id) {
      return
    }
    if (unsubscribeConversation) {
      unsubscribeConversation()
      unsubscribeConversation = undefined
    }

    // Why not mirror currentConversation?
    // It does not work, probably because currentConversation is not set when this returns

    currentConversation.value = conversations.value.find((c) => {
      return c.id === id
    })

    if (!currentConversation.value) {
      currentConversation.value = (await state.value.conversationCollection.getOne(id)) ?? undefined
    }

    if (!currentConversation.value) return

    setChannel(currentConversation.value.channelId)

    unsubscribeConversation = await state.value.conversationCollection.subscribeOne(id, {
      onChange: (_, newDoc) => (currentConversation.value = newDoc)
    })

    if (unsubscribeMessages) {
      unsubscribeMessages()
      unsubscribeMessages = undefined
    }

    // TODO how to make sure only members of this channel can read these messages?
    messages.value = []
    unsubscribeMessages = await state.value.messageCollection.subscribeAll(
      { conversationId: id },
      arrayMirrorSubscribeListener<Message>(messages.value)
    )
  }

  async function createMessage(message: Omit<Message, 'id' | 'created' | 'authorId' | 'group'>) {
    if (!state.value || !currentChannel.value) {
      return
    }
    const newMessage = {
      ...message,
      created: dateStrToISO(),
      authorId: user.value.id,
      group: currentChannel.value.group
    }

    return state.value.messageCollection.insertOne(newMessage)
  }

  function editMessage(messageId: string) {
    return async (text: string) => {
      if (!state.value) {
        return
      }
      const message = await state.value.messageCollection.getOne(messageId)
      if (!message) {
        return
      }

      const history = message.editHistory || []
      history.push({
        authorId: user.value.id,
        ts: dateStrToISO(),
        text: message.text
      })
      await state.value.messageCollection.updateOne(messageId, {
        text: text,
        editHistory: history
      })
      return
    }
  }

  async function cacheUser(userId: string): Promise<void> {
    const cachedUser = users.value[userId]
    if (!cachedUser) {
      const fetchedUser = await bzr.social.getUser({ userId })
      if (fetchedUser) {
        users.value[fetchedUser.id] = fetchedUser
      }
    }
  }

  async function cacheGroup(groupId: string): Promise<void> {
    if (!state.value) {
      return
    }
    const cachedGroup = groups.value[groupId]
    if (!cachedGroup) {
      const fetchedGroup = await state.value.bzr.permissions.groups.get(groupId)
      if (fetchedGroup) {
        groups.value[fetchedGroup.id] = fetchedGroup
      }
    }
  }

  // Like getGroup, but waits for it to load
  async function loadGroup(groupId: string): Promise<PermissionGroup | undefined> {
    await cacheGroup(groupId)
    return groups.value[groupId]
  }

  async function addGroupMember(groupId: string, memberId: string) {
    if (!state.value) {
      return
    }
    await state.value.bzr.permissions.groups.addMember(groupId, memberId)
    const newGroup = await state.value.bzr.permissions.groups.get(groupId)

    if (newGroup) {
      groups.value[newGroup.id] = newGroup
    }
  }

  async function removeGroupMember(groupId: string, memberId: string) {
    if (!state.value) {
      return
    }
    await state.value.bzr.permissions.groups.removeMember(groupId, memberId)
    const newGroup = await state.value.bzr.permissions.groups.get(groupId)

    if (newGroup) {
      groups.value[newGroup.id] = newGroup
    }
  }

  async function updateConversation(id: string, doc: DeepPartial<Conversation>) {
    if (state.value) {
      return state.value.conversationCollection.updateOne(id, doc)
    }
  }

  return {
    user,
    getUser,
    currentWorkspace,
    users,
    getGroup,
    loadGroup,
    addGroupMember,
    removeGroupMember,
    groups,
    state,
    hasCompletedOnboarding,
    isSideBarExpanded,
    toggleSideBarExpanded,
    orgs,
    activeOrgs,
    setOrgs,
    getOrg,
    loaded,
    authenticated,
    autoSignIn,

    // Org view
    syncChannels,
    channels,
    setTeam,
    awaitingSetup,
    checkSetup,
    createChannel,

    // Channel view
    currentChannel,
    conversations,
    setChannel,
    getChannel,
    getChannelName,
    // addMember,

    createConversation,
    editConversation,

    // Conversation view
    currentConversation,
    messages,
    orderedMessages,
    setConversation,
    createMessage,
    editMessage,
    updateConversation,
    syncConversations
  }
})
