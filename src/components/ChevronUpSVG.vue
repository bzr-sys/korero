<script setup lang="ts">
defineProps<{ width: string }>()
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 46"
    :style="`width: ${width}`"
    aria-hidden="true"
    aria-labelledby="chevron-up-icon"
  >
    <title id="chevron-up-icon">Chevron up icon</title>
    <polyline
      points="5,40 50,5 95,40"
      fill="none"
      stroke="black"
      stroke-width="10"
      stroke-linecap="round"
    />
  </svg>
</template>

<style scoped></style>
