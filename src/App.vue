<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'
import { bzr } from '@/bazaar'
import NavBar from './components/NavBar.vue'
import BaseLogin from './components/BaseLogin.vue'
import SideBar from './components/SideBar.vue'
import BaseOnboarding from './components/BaseOnboarding.vue'
import SetupPending from './components/SetupPending.vue'
import OrgPlanRequired from './components/OrgPlanRequired.vue'
import LoaderSVG from './components/LoaderSVG.vue'

const koreroStore = useKoreroStore()
koreroStore.autoSignIn()

bzr.onLogin(async () => {
  koreroStore.autoSignIn()
})
</script>

<template>
  <div v-if="!koreroStore.loaded" class="grid w-full justify-center items-center h-full">
    <LoaderSVG width="40px" />
  </div>
  <template v-else>
    <div
      v-if="koreroStore.authenticated"
      class="flex flex-col overflow-hidden fixed top-0 right-0 bottom-0 left-0 min-h-[600px]"
    >
      <NavBar />
      <BaseOnboarding v-if="koreroStore.gate === 'choose'" />
      <OrgPlanRequired v-else-if="koreroStore.gate === 'plan'" />
      <SetupPending v-else-if="koreroStore.gate === 'setup'" />
      <template v-else-if="koreroStore.gate === 'ready'">
        <div class="flex flex-1">
          <SideBar />
          <!-- height = 100vh - navbar header height -->
          <main class="flex-grow h-[calc(100vh-12*0.25rem)] overflow-hidden">
            <div class="px-4 sm:px-8 pt-6 pb-16 overflow-y-auto h-full">
              <RouterView />
            </div>
          </main>
        </div>
      </template>
      <div v-else class="grid flex-1 place-items-center">
        <LoaderSVG width="40px" />
      </div>
    </div>
    <template v-else>
      <BaseLogin />
    </template>
  </template>
</template>

<style>
html,
body,
#app {
  height: 100%;
}
</style>
