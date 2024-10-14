<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'
import { watch } from 'vue'
import { useRoute, type RouteLocationNormalizedLoadedGeneric } from 'vue-router'

const route = useRoute()

const koreroStore = useKoreroStore()

async function setChannelFromRoute(route: RouteLocationNormalizedLoadedGeneric) {
  const channelId = route.params.channelId as string
  await koreroStore.setChannel(channelId)
}

watch(
  route,
  (route) => {
    setChannelFromRoute(route)
  },
  { immediate: true }
)
</script>

<template>
  <RouterView />
</template>

<style></style>
