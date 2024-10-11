<script setup lang="ts">
import type { Conversation } from '@/types'
import ConversationListItem from './ConversationListItem.vue'

defineProps<{ conversations: Conversation[] }>()
</script>

<template>
  <div class="flex flex-col gap-3">
    <ConversationListItem
      v-for="conversation in conversations"
      :key="conversation.id"
      :conversation="conversation"
      class="[&:not(:last-child)]:border-b border-slate-200 [&:not(:last-child)]:pb-4"
    />
  </div>
</template>

<style scoped></style>
