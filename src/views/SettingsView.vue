<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'
import HeadingOne from '@/components/HeadingOne.vue'
import ManageTeam from '@/components/ManageTeam.vue'

const koreroStore = useKoreroStore()
</script>

<template>
  <div class="max-w-xl mx-auto">
    <HeadingOne class="pb-8">Org Management</HeadingOne>
    <template v-if="koreroStore.state">
      <ManageTeam />
    </template>
  </div>
</template>

<style scoped></style>
