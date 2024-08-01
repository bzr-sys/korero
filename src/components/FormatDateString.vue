<script setup lang="ts">
import type { DatetimeLocalInputString } from '@/types'

defineProps<{
  dateString: DatetimeLocalInputString
}>()

function formatDateString(string: DatetimeLocalInputString) {
  const date = new Date(string)
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}
</script>

<template>
  <div class="italic text-xs">{{ formatDateString(dateString) }}</div>
</template>

<style scoped></style>
