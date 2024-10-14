<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import SmallContainer from './SmallContainer.vue'
import ConversationList from './ConversationList.vue'

const koreroStore = useKoreroStore()
const { channels, conversations } = storeToRefs(koreroStore)

const orderedConversations = computed(() => {
  return conversations.value
    .map((c) => c)
    .sort((a, b) => {
      return new Date(b.created).getTime() - new Date(a.created).getTime()
    })
    .slice(0, 10)
})
</script>

<template>
  <SmallContainer>
    <h2 v-if="conversations.length > 0" class="font-bold pb-2">Recent Conversations</h2>
    <div class="py-4 px-6 rounded border border-slate-200">
      <div v-if="conversations.length === 0">
        <p class="pb-4">To get started, create a conversation in one of your channels:</p>
        <ul>
          <li v-for="channel in channels" :key="channel.id">
            <RouterLink
              :to="{ name: 'newConversationChoose', params: { channelId: channel.id } }"
              class="link link-hover"
              >&rarr; {{ channel.name }}</RouterLink
            >
          </li>
        </ul>
      </div>
      <ConversationList v-else :conversations="orderedConversations" />
    </div>
  </SmallContainer>
</template>

<style scoped></style>
