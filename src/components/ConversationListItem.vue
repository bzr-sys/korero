<script setup lang="ts">
import type { Conversation } from '@/types'
import ConversationTypeIcon from './ConversationTypeIcon.vue'
import FormatDateString from './FormatDateString.vue'
import { useKoreroStore } from '@/stores/korero'

const { conversation, iconWidth } = defineProps<{
  conversation: Conversation
  iconWidth?: string
}>()

const koreroStore = useKoreroStore()
</script>

<template>
  <li class="flex gap-3 sm:gap-4 items-center">
    <span class="grid place-items-center p-2.5 rounded-full bg-mint-soft shrink-0">
      <ConversationTypeIcon :type="conversation.type" :width="iconWidth" />
    </span>
    <div class="min-w-0">
      <h2 class="font-semibold text-base sm:text-lg leading-snug hover:text-accent">
        <!-- could make this not a link when on the conversation view -->
        <RouterLink :to="{ name: 'conversation', params: { conversationId: conversation.id } }">{{
          conversation.title
        }}</RouterLink>
      </h2>
      <div class="text-xs opacity-70 mt-0.5">
        By {{ koreroStore.getUser(conversation.authorId).name }} on
        <FormatDateString :dateString="conversation.created" :defaultCss="false" /> in
        <RouterLink
          :to="{ name: 'channel', params: { channelId: conversation.channelId } }"
          class="link"
          >{{ koreroStore.getChannelName(conversation.channelId) }}</RouterLink
        >
      </div>
    </div>
  </li>
</template>

<style scoped></style>
