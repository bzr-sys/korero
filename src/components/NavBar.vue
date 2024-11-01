<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted, ref, useTemplateRef } from 'vue'
import { useKoreroStore } from '@/stores/korero'
import { bzr } from '@/bazaar'
import LogoTextSVG from './LogoTextSVG.vue'
import ChevronDownSVG from './ChevronDownSVG.vue'
import ChevronUpSVG from './ChevronUpSVG.vue'
import SignOutSVG from './SignOutSVG.vue'
import SettingsSVG from './SettingsSVG.vue'
import WorkspaceAvatar from './WorkspaceAvatar.vue'
import HamburgerSVG from './HamburgerSVG.vue'

const koreroStore = useKoreroStore()

const { user, currentWorkspace, isSideBarExpanded } = storeToRefs(koreroStore)

const isUserDropdownExpanded = ref(false)

const userDropdown = useTemplateRef('user-dropdown')
const userDropdownButton = useTemplateRef('user-dropdown-button')

function logOut(): void {
  bzr.logOut()
}

function toggleUserDropdown(): void {
  isUserDropdownExpanded.value = !isUserDropdownExpanded.value
}

function closeUserDropdown(): void {
  isUserDropdownExpanded.value = false
  userDropdownButton.value?.focus()
}

function handleEscKey(event: KeyboardEvent): void {
  if (event.key === 'Escape' && isUserDropdownExpanded.value) {
    closeUserDropdown()
  }
}

function handleClickOutside(event: MouseEvent): void {
  // if button or dropdown are not clicked, close
  if (
    userDropdown.value &&
    !userDropdown.value.contains(event.target as Node) &&
    userDropdownButton.value &&
    !userDropdownButton.value.contains(event.target as Node) &&
    isUserDropdownExpanded.value
  ) {
    closeUserDropdown()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscKey)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscKey)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <header class="bg-slate-50 border-b border-slate-200">
    <div class="px-4 py-2 h-12 flex justify-between gap-4 items-center">
      <!-- left -->
      <div class="flex flex-row-reverse gap-4 items-center">
        <RouterLink :to="{ name: 'home' }" class="relative flex gap-3">
          <LogoTextSVG width="130px" />
          <!-- <span class="absolute bottom-[5px] right-0 translate-y-full text-[0.6rem]"
            >Powered by Bazaar</span
          > -->
        </RouterLink>
        <button
          @click="koreroStore.toggleSideBarExpanded"
          :aria-expanded="isSideBarExpanded"
          aria-label="Side bar"
          class="lg:hidden"
        >
          <HamburgerSVG width="14px" />
        </button>
      </div>
      <!-- right -->
      <div class="relative">
        <button
          @click="toggleUserDropdown"
          class="flex items-center gap-1"
          :aria-expanded="isUserDropdownExpanded"
          aria-label="User sub menu"
          ref="user-dropdown-button"
        >
          <WorkspaceAvatar size="small" />
          <ChevronDownSVG v-show="!isUserDropdownExpanded" width="12px" />
          <ChevronUpSVG v-show="isUserDropdownExpanded" width="12px" />
        </button>
        <div
          :class="
            isUserDropdownExpanded
              ? `absolute top-[130%] right-0 bg-white rounded shadow z-30`
              : `sr-only`
          "
          :aria-hidden="!isUserDropdownExpanded"
          ref="user-dropdown"
        >
          <div class="flex flex-wrap gap-4 px-4 py-6 min-w-[calc(320px-2rem)]">
            <WorkspaceAvatar size="medium" />
            <div>
              <div class="capitalize text-lg font-bold">{{ user.name }}</div>
              <div class="opacity-70 text-sm">{{ user.email }}</div>
              <div class="opacity-70 text-sm">@{{ user.handle }}</div>
            </div>
          </div>

          <div v-if="currentWorkspace" class="px-4 pb-6">
            <div class="text-xs opacity-70">Current workspace</div>
            <div>{{ currentWorkspace.name }}</div>
            <div class="text-xs opacity-70">@{{ currentWorkspace.handle }}</div>
          </div>

          <ul class="py-1 border-t border-slate-200" @click="closeUserDropdown">
            <li v-if="currentWorkspace">
              <RouterLink
                :to="{ name: 'settings' }"
                class="flex gap-2 items-center hover:bg-slate-100 w-full px-4 py-2"
                ><SettingsSVG width="18px" /> <span>Settings</span></RouterLink
              >
            </li>
            <li>
              <button
                @click="logOut"
                class="flex gap-2 items-center hover:bg-slate-100 w-full px-4 py-2"
              >
                <SignOutSVG width="18px" /> <span>Sign out</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped></style>
