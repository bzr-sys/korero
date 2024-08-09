<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'
import { useRoute } from 'vue-router'

const route = useRoute()

const channelId = route.params.channelId as string

const koreroStore = useKoreroStore()

koreroStore.setChannel(channelId)
</script>

<template>
  <RouterView />
</template>

<style></style>
