<script setup lang="ts">
import { computed, ref, type ComputedRef } from 'vue'

import { useKoreroStore } from '@/stores/korero'
import ToastUiViewer from '@/components/ToastUiViewer.vue'
import ToastUiEditor from '@/components/ToastUiEditor.vue'
import { Agency, MessageType, type AgendaItem, type Meeting } from '@/types'

const koreroStore = useKoreroStore()
// We know the conversation is a meeting
const meeting = koreroStore.currentConversation as Meeting

const newMessage = ref('')
const editor = ref<InstanceType<typeof ToastUiEditor> | null>(null)
async function postMessage() {
  if (!newMessage.value) {
    return
  }
  await koreroStore.createMessage({
    conversationId: meeting.id,
    type: MessageType.COMMENT,
    text: newMessage.value
  })
  newMessage.value = ''
  editor.value?.clearMarkdown()
}

async function postMeetingNotes() {
  if (!newMessage.value) {
    return
  }
  await koreroStore.updateConversation(meeting.id, {
    notes: newMessage.value
  })
  newMessage.value = ''
  editor.value?.clearMarkdown()
}

const agendaItemTitle = ref('')
const agendaItemText = ref('')
async function addAgendaItem() {
  console.log('add')
  if (!agendaItemTitle.value || !agendaItemText.value) {
    return
  }
  meeting.agenda.items.push({
    index: meeting.agenda.items.length,
    title: agendaItemTitle.value,
    text: agendaItemText.value,
    approved: false,
    votes: []
  })

  await koreroStore.updateConversation(meeting.id, {
    agenda: meeting.agenda
  })
  agendaItemTitle.value = ''
  agendaItemText.value = ''
  editor.value?.clearMarkdown()
}

async function approveAgendaItem(index: number) {
  // console.log('approve')
  // console.log(index)
  // console.log(meeting.agenda.items)
  const i = meeting.agenda.items.findIndex((item) => item.index === index)
  // console.log(i)
  if (i > -1) {
    meeting.agenda.items[i].approved = true
    await koreroStore.updateConversation(meeting.id, {
      agenda: meeting.agenda
    })
  }
}

async function voteAgendaItem(index: number) {
  const i = meeting.agenda.items.findIndex((item) => item.index === index)
  if (i > -1 && !meeting.agenda.items[i].votes.includes(koreroStore.user.id)) {
    meeting.agenda.items[i].votes.push(koreroStore.user.id)
    await koreroStore.updateConversation(meeting.id, {
      agenda: meeting.agenda
    })
  }
}

async function unvoteAgendaItem(index: number) {
  const i = meeting.agenda.items.findIndex((item) => item.index === index)
  if (i > -1 && meeting.agenda.items[i].votes.includes(koreroStore.user.id)) {
    meeting.agenda.items[i].votes = meeting.agenda.items[i].votes.filter(
      (id) => id !== koreroStore.user.id
    )
    await koreroStore.updateConversation(meeting.id, {
      agenda: meeting.agenda
    })
  }
}

const sortedAgenda = computed(() => {
  // @ts-ignore Not sure how to get toSorted to pass ts check
  return meeting.agenda.items.toSorted((a: AgendaItem, b: AgendaItem) => {
    if (a.approved && !b.approved) return -1
    if (!a.approved && b.approved) return 1
    if (a.votes.length > b.votes.length) return -1
    if (a.votes.length < b.votes.length) return 1
    if (a.index < b.index) return -1
    return 1
  })
}) as ComputedRef<AgendaItem[]>

const agendaDue = computed(() => {
  return new Date(meeting.agenda.due) < new Date()
})

const meetingPast = computed(() => {
  return new Date(meeting.date) < new Date()
})

const messagesBeforeNotes = computed(() => {
  const notesDate = new Date(meeting.date)
  return koreroStore.messages.filter((m) => new Date(m.created) < notesDate)
})

const messagesAfterNotes = computed(() => {
  const notesDate = new Date(meeting.date)
  return koreroStore.messages.filter((m) => new Date(m.created) > notesDate)
})
</script>

