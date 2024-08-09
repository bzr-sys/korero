<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'
import ToastUiViewer from '@/components/ToastUiViewer.vue'
import type { Announcement } from '@/types'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const koreroStore = useKoreroStore()
const { currentConversation } = storeToRefs(koreroStore)

// We know the conversation is a announcement
const announcement = computed(() => currentConversation.value as Announcement)
</script>

<template>
  <ToastUiViewer :initialValue="announcement.message" />
</template>

<style></style>
