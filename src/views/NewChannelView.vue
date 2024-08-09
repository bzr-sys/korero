<script setup lang="ts">
import HeadingOne from '@/components/HeadingOne.vue'
import TextInput from '@/components/TextInput.vue'
import SmallContainer from '@/components/SmallContainer.vue'
import { useKoreroStore } from '@/stores/korero'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const koreroStore = useKoreroStore()

const router = useRouter()

const channelName = ref('')

async function createChannel() {
  if (!channelName.value) {
    return
  }
  const channelId = await koreroStore.createChannel(channelName.value)
  channelName.value = ''

  if (!channelId) {
    console.error('No channel ID after trying to create channel')
    return
  }

  router.push({ name: 'channel', params: { channelId } })
}
</script>

<template>
  <SmallContainer>
    <HeadingOne class="mb-4">Create a new channel</HeadingOne>

    <form @submit.prevent="createChannel">
      <TextInput label="Channel name" v-model="channelName" />
      <button class="btn btn-accent">Create channel</button>
    </form>
  </SmallContainer>
</template>

<style scoped></style>
