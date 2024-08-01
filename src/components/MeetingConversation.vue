<script setup lang="ts">
import { computed, ref, type ComputedRef } from 'vue'

import { useKoreroStore } from '@/stores/korero'
import HeadingTwo from '@/components/HeadingTwo.vue'
import FormatDateString from '@/components/FormatDateString.vue'
import ToastUiViewer from '@/components/ToastUiViewer.vue'
import ToastUiEditor from '@/components/ToastUiEditor.vue'
import BaseCard from '@/components/BaseCard.vue'
import ChatMessage from '@/components/ChatMessage.vue'
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
  <FormatDateString class="text-center" :dateString="meeting.date" />

  <ToastUiViewer :initialValue="meeting.message" />

  <HeadingTwo class="pt-8 text-center">Agenda</HeadingTwo>

  <div v-if="meeting.agenda.decision == Agency.COLLAB && !agendaDue">
    <!-- Still need to vote, so we show unordered agenda items -->
    <div v-for="item in meeting.agenda.items" :key="item.index" class="border">
      <p class="font-bold">{{ item.title }}</p>
      <ToastUiViewer :initialValue="item.text" />

      <button
        v-if="item.votes.includes(koreroStore.user.id)"
        @click="unvoteAgendaItem(item.index)"
        class="btn"
      >
        Remove my vote
      </button>
      <button v-else @click="voteAgendaItem(item.index)" class="btn">Vote for item</button>
    </div>
  </div>
  <div v-else class="grid gap-8 mb-8">
    <!-- Show ordered agenda items -->
    <!-- TODO hide or minimize agenda if meeting has passed -->
    <BaseCard v-for="item in sortedAgenda" :key="item.index">
      <div>{{ item.title }}</div>
      <ToastUiViewer :initialValue="item.text" />
      <div
        v-if="meeting.agenda.decision === Agency.OWNER && meeting.agenda.setting === Agency.COLLAB"
      >
        <p v-if="item.approved">Approved</p>
        <p v-else-if="meetingPast">Rejected (TODO: should probably hide agenda text)</p>
        <button
          v-else-if="meeting.authorId === koreroStore.user.id"
          @click="approveAgendaItem(item.index)"
          class="btn"
        >
          Approve
        </button>
        <p v-else>Pending</p>
      </div>
      <div v-else-if="meeting.agenda.decision === Agency.COLLAB">
        <p>Votes: {{ item.votes.length }}</p>
      </div>
    </BaseCard>
  </div>

  <!-- Propose new agenda items -->
  <div v-if="meeting.agenda.setting == Agency.COLLAB && !agendaDue">
    <p>Agenda items can be proposed until {{ meeting.agenda.due }}</p>
    <div>
      <span>Propose item with title</span>
      <input type="text" v-model="agendaItemTitle" class="border" />
      <ToastUiEditor
        @updateValue="(t) => (agendaItemText = t)"
        label="Agenda item text"
        height="auto"
        initialEditType="markdown"
        ref="editor"
      />
    </div>
    <button @click="addAgendaItem()" class="btn btn-sm">Add Agenda Item</button>
  </div>

  <!-- Agenda is set, move on to comments and notes -->
  <div v-else>
    <!-- Show comment from before the meeting-->
    <!-- TODO minimize messages when we have notes -->
    <HeadingTwo v-if="messagesBeforeNotes.length" class="pt-8 text-center"
      >Pre-Meeting Notes</HeadingTwo
    >
    <ChatMessage v-for="message in messagesBeforeNotes" :key="message.id" :message="message" />

    <template v-if="meeting.notes">
      <HeadingTwo class="pt-8 text-center">During-Meeting Notes</HeadingTwo>
      <ToastUiViewer :initialValue="meeting.notes" />
    </template>

    <HeadingTwo v-if="messagesAfterNotes.length" class="pt-8 text-center"
      >Post-Meeting Notes</HeadingTwo
    >
    <ChatMessage v-for="message in messagesAfterNotes" :key="message.id" :message="message" />

    <!-- Add notes -->
    <!-- TODO highlight to make sure people know its notes and not a normal comment -->
    <div v-if="meetingPast && !meeting.notes">
      <ToastUiEditor
        @updateValue="(t) => (newMessage = t)"
        label="Add meeting notes"
        height="auto"
        initialEditType="markdown"
        ref="editor"
      />
      <button @click="postMeetingNotes" class="btn btn-primary mt-4">Post Meeting Notes</button>
    </div>

    <div v-else>
      <ToastUiEditor
        @updateValue="(t) => (newMessage = t)"
        label="Write a comment"
        height="auto"
        initialEditType="markdown"
        ref="editor"
      />
      <button @click="postMessage" class="btn btn-primary mt-4">Comment</button>
    </div>
  </div>
</template>

<style></style>
