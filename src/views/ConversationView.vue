<script setup lang="ts">
import { computed } from 'vue'

import { useKoreroStore } from '@/stores/korero'
import AnnouncementConversation from '@/components/AnnouncementConversation.vue'
import DiscussionConversation from '@/components/DiscussionConversation.vue'
import BrainstormConversation from '@/components/BrainstormConversation.vue'
import QuestionConversation from '@/components/QuestionConversation.vue'
import PollConversation from '@/components/PollConversation.vue'
import MeetingConversation from '@/components/MeetingConversation.vue'
import ChannelBreadcrumbNav from '@/components/ChannelBreadcrumbNav.vue'
import FormatDateString from '@/components/FormatDateString.vue'
import HeadingOne from '@/components/HeadingOne.vue'
import SmallContainer from '@/components/SmallContainer.vue'
import { ConversationType } from '@/types'
import { useRoute } from 'vue-router'

const route = useRoute()
const koreroStore = useKoreroStore()

const conversationId = route.params.conversationId as string

koreroStore.setConversation(conversationId as string)

const conversationTitle = computed(() => {
  if (koreroStore.currentConversation) {
    return koreroStore.currentConversation.title
  }
  return conversationId
})
</script>

<template>
  <ChannelBreadcrumbNav :currentTitle="conversationTitle" />

  <SmallContainer>
    <template v-if="!koreroStore.currentConversation">
      <p>Cannot find conversation</p>
    </template>
    <template v-else>
      <div class="pb-4">
        <HeadingOne>{{ conversationTitle }}</HeadingOne>
        <div class="italic text-xs">
          By {{ koreroStore.getUser(koreroStore.currentConversation.authorId).name }} on
          <FormatDateString
            :dateString="koreroStore.currentConversation.created"
            :defaultCss="false"
          />
        </div>
        <div class="badge">{{ koreroStore.currentConversation.type }}</div>
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
  </SmallContainer>
</template>

<style></style>
