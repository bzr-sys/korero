<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const koreroStore = useKoreroStore()

defineProps<{ currentTitle?: string }>()

const currentChannel = computed(() => {
  if (koreroStore.currentChannel) {
    return koreroStore.currentChannel
  }
  return { id: '', name: '' }
})
</script>

<template>
  <div class="breadcrumbs text-sm pb-12">
    <ul class="justify-center">
      <li>
        <RouterLink :to="{ name: 'home' }">Channels</RouterLink>
      </li>
      <li>
        <span class="truncate max-w-60">
          <template v-if="route.meta.group === 'channelParent'">
            {{ currentChannel.name }}
          </template>
          <template v-else-if="route.meta.group === 'channelChild' && currentChannel.id">
            <RouterLink :to="{ name: 'channel', params: { channelId: currentChannel.id } }">{{
              currentChannel.name
            }}</RouterLink>
          </template>
        </span>
      </li>
      <li v-if="currentTitle">
        <span class="truncate max-w-60">{{ currentTitle }}</span>
      </li>

      <!-- if channel view -->
      <!-- `channel`               'channel-name' -->
      <!-- `channelByType`         'channel-name' -->
      <!-- `newConversationChoose` [channel-name]() / Create conversation -->
      <!-- `newConversation`       [channel-name]() / Create conversation -->

      <!-- if conversation -->
      <!-- Channels / <channel-name> [link] / Conversation name -->
    </ul>
  </div>
</template>

<style scoped></style>
