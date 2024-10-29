<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'
import EditViewer from '@/components/EditViewer.vue'
import type { Announcement } from '@/types'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const koreroStore = useKoreroStore()
const { currentConversation } = storeToRefs(koreroStore)

// We know the conversation is a announcement
const announcement = computed(() => currentConversation.value as Announcement)
</script>

<template>
  <EditViewer
    :initialValue="announcement.message"
    :editValue="koreroStore.editConversation(currentConversation?.id)"
  />
</template>

<style></style>
