<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'
import AnnouncementConversation from '@/components/AnnouncementConversation.vue'
import DiscussionConversation from '@/components/DiscussionConversation.vue'
import BrainstormConversation from '@/components/BrainstormConversation.vue'
import QuestionConversation from '@/components/QuestionConversation.vue'
import PollConversation from '@/components/PollConversation.vue'
import MeetingConversation from '@/components/MeetingConversation.vue'
import SmallContainer from '@/components/SmallContainer.vue'
import { ConversationType } from '@/types'
import { useRoute } from 'vue-router'
import ConversationListItem from '@/components/ConversationListItem.vue'

const route = useRoute()
const koreroStore = useKoreroStore()

const conversationId = route.params.conversationId as string

koreroStore.setConversation(conversationId as string)
</script>

<template>
  <SmallContainer>
    <div class="mt-12 py-4 px-6 rounded border border-slate-200">
      <template v-if="!koreroStore.currentConversation">
        <p>Cannot find conversation</p>
      </template>
      <template v-else>
        <ConversationListItem
          :conversation="koreroStore.currentConversation"
          iconWidth="36px"
          class="pb-8"
        />

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
  </SmallContainer>
</template>

<style></style>
