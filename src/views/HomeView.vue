<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'
import router from '@/router'
import ClickableCard from '@/components/ClickableCard.vue'
import HeadingOne from '@/components/HeadingOne.vue'

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

function goToChannel(channelId: string) {
  if (channelId) {
    router.push({ name: 'channel', params: { id: channelId } })
  }
}
</script>

<template>
  <main>
    <div v-if="!koreroStore.config" class="text-center">
      <HeadingOne class="text-center pb-6">Get started</HeadingOne>
      <button @click="chooseOrg" class="btn btn-accent">Choose organization</button>
    </div>

    <div v-else>
      <div class="text-center pb-12">
        <HeadingOne class="text-center pb-6">Channels</HeadingOne>
        <div>
          <RouterLink :to="{ name: 'newChannel' }" class="btn btn-sm btn-accent"
            >Create a new channel</RouterLink
          >
        </div>
      </div>

      <div class="grid grid-cols-3 gap-4 py-4">
        <ClickableCard
          v-for="channel in koreroStore.channels"
          :key="channel.id"
          @click="goToChannel(channel.id)"
          class="mb-4"
        >
          <h2 class="card-title">{{ channel.name }}</h2>
        </ClickableCard>
      </div>
    </div>
  </main>
</template>
