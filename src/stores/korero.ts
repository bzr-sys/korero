import { ref } from 'vue'
import { defineStore } from 'pinia'

import { bzr } from '@/bazaar'
import {
  arrayMirrorSubscribeListener,
  type BazaarMessage,
  type DeepPartial,
  type Doc,
  type User
} from '@bzr/bazaar'
import type { Config, Conversation, Message } from '@/types'

const CONFIG_COLLECTION = 'configs'
const CHANNEL_COLLECTION = 'channels'
const CONVERSATION_COLLECTION = 'conversations'
const MESSAGE_COLLECTION = 'messages'

export const useKoreroStore = defineStore('korero', () => {
  const loaded = ref(false)
  const authenticated = ref(false)
  const config = ref(undefined as Config | undefined)
  const user = ref({
    id: '',
    email: '',
    name: ''
  } as User)

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
        console.error('Error during auto signin', e)
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
  const channels = ref([] as Channel[])
  let unsubsribeChannels: (() => Promise<BazaarMessage>) | undefined = undefined
  // let channelCollection = undefined;
  async function syncChannels() {
    if (!config.value) {
      channels.value = []
    }
    if (unsubsribeChannels) {
      unsubsribeChannels()
      unsubsribeChannels = undefined
    }

    // TODO we currently do not support collection creation with a set userId
    // unsubsribeChannels = await bzr
    //   .collection<Channel>(CHANNEL_COLLECTION, { userId: config.value!.currentTeam })
    //   .subscribeAll({}, arrayMirrorSubscribeListener<Channel>(channels.value))
    unsubsribeChannels = await bzr
      .collection<Channel>(CHANNEL_COLLECTION)
      .subscribeAll({}, arrayMirrorSubscribeListener<Channel>(channels.value))
    return
  }

  async function createChannel(name: string) {
    if (config.value) {
      await bzr
        .collection<Channel>(CHANNEL_COLLECTION, { userId: config.value!.currentTeam })
        .insertOne({ name: name })
    }
  }

  //
  // Load and manage conversations in a channel
  //

  const currentChannel = ref(undefined as Channel | undefined)
  const conversations = ref([] as Conversation[])
  let unsubsribeConversations: (() => Promise<BazaarMessage>) | undefined = undefined

  async function setChannel(id: string) {
    if (currentChannel.value && currentChannel.value.id === id) {
      return
    }
    currentChannel.value = channels.value.find((c) => {
      return c.id == id
    })

    if (!currentChannel.value) {
      currentChannel.value = await bzr
        .collection<Channel>(CHANNEL_COLLECTION, { userId: config.value!.currentTeam })
        .getOne(id)
    }

    if (unsubsribeConversations) {
      unsubsribeConversations()
      unsubsribeConversations = undefined
    }

    // TODO how to make sure only members of this channel can read these conversations?
    unsubsribeConversations = await bzr
      .collection<Conversation>(CONVERSATION_COLLECTION)
      .subscribeAll(
        { channelId: id },
        arrayMirrorSubscribeListener<Conversation>(conversations.value)
      )
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
  let unsubsribeConversation: (() => Promise<BazaarMessage>) | undefined = undefined
  const messages = ref([] as Message[])
  let unsubsribeMessages: (() => Promise<BazaarMessage>) | undefined = undefined

  async function setConversation(id: string) {
    if (currentConversation.value && currentConversation.value.id === id) {
      return
    }
    if (unsubsribeConversation) {
      unsubsribeConversation()
      unsubsribeConversation = undefined
    }

    // Why not mirror currentConversation?
    // It does not work, probably because currentConversation is not set when this returns

    currentConversation.value = conversations.value.find((c) => {
      return c.id == id
    })

    if (!currentConversation.value) {
      currentConversation.value = await bzr
        .collection<Conversation>(CONVERSATION_COLLECTION, { userId: config.value!.currentTeam })
        .getOne(id)
    }

    unsubsribeConversation = await bzr
      .collection<Conversation>(CONVERSATION_COLLECTION, { userId: config.value!.currentTeam })
      .subscribeOne(id, { onChange: (_, newDoc) => (currentConversation.value = newDoc) })

    if (unsubsribeMessages) {
      unsubsribeMessages()
      unsubsribeMessages = undefined
    }

    // TODO how to make sure only members of this channel can read these messages?
    messages.value = []
    unsubsribeMessages = await bzr
      .collection<Message>(MESSAGE_COLLECTION)
      .subscribeAll({ conversationId: id }, arrayMirrorSubscribeListener<Message>(messages.value))
  }

  async function createMessage(message: Omit<Message, 'id' | 'created' | 'author'>) {
    if (config.value) {
      const newMessage = { ...message, created: new Date(), author: user.value.id }
      return bzr
        .collection<Message>(MESSAGE_COLLECTION, { userId: config.value!.currentTeam })
        .insertOne(newMessage)
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
    createConversation,

    // Conversation view
    currentConversation,
    messages,
    setConversation,
    createMessage,
    updateConversation
  }
})
