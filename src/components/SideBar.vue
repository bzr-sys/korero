<script setup lang="ts">
import { useRoute } from 'vue-router'
import HomeSVG from './HomeSVG.vue'
import { useKoreroStore } from '@/stores/korero'
import { bzr } from '@/bazaar'
import BazaarLogoIcon from './BazaarLogoIcon.vue'
import { storeToRefs } from 'pinia'

const route = useRoute()

const koreroStore = useKoreroStore()
const { channels, currentChannel, isSideBarExpanded } = storeToRefs(koreroStore)

function openOrgModal() {
  // @ts-ignore
  bzr.orgs.openModal(null, () => koreroStore.setOrgs())
}
</script>

<template>
  <!-- height = 100vh - navbar header height -->
  <aside
    class="bg-slate-50 min-w-56 border-r border-slate-200 lg:flex flex-col h-[calc(100vh-12*0.25rem)] overflow-hidden"
    :class="isSideBarExpanded ? 'max-lg:flex' : 'max-lg:sr-only'"
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
        <button
          @click="openOrgModal()"
          class="flex gap-2 items-center hover:bg-slate-200 w-full px-4 py-2 rounded"
        >
          <BazaarLogoIcon width="18px" /> Invite teammates
        </button>
      </li>
    </ul>
    <!-- channels nav -->
    <div class="p-4 relative min-h-px flex-1">
      <div class="overflow-y-auto h-full">
        <div class="flex gap-4 justify-between items-center">
          <h2 class="font-bold px-4 py-2">Channels</h2>
          <RouterLink :to="{ name: 'newChannel' }" class="font-bold px-2 hover:bg-slate-200 rounded"
            ><span class="sr-only">Create new channel</span>+</RouterLink
          >
        </div>
        <ul class="[&>li]:mb-px">
          <!-- Show skeleton when there are no channels -->
          <template v-if="channels.length === 0">
            <li aria-hidden="true">
              <div class="bg-slate-200 opacity-50 rounded h-5 ml-4 mr-8 mb-3"></div>
            </li>
            <li aria-hidden="true">
              <div class="bg-slate-200 opacity-50 rounded h-5 mx-4 mb-3"></div>
            </li>
            <li aria-hidden="true">
              <div class="bg-slate-200 opacity-50 rounded h-5 ml-4 mr-16 mb-3"></div>
            </li>
          </template>

          <li v-for="channel in channels" :key="channel.id">
            <RouterLink
              :to="{ name: 'channel', params: { channelId: channel.id } }"
              class="flex gap-2 items-center hover:bg-slate-200 w-full px-4 py-1 rounded"
              :class="{
                'bg-slate-200':
                  route.params.channelId === channel.id || currentChannel?.id === channel.id
              }"
              >{{ channel.name }}</RouterLink
            >
          </li>
        </ul>
      </div>
    </div>
    <!-- bottom sidebar actions -->
    <div class="p-4 border-t border-slate-200"></div>
  </aside>
</template>

<style scoped></style>
