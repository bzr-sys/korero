<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'
import { bzr } from '@/bazaar'
import { RouterLink } from 'vue-router'
import LogoIconSVG from './components/LogoIconSVG.vue'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import type { ComputedRef } from 'vue'

const koreroStore = useKoreroStore()
koreroStore.autoSignIn()

bzr.onLogin(async () => {
  koreroStore.autoSignIn()
})

function login(): void {
  bzr.login()
}

function logOut(): void {
  bzr.logOut()
}

const { state, orgs, user } = storeToRefs(koreroStore)

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
  <div class="navbar bg-base-100">
    <div class="flex-1">
      <RouterLink :to="{ name: 'home' }" class="btn btn-ghost text-xl"
        ><LogoIconSVG width="36px" /> Korero</RouterLink
      >
    </div>
    <div class="flex-none">
      <ul class="menu menu-horizontal px-1">
        <li v-if="state">
          <RouterLink :to="{ name: 'settings' }" class="font-bold">{{ currentOrg }}</RouterLink>
        </li>
        <!-- <li v-if="koreroStore.authenticated">
          <details>
            <summary>Menu</summary>
            <ul class="bg-base-100 rounded-t-none p-2">
              <li><RouterLink :to="{ name: 'home' }">Channels</RouterLink></li>
              <li><RouterLink :to="{ name: 'settings' }">Settings</RouterLink></li>
            </ul>
          </details>
        </li> -->
        <li v-if="koreroStore.authenticated">
          <button @click="logOut">Sign out</button>
        </li>
        <li v-else>
          <button @click="login" class="btn btn-accent btn-sm">Log in with Bazaar</button>
        </li>
      </ul>
    </div>
  </div>
  <div v-if="koreroStore.authenticated" class="container mx-auto mb-32 p-6">
    <RouterView />
  </div>
  <div v-else>
    <div class="text-center px-4 py-24">
      <p>Log in with Bazaar to get started</p>
    </div>
  </div>
  <footer class="footer px-8 py-4">
    <div class="grid-flow-col items-center">
      <LogoIconSVG width="36px" />
      <div>
        <div>
          <strong>&copy; {{ new Date().getFullYear() }} Korero</strong>
        </div>
        <div>Communicate effectively with your team.</div>
      </div>
    </div>
  </footer>
</template>

<style scoped></style>
