<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'
import BaseCard from '@/components/BaseCard.vue'
import HeadingOne from '@/components/HeadingOne.vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { ref, type Ref } from 'vue'

const router = useRouter()

const koreroStore = useKoreroStore()

const { config, channels, orgs, user } = storeToRefs(koreroStore)
if (!config.value) {
  // TODO:
  // * get all teams (or just org?)
  // * let user choose a team/org to build
  // 2. If default team is found, get channels for this team and set up view
  // 3. If no team is found, search for team: `bzr.teams.list()`
  // 4. Find channels for each team: `bzr.collection("channels", {teamId: ID})`
  // 5. Set teams with channels and default team (the first in list) in config. Set up view.
  // 6. If no teams with channels are found, show choose team to create channels view.
}

function chooseTeam(teamId: string) {
  koreroStore.setTeam(teamId)
}

const showSwitchTeam: Ref<boolean> = ref(false)
function label(teamId: string) {
  if (config.value?.currentTeam == teamId) {
    return 'current'
  }
  if (config.value?.teams.includes(teamId)) {
    return 'active'
  }
  return 'unused'
}
</script>

<template>
  <main>
    <div v-if="!config">
      <HeadingOne class="pb-6">Get started</HeadingOne>

      <p class="font-bold">{{ user.name }}</p>
      <ul>
        <li>
          Just me
          <button @click="chooseTeam(user.id)" class="btn btn-accent">Choose team</button>
        </li>
      </ul>
      <div v-for="org in orgs">
        <p class="font-bold">{{ org.name }}</p>
        <ul>
          <li v-for="team in org.teams">
            {{ team.name }}
            <button @click="chooseTeam(team.id)" class="btn btn-accent">Choose team</button>
          </li>
        </ul>
      </div>
    </div>

    <div v-else>
      <button @click="showSwitchTeam = true" class="btn btn-accent">Switch team</button>
      <div v-if="showSwitchTeam">
        <p class="font-bold">{{ user.name }}</p>
        <ul>
          <li>
            Just me {{ label(user.id) }}
            <button
              v-if="config.currentTeam !== user.id"
              @click="chooseTeam(user.id)"
              class="btn btn-accent"
            >
              Choose team
            </button>
          </li>
        </ul>
        <div v-for="org in orgs">
          <p class="font-bold">{{ org.name }}</p>
          <ul>
            <li v-for="team in org.teams">
              {{ team.name }} {{ label(team.id) }}
              <button
                v-if="config.currentTeam !== team.id"
                @click="chooseTeam(team.id)"
                class="btn btn-accent"
              >
                Choose team
              </button>
            </li>
          </ul>
        </div>

        <button @click="showSwitchTeam = false" class="btn btn-accent">Cancel</button>
      </div>
      <div class="flex gap-4 justify-between items-center">
        <HeadingOne>Channels</HeadingOne>
        <div>
          <RouterLink :to="{ name: 'newChannel' }" class="btn btn-sm btn-accent"
            >Create a new channel</RouterLink
          >
        </div>
      </div>

      <p v-if="channels.length === 0" class="text-center py-12">Create a channel to get started.</p>

      <div class="grid grid-cols-3 gap-4 py-4">
        <BaseCard v-for="channel in channels" :key="channel.id" class="mb-4">
          <h2 class="card-title">
            <RouterLink :to="{ name: 'channel', params: { channelId: channel.id } }">{{
              channel.name
            }}</RouterLink>
          </h2>
        </BaseCard>
      </div>
    </div>
  </main>
</template>