<template>
  <p>Date & time: {{ meeting.date }}</p>

  <div class="border p-4">
    <ToastUiViewer :initialValue="meeting.message" />
  </div>

  <p>Agenda</p>
  <div v-if="meeting.agenda.decision == Agency.COLLAB && !agendaDue">
    <!-- Still need to vote, so we show unordered agenda items -->
    <div v-for="item in meeting.agenda.items" :key="item.index" class="border">
      <p class="font-bold">{{ item.title }}</p>
      <ToastUiViewer :initialValue="item.text" />

      <button
        v-if="item.votes.includes(koreroStore.user.id)"
        @click="unvoteAgendaItem(item.index)"
        class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded self-center"
      >
        Remove my vote
      </button>
      <button
        v-else
        @click="voteAgendaItem(item.index)"
        class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded self-center"
      >
        Vote for item
      </button>
    </div>
  </div>
  <div v-else>
    <!-- Show ordered agenda items -->
    <!-- TODO hide or minimize agenda if meeting has passed -->
    <div v-for="item in sortedAgenda" :key="item.index" class="border">
      <p class="font-bold">{{ item.title }}</p>
      <ToastUiViewer :initialValue="item.text" />
      <div
        v-if="meeting.agenda.decision === Agency.OWNER && meeting.agenda.setting === Agency.COLLAB"
      >
        <p v-if="item.approved">Approved</p>
        <p v-else-if="meetingPast">Rejected (TODO: should probably hide agenda text)</p>
        <button
          v-else-if="meeting.author === koreroStore.user.id"
          @click="approveAgendaItem(item.index)"
          class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded self-center"
        >
          Approve
        </button>
        <p v-else>Pending</p>
      </div>
      <div v-else-if="meeting.agenda.decision === Agency.COLLAB">
        <p>Votes: {{ item.votes.length }}</p>
      </div>
    </div>
  </div>

  <!-- Propose new agenda items -->
  <div v-if="meeting.agenda.setting == Agency.COLLAB && !agendaDue">
    <p>Agenda items can be proposed until {{ meeting.agenda.due }}</p>
    <div>
      <span>Propose item with title</span>
      <input type="text" v-model="agendaItemTitle" class="border" />
      <ToastUiEditor
        @updateValue="(t) => (agendaItemText = t)"
        height="auto"
        initialEditType="markdown"
        ref="editor"
      />
    </div>
    <button
      @click="addAgendaItem()"
      class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded self-center"
    >
      Add Agenda Item
    </button>
  </div>

  <!-- Agenda is set, move on to coments and notes -->
  <div v-else>
    <!-- Show comment from before the meeting-->
    <!-- TODO minimize messages when we have notes -->
    <div v-for="message in messagesBeforeNotes" :key="message.id" class="border p-4">
      <ToastUiViewer :initialValue="message.text" />
    </div>

    <div v-if="meeting.notes" class="border-4 p-4">
      <ToastUiViewer :initialValue="meeting.notes" />
    </div>

    <div v-for="message in messagesAfterNotes" :key="message.id" class="border p-4">
      <ToastUiViewer :initialValue="message.text" />
    </div>

    <!-- Add notes -->
    <!-- TODO highlight to make sure people know its notes and not a normal comment -->
    <div v-if="meetingPast && !meeting.notes">
      <p>Add meeting notes</p>
      <ToastUiEditor
        @updateValue="(t) => (newMessage = t)"
        height="auto"
        initialEditType="markdown"
        ref="editor"
      />
      <button
        @click="postMeetingNotes"
        class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded self-center"
      >
        Post Meeting Notes
      </button>
    </div>

    <div v-else>
      <p>Write a comment</p>
      <ToastUiEditor
        @updateValue="(t) => (newMessage = t)"
        height="auto"
        initialEditType="markdown"
        ref="editor"
      />
      <button
        @click="postMessage"
        class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded self-center"
      >
        Post Message
      </button>
    </div>
  </div>
</template>

<style></style>
