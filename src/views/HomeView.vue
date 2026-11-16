<script setup lang="ts">
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
    return 'Good morning'
  } else if (hour >= 12 && hour < 18) {
    return 'Good afternoon'
  } else {
    return 'Good evening'
  }
}
</script>

<template>
  <SmallContainer class="pt-2 pb-8 sm:pt-6 sm:pb-10">
    <p class="text-sm opacity-70">
      {{ currentWorkspace?.name }} <span class="opacity-70">@{{ currentWorkspace?.handle }}</span>
    </p>
    <h1 class="text-3xl sm:text-4xl font-semibold tracking-tight">{{ getGreeting() }}</h1>
  </SmallContainer>

  <SmallContainer v-if="channels.length === 0">
    <div class="p-6 rounded-box border border-base-300 bg-base-100 text-center">
      <p class="mb-4">Create your first channel in this organization.</p>
      <RouterLink :to="{ name: 'newChannel' }" class="btn btn-lg btn-accent"
        >Create Channel</RouterLink
      >
    </div>
  </SmallContainer>
  <RecentConversations v-else />
</template>
