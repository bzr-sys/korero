<script setup lang="ts">
import { computed } from 'vue'
import { useKoreroStore } from '@/stores/korero'
import router from '@/router'
import ClickableCard from '@/components/ClickableCard.vue'
import HeadingOne from '@/components/HeadingOne.vue'
import BreadcrumbNav from '@/components/BreadcrumbNav.vue'

const channelId = router.currentRoute.value.params.id as string

const koreroStore = useKoreroStore()

koreroStore.setChannel(channelId)

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
  <BreadcrumbNav />

  <div class="flex gap-4 justify-between items-center">
    <HeadingOne class="text-center">Conversations</HeadingOne>
    <button @click="newConversation" class="btn btn-sm btn-accent">New conversation</button>
  </div>

  <div class="py-4 grid grid-cols-3 gap-4">
    <ClickableCard
      v-for="conversation in koreroStore.conversations"
      :key="conversation.id"
      @click="goToConversation(conversation.id)"
    >
      <div class="flex gap-4 justify-between items-center">
        <div>{{ conversation.title }}</div>
        <div class="badge badge-secondary">{{ conversation.type }}</div>
      </div>
    </ClickableCard>
  </div>
</template>

<style></style>
