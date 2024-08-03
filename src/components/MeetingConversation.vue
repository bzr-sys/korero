<script setup lang="ts">
import { computed, ref, type ComputedRef } from 'vue'

import { useKoreroStore } from '@/stores/korero'
import HeadingTwo from '@/components/HeadingTwo.vue'
import FormatDateString from '@/components/FormatDateString.vue'
import ToastUiViewer from '@/components/ToastUiViewer.vue'
import ToastUiEditor from '@/components/ToastUiEditor.vue'
import BaseCard from '@/components/BaseCard.vue'
import ChatMessage from '@/components/ChatMessage.vue'
import MessageForm from '@/components/MessageForm.vue'
import { Agency, type AgendaItem, type Meeting } from '@/types'

const koreroStore = useKoreroStore()
// We know the conversation is a meeting
const meeting = koreroStore.currentConversation as Meeting

const newMessage = ref('')
const newMessageValidationError = ref('')
const editor = ref<InstanceType<typeof ToastUiEditor> | null>(null)

async function postMeetingNotes() {
  if (!newMessage.value) {
    newMessageValidationError.value = 'A message is required'
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
const agendaItemValidationError = ref('')
async function addAgendaItem() {
  if (!agendaItemTitle.value) {
    return
  }
  if (!agendaItemText.value) {
    agendaItemValidationError.value = 'A message is required'
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

  <div v-if="meeting.agenda.decision === Agency.COLLAB && !agendaDue">
    <!-- Still need to vote, so we show unordered agenda items -->
    <BaseCard v-for="item in meeting.agenda.items" :key="item.index" class="mb-4">
      <div>{{ item.title }}</div>
      <ToastUiViewer :initialValue="item.text" />

      <div>
        <button
          v-if="item.votes.includes(koreroStore.user.id)"
          @click="unvoteAgendaItem(item.index)"
          class="btn btn-sm btn-error mt-1"
        >
          Remove my vote
        </button>
        <button v-else @click="voteAgendaItem(item.index)" class="btn btn-sm btn-accent mt-1">
          Vote for item
        </button>
      </div>
    </BaseCard>
  </div>
  <div v-else class="grid gap-8 mb-8">
    <!-- Show ordered agenda items -->
    <!-- TODO hide or minimize agenda if meeting has passed -->
    <BaseCard v-for="item in sortedAgenda" :key="item.index">
      <div>{{ item.title }}</div>
      <ToastUiViewer v-if="item.text" :initialValue="item.text" />
      <div
        v-if="meeting.agenda.decision === Agency.OWNER && meeting.agenda.setting === Agency.COLLAB"
      >
        <div v-if="item.approved" class="badge badge-success">Approved</div>
        <p v-else-if="meetingPast">Rejected (TODO: should probably hide agenda text)</p>
        <button
          v-else-if="meeting.authorId === koreroStore.user.id"
          @click="approveAgendaItem(item.index)"
          class="btn btn-sm btn-accent mt-1"
        >
          Approve
        </button>
        <p v-else>Pending</p>
      </div>
      <div v-else-if="meeting.agenda.decision === Agency.COLLAB">
        <div class="badge badge-neutral">Votes {{ item.votes.length }}</div>
      </div>
    </BaseCard>
  </div>

  <!-- Propose new agenda items -->
  <div v-if="meeting.agenda.setting === Agency.COLLAB && !agendaDue">
    <div class="text-center pb-8">
      <div>Agenda items proposal due date</div>
      <FormatDateString :dateString="meeting.agenda.due" />
    </div>

    <BaseCard>
      <div>Propose agenda item</div>
      <label class="form-control mb-8">
        <div class="label">
          <span class="label-text">Title</span>
        </div>
        <input v-model="agendaItemTitle" type="text" class="input input-bordered" required />
      </label>
      <ToastUiEditor
        @updateValue="(t) => (agendaItemText = t)"
        label="Agenda item text"
        height="auto"
        initialEditType="markdown"
        ref="editor"
        :validationError="agendaItemValidationError"
      />
    </BaseCard>

    <button @click="addAgendaItem()" class="btn mt-4">Add Agenda Item</button>
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
        :validationError="newMessageValidationError"
        initialEditType="markdown"
        ref="editor"
      />
      <button @click="postMeetingNotes" class="btn btn-accent mt-4">Post Meeting Notes</button>
    </div>
    <MessageForm v-else />
  </div>
</template>

<style></style>
