<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

const koreroStore = useKoreroStore()

const { config, orgs, user } = storeToRefs(koreroStore)

const showSwitchTeam = ref<boolean>(false)

function getTeamStatus(teamId: string) {
  if (config.value?.currentTeam == teamId) {
    return 'current'
  }
  if (config.value?.teams.includes(teamId)) {
    return 'active'
  }
  return 'unused'
}

function chooseTeam(teamId: string) {
  koreroStore.setTeam(teamId)
}
</script>

<template>
  <div v-if="config" class="py-8">
    <button @click="showSwitchTeam = true" class="btn btn-accent btn-sm">Switch team</button>
    <div v-if="showSwitchTeam" class="pt-4">
      <p class="font-bold">{{ user.name }}</p>
      <ul>
        <li>
          Just me {{ getTeamStatus(user.id) }}
          <button
            v-if="config.currentTeam !== user.id"
            @click="chooseTeam(user.id)"
            class="btn btn-accent btn-sm"
          >
            Choose team
          </button>
        </li>
      </ul>
      <div v-for="org in orgs" :key="org.id" class="pt-4">
        <p class="font-bold">{{ org.name }}</p>
        <ul>
          <li v-for="team in org.teams" :key="team.id">
            {{ team.name }} {{ getTeamStatus(team.id) }}
            <button
              v-if="config.currentTeam !== team.id"
              @click="chooseTeam(team.id)"
              class="btn btn-accent btn-sm"
            >
              Choose team
            </button>
          </li>
        </ul>
      </div>

      <button @click="showSwitchTeam = false" class="btn btn-sm">Cancel</button>
    </div>
  </div>
</template>

<style scoped></style>
