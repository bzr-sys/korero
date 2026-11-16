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
import router from '@/router'

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

  // Which org this user last opened, in their own DB
  const config: Ref<Config | undefined> = ref(undefined)

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
    // Bazaar returns them in no particular order
    orgs.value = (await bzr.orgs.list()).sort((a, b) => a.name.localeCompare(b.name))
  }

  function getOrg(id: string): Org | undefined {
    return orgs.value.find((o) => o.id === id)
  }

  // Undefined: none chosen yet, or the user left it
  const currentOrg = computed(() => (config.value ? getOrg(config.value.currentTeam) : undefined))

  // Only org owners can subscribe
  function isOrgAdmin(org: Org): boolean {
    return org.admins.includes(user.value.id)
  }

  // What a signed-in user sees. Korero only runs in an org on an org plan.
  const gate = computed<'choose' | 'plan' | 'setup' | 'loading' | 'ready'>(() => {
    if (!currentOrg.value) return 'choose'
    // Orgs can only buy org plans, so active = on an org plan
    if (!currentOrg.value.active) return 'plan'
    if (awaitingSetup.value) return 'setup'
    if (!state.value) return 'loading'
    return 'ready'
  })

  // The org used last is gone: personal (no longer offered) or left
  const lostOrg = computed(() => !!config.value && !currentOrg.value)

  function getUser(id: string): User {
    const user = users.value[id]
    if (user) {
      return user
    }
    cacheUser(id)
    return emptyUser
  }

  const currentWorkspace = computed<Workspace | null>(() => {
    const org = currentOrg.value
    if (!state.value || !org) return null
    return { id: org.id, name: org.name, handle: org.handle, type: 'org' }
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
        user.value = await bzr.social.getUser()
        await setOrgs()
        config.value = (await configCollection.getAll())[0]
        if (!(await chooseOnlyOrg())) {
          await openOrg()
        }

        authenticated.value = true
        loaded.value = true
      } catch (e: unknown) {
        console.error('Error during auto-sign in', e)
      }
    } else {
      loaded.value = true
    }
  }

  // Bazaar has no event for joining, leaving or subscribing: check on return
  window.addEventListener('focus', () => {
    if (authenticated.value) void refresh()
  })

  // One at a time: closing a popup also focuses the window
  let refreshing: Promise<void> | undefined
  function refresh(): Promise<void> {
    refreshing ??= reloadOrgs().finally(() => (refreshing = undefined))
    return refreshing
  }

  // Reopens the current org if it changed (plan, membership) or waits for setup
  async function reloadOrgs() {
    const key = () => `${currentOrg.value?.id}:${currentOrg.value?.active}`
    const before = key()
    await setOrgs()
    if (await chooseOnlyOrg()) {
      return
    }
    if (key() !== before || awaitingSetup.value) {
      await openOrg()
    }
  }

  // Nothing to choose from: no org open yet and exactly one to open
  async function chooseOnlyOrg(): Promise<boolean> {
    if (currentOrg.value || orgs.value.length !== 1) {
      return false
    }
    await chooseOrg(orgs.value[0]!.id)
    return true
  }

  // Opens the current org, if it is on a plan. Clears everything from the one before.
  let opening = 0
  async function openOrg() {
    const mine = ++opening
    void state.value?.bzr.close()
    state.value = undefined
    awaitingSetup.value = false
    channels.value = []
    conversations.value = []
    messages.value = []
    currentChannel.value = undefined
    currentConversation.value = undefined
    groups.value = {}

    if (!config.value || !currentOrg.value?.active) {
      return
    }
    const bzrCtx = await bzr.createContext({ ownerId: config.value.currentTeam })
    const opened = await setState(config.value, bzrCtx)
    // Switched again meanwhile
    if (mine !== opening) {
      void bzrCtx.close()
      return
    }
    awaitingSetup.value = !opened.ready
    state.value = opened.state
    syncChannels()
    syncConversations()
  }

  async function setState(config: Config, bzrCtx: BazaarContext) {
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
    const ready = await setUpCollections(bzrCtx, [
      [CHANNEL_COLLECTION, collections.channelCollection],
      [CONVERSATION_COLLECTION, collections.conversationCollection],
      [MESSAGE_COLLECTION, collections.messageCollection]
    ])
    if (ready) {
      await tightenMessagePermissions(bzrCtx, config.currentTeam)
    }
    return { ready, state: { config, bzr: bzrCtx, ...collections } }
  }

  // Remembers the org and opens it. Its own data starts at Home.
  async function chooseOrg(orgId: string) {
    if (config.value) {
      const teams = config.value.teams.includes(orgId)
        ? config.value.teams
        : [...config.value.teams, orgId]
      await configCollection.updateOne(config.value.id, { currentTeam: orgId, teams })
      config.value = { ...config.value, currentTeam: orgId, teams }
    } else {
      const newConfig = { currentTeam: orgId, teams: [orgId] }
      const id = await configCollection.insertOne(newConfig)
      config.value = { id, ...newConfig }
    }
    void router.push({ name: 'home' })
    await openOrg()
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
    isSideBarExpanded,
    toggleSideBarExpanded,
    orgs,
    setOrgs,
    getOrg,
    config,
    currentOrg,
    isOrgAdmin,
    gate,
    lostOrg,
    chooseOrg,
    refresh,
    loaded,
    authenticated,
    autoSignIn,

    // Org view
    syncChannels,
    channels,
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
