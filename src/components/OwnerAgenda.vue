<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'
import MeetingNotes from './MeetingNotes.vue'
import ToastUiViewer from '@/components/ToastUiViewer.vue'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import type { Meeting, OwnerAgenda } from '@/types'

const koreroStore = useKoreroStore()

const { currentConversation } = storeToRefs(koreroStore)

const meeting = computed(() => currentConversation.value as Meeting)
const ownerAgenda = computed(() => meeting.value.agenda as OwnerAgenda)
</script>

<template>
  <ToastUiViewer :initialValue="ownerAgenda.text" />
  <MeetingNotes />
</template>

<style scoped></style>
