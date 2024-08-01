<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'
import { bzr } from '@/bazaar'
import { RouterLink } from 'vue-router'

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
</script>

<template>
  <div class="navbar bg-base-100">
    <div class="flex-1">
      <RouterLink :to="{ name: 'home' }" class="btn btn-ghost text-xl">Korero</RouterLink>
    </div>
    <div class="flex-none">
      <ul class="menu menu-horizontal px-1">
        <li v-if="koreroStore.authenticated">
          <details>
            <summary>Menu</summary>
            <ul class="bg-base-100 rounded-t-none p-2">
              <li><RouterLink :to="{ name: 'home' }">Channels</RouterLink></li>
              <li><RouterLink :to="{ name: 'settings' }">Settings</RouterLink></li>
            </ul>
          </details>
        </li>
        <li v-if="koreroStore.authenticated">
          <button @click="logOut">Sign out</button>
        </li>
        <li v-else>
          <button @click="login">Log in with Bazaar</button>
        </li>
      </ul>
    </div>
  </div>
  <div v-if="koreroStore.authenticated" class="container mx-auto mb-32 p-6">
    <RouterView />
  </div>
</template>

<style scoped></style>
