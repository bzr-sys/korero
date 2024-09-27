<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'
import { storeToRefs } from 'pinia'
import { computed, type ComputedRef } from 'vue'
import { type Team, type Org } from '@bzr/bazaar'
import { bzr } from '@/bazaar'

const props = defineProps<{ initialMembers: string[] }>()
const emit = defineEmits(['update:addMember', 'update:removeMember'])

const koreroStore = useKoreroStore()

function openModal() {
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

console.log('initial', props.initialMembers)
console.log('me', user.value.id)

function selectMember(id: string) {
  console.log('select', id)
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
    <p>Channel Members</p>
    <div>
      <span class="badge">You</span>
      <span class="badge" v-for="m in initialMembers" :key="m" @click="unselectMember(m)"
        >{{ userName(m) }} X</span
      >
    </div>
    <div>
      <!-- <div
            class="btn"
            @click="
              bzr.social.openModal((userId) => {
                selectMember(userId)
              })
            "
          >
            Invite Guets
          </div> -->
      <p>
        Org Members
        <span class="btn btn-xs" @click="openModal()">Manage Members</span>
      </p>
      <div v-if="availableMembers.length > 0">
        <div v-for="m in availableMembers" :key="m">
          {{ userName(m) }}
          <div class="btn" @click="selectMember(m)">Select</div>
        </div>
      </div>
      <div v-else>Nobody left</div>
    </div>
  </div>
</template>
