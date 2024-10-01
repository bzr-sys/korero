<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import { useKoreroStore } from '@/stores/korero'
import { bzr } from '@/bazaar'
import LogoIconSVG from './LogoIconSVG.vue'
import LogoTextSVG from './LogoTextSVG.vue'

const koreroStore = useKoreroStore()

const { state, orgs, user } = storeToRefs(koreroStore)

function login(): void {
  bzr.login()
}

function logOut(): void {
  bzr.logOut()
}

const currentOrg: ComputedRef<string> = computed(() => {
  if (!state.value) {
    return 'Choose org'
  }
  if (user.value.id === state.value.config.currentTeam) {
    return user.value.name
  }
  const org = orgs.value.filter((o) => o.id === state.value!.config.currentTeam)
  if (org.length > 0) {
    return org[0].name
  }
  return 'Switch org'
})
</script>

<template>
  <header class="px-4 py-2 bg-slate-50">
    <div class="flex justify-between gap-4 items-center">
      <!-- left -->
      <div>
        <RouterLink :to="{ name: 'home' }"> <LogoTextSVG width="100px" /></RouterLink>
      </div>
      <!-- right -->
      <div>
        <ul>
          <li v-if="state">
            <RouterLink :to="{ name: 'settings' }" class="font-bold">{{ currentOrg }}</RouterLink>
          </li>
          <li v-if="koreroStore.authenticated">
            <button @click="logOut">Sign out</button>
          </li>
          <li v-else>
            <button @click="login" class="btn btn-accent btn-sm">Log in with Bazaar</button>
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>

<style scoped></style>
