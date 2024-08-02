<script setup lang="ts">
import { ref } from 'vue'

import { useKoreroStore } from '@/stores/korero'
import HeadingTwo from '@/components/HeadingTwo.vue'
import ToastUiViewer from '@/components/ToastUiViewer.vue'
import ToastUiEditor from '@/components/ToastUiEditor.vue'
import ChatMessage from '@/components/ChatMessage.vue'
import { MessageType, type Discussion } from '@/types'

const koreroStore = useKoreroStore()
// We know the conversation is a discussion
const discussion = koreroStore.currentConversation as Discussion

const newMessage = ref('')
const editor = ref<InstanceType<typeof ToastUiEditor> | null>(null)
async function postMessage() {
  if (!newMessage.value) {
    return
  }
  await koreroStore.createMessage({
    conversationId: discussion.id,
    type: MessageType.COMMENT,
    text: newMessage.value
  })
  newMessage.value = ''
  editor.value?.clearMarkdown()
}
</script>

<template>
  <ToastUiViewer :initialValue="discussion.message" />

  <HeadingTwo class="pt-8 text-center">Comments</HeadingTwo>

  <ChatMessage v-for="message in koreroStore.messages" :key="message.id" :message="message" />

  <ToastUiEditor
    @updateValue="(t) => (newMessage = t)"
    label="Write a comment"
    height="auto"
    initialEditType="markdown"
    ref="editor"
  />

  <div>
    <button @click="postMessage" class="btn btn-accent mt-4">Comment</button>
  </div>
</template>

<style></style>
