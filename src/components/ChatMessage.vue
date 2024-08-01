<script setup lang="ts">
import ToastUiViewer from '@/components/ToastUiViewer.vue'
import FormatDateString from '@/components/FormatDateString.vue'
import type { Message } from '@/types'
import { useKoreroStore } from '@/stores/korero'

defineProps<{
  message: Message
}>()

const koreroStore = useKoreroStore()
</script>

<template>
  <div>
    <div :class="koreroStore.user.id === message.authorId && 'text-right'">
      {{ koreroStore.getUser(message.authorId).name }}
      <span v-if="koreroStore.user.id === message.authorId">(me)</span>
      <time class="text-xs opacity-50"><FormatDateString :dateString="message.created" /></time>
    </div>
    <ToastUiViewer :initialValue="message.text" />
  </div>
</template>

<style scoped></style>
