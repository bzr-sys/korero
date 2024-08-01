<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'
import ToastUiViewer from '@/components/ToastUiViewer.vue'
import type { Announcement } from '@/types'

const koreroStore = useKoreroStore()
// We know the conversation is an announcement
const announcement = koreroStore.currentConversation as Announcement
</script>

<template>
  <ToastUiViewer :initialValue="announcement.message" />
</template>

<style></style>
