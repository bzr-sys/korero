<script setup lang="ts">
import { computed } from 'vue'
import { useKoreroStore } from '@/stores/korero'
import DueDate from '@/components/DueDate.vue'
import HeadingTwo from './HeadingTwo.vue'
import EditViewer from '@/components/EditViewer.vue'
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
  <DueDate label="Contribute ideas by" :dateString="brainstorm.due" />

  <EditViewer
    :initialValue="brainstorm.message"
    :editValue="koreroStore.editConversation(currentConversation?.id)"
  />

  <template v-if="pastDue">
    <HeadingTwo class="pt-4">Messages</HeadingTwo>

    <ChatMessage v-for="message in messages" :key="message.id" :message="message" />
  </template>

  <template v-else>
    <ChatMessage v-for="message in myMessages" :key="message.id" :message="message" />
  </template>

  <MessageForm
    v-if="canWrite"
    :label="pastDue ? 'Add a comment' : 'Contribute your ideas'"
    :buttonText="pastDue ? 'Comment' : 'Contribute ideas'"
  />
</template>

<style></style>
