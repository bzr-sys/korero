<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const channelId = router.currentRoute.value.params.id as string

const koreroStore = useKoreroStore()

const channelName = computed(() => {
  if (koreroStore.currentChannel) {
    return koreroStore.currentChannel.name
  }
  return channelId
})
</script>

<template>
  <div class="breadcrumbs text-sm pb-12">
    <ul class="justify-center">
      <li>
        <RouterLink :to="{ name: 'home' }">Channels</RouterLink>
      </li>
      <li v-if="route.name === 'channel'">
        <span class="sr-only">Channel name: </span>{{ channelName }}
      </li>
      <slot></slot>
    </ul>
  </div>
</template>

<style scoped></style>
