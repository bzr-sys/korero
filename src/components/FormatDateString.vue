<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    /** A valid date string */
    dateString: string
    defaultCss?: boolean
  }>(),
  {
    defaultCss: true
  }
)

function formatDateString() {
  const date = new Date(props.dateString)
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
    formatDateString()
  }}</time>
</template>

<style scoped></style>
