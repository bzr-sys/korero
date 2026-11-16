<script setup lang="ts">
import { useRoute } from 'vue-router'
import { watch } from 'vue'
import HomeSVG from './HomeSVG.vue'
import { useKoreroStore } from '@/stores/korero'
import { bzr } from '@/bazaar'
import BazaarLogoIcon from './BazaarLogoIcon.vue'
import { storeToRefs } from 'pinia'

const route = useRoute()

const koreroStore = useKoreroStore()
const { channels, currentChannel, isSideBarExpanded } = storeToRefs(koreroStore)

// Phones: the side bar covers the page, so close it once a link is followed
watch(
  () => route.fullPath,
  () => (isSideBarExpanded.value = false)
)

function openOrgModal() {
  bzr.orgs.openPopup(null, () => koreroStore.setOrgs())
}
</script>

<template>
  <div
    v-if="isSideBarExpanded"
    class="lg:hidden fixed inset-0 top-12 z-30 bg-black/20"
    aria-hidden="true"
    @click="koreroStore.toggleSideBarExpanded"
  ></div>
  <!-- height = 100vh - navbar header height -->
  <aside
    class="bg-base-200 w-64 shrink-0 border-r border-base-300 lg:flex flex-col h-[calc(100vh-12*0.25rem)] overflow-hidden max-lg:fixed max-lg:top-12 max-lg:left-0 max-lg:z-40 max-lg:shadow-xl"
    :class="isSideBarExpanded ? 'max-lg:flex' : 'max-lg:sr-only'"
  >
    <!-- top sidebar nav -->
    <ul class="p-3 border-b border-base-300 flex flex-col gap-0.5">
      <li>
        <RouterLink
          :to="{ name: 'home' }"
          class="flex gap-2 items-center hover:bg-base-300 w-full px-3 py-2 rounded-field"
          :class="{ 'bg-mint-soft text-accent font-medium': route.name === 'home' }"
          ><HomeSVG width="18px" /> Home</RouterLink
        >
      </li>
      <li>
        <button
          @click="openOrgModal()"
          class="flex gap-2 items-center hover:bg-base-300 w-full px-3 py-2 rounded-field"
        >
          <BazaarLogoIcon width="18px" /> Invite teammates
        </button>
      </li>
    </ul>
    <!-- channels nav -->
    <div class="p-3 relative min-h-px flex-1">
      <div class="overflow-y-auto h-full">
        <div class="flex gap-4 justify-between items-center">
          <h2 class="text-xs font-semibold uppercase tracking-wider opacity-60 px-3 py-2">
            Channels
          </h2>
          <RouterLink
            :to="{ name: 'newChannel' }"
            class="grid place-items-center size-7 text-lg leading-none rounded-field hover:bg-base-300"
            title="Create new channel"
            ><span class="sr-only">Create new channel</span
            ><span aria-hidden="true">+</span></RouterLink
          >
        </div>
        <ul class="flex flex-col gap-0.5">
          <!-- Show skeleton when there are no channels -->
          <template v-if="channels.length === 0">
            <li aria-hidden="true">
              <div class="bg-base-300 rounded h-5 ml-3 mr-8 mb-3"></div>
            </li>
            <li aria-hidden="true">
              <div class="bg-base-300 rounded h-5 mx-3 mb-3"></div>
            </li>
            <li aria-hidden="true">
              <div class="bg-base-300 rounded h-5 ml-3 mr-16 mb-3"></div>
            </li>
          </template>

          <li v-for="channel in channels" :key="channel.id">
            <RouterLink
              :to="{ name: 'channel', params: { channelId: channel.id } }"
              class="flex gap-2 items-center hover:bg-base-300 w-full px-3 py-1.5 rounded-field before:content-['#'] before:opacity-40"
              :class="{
                'bg-mint-soft text-accent font-medium':
                  route.params.channelId === channel.id || currentChannel?.id === channel.id
              }"
              >{{ channel.name }}</RouterLink
            >
          </li>
        </ul>
      </div>
    </div>
  </aside>
</template>

<style scoped></style>
