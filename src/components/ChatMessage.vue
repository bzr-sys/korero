<script setup lang="ts">
import EditViewer from '@/components/EditViewer.vue'
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

    <EditViewer :initialValue="message.text" :editValue="koreroStore.editMessage(message.id)" />
  </div>
</template>

<style scoped></style>
