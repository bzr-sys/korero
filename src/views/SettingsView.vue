<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'
import HeadingOne from '@/components/HeadingOne.vue'

const koreroStore = useKoreroStore()
</script>

<template>
  <div class="max-w-xl mx-auto">
    <HeadingOne class="pb-8">Settings</HeadingOne>
    <template v-if="koreroStore.config">
      <div><span class="font-bold">Team ID:</span> {{ koreroStore.config.currentTeam }}</div>
    </template>
  </div>
</template>

<style scoped></style>
