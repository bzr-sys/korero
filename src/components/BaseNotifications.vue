<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'

const koreroStore = useKoreroStore()
</script>

<template>
  <div class="toast toast-top toast-center">
    <div
      v-for="(notification, index) in koreroStore.notifications"
      :key="index"
      class="alert"
      :class="`alert-${notification.type}`"
    >
      <span>{{ notification.message }}</span>
    </div>
  </div>
</template>

<style scoped></style>
