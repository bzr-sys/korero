<script setup lang="ts">
import HeadingOne from '@/components/HeadingOne.vue'
import { useKoreroStore } from '@/stores/korero'
import RecentConversations from '@/components/RecentConversations.vue'
import SmallContainer from '@/components/SmallContainer.vue'
import { storeToRefs } from 'pinia'

const koreroStore = useKoreroStore()
const { currentWorkspace, channels, currentChannel } = storeToRefs(koreroStore)

// Sync on each visit since subscription does not work: https://github.com/bzr-sys/bazaar-server/issues/181
koreroStore.syncChannels()

// Reset channel
currentChannel.value = undefined

function getGreeting() {
  const hour = new Date().getHours()

  if (hour >= 5 && hour < 12) {
    return 'Good Morning'
  } else if (hour >= 12 && hour < 18) {
    return 'Good Afternoon'
  } else {
    return 'Good Evening'
  }
}
</script>

<template>
  <HeadingOne>Home</HeadingOne>
  <div class="text-center pt-8 py-8">
    <div class="text-4xl">{{ getGreeting() }}</div>
    <div class="text-lg">{{ currentWorkspace?.name }}</div>
    <div class="opacity-70 text-sm">@{{ currentWorkspace?.handle }}</div>
  </div>

  <SmallContainer v-if="channels.length === 0">
    <div class="p-6 rounded border border-slate-200 text-center">
      <p class="mb-4">Create your first channel in this workspace.</p>
      <RouterLink :to="{ name: 'newChannel' }" class="btn btn-lg btn-accent"
        >Create Channel</RouterLink
      >
    </div>
  </SmallContainer>
  <RecentConversations v-else />
</template>
