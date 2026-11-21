<script setup lang="ts">
import HeadingOne from '@/components/HeadingOne.vue'
import ConversationTypeIcon from '@/components/ConversationTypeIcon.vue'
import { ConversationType } from '@/types'
import { useRoute } from 'vue-router'
import { useKoreroStore } from '@/stores/korero'

const route = useRoute()
const koreroStore = useKoreroStore()

const channelId = route.params.channelId

koreroStore.setChannel(channelId as string)

// TODO descriptions

function getTypeDescription(type: ConversationType) {
  switch (type) {
    case ConversationType.MEETING:
      return 'Create an agenda on your own or collaboratively with your team.'
    case ConversationType.POLL:
      return 'Gather votes and insights from your team.'
    case ConversationType.BRAINSTORM:
      return 'Collect and discuss ideas and suggestions from your team.'
    case ConversationType.DISCUSSION:
      return 'Engage in a conversation on any topic.'
    case ConversationType.ANNOUNCEMENT:
      return 'Post a memo that is not open for comments.'
    case ConversationType.QUESTION:
      return 'Get answers from your team and choose the best one.'

    default:
      return ''
  }
}
</script>

<template>
  <HeadingOne class="pb-4">Create a new <span class="text-accent">conversation</span></HeadingOne>
  <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-screen-2xl">
    <div
      v-for="(type, index) in ConversationType"
      :key="index"
      class="p-4 sm:p-6 rounded-box border border-base-300 bg-base-100 flex flex-col justify-between hover:border-accent/40 transition-colors"
    >
      <!-- top -->
      <div>
        <div class="flex gap-4 items-center">
          <span class="grid place-items-center p-2.5 rounded-full bg-mint-soft shrink-0">
            <ConversationTypeIcon :type="type" width="22px" />
          </span>
          <div>
            <h2 class="text-lg font-semibold capitalize">{{ type }}</h2>
          </div>
        </div>
        <p class="py-4 text-sm opacity-80">{{ getTypeDescription(type) }}</p>
      </div>
      <!-- bottom -->
      <RouterLink
        :to="{ name: 'newConversation', params: { channelId }, query: { type } }"
        class="btn btn-accent btn-soft btn-block"
        >Create {{ type }}</RouterLink
      >
    </div>
  </div>
</template>

<style scoped></style>
