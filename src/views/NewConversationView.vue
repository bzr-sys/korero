<script setup lang="ts">
import { computed, ref } from 'vue'

import { useKoreroStore } from '@/stores/korero'
import router from '@/router'
import ToastUiEditor from '@/components/ToastUiEditor.vue'
import { ConversationType, PollType, Agency, type Conversation } from '@/types'
import type { Meeting } from '@/types'
import type { Poll } from '@/types'
import type { Brainstorm } from '@/types'

const channelId = router.currentRoute.value.params.id

const koreroStore = useKoreroStore()

koreroStore.setChannel(channelId as string)

const currentChannel = computed(() => {
  return koreroStore.channels.find((c) => {
    return c.id == channelId
  })
})

const channelName = computed(() => {
  if (currentChannel.value) {
    return currentChannel.value.name
  }
  return channelId
})

async function createConversation() {
  if (!message.value || !title.value) {
    return
  }
  //
  let c: Omit<Conversation, 'id'> = {
    channelId: channelId as string,
    author: koreroStore.user.id,
    title: title.value,
    archived: false,
    created: new Date(),
    //
    message: message.value,
    reactions: [],
    //
    type: chosenType.value
  }
  switch (chosenType.value) {
    case ConversationType.MEETING:
      c = {
        ...c,
        date: date.value,
        agenda: {
          setting: agendaSetting.value,
          decision: agendaDecision.value,
          due: due.value,
          items: agendaItemTitles.value.map((t, i) => {
            return {
              index: i,
              title: t,
              text: agendaItemTexts.value[i],
              approved: false,
              votes: []
            }
          })
        }
      } as Omit<Meeting, 'id'>
      break
    case ConversationType.POLL:
      c = {
        ...c,
        pollType: pollType.value,
        items: pollOptions.value.map((t, i) => {
          return { index: i, text: t, votes: [] }
        }),
        due: due.value
      } as Omit<Poll, 'id'>
      break
    case ConversationType.BRAINSTORM:
      c = {
        ...c,
        due: due.value
      } as Omit<Brainstorm, 'id'>
      break
    case ConversationType.DISCUSSION:
    case ConversationType.ANNOUNCEMENT:
    case ConversationType.QUESTION:
    default:
      break
  }
  const id = await koreroStore.createConversation(c)
  router.push({ name: 'conversation', params: { id: id } })
}

const conversationTypes = ref([] as { id: string; value: string }[])
for (const t of Object.values(ConversationType)) {
  conversationTypes.value.push({ id: t, value: t.charAt(0).toUpperCase() + t.slice(1) })
}

const chosenType = ref(ConversationType.DISCUSSION)
const messageDescription = computed(() => {
  switch (chosenType.value) {
    case ConversationType.MEETING:
      return 'Brief meeting description'
    case ConversationType.POLL:
      return 'Brief poll description'
    case ConversationType.BRAINSTORM:
      return 'Whats are you brainstorming?'
    case ConversationType.DISCUSSION:
      return 'Start your discussion'
    case ConversationType.ANNOUNCEMENT:
      return 'Whats going on?'
    case ConversationType.QUESTION:
      return 'Whats answers are you seeking?'
    default:
      return 'Start your conversation'
  }
})
const title = ref('')
const message = ref('')
const pollOptions = ref(['', '', ''])
const pollType = ref(PollType.SINGLE)
const agendaSetting = ref(Agency.OWNER)
const agendaDecision = ref(Agency.OWNER)
const agendaItemTitles = ref(['', '', ''])
const agendaItemTexts = ref(['', '', ''])
const due = ref(new Date())
const date = ref(new Date())
</script>

