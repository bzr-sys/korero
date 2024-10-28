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
  <HeadingOne class="pb-2">Create a new <span class="text-accent">conversation</span></HeadingOne>
  <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-screen-2xl">
    <div
      v-for="(type, index) in ConversationType"
      :key="index"
      class="py-4 px-6 rounded border border-slate-200 flex flex-col justify-between"
    >
      <!-- top -->
      <div>
        <div class="flex gap-4 items-center">
          <ConversationTypeIcon :type="type" class="flex-shrink-0" width="24px" />
          <div>
            <h2 class="card-title capitalize">{{ type }}</h2>
          </div>
        </div>
        <p class="py-4">{{ getTypeDescription(type) }}</p>
      </div>
      <!-- bottom -->
      <RouterLink
        :to="{ name: 'newConversation', params: { channelId }, query: { type } }"
        class="btn btn-accent btn-block"
        >Create {{ type }}</RouterLink
      >
    </div>
  </div>
</template>

<style scoped></style>
