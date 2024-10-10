<script setup lang="ts">
import HeadingOne from '@/components/HeadingOne.vue'
import BaseCard from '@/components/BaseCard.vue'
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
  <HeadingOne>Create a new conversation</HeadingOne>
  <div class="grid grid-cols-3 gap-4 py-4">
    <BaseCard v-for="(type, index) in ConversationType" :key="index">
      <h2 class="card-title capitalize">{{ type }}</h2>
      <p>{{ getTypeDescription(type) }}</p>
      <div>
        <RouterLink
          :to="{ name: 'newConversation', params: { channelId }, query: { type } }"
          class="btn btn-accent"
          >Choose</RouterLink
        >
      </div>
    </BaseCard>
  </div>
</template>

<style scoped></style>
