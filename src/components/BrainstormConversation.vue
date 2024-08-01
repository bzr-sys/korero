<script setup lang="ts">
import { ref, computed } from 'vue'

import { useKoreroStore } from '@/stores/korero'
import FormatDateString from '@/components/FormatDateString.vue'
import HeadingTwo from './HeadingTwo.vue'
import ToastUiViewer from '@/components/ToastUiViewer.vue'
import ToastUiEditor from '@/components/ToastUiEditor.vue'
import ChatMessage from './ChatMessage.vue'
import { MessageType, type Brainstorm } from '@/types'

const koreroStore = useKoreroStore()
// We know the conversation is a brainstorm
const brainstorm = koreroStore.currentConversation as Brainstorm

const newMessage = ref('')
const editor = ref<InstanceType<typeof ToastUiEditor> | null>(null)
async function postMessage() {
  if (!newMessage.value) {
    return
  }
  await koreroStore.createMessage({
    conversationId: brainstorm.id,
    type: MessageType.COMMENT,
    text: newMessage.value
  })
  newMessage.value = ''
  editor.value?.clearMarkdown()
}

const pastDue = computed(() => {
  if (new Date(brainstorm.due) < new Date()) {
    return true
  }
  return false
})

const myMessages = computed(() => {
  return koreroStore.messages.filter((m) => m.authorId === koreroStore.user.id)
})

const canWrite = computed(() => {
  if (pastDue.value) {
    return true
  }
  return myMessages.value.length === 0
})
</script>

<template>
  <FormatDateString class="text-center" :dateString="brainstorm.due" />

  <ToastUiViewer :initialValue="brainstorm.message" />

  <template v-if="pastDue">
    <HeadingTwo class="pt-8 text-center">Messages</HeadingTwo>

    <ChatMessage v-for="message in koreroStore.messages" :key="message.id" :message="message" />
  </template>

  <template v-else>
    <HeadingTwo class="pt-8 text-center">My Suggestion</HeadingTwo>
    <ToastUiViewer v-for="message in myMessages" :key="message.id" :initialValue="message.text" />
  </template>

  <template v-if="canWrite">
    <ToastUiEditor
      @updateValue="(t) => (newMessage = t)"
      :label="pastDue ? 'Add a comment' : 'Add your brainstorm suggestion'"
      height="auto"
      initialEditType="markdown"
      ref="editor"
    />
    <div>
      <button @click="postMessage" class="btn btn-primary mt-4">Post message</button>
    </div>
  </template>
</template>

<style></style>
