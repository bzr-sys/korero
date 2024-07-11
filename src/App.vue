<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'
import { bzr } from '@/bazaar'

const koreroStore = useKoreroStore()
koreroStore.autoSignIn()

bzr.onLogin(async () => {
  koreroStore.autoSignIn()
})

function login(): void {
  bzr.login()
}
</script>

<template>
  <div v-if="koreroStore.authenticated" class="container m-auto">
    <RouterView />
  </div>

  <div v-else class="m-auto w-fit py-8">
    <button
      @click="login"
      class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded self-center"
    >
      Log in with Bazaar
    </button>
  </div>
</template>

<style scoped></style>
@/stores/korero
