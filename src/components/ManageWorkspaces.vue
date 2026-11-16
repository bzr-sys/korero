<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'
import { storeToRefs } from 'pinia'
import { bzr } from '@/bazaar'
import HeadingTwo from './HeadingTwo.vue'
import BazaarLogoIcon from './BazaarLogoIcon.vue'

const koreroStore = useKoreroStore()
const { orgs, currentOrg } = storeToRefs(koreroStore)

// Creating, joining and subscribing happen in Bazaar
function openOrgModal() {
  bzr.orgs.openPopup(null, () => koreroStore.refresh())
}
</script>

<template>
  <HeadingTwo class="pb-4">Organizations</HeadingTwo>
  <ul class="rounded border border-slate-200 divide-y divide-slate-200 mb-4">
    <li v-for="org in orgs" :key="org.id" class="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
      <div class="min-w-0 flex-1">
        <div class="font-bold truncate">{{ org.name }}</div>
        <div class="opacity-70 text-sm truncate">@{{ org.handle }}</div>
        <template v-if="!org.active">
          <button
            v-if="koreroStore.isOrgAdmin(org)"
            class="link text-sm text-amber-700"
            @click="openOrgModal"
          >
            No plan: subscribe in Bazaar
          </button>
          <div v-else class="text-sm text-amber-700">No plan: ask an owner to subscribe</div>
        </template>
      </div>
      <span v-if="org.id === currentOrg?.id" class="text-sm font-bold text-green-700">Current</span>
      <button v-else class="btn btn-sm btn-accent" @click="koreroStore.chooseOrg(org.id)">
        {{ currentOrg ? 'Switch' : 'Open' }}
      </button>
    </li>
  </ul>
  <button @click="openOrgModal" class="btn btn-sm">
    <BazaarLogoIcon width="12px" /> Manage organizations in Bazaar
  </button>
</template>
