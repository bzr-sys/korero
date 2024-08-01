<script setup lang="ts">
import { computed, ref } from 'vue'

import { useKoreroStore } from '@/stores/korero'
import ToastUiViewer from '@/components/ToastUiViewer.vue'
import ToastUiEditor from '@/components/ToastUiEditor.vue'
import HeadingTwo from '@/components/HeadingTwo.vue'
import ChatMessage from '@/components/ChatMessage.vue'
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

const chosenAnswer = computed(() =>
  koreroStore.messages.find((answer) => answer.id === question.answer)
)
</script>

<template>
  <ToastUiViewer :initialValue="question.message" />

  <div v-if="chosenAnswer" class="pt-8">
    <ChatMessage :message="chosenAnswer" />
    <div class="badge badge-success">Chosen Answer</div>
  </div>

  <HeadingTwo class="pt-8 text-center">Answers</HeadingTwo>

  <div v-for="message in koreroStore.messages" :key="message.id">
    <ChatMessage :message="message" />
    <div v-if="question.answer == message.id" class="badge badge-success">Chosen Answer</div>
    <div v-else-if="!question.answer && question.authorId == koreroStore.user.id">
      <button @click="markAnswer(message.id)" class="btn btn-sm btn-primary mt-4">
        Mark as answer
      </button>
    </div>
  </div>

  <div v-if="!question.answer">
    <ToastUiEditor
      @updateValue="(t) => (newMessage = t)"
      label="Write a comment"
      height="auto"
      initialEditType="markdown"
      ref="editor"
    />
    <button @click="postMessage" class="btn mt-4">Comment</button>
  </div>
</template>

<style></style>
