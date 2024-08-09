<script setup lang="ts">
import { computed } from 'vue'

import { useKoreroStore } from '@/stores/korero'
import ToastUiViewer from '@/components/ToastUiViewer.vue'
import HeadingTwo from '@/components/HeadingTwo.vue'
import ChatMessage from '@/components/ChatMessage.vue'
import MessageForm from '@/components/MessageForm.vue'
import ValidationError from '@/components/ValidationError.vue'
import { getPluralEnding } from '@/utils/getPluralEnding'
import { ConversationType, type Message, type Question } from '@/types'
import { storeToRefs } from 'pinia'

const koreroStore = useKoreroStore()
const { currentConversation, messages, user } = storeToRefs(koreroStore)

// We know the conversation is a question
const question = computed(() => currentConversation.value as Question)

async function markAnswer(messageId: string) {
  await koreroStore.updateConversation(question.value.id, {
    answerId: messageId
  })
}

const chosenAnswer = computed<Message | undefined>(() => {
  return messages.value.find((answerId) => answerId.id === question.value.answerId)
})
</script>

<template>
  <template v-if="question.type !== ConversationType.QUESTION">
    <ValidationError>Conversation type is not <strong>question</strong>!</ValidationError>
  </template>
  <template v-else>
    <ToastUiViewer :initialValue="question.message" />

    <div v-if="chosenAnswer" class="pt-8">
      <ChatMessage :message="chosenAnswer" />
      <div class="badge badge-success">Chosen Answer</div>
    </div>

    <HeadingTwo class="pt-4"
      >{{ messages.length }} Answer{{ getPluralEnding(messages) }}</HeadingTwo
    >

    <div v-for="message in messages" :key="message.id">
      <ChatMessage :message="message" />
      <div v-if="question.answerId === message.id" class="badge badge-success">Chosen Answer</div>
      <div v-else-if="!question.answerId && question.authorId === user.id">
        <button @click="markAnswer(message.id)" class="btn btn-sm btn-accent mt-1">
          Mark as answer
        </button>
      </div>
    </div>

    <MessageForm v-if="!question.answerId" />
  </template>
</template>

<style></style>
