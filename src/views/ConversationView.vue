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
  <div class="max-w-4xl mx-auto">
    <template v-if="!koreroStore.currentConversation">
      <p>Cannot find conversation</p>
    </template>
    <template v-else>
      <div class="text-center pb-12">
        <div class="badge badge-neutral">
          <RouterLink
            :to="{ name: 'channel', params: { id: koreroStore.currentConversation.channelId } }"
          >
            <span class="sr-only">Channel name: </span>
            {{ koreroStore.getChannel(koreroStore.currentConversation.channelId).name }}
          </RouterLink>
        </div>
        /
        <div class="badge badge-neutral">
          <span class="sr-only">Conversation title: </span> {{ conversationTitle }}
        </div>
        <div class="badge badge-secondary">{{ koreroStore.currentConversation.type }}</div>
      </div>

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
    </template>
  </div>
</template>

<style></style>
