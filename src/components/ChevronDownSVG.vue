<script setup lang="ts">
defineProps<{ width: string }>()
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 46"
    :style="`width: ${width}`"
    aria-hidden="true"
    aria-labelledby="chevron-down-icon"
  >
    <title id="chevron-down-icon">Chevron down icon</title>
    <polyline
      points="5,5 50,40 95,5"
      fill="none"
      stroke="black"
      stroke-width="10"
      stroke-linecap="round"
    />
  </svg>
</template>

<style scoped></style>
