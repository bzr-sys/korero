<script setup lang="ts">
import { computed, ref } from 'vue'

import { useKoreroStore } from '@/stores/korero'
import router from '@/router'

const koreroStore = useKoreroStore()
if (!koreroStore.config) {
  // TODO:
  // * get all teams (or just org?)
  // * let user choose a team/org to build
  // 2. If default team is found, get channels for this team and set up view
  // 3. If no team is found, search for team: `bzr.teams.list()`
  // 4. Find channels for each team: `bzr.collection("channels", {teamId: ID})`
  // 5. Set teams with channels and default team (the first in list) in config. Set up view.
  // 6. If no teams with channels are found, show choose team to create channels view.
}

function chooseOrg() {
  koreroStore.setOrg(koreroStore.user.id)
}

const channelName = ref('')

function createChannel() {
  if (!channelName.value) {
    return
  }
  koreroStore.createChannel(channelName.value)
  channelName.value = ''
}

function goToChannel(channelId: string) {
  if (channelId) {
    router.push({ name: 'channel', params: { id: channelId } })
  }
}
</script>

<template>
  <main>
    <div v-if="!koreroStore.config">
      <button
        @click="chooseOrg"
        class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded self-center"
      >
        Choose org
      </button>
    </div>

    <div v-else>
      <p>Team is {{ koreroStore.config.currentTeam }}</p>
      <input v-model="channelName" class="border bg-orange-50" />
      <button
        @click="createChannel"
        class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded self-center"
      >
        Create channel
      </button>
      <div class="py-4 grid grid-cols-3">
        <div
          v-for="channel in koreroStore.channels"
          :key="channel.id"
          class="border-2 border-orange-500 p-8"
          @click="goToChannel(channel.id)"
        >
          <p>{{ channel.name }}</p>
        </div>
      </div>
    </div>
  </main>
</template>
@/stores/korero
