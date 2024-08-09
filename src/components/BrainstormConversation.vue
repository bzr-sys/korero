<script setup lang="ts">
import { computed } from 'vue'
import { useKoreroStore } from '@/stores/korero'
import FormatDateString from '@/components/FormatDateString.vue'
import HeadingTwo from './HeadingTwo.vue'
import ToastUiViewer from '@/components/ToastUiViewer.vue'
import MessageForm from '@/components/MessageForm.vue'
import ChatMessage from './ChatMessage.vue'
import { type Brainstorm } from '@/types'
import { storeToRefs } from 'pinia'

const koreroStore = useKoreroStore()
const { currentConversation, messages, user } = storeToRefs(koreroStore)

// We know the conversation is a brainstorm
const brainstorm = computed(() => currentConversation.value as Brainstorm)

const pastDue = computed(() => {
  if (new Date(brainstorm.value.due) < new Date()) {
    return true
  }
  return false
})

const myMessages = computed(() => {
  return messages.value.filter((m) => m.authorId === user.value.id)
})

const canWrite = computed(() => {
  if (pastDue.value) {
    return true
  }
  return myMessages.value.length === 0
})
</script>

<template>
  <FormatDateString :dateString="brainstorm.due" />

  <ToastUiViewer :initialValue="brainstorm.message" />

  <template v-if="pastDue">
    <HeadingTwo class="pt-4">Messages</HeadingTwo>

    <ChatMessage v-for="message in messages" :key="message.id" :message="message" />
  </template>

  <template v-else>
    <HeadingTwo class="pt-4">My Suggestion</HeadingTwo>
    <ToastUiViewer v-for="message in myMessages" :key="message.id" :initialValue="message.text" />
  </template>

  <MessageForm
    v-if="canWrite"
    :label="pastDue ? 'Add a comment' : 'Add your brainstorm suggestion'"
  />
</template>

<style></style>
