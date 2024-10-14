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
  <div class="flex gap-4 items-center">
    <ConversationTypeIcon :type="conversation.type" class="flex-shrink-0" :width="iconWidth" />
    <div>
      <h2 class="card-title">
        <!-- could make this not a link when on the conversation view -->
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
</template>

<style scoped></style>
