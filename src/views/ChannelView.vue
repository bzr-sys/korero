<script setup lang="ts">
import { computed, ref } from 'vue'

import { useKoreroStore } from '@/stores/korero'
import router from '@/router'

const channelId = router.currentRoute.value.params.id

const koreroStore = useKoreroStore()

koreroStore.setChannel(channelId as string)

const channelName = computed(() => {
  if (koreroStore.currentChannel) {
    return koreroStore.currentChannel.name
  }
  return channelId
})

function newConversation() {
  router.push({ name: 'newConversation', params: { id: channelId } })
}

function goToConversation(channelId: string) {
  if (channelId) {
    router.push({ name: 'conversation', params: { id: channelId } })
  }
}
</script>

<template>
  <p>Channel is {{ channelName }}</p>
  <button
    @click="newConversation"
    class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded self-center"
  >
    New Conversation
  </button>
  <RouterLink
    :to="{ name: 'home' }"
    class="inline-block bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded self-center"
  >
    Go home
  </RouterLink>
  <div class="py-4 grid grid-cols-3">
    <div
      v-for="conversations in koreroStore.conversations"
      :key="conversations.id"
      class="border-2 border-orange-500 p-8"
      @click="goToConversation(conversations.id)"
    >
      <p>{{ conversations.title }}</p>
    </div>
  </div>
</template>

<style></style>
@/stores/korero
