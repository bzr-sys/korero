<script setup lang="ts">
import { ref } from 'vue'

import { useKoreroStore } from '@/stores/korero'
import ToastUiViewer from '@/components/ToastUiViewer.vue'
import ToastUiEditor from '@/components/ToastUiEditor.vue'
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
  <div class="border p-4">
    <ToastUiViewer :initialValue="discussion.message" />
  </div>

  <div v-for="message in koreroStore.messages" :key="message.id" class="border p-4">
    <ToastUiViewer :initialValue="message.text" />
  </div>

  <div>
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
</template>

<style></style>
