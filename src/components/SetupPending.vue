<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useKoreroStore } from '@/stores/korero'
import ManageWorkspaces from './ManageWorkspaces.vue'
import SmallContainer from './SmallContainer.vue'

const koreroStore = useKoreroStore()
const { currentWorkspace } = storeToRefs(koreroStore)

const checking = ref(false)

async function checkAgain() {
  checking.value = true
  await koreroStore.checkSetup()
  checking.value = false
}
</script>

<template>
  <div class="overflow-y-auto px-4 py-12">
    <SmallContainer>
      <div class="p-6 mb-12 rounded border border-slate-200 text-center">
        <p class="font-bold">Korero isn't set up for {{ currentWorkspace?.name }} yet</p>
        <p class="mb-4">Ask an admin of the organization to open Korero once, then check again.</p>
        <button class="btn btn-accent" :disabled="checking" @click="checkAgain">Check again</button>
      </div>
      <ManageWorkspaces />
    </SmallContainer>
  </div>
</template>
