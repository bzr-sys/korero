<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'
import BaseCard from '@/components/BaseCard.vue'
import ToastUiEditor from '@/components/ToastUiEditor.vue'
import ToastUiViewer from '@/components/ToastUiViewer.vue'
import TextInput from '@/components/TextInput.vue'
import MeetingNotes from './MeetingNotes.vue'
import DueDate from '@/components/DueDate.vue'
import { Agency, type AgendaItem, type CollabAgenda, type Meeting } from '@/types'
import { storeToRefs } from 'pinia'
import { computed, ref, type ComputedRef } from 'vue'

const koreroStore = useKoreroStore()

const { currentConversation, user } = storeToRefs(koreroStore)

const editor = ref<InstanceType<typeof ToastUiEditor> | null>(null)

// We know the conversation is a meeting
const meeting = computed(() => currentConversation.value as Meeting)
const collabAgenda = computed(() => meeting.value.agenda as CollabAgenda)
const agendaDue = computed(() => {
  return new Date(collabAgenda.value.due) < new Date()
})
const meetingPast = computed(() => {
  return new Date(meeting.value.date) < new Date()
})

// TODO seems to be broken, unvote doesn't persist
async function unvoteAgendaItem(index: number) {
  const i = collabAgenda.value.items.findIndex((item) => item.index === index)
  if (i > -1 && collabAgenda.value.items[i].votes.includes(user.value.id)) {
    collabAgenda.value.items[i].votes = collabAgenda.value.items[i].votes.filter(
      (id) => id !== user.value.id
    )
    await koreroStore.updateConversation(meeting.value.id, {
      agenda: collabAgenda.value
    })
  }
}

async function voteAgendaItem(index: number) {
  const i = collabAgenda.value.items.findIndex((item) => item.index === index)
  if (i > -1 && !collabAgenda.value.items[i].votes.includes(user.value.id)) {
    collabAgenda.value.items[i].votes.push(user.value.id)
    await koreroStore.updateConversation(meeting.value.id, {
      agenda: collabAgenda.value
    })
  }
}

const sortedAgenda = computed(() => {
  // @ts-ignore Not sure how to get toSorted to pass ts check
  return meeting.value.agenda.items.toSorted((a: AgendaItem, b: AgendaItem) => {
    if (a.approved && !b.approved) return -1
    if (!a.approved && b.approved) return 1
    if (a.votes.length > b.votes.length) return -1
    if (a.votes.length < b.votes.length) return 1
    if (a.index < b.index) return -1
    return 1
  })
}) as ComputedRef<AgendaItem[]>

async function approveAgendaItem(index: number) {
  // console.log('approve')
  // console.log(index)
  // console.log(collabAgenda.value.items)
  const i = collabAgenda.value.items.findIndex((item) => item.index === index)
  // console.log(i)
  if (i > -1) {
    collabAgenda.value.items[i].approved = true
    await koreroStore.updateConversation(meeting.value.id, {
      agenda: collabAgenda.value
    })
  }
}

const agendaItemTitle = ref('')
const agendaItemText = ref('')
async function addAgendaItem() {
  if (!agendaItemTitle.value) {
    return
  }
  collabAgenda.value.items.push({
    index: collabAgenda.value.items.length,
    title: agendaItemTitle.value,
    text: agendaItemText.value,
    approved: false,
    votes: []
  })

  await koreroStore.updateConversation(meeting.value.id, {
    agenda: collabAgenda.value
  })
  agendaItemTitle.value = ''
  agendaItemText.value = ''
  editor.value?.clearMarkdown()
}
</script>

<template>
  <template v-if="!agendaDue">
    <!-- Still need to vote, so we show unordered agenda items -->
    <BaseCard v-for="item in collabAgenda.items" :key="item.index" class="mb-4">
      <div>{{ item.title }}</div>
      <ToastUiViewer v-if="item.text" :initialValue="item.text" />
      <div>
        <button
          v-if="item.votes.includes(user.id)"
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

    <div class="pb-4">
      <DueDate label="Propose agenda items by" :dateString="collabAgenda.due" />
    </div>

    <form @submit.prevent="addAgendaItem" class="box-border w-full">
      <BaseCard class="box-border w-full">
        <div>Propose agenda item</div>
        <TextInput label="Title" v-model="agendaItemTitle" />
        <!-- Description is optional -->
        <!-- 556px max w is a temp fix to stop editor breaking out of container -->
        <ToastUiEditor
          @updateValue="(t) => (agendaItemText = t)"
          label="Agenda item text"
          height="auto"
          initialEditType="markdown"
          ref="editor"
          class="max-w-[556px]"
        />
      </BaseCard>
      <button type="submit" class="btn mt-4">Add agenda item</button>
    </form>
  </template>

  <div v-if="agendaDue" class="grid gap-4 mb-4">
    <!-- TODO hide or minimize agenda if meeting has passed -->
    <BaseCard v-for="item in sortedAgenda" :key="item.index">
      <div>{{ item.title }}</div>

      <ToastUiViewer v-if="item.text" :initialValue="item.text" />

      <!-- badges, approve button -->
      <div v-if="collabAgenda.decision === Agency.OWNER">
        <div v-if="item.approved" class="badge badge-success">Approved</div>
        <div v-else-if="meetingPast" class="badge">Rejected</div>
        <button
          v-else-if="meeting.authorId === user.id"
          @click="approveAgendaItem(item.index)"
          class="btn btn-sm btn-accent mt-1"
        >
          Approve
        </button>
        <div v-else class="badge">Pending</div>
      </div>
      <div v-else-if="collabAgenda.decision === Agency.COLLAB">
        <div class="badge badge-neutral">Votes {{ item.votes.length }}</div>
      </div>
    </BaseCard>

    <MeetingNotes />
  </div>
</template>

<style scoped></style>
