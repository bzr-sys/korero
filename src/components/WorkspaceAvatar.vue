<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'

defineProps<{
  size: 'small' | 'medium'
}>()

const koreroStore = useKoreroStore()
const { user, state, currentWorkspace } = storeToRefs(koreroStore)

const gravatarUrl = ref('')
const gravatarExists = ref(false)

// See https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#converting_a_digest_to_a_hex_string
async function digestMessage(message: string) {
  const msgUint8 = new TextEncoder().encode(message) // encode as (utf-8) Uint8Array
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8) // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)) // convert buffer to byte array
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('') // convert bytes to hex string
  return hashHex
}

async function getUserGravatar() {
  if (user.value.email) {
    digestMessage(user.value.email).then(async (digestHex) => {
      gravatarUrl.value = `https://www.gravatar.com/avatar/${digestHex}?size=100&d=404`
      const response = await fetch(gravatarUrl.value)
      gravatarExists.value = response.ok
      // could cache in local storage
    })
  }
}

watch(
  state || {},
  () => {
    getUserGravatar()
  },
  { immediate: true }
)
</script>

<template>
  <div
    v-if="currentWorkspace?.type === 'org' || !gravatarExists"
    :class="`bg-warning rounded-full inline-flex justify-center items-center ${size === 'small' && `w-7 h-7`} ${size === 'medium' && `w-12 h-12`}`"
  >
    <span :class="`uppercase ${size === 'small' && `text-xs`} ${size === 'medium' && `text-xl`}`">{{
      currentWorkspace?.handle[0]
    }}</span>
  </div>
  <img
    v-else
    :src="gravatarUrl"
    :alt="`Avatar for ${user.name}`"
    :class="`rounded-full ${size === 'small' && `w-7 h-7`} ${size === 'medium' && `w-12 h-12`}`"
  />
</template>

<style scoped></style>
