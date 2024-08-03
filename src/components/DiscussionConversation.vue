<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'
import HeadingTwo from '@/components/HeadingTwo.vue'
import ToastUiViewer from '@/components/ToastUiViewer.vue'
import ChatMessage from '@/components/ChatMessage.vue'
import MessageForm from '@/components/MessageForm.vue'
import type { Discussion } from '@/types'

const koreroStore = useKoreroStore()
// We know the conversation is a discussion
const discussion = koreroStore.currentConversation as Discussion
</script>

<template>
  <ToastUiViewer :initialValue="discussion.message" />

  <HeadingTwo class="pt-8 text-center">Comments</HeadingTwo>

  <ChatMessage v-for="message in koreroStore.messages" :key="message.id" :message="message" />

  <MessageForm />
</template>

<style></style>
