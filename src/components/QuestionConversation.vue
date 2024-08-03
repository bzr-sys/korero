<script setup lang="ts">
import { computed } from 'vue'

import { useKoreroStore } from '@/stores/korero'
import ToastUiViewer from '@/components/ToastUiViewer.vue'
import HeadingTwo from '@/components/HeadingTwo.vue'
import ChatMessage from '@/components/ChatMessage.vue'
import MessageForm from '@/components/MessageForm.vue'
import type { Question } from '@/types'

const koreroStore = useKoreroStore()
// We know the conversation is a question
const question = koreroStore.currentConversation as Question

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
    <div v-if="question.answer === message.id" class="badge badge-success">Chosen Answer</div>
    <div v-else-if="!question.answer && question.authorId === koreroStore.user.id">
      <button @click="markAnswer(message.id)" class="btn btn-sm btn-accent mt-1">
        Mark as answer
      </button>
    </div>
  </div>

  <MessageForm v-if="!question.answer" />
</template>

<style></style>
