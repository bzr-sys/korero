<script setup lang="ts">
import { ref } from 'vue'

import { useKoreroStore } from '@/stores/korero'
import ToastUiViewer from '@/components/ToastUiViewer.vue'
import ToastUiEditor from '@/components/ToastUiEditor.vue'
import { MessageType, type Question } from '@/types'

const koreroStore = useKoreroStore()
// We know the conversation is a question
const question = koreroStore.currentConversation as Question

const newMessage = ref('')
const editor = ref<InstanceType<typeof ToastUiEditor> | null>(null)
async function postMessage() {
  if (!newMessage.value) {
    return
  }
  await koreroStore.createMessage({
    conversationId: question.id,
    type: MessageType.COMMENT,
    text: newMessage.value
  })
  newMessage.value = ''
  editor.value?.clearMarkdown()
}

// QUESTION

async function markAnswer(messageId: string) {
  await koreroStore.updateConversation(question.id, {
    answer: messageId
  })
}
</script>

<template>
  <div class="border p-4">
    <ToastUiViewer :initialValue="question.message" />
  </div>

  <div v-if="question.answer">
    <p>Answered in: {{ question.answer }}</p>
  </div>

  <!-- Start comment thread -->

  <div v-for="message in koreroStore.messages" :key="message.id" class="border p-4">
    <div v-if="question.answer == message.id">
      <p>This is the answer:</p>
    </div>
    <div v-else-if="!question.answer && question.author == koreroStore.user.id">
      <button
        @click="markAnswer(message.id)"
        class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded self-center"
      >
        Mark as answer
      </button>
    </div>

    <ToastUiViewer :initialValue="message.text" />
  </div>

  <div v-if="!question.answer">
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
