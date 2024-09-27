import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'

import { bzr } from '@/bazaar'
import {
  arrayMirrorSubscribeListener,
  type BazaarMessage,
  type DeepPartial,
  type User,
  type Org,
  type PermissionGroup,
  CollectionAPI,
  GranteeType,
  PermissionType,
  noSharingNotification,
  BazaarContext
} from '@bzr/bazaar'
import { type Channel, type Config, type Conversation, type Message } from '@/types'
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

  const user: Ref<User> = ref(emptyUser)
  const orgs: Ref<Org[]> = ref([])
  const users: Ref<{ [key: string]: User }> = ref({})
  const groups: Ref<{ [key: string]: PermissionGroup }> = ref({})

  function getUser(id: string): User {
    const user = users.value[id]
    if (user) {
      return user
    }
    cacheUser(id)
    return emptyUser
  }

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
    console.log('autosignin:', bzr.isLoggedIn())
    if (bzr.isLoggedIn()) {
      try {
        // TODO get all entities that can have channels (user, org, teams?)
        user.value = await bzr.social.getUser()

        // Get config
        const c = await configCollection.getAll()
        if (c.length) {
          setState(c[0])

          // Get channels
          syncChannels()
          syncConversations()
        }

        // Get orgs
        // @ts-ignore
        orgs.value = await bzr.orgs.list()
        console.log(orgs.value)

        authenticated.value = true
        loaded.value = true
      } catch (e: unknown) {
        console.error('Error during auto-sign in', e)
      }
    } else {
      loaded.value = true
    }
  }

  function setState(config: Config) {
    const bzrCtx = bzr.createContext({ ownerId: config.currentTeam })
    state.value = {
      config: config,
      bzr: bzrCtx,
      channelCollection: bzrCtx.collection<Channel>(CHANNEL_COLLECTION, {
        onCreate: async () => {
          // create permissions for group
          bzrCtx.permissions.create(
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
          bzrCtx.permissions.create(
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
          // create permissions for group
          bzrCtx.permissions.create(
            {
              collectionName: MESSAGE_COLLECTION,
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
      })
    }
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
    router.push({ name: 'home' })
    setState(config)
    await syncChannels()
    await syncConversations()
  }

  //
  // Load and manage channels in a team
  //

  const channels: Ref<Channel[]> = ref([])

  async function syncChannels() {
    if (!state.value) {
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
    // @ts-ignore
    const { id } = await state.value.bzr.permissions.groups.create(newGroup)
    groups.value[id] = { id, ...newGroup }

    return state.value.channelCollection.insertOne({
      name: name,
      description: '',
      archived: false,
      group: id
    })
  }

  //
  // Load and manage conversations in a channel
  //

  const conversations: Ref<Conversation[]> = ref([])
  let unsubscribeConversations: (() => Promise<BazaarMessage>) | undefined = undefined

  async function syncConversations() {
    if (!state.value) {
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
      currentChannel.value = await state.value.channelCollection.getOne(id)
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

  async function createConversation(conversation: Omit<Conversation, 'id'>) {
    if (state.value) {
      return state.value.conversationCollection.insertOne(conversation)
    }
  }

  //
  // Load and manage messages in a conversation
  //

  const currentConversation = ref(undefined as Conversation | undefined)
  let unsubscribeConversation: (() => Promise<BazaarMessage>) | undefined = undefined

  const messages = ref([] as Message[])

  let unsubscribeMessages: (() => Promise<BazaarMessage>) | undefined = undefined

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
      currentConversation.value = await state.value.conversationCollection.getOne(id)
    }

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
      // @ts-ignore
      const fetchedGroup = await state.value.bzr.permissions.groups.get(groupId)
      if (fetchedGroup) {
        groups.value[fetchedGroup.id] = fetchedGroup
      }
    }
  }

  async function addGroupMember(groupId: string, memberId: string) {
    if (!state.value) {
      return
    }
    // @ts-ignore
    await state.value.bzr.permissions.groups.addMember(groupId, memberId)
    // @ts-ignore
    const newGroup = await state.value.bzr.permissions.groups.get(groupId)

    if (newGroup) {
      groups.value[newGroup.id] = newGroup
    }
  }

  async function removeGroupMember(groupId: string, memberId: string) {
    if (!state.value) {
      return
    }
    // @ts-ignore
    await state.value.bzr.permissions.groups.removeMember(groupId, memberId)
    // @ts-ignore
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
    users,
    getGroup,
    addGroupMember,
    removeGroupMember,
    groups,
    state,
    orgs,
    loaded,
    authenticated,
    autoSignIn,

    // Org view
    syncChannels,
    channels,
    setTeam,
    createChannel,

    // Channel view
    currentChannel,
    conversations,
    setChannel,
    getChannel,
    // addMember,

    createConversation,

    // Conversation view
    currentConversation,
    messages,
    setConversation,
    createMessage,
    updateConversation
  }
})
