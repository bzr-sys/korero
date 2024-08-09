import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'

import { bzr } from '@/bazaar'
import {
  arrayMirrorSubscribeListener,
  type BazaarMessage,
  type DeepPartial,
  type Doc,
  type User
} from '@bzr/bazaar'
import { type Config, type Conversation, type Message } from '@/types'
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

export const useKoreroStore = defineStore('korero', () => {
  const loaded = ref(false)
  const authenticated = ref(false)
  const config = ref<Config | undefined>(undefined)
  const user = ref<User>(emptyUser)

  /** A list of users, e.g. those who have authored messages  */
  const users: Ref<User[]> = ref([])

  function getUser(id: string): User {
    const user = users.value.find((u) => u.id === id)
    if (user) {
      return user
    }
    cacheUser(id)
    return emptyUser
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
          config.value = c[0]

          // Get channels
          syncChannels()
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

  async function setOrg(teamId: string) {
    if (config.value) {
      await configCollection.updateOne(config.value.id, { currentTeam: teamId })
      config.value.currentTeam = teamId
    } else {
      const newConfig = { currentTeam: teamId, teams: [] }
      const configId = await configCollection.insertOne(newConfig)
      config.value = { id: configId, ...newConfig }
    }
    await syncChannels()
  }

  //
  // Load and manage channels in a team
  //

  type Channel = Doc & {
    name: string
  }
  const channels = ref<Channel[]>([])
  let unsubscribeChannels: (() => Promise<BazaarMessage>) | undefined = undefined
  // let channelCollection = undefined;
  async function syncChannels() {
    if (!config.value) {
      channels.value = []
    }
    if (unsubscribeChannels) {
      unsubscribeChannels()
      unsubscribeChannels = undefined
    }

    // TODO we currently do not support collection creation with a set userId
    // unsubscribeChannels = await bzr
    //   .collection<Channel>(CHANNEL_COLLECTION, { userId: config.value!.currentTeam })
    //   .subscribeAll({}, arrayMirrorSubscribeListener<Channel>(channels.value))
    unsubscribeChannels = await bzr
      .collection<Channel>(CHANNEL_COLLECTION)
      .subscribeAll({}, arrayMirrorSubscribeListener<Channel>(channels.value))
    return
  }

  async function createChannel(name: string): Promise<string> {
    if (!config.value) {
      return ''
    }
    return bzr
      .collection<Channel>(CHANNEL_COLLECTION, { userId: config.value!.currentTeam })
      .insertOne({ name: name })
  }

  //
  // Load and manage conversations in a channel
  //

  const currentChannel = ref<Channel | undefined>(undefined)
  const conversations = ref<Conversation[]>([])
  let unsubscribeConversations: (() => Promise<BazaarMessage>) | undefined = undefined

  async function setChannel(id: string) {
    if (currentChannel.value && currentChannel.value.id === id) {
      return
    }
    currentChannel.value = channels.value.find((c) => {
      return c.id === id
    })

    if (!currentChannel.value) {
      currentChannel.value = await bzr
        .collection<Channel>(CHANNEL_COLLECTION, { userId: config.value!.currentTeam })
        .getOne(id)
    }

    if (unsubscribeConversations) {
      unsubscribeConversations()
      unsubscribeConversations = undefined
    }

    // Remove conversations before mirroring
    conversations.value = []

    // TODO how to make sure only members of this channel can read these conversations?
    unsubscribeConversations = await bzr
      .collection<Conversation>(CONVERSATION_COLLECTION)
      .subscribeAll(
        { channelId: id },
        arrayMirrorSubscribeListener<Conversation>(conversations.value)
      )
  }

  function getChannel(id: string): Channel {
    return channels.value.find((c) => c.id === id) || { id: '', name: 'Unknown Channel' }
  }

  async function createConversation(conversation: Omit<Conversation, 'id'>) {
    if (config.value) {
      return bzr
        .collection<Conversation>(CONVERSATION_COLLECTION, { userId: config.value!.currentTeam })
        .insertOne(conversation)
    }
  }

  //
  // Load and manage messages in a conversation
  //

  type MessageTemplate = Doc & {
    type: string
    conversationId: string
    text: string
  }
  const currentConversation = ref(undefined as Conversation | undefined)
  let unsubscribeConversation: (() => Promise<BazaarMessage>) | undefined = undefined

  const messages = ref([] as Message[])

  let unsubscribeMessages: (() => Promise<BazaarMessage>) | undefined = undefined

  async function setConversation(id: string) {
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
      currentConversation.value = await bzr
        .collection<Conversation>(CONVERSATION_COLLECTION, { userId: config.value!.currentTeam })
        .getOne(id)
    }

    setChannel(currentConversation.value.channelId)

    unsubscribeConversation = await bzr
      .collection<Conversation>(CONVERSATION_COLLECTION, { userId: config.value!.currentTeam })
      .subscribeOne(id, { onChange: (_, newDoc) => (currentConversation.value = newDoc) })

    if (unsubscribeMessages) {
      unsubscribeMessages()
      unsubscribeMessages = undefined
    }

    // TODO how to make sure only members of this channel can read these messages?
    messages.value = []
    unsubscribeMessages = await bzr
      .collection<Message>(MESSAGE_COLLECTION)
      .subscribeAll({ conversationId: id }, arrayMirrorSubscribeListener<Message>(messages.value))
  }

  async function createMessage(message: Omit<Message, 'id' | 'created' | 'authorId'>) {
    if (config.value) {
      const newMessage = {
        ...message,
        created: dateStrToISO(),
        authorId: user.value.id
        // authorId: 'fa3b7079-daab-4d28-a356-8468a17434cd'
      }

      return bzr
        .collection<Message>(MESSAGE_COLLECTION, { userId: config.value!.currentTeam })
        .insertOne(newMessage)
    }
  }

  async function cacheUser(userId: string): Promise<void> {
    const cachedUser = users.value.find((u) => u.id === userId)
    if (!cachedUser) {
      const fetchedUser = await bzr.social.getUser({ userId })
      if (fetchedUser) {
        users.value.push(fetchedUser)
      }
    }
  }

  async function updateConversation(id: string, doc: DeepPartial<Conversation>) {
    if (config.value) {
      return bzr
        .collection<Conversation>(CONVERSATION_COLLECTION, { userId: config.value!.currentTeam })
        .updateOne(id, doc)
    }
  }

  return {
    user,
    getUser,
    users,
    config,
    loaded,
    authenticated,
    autoSignIn,

    // Org view
    channels,
    setOrg,
    createChannel,

    // Channel view
    currentChannel,
    conversations,
    setChannel,
    getChannel,
    createConversation,

    // Conversation view
    currentConversation,
    messages,
    setConversation,
    createMessage,
    updateConversation
  }
})
