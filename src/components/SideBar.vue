<script setup lang="ts">
import { useRoute } from 'vue-router'
import HomeSVG from './HomeSVG.vue'
import SettingsSVG from './SettingsSVG.vue'
import { useKoreroStore } from '@/stores/korero'
import ChannelSVG from './ChannelSVG.vue'

const route = useRoute()

const { channels } = useKoreroStore()
</script>

<template>
  <!-- height = 100vh - navbar header height -->
  <aside
    class="bg-slate-50 min-w-56 border-r border-slate-200 flex flex-col h-[calc(100vh-12*0.25rem)] overflow-hidden"
  >
    <!-- top sidebar nav -->
    <ul class="p-4 border-b border-slate-200 [&>li]:mb-px">
      <li>
        <RouterLink
          :to="{ name: 'home' }"
          class="flex gap-2 items-center hover:bg-slate-200 w-full px-4 py-2 rounded"
          :class="{ 'bg-slate-200': route.name === 'home' }"
          ><HomeSVG width="18px" /> Home</RouterLink
        >
      </li>
      <li>
        <RouterLink
          :to="{ name: 'settings' }"
          class="flex gap-2 items-center hover:bg-slate-200 w-full px-4 py-2 rounded"
          :class="{ 'bg-slate-200': route.name === 'settings' }"
          ><SettingsSVG width="18px" /> Tools</RouterLink
        >
      </li>
    </ul>
    <!-- channels nav -->
    <div class="p-4 relative min-h-px flex-1">
      <div class="overflow-y-auto h-full">
        <h2 class="font-bold px-4 py-2">Channels</h2>
        <ul>
          <li v-for="channel in channels" :key="channel.id">
            <RouterLink
              :to="{ name: 'channel', params: { channelId: channel.id } }"
              class="flex gap-2 items-center hover:bg-slate-200 w-full px-4 py-1 rounded"
              ><SettingsSVG width="18px" /> {{ channel.name }}</RouterLink
            >
          </li>
          <!-- <li v-for="n in Array.from(Array(200).keys())" :key="n">
            <a href="#" class="flex gap-2 items-center hover:bg-slate-200 w-full px-4 py-1 rounded"
              ><ChannelSVG /> Primary</a
            >
          </li> -->
        </ul>
      </div>
    </div>
    <!-- bottom sidebar actions -->
    <div class="p-4 border-t border-slate-200">
      <button class="btn btn-sm btn-block">Invite teammates</button>
    </div>
  </aside>
</template>

<style scoped></style>
