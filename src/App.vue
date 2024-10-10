<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'
import { bzr } from '@/bazaar'
import NavBar from './components/NavBar.vue'
import BaseLogin from './components/BaseLogin.vue'
import SideBar from './components/SideBar.vue'
import BaseOnboarding from './components/BaseOnboarding.vue'

const koreroStore = useKoreroStore()
koreroStore.autoSignIn()

bzr.onLogin(async () => {
  koreroStore.autoSignIn()
})

// maybe redirect home if not onboarded
</script>

<template>
  <div
    v-if="koreroStore.authenticated"
    class="flex flex-col overflow-hidden fixed top-0 right-0 bottom-0 left-0 min-h-[600px]"
  >
    <NavBar />
    <template v-if="!koreroStore.hasCompletedOnboarding">
      <BaseOnboarding />
    </template>
    <template v-if="koreroStore.state">
      <div class="flex flex-1">
        <SideBar />
        <!-- height = 100vh - navbar header height -->
        <main class="flex-grow h-[calc(100vh-12*0.25rem)] overflow-hidden">
          <div class="px-6 pt-4 pb-16 overflow-y-auto h-full">
            <RouterView />
          </div>
        </main>
      </div>
    </template>
  </div>
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
