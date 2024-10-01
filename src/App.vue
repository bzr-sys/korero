<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'
import { bzr } from '@/bazaar'
import NavBar from './components/NavBar.vue'
import BaseFooter from './components/BaseFooter.vue'
import BaseLogin from './components/BaseLogin.vue'

const koreroStore = useKoreroStore()
koreroStore.autoSignIn()

bzr.onLogin(async () => {
  koreroStore.autoSignIn()
})
</script>

<template>
  <template v-if="koreroStore.authenticated">
    <NavBar />
    <main class="container mx-auto mb-32 p-6">
      <RouterView />
    </main>
    <BaseFooter />
  </template>
  <template v-else>
    <BaseLogin />
  </template>
</template>

<style>
html,
body,
#app {
  height: 100%;
}
</style>
