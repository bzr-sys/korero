<script setup lang="ts">
import HeadingOne from '@/components/HeadingOne.vue'
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
  const id = await koreroStore.createChannel(channelName.value)
  channelName.value = ''

  if (!id) {
    console.error('No channel ID after trying to create channel')
    return
  }

  router.push({ name: 'channel', params: { id } })
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <HeadingOne>Create a new channel</HeadingOne>

    <form @submit.prevent="createChannel">
      <label class="form-control">
        <div class="label">
          <span class="label-text">Channel name</span>
        </div>
        <input v-model="channelName" type="text" class="input input-bordered mb-4" required />
      </label>

      <button class="btn btn-accent">Create channel</button>
    </form>
  </div>
</template>

<style scoped></style>
