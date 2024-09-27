<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'
import BaseCard from '@/components/BaseCard.vue'
import HeadingOne from '@/components/HeadingOne.vue'
import ManageTeam from '@/components/ManageTeam.vue'
import FormatDateString from '@/components/FormatDateString.vue'
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

const koreroStore = useKoreroStore()

const { state, channels, conversations } = storeToRefs(koreroStore)

// Sync on each visit since subscription does not work: https://github.com/bzr-sys/bazaar-server/issues/181
koreroStore.syncChannels()

const orderedConversations = computed(() => {
  return conversations.value
    .map((c) => c)
    .sort((a, b) => {
      return new Date(b.created).getTime() - new Date(a.created).getTime()
    })
    .slice(0, 10)
})

function channelName(channelId: string) {
  for (const channel of channels.value) {
    if (channel.id === channelId) {
      return channel.name
    }
  }
  return 'unknown channel'
}

if (!state.value) {
  // TODO:
  // * get all teams (or just org?)
  // * let user choose a team/org to build
  // 2. If default team is found, get channels for this team and set up view
  // 3. If no team is found, search for team: `bzr.teams.list()`
  // 4. Find channels for each team: `bzr.collection("channels", {teamId: ID})`
  // 5. Set teams with channels and default team (the first in list) in config. Set up view.
  // 6. If no teams with channels are found, show choose team to create channels view.
}
</script>

<template>
  <main>
    <div v-if="!state">
      <HeadingOne class="pb-6">Get started</HeadingOne>
      <ManageTeam />
    </div>

    <div v-else>
      <div class="grid grid-cols-4 gap-4">
        <div>
          <div class="flex gap-4 items-center">
            <HeadingOne>Channels</HeadingOne>
            <RouterLink :to="{ name: 'newChannel' }" class="btn btn-sm btn-accent">+</RouterLink>
          </div>

          <p v-if="channels.length === 0" class="text-center py-12">
            Create a channel to get started.
          </p>

          <div class="grid gap-2 py-4">
            <BaseCard v-for="channel in channels" :key="channel.id">
              <h2 class="card-title">
                <RouterLink :to="{ name: 'channel', params: { channelId: channel.id } }">{{
                  channel.name
                }}</RouterLink>
              </h2>
            </BaseCard>
          </div>
        </div>
        <div class="col-span-3">
          <HeadingOne>Conversations</HeadingOne>
          <p v-if="conversations.length === 0" class="text-center py-12">
            No recent conversations.
          </p>

          <div class="grid gap-4 py-4">
            <BaseCard v-for="conversation in orderedConversations" :key="conversation.id">
              <div class="badge badge-accent">
                {{ conversation.type }} in {{ channelName(conversation.channelId) }}
              </div>
              <h2 class="card-title">
                <RouterLink
                  :to="{ name: 'conversation', params: { conversationId: conversation.id } }"
                  >{{ conversation.title }}</RouterLink
                >
              </h2>
              <div class="italic text-xs">
                By {{ koreroStore.getUser(conversation.authorId).name }} on
                <FormatDateString :dateString="conversation.created" :defaultCss="false" />
              </div>
            </BaseCard>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
