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
    <div class="italic text-xs" :class="koreroStore.user.id === message.authorId && 'text-right'">
      By {{ koreroStore.getUser(message.authorId).name }} on
      <FormatDateString :dateString="message.created" :defaultCss="false" />
    </div>

    <ToastUiViewer :initialValue="message.text" />
  </div>
</template>

<style scoped></style>
