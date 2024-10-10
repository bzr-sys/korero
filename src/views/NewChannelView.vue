<script setup lang="ts">
import HeadingOne from '@/components/HeadingOne.vue'
import TextInput from '@/components/TextInput.vue'
import SmallContainer from '@/components/SmallContainer.vue'
import { useKoreroStore } from '@/stores/korero'
import { storeToRefs } from 'pinia'
import { ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'

const koreroStore = useKoreroStore()

const { user } = storeToRefs(koreroStore)

const selectedMembers: Ref<string[]> = ref([])

const router = useRouter()

const channelName = ref('')

async function createChannel() {
  if (!channelName.value) {
    return
  }
  const channelId = await koreroStore.createChannel(channelName.value, [
    user.value.id,
    ...selectedMembers.value
  ])
  channelName.value = ''

  if (!channelId) {
    console.error('No channel ID after trying to create channel')
    return
  }

  router.push({ name: 'newConversationChoose', params: { channelId } })
}
</script>

<template>
  <HeadingOne class="mb-2">Create a new channel</HeadingOne>

  <SmallContainer>
    <div class="mt-16 p-6 rounded border border-slate-200">
      <form @submit.prevent="createChannel">
        <TextInput label="Channel name" v-model="channelName" />
        <button class="btn btn-accent">Create channel</button>
      </form>
    </div>
  </SmallContainer>
</template>

<style scoped></style>
