<script setup lang="ts">
import { computed, ref } from 'vue'
import ToastUiViewer from '@/components/ToastUiViewer.vue'
import ToastUiEditor from '@/components/ToastUiEditor.vue'
import ChatMessage from '@/components/ChatMessage.vue'
import MessageForm from '@/components/MessageForm.vue'
import HeadingTwo from '@/components/HeadingTwo.vue'
import { useKoreroStore } from '@/stores/korero'
import { storeToRefs } from 'pinia'
import { type Meeting } from '@/types'

const koreroStore = useKoreroStore()

const { currentConversation, messages } = storeToRefs(koreroStore)

// We know the conversation is a meeting
const meeting = computed(() => currentConversation.value as Meeting)

const notes = ref('')
const notesValidationError = ref('')
const editor = ref<InstanceType<typeof ToastUiEditor> | null>(null)

async function postMeetingNotes() {
  if (!notes.value) {
    notesValidationError.value = 'A message is required'
    return
  }
  await koreroStore.updateConversation(meeting.value.id, {
    notes: notes.value
  })
  notes.value = ''
  editor.value?.clearMarkdown()
}

const meetingPast = computed(() => {
  return new Date(meeting.value.date) < new Date()
})

const preMeetingMessages = computed(() => {
  const meetingDate = new Date(meeting.value.date)
  return messages.value.filter((m) => new Date(m.created) < meetingDate)
})

const postMeetingMessages = computed(() => {
  console.log('meeting.value.date', meeting.value.date)
  const meetingDate = new Date(meeting.value.date)
  console.log('# meetingDate vs messageCreated')
  console.log('meeting date', meetingDate)
  return messages.value.filter((m) => {
    console.log('- message date str', m.created)
    console.log(new Date(m.created))
    return new Date(m.created) > meetingDate
  })
})
</script>

<template>
  <template v-if="!meeting.notes">
    <!-- TODO minimize messages when we have notes -->
    <HeadingTwo v-if="preMeetingMessages.length" class="pt-4">Pre-Meeting Messages</HeadingTwo>
    <ChatMessage v-for="message in preMeetingMessages" :key="message.id" :message="message" />
  </template>

  <template v-if="meeting.notes">
    <details class="collapse bg-base-200">
      <summary class="collapse-title text-sm">Pre-Meeting Messages</summary>
      <div class="collapse-content">
        <ChatMessage v-for="message in preMeetingMessages" :key="message.id" :message="message" />
      </div>
    </details>

    <HeadingTwo class="pt-4">Meeting Notes</HeadingTwo>
    <ToastUiViewer :initialValue="meeting.notes" />
  </template>

  <HeadingTwo v-if="postMeetingMessages.length" class="pt-4">Post-Meeting Messages</HeadingTwo>
  <ChatMessage v-for="message in postMeetingMessages" :key="message.id" :message="message" />

  <div v-if="meetingPast && !meeting.notes">
    <ToastUiEditor
      @updateValue="(t) => (notes = t)"
      label="Add meeting notes"
      height="auto"
      :validationError="notesValidationError"
      initialEditType="markdown"
      ref="editor"
    />
    <button @click="postMeetingNotes" class="btn btn-accent mt-4">Post Meeting Notes</button>
  </div>
  <MessageForm v-else />
</template>

<style scoped></style>
