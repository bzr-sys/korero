<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'
import ToastUiViewer from '@/components/ToastUiViewer.vue'
import type { Announcement } from '@/types'

const koreroStore = useKoreroStore()
// We know the conversation is an announcement
const announcement = koreroStore.currentConversation as Announcement
</script>

<template>
  <div class="border p-4">
    <ToastUiViewer :initialValue="announcement.message" />
  </div>
</template>

<style></style>
