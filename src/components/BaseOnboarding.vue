<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'
import HeadingOne from './HeadingOne.vue'
import { bzr } from '@/bazaar'
import { storeToRefs } from 'pinia'

const koreroStore = useKoreroStore()
const { hasCompletedOnboarding, orgs, user } = storeToRefs(koreroStore)

function openOrgModal() {
  // @ts-ignore
  bzr.orgs.openModal(null, async () => {
    await koreroStore.setOrgs()
  })
}

function handleUsePersonal(): void {
  koreroStore.setTeam(user.value.id)
}

function handleUseOrg(orgPrimaryTeamId: string): void {
  koreroStore.setTeam(orgPrimaryTeamId)
}
</script>

<template>
  <div class="overflow-y-auto">
    <div v-if="!hasCompletedOnboarding" class="py-12 px-4 max-w-[450px] mx-auto">
      <div class="text-center">
        <HeadingOne className="text-4xl">Welcome!</HeadingOne>
        <div class="text-lg pb-8 opacity-70">Choose a workspace</div>
      </div>

      <div v-if="orgs.length < 1" class="text-center">
        <button @click="openOrgModal" class="btn btn-accent">Create your first organization</button>
      </div>
      <div v-else>
        <div class="flex justify-between gap-4 items-center pb-2">
          <h2 class="text-left font-bold">My organizations</h2>
          <button @click="openOrgModal" class="btn btn-xs">Create organization</button>
        </div>
        <div class="py-4 px-6 rounded border border-slate-200">
          <ul class="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <li
              v-for="org in orgs"
              :key="org.id"
              class="grid grid-flow-row max-sm:gap-3 sm:grid-flow-col sm:grid-cols-subgrid sm:col-span-5 items-center [&:not(:last-child)]:border-b border-slate-200 [&:not(:last-child)]:pb-4"
            >
              <div class="sm:col-span-3">
                <div class="card-title">{{ org.name }}</div>
                <div class="italic text-xs">@{{ org.handle }}</div>
              </div>
              <div class="sm:col-span-2">
                <button
                  v-if="org.active"
                  @click="handleUseOrg(org.primaryTeam.id)"
                  class="btn btn-sm btn-accent btn-block"
                >
                  Choose
                </button>
                <button v-else @click="openOrgModal" class="btn btn-sm btn-warning btn-block">
                  Get subscription
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div class="pt-4">
        <button @click="handleUsePersonal" class="btn btn-md btn-block btn-ghost">
          Or, choose personal use
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/*
  Enter and leave animations can use different
  durations and timing functions.
*/
.slide-fade-enter-active {
  transition: all 0.1s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.1s ease-out;
}

.slide-fade-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}
</style>
