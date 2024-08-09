<script setup lang="ts">
import type { DatetimeLocalInputString } from '@/types'

const props = withDefaults(
  defineProps<{
    dateString: DatetimeLocalInputString
    defaultCss?: boolean
  }>(),
  {
    defaultCss: true
  }
)

function formatDateString(string: DatetimeLocalInputString) {
  const date = new Date(string)
  return date.toLocaleDateString(undefined, {
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
  <time :class="{ 'italic text-xs': props.defaultCss }" :datetime="dateString">{{
    formatDateString(dateString)
  }}</time>
</template>

<style scoped></style>
