<script setup lang="ts">
import { computed } from 'vue'
import { useKoreroStore } from '@/stores/korero'
import HeadingTwo from '@/components/HeadingTwo.vue'
import DueDate from './DueDate.vue'
import OwnerAgenda from '@/components/OwnerAgenda.vue'
import CollabAgenda from '@/components/CollabAgenda.vue'
import { Agency, type Meeting } from '@/types'
import { storeToRefs } from 'pinia'

const koreroStore = useKoreroStore()
const { currentConversation } = storeToRefs(koreroStore)

// We know the conversation is a meeting
const meeting = computed(() => currentConversation.value as Meeting)
</script>

<template>
  <DueDate label="Meeting on" :dateString="meeting.date" />

  <HeadingTwo class="pt-4">Agenda</HeadingTwo>
  <OwnerAgenda v-if="meeting.agenda.setting === Agency.OWNER" />
  <CollabAgenda v-if="meeting.agenda.setting === Agency.COLLAB" />
</template>

<style></style>
