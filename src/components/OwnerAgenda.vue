<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'
import MeetingNotes from './MeetingNotes.vue'
import MarkdownView from '@/components/MarkdownView.vue'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import type { Meeting, OwnerAgenda } from '@/types'

const koreroStore = useKoreroStore()

const { currentConversation } = storeToRefs(koreroStore)

const meeting = computed(() => currentConversation.value as Meeting)
const ownerAgenda = computed(() => meeting.value.agenda as OwnerAgenda)
</script>

<template>
  <MarkdownView :markdown="ownerAgenda.text" />
  <MeetingNotes />
</template>

<style scoped></style>
