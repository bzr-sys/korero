<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'
import { storeToRefs } from 'pinia'
import { computed, type ComputedRef } from 'vue'
import { type Team, type Org } from '@bzr/bazaar'
import { bzr } from '@/bazaar'
import BazaarLogoIcon from './BazaarLogoIcon.vue'

const props = defineProps<{ initialMembers: string[] }>()
const emit = defineEmits(['update:addMember', 'update:removeMember'])

const koreroStore = useKoreroStore()

function openOrgModal() {
  // @ts-ignore
  bzr.orgs.openModal()
}

const { state, orgs, user } = storeToRefs(koreroStore)
const currentTeam: ComputedRef<Team | undefined> = computed(() => {
  if (!state.value) {
    return undefined
  }
  const org = orgs.value.filter((o: Org) => o.id === state.value!.config.currentTeam)
  if (org.length > 0) {
    return org[0].primaryTeam
  }
  return undefined
})
const teamMembers = computed(() => {
  if (!currentTeam.value) {
    return []
  }
  return [...currentTeam.value.admins, ...currentTeam.value.members]
})

const availableMembers = computed(() => {
  return teamMembers.value.filter((m) => {
    if (m === user.value.id) {
      return false
    }
    if (props.initialMembers.includes(m)) {
      return false
    }
    return true
  })
})

function selectMember(id: string) {
  emit('update:addMember', id)
}

function unselectMember(id: string) {
  emit('update:removeMember', id)
}

function userName(id: string) {
  const user = koreroStore.getUser(id)
  if (user.id) {
    return user.name
  }
  return id
}
</script>

<template>
  <div>
    <ul class="text-sm">
      <li>{{ user.name }}</li>
      <li v-for="m in initialMembers" :key="m">
        {{ userName(m) }}
        <button @click="unselectMember(m)" class="text-error text-xs">Remove</button>
      </li>
    </ul>
    <div class="pt-4">
      <h3 class="font-bold pb-2 text-sm">
        Non-members <span class="badge badge-sm">{{ availableMembers.length }}</span>
      </h3>
      <ul v-if="availableMembers.length > 0" class="text-sm pb-4">
        <li v-for="m in availableMembers" :key="m">
          {{ userName(m) }}
          <button class="text-success text-xs" @click="selectMember(m)">Add</button>
        </li>
      </ul>
      <button @click="openOrgModal" class="btn btn-sm">
        <BazaarLogoIcon width="12px" /> Manage organization members
      </button>
      <!-- What does this mean? -->
      <!-- <div v-else>Nobody left</div> -->
    </div>
  </div>
</template>
