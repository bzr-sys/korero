<script setup lang="ts">
import { computed, ref } from 'vue'

import { useKoreroStore } from '@/stores/korero'
import router from '@/router'
import AnnouncementConversation from '@/components/AnnouncementConversation.vue'
import DiscussionConversation from '@/components/DiscussionConversation.vue'
import BrainstormConversation from '@/components/BrainstormConversation.vue'
import QuestionConversation from '@/components/QuestionConversation.vue'
import PollConversation from '@/components/PollConversation.vue'
import MeetingConversation from '@/components/MeetingConversation.vue'
import { ConversationType } from '@/types'

const conversationId = router.currentRoute.value.params.id

const koreroStore = useKoreroStore()

koreroStore.setConversation(conversationId as string)

const conversationTitle = computed(() => {
  if (koreroStore.currentConversation) {
    return koreroStore.currentConversation.title
  }
  return conversationId
})
</script>

<template>
  <p>Title: {{ conversationTitle }}</p>

  <div v-if="!koreroStore.currentConversation">
    <p>Cannot find conversation</p>
  </div>
  <div v-else>
    <RouterLink
      :to="{ name: 'channel', params: { id: koreroStore.currentConversation.channelId } }"
      class="inline-block bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded self-center"
    >
      Go back to channel
    </RouterLink>
    <div class="grid gap-4">
      <AnnouncementConversation
        v-if="koreroStore.currentConversation.type === ConversationType.ANNOUNCEMENT"
      />
      <DiscussionConversation
        v-else-if="koreroStore.currentConversation.type === ConversationType.DISCUSSION"
      />
      <BrainstormConversation
        v-else-if="koreroStore.currentConversation.type === ConversationType.BRAINSTORM"
      />
      <QuestionConversation
        v-else-if="koreroStore.currentConversation.type === ConversationType.QUESTION"
      />
      <PollConversation
        v-else-if="koreroStore.currentConversation.type === ConversationType.POLL"
      />
      <MeetingConversation
        v-else-if="koreroStore.currentConversation.type === ConversationType.MEETING"
      />
      <div v-else>Unknown conversation type</div>
    </div>
  </div>
</template>

<style></style>
@/stores/korero
