<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'
import { storeToRefs } from 'pinia'
import { bzr } from '@/bazaar'
import HeadingTwo from './HeadingTwo.vue'
import SwitchSVG from './SwitchSVG.vue'
import BazaarLogoIcon from './BazaarLogoIcon.vue'

const koreroStore = useKoreroStore()

const { orgs, user, currentWorkspace } = storeToRefs(koreroStore)

function openOrgModal() {
  // @ts-ignore
  bzr.orgs.openModal(null, async () => {
    await koreroStore.setOrgs()
  })
}
</script>

<template>
  <HeadingTwo class="pb-4">Workspaces</HeadingTwo>

  <!-- grid 2x2 -->
  <div class="grid gap-y-4 grid-cols-[minmax(150px,1fr)_4fr] mb-12 [&>div]:p-2">
    <div class="text-right border-r border-slate-200">
      <h3 class="text-sm opacity-70">Personal</h3>
    </div>
    <div>
      <div
        v-if="currentWorkspace?.id === user.id"
        class="text-xs opacity-70 text-success font-bold"
      >
        Current workspace
      </div>
      <button
        @click="koreroStore.setTeam(user.id)"
        v-else
        class="link link-hover text-xs flex gap-1 items-center"
      >
        <SwitchSVG width="12px" /> <span>Switch workspace</span>
      </button>
      <div class="capitalize font-bold">{{ user.name }}</div>
      <div class="opacity-70 text-sm">{{ user.email }}</div>
      <div class="opacity-70 text-sm">@{{ user.handle }}</div>
    </div>
    <div class="text-right border-r border-slate-200">
      <h3 class="text-sm opacity-70">Organizations</h3>
    </div>
    <div class="flex flex-col gap-8">
      <div>
        <button @click="openOrgModal" class="btn btn-sm">
          <BazaarLogoIcon width="12px" /> Manage organizations
        </button>
      </div>
      <div v-for="org in orgs" :key="org.id">
        <div
          v-if="currentWorkspace?.id === org.id"
          class="text-xs opacity-70 text-success font-bold"
        >
          Current workspace
        </div>
        <template v-else-if="!org.active">
          <button v-if="org.admins.includes(user.id)" @click="openOrgModal()" class="text-xs">
            <span class="text-warning">&rarr;</span> Get Subscription
          </button>
          <span v-else class="text-xs opacity-70 text-error font-bold">Inactive</span>
        </template>
        <button
          v-else
          @click="koreroStore.setTeam(org.primaryTeam.id)"
          class="link link-hover text-xs flex gap-1 items-center"
        >
          <SwitchSVG width="12px" /> <span>Switch workspace</span>
        </button>
        <div class="capitalize font-bold">{{ org.name }}</div>
        <div class="opacity-70 text-sm">@{{ org.handle }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
