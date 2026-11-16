<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useKoreroStore } from '@/stores/korero'
import SwitchSVG from './SwitchSVG.vue'

const koreroStore = useKoreroStore()
const { orgs, currentOrg } = storeToRefs(koreroStore)

// Without an open org the picker is on screen already
const others = computed(() =>
  currentOrg.value ? orgs.value.filter((o) => o.id !== currentOrg.value?.id) : []
)
</script>

<template>
  <li v-for="org in others" :key="org.id">
    <button
      @click="koreroStore.chooseOrg(org.id)"
      class="flex gap-2 items-center hover:bg-slate-100 w-full px-4 py-2 text-left"
    >
      <SwitchSVG width="18px" /> <span class="truncate">Switch to {{ org.name }}</span>
    </button>
  </li>
</template>
