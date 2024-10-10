<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'
import type { Conversation } from '@/types'
import ConversationTypeIcon from './ConversationTypeIcon.vue'
import FormatDateString from './FormatDateString.vue'

defineProps<{ conversations: Conversation[] }>()

const koreroStore = useKoreroStore()
</script>

<template>
  <div class="flex flex-col gap-3">
    <div
      v-for="conversation in conversations"
      :key="conversation.id"
      class="flex gap-4 items-center [&:not(:last-child)]:border-b border-slate-200 [&:not(:last-child)]:pb-4"
    >
      <ConversationTypeIcon :type="conversation.type" class="flex-shrink-0" />
      <div>
        <h2 class="card-title">
          <RouterLink :to="{ name: 'conversation', params: { conversationId: conversation.id } }">{{
            conversation.title
          }}</RouterLink>
        </h2>
        <div class="italic text-xs">
          By {{ koreroStore.getUser(conversation.authorId).name }} on
          <FormatDateString :dateString="conversation.created" :defaultCss="false" /> in
          <RouterLink
            :to="{ name: 'channel', params: { channelId: conversation.channelId } }"
            class="link"
            >{{ koreroStore.getChannelName(conversation.channelId) }}</RouterLink
          >
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
