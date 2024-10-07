<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'
import { storeToRefs } from 'pinia'
import { bzr } from '@/bazaar'
import HeadingTwo from './HeadingTwo.vue'

const koreroStore = useKoreroStore()

const { state, orgs, user } = storeToRefs(koreroStore)

function openModal() {
  // @ts-ignore
  bzr.orgs.openModal()
}
</script>

<template>
  <HeadingTwo class="pb-4">Personal</HeadingTwo>
  <div>
    <span class="font-bold pr-2">{{ user.name }}</span>
    <button
      v-if="!state || state.config.currentTeam !== user.id"
      @click="koreroStore.setTeam(user.id)"
      class="btn btn-accent"
    >
      Choose
    </button>
    <span v-else class="btn btn-xs btn-primary">current</span>
  </div>

  <HeadingTwo class="py-4">
    Organizations
    <button class="btn btn-sm" @click="openModal()">Manage orgs</button>
  </HeadingTwo>

  <div v-for="org in orgs" :key="org.id">
    <div>
      <span class="font-bold pr-2">{{ org.name }}</span>
      <template v-if="!org.active">
        <button
          v-if="org.admins.includes(user.id)"
          @click="openModal()"
          class="btn btn-xs btn-warning"
        >
          Get Subscription
        </button>
        <span v-else class="btn btn-xs btn-warning">inactive</span>
      </template>

      <span
        v-else-if="state && org.primaryTeam.id === state.config.currentTeam"
        class="btn btn-xs btn-primary"
        >current</span
      >

      <button
        v-else-if="state && state.config.teams.includes(org.primaryTeam.id)"
        @click="koreroStore.setTeam(org.primaryTeam.id)"
        class="btn btn-xs btn-accent"
      >
        Return to this org
      </button>

      <button v-else @click="koreroStore.setTeam(org.primaryTeam.id)" class="btn btn-xs btn-accent">
        Start with this org
      </button>
    </div>
  </div>
</template>

<style scoped></style>
