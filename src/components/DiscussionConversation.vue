<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'
import HeadingTwo from '@/components/HeadingTwo.vue'
import ToastUiViewer from '@/components/ToastUiViewer.vue'
import ChatMessage from '@/components/ChatMessage.vue'
import MessageForm from '@/components/MessageForm.vue'
import { getPluralEnding } from '@/utils/getPluralEnding'
import type { Discussion } from '@/types'
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

const koreroStore = useKoreroStore()
const { currentConversation, orderedMessages } = storeToRefs(koreroStore)

// We know the conversation is a discussion
const discussion = computed(() => currentConversation.value as Discussion)
</script>

<template>
  <ToastUiViewer :initialValue="discussion.message" />

  <HeadingTwo class="pt-4"
    >{{ orderedMessages.length }} Comment{{ getPluralEnding(orderedMessages) }}</HeadingTwo
  >

  <ChatMessage v-for="message in orderedMessages" :key="message.id" :message="message" />

  <MessageForm />
</template>

<style></style>