<template>
  <p>Channel is {{ channelName }}</p>
  <RouterLink
    :to="{ name: 'channel', params: { id: channelId } }"
    class="inline-block bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded self-center"
  >
    Go back to channel
  </RouterLink>

  <p>This conversation is a</p>
  <div>
    <template v-for="t in conversationTypes">
      <input type="radio" :id="t.id" :value="t.id" v-model="chosenType" />
      <label :for="t.id">{{ t.value }}</label>
    </template>
  </div>

  <div>
    <span>Title</span>
    <input type="text" v-model="title" class="border" />
  </div>

  <div>
    <p>{{ messageDescription }}</p>
    <ToastUiEditor @updateValue="(t) => (message = t)" height="auto" initialEditType="markdown" />

    <!-- MEETING -->

    <div v-if="chosenType === ConversationType.MEETING">
      <div>
        <span>Date</span>
        <input type="datetime-local" v-model="date" class="border" />
      </div>
      <p>Agenda</p>
      <div>
        <input
          type="radio"
          :id="'AgendaSetting' + Agency.OWNER"
          :value="Agency.OWNER"
          v-model="agendaSetting"
        />
        <label :for="'AgendaSetting' + Agency.OWNER">You set agenda now</label>
        <input
          type="radio"
          :id="'AgendaSetting' + Agency.COLLAB"
          :value="Agency.COLLAB"
          v-model="agendaSetting"
        />
        <label :for="'AgendaSetting' + Agency.COLLAB">Set agenda collaboratively</label>
      </div>
      <div v-if="agendaSetting == Agency.COLLAB">
        <span>Due</span>
        <input type="datetime-local" v-model="due" class="border" />
      </div>
      <div>
        <input
          type="radio"
          :id="'AgendaDecision' + Agency.OWNER"
          :value="Agency.OWNER"
          v-model="agendaDecision"
        />
        <label :for="'AgendaDecision' + Agency.OWNER">You decide about agenda items</label>
        <input
          type="radio"
          :id="'AgendaDecision' + Agency.COLLAB"
          :value="Agency.COLLAB"
          v-model="agendaDecision"
        />
        <label :for="'AgendaDecision' + Agency.COLLAB">Vote for agenda items</label>
      </div>
      <p>Agenda items -- TODO: add ability to have arbitrary # of items</p>
      <div>
        <p>Item 1 -- TODO this should be only items if not collaborative or voted</p>
        <span>Title</span>
        <input type="text" v-model="agendaItemTitles[0]" class="border" />
        <ToastUiEditor
          @updateValue="(t) => (agendaItemTexts[0] = t)"
          height="auto"
          initialEditType="markdown"
        />
      </div>
      <div>
        <p>Item 2</p>
        <span>Title</span>
        <input type="text" v-model="agendaItemTitles[1]" class="border" />
        <ToastUiEditor
          @updateValue="(t) => (agendaItemTexts[1] = t)"
          height="auto"
          initialEditType="markdown"
        />
      </div>
      <div>
        <p>Item 3</p>
        <span>Title</span>
        <input type="text" v-model="agendaItemTitles[2]" class="border" />
        <ToastUiEditor
          @updateValue="(t) => (agendaItemTexts[2] = t)"
          height="auto"
          initialEditType="markdown"
        />
      </div>
    </div>

    <!-- POLL -->

    <div v-else-if="chosenType === ConversationType.POLL">
      <p>Poll options -- TODO: add ability to have arbitrary # of options</p>
      <div>
        <span>Option 1</span>
        <input type="text" v-model="pollOptions[0]" class="border" />
      </div>
      <div>
        <span>Option 2</span>
        <input type="text" v-model="pollOptions[1]" class="border" />
      </div>
      <div>
        <span>Option 3</span>
        <input type="text" v-model="pollOptions[2]" class="border" />
      </div>
      <div>
        <p>Options allowed to choose:</p>
        <input type="radio" :id="PollType.SINGLE" :value="PollType.SINGLE" v-model="pollType" />
        <label :for="PollType.SINGLE">{{ PollType.SINGLE }}</label>
        <input type="radio" :id="PollType.MULTIPLE" :value="PollType.MULTIPLE" v-model="pollType" />
        <label :for="PollType.MULTIPLE">{{ PollType.MULTIPLE }}</label>
      </div>
      <div>
        <span>Due</span>
        <input type="datetime-local" v-model="due" class="border" />
      </div>
    </div>

    <!-- BRAINSTORM -->

    <div v-else-if="chosenType === ConversationType.BRAINSTORM">
      <div>
        <span>Due</span>
        <input type="datetime-local" v-model="due" class="border" />
      </div>
    </div>
  </div>

  <button
    @click="createConversation"
    class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded self-center"
  >
    Create Conversation
  </button>
</template>

<style></style>
@/stores/korero
