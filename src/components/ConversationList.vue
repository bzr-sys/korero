<script setup lang="ts">
import type { Conversation } from '@/types'
import ConversationListItem from './ConversationListItem.vue'

defineProps<{ conversations: Conversation[] }>()
</script>

<template>
  <ul class="flex flex-col gap-3">
    <ConversationListItem
      v-for="conversation in conversations"
      :key="conversation.id"
      :conversation="conversation"
      class="[&:not(:last-child)]:border-b border-slate-200 [&:not(:last-child)]:pb-4"
    />
  </ul>
</template>

<style scoped></style>
