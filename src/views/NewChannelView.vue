<script setup lang="ts">
import HeadingOne from '@/components/HeadingOne.vue'
import TextInput from '@/components/TextInput.vue'
import SmallContainer from '@/components/SmallContainer.vue'
import ManageChannelMembers from '@/components/ManageChannelMembers.vue'
import { useKoreroStore } from '@/stores/korero'
import { storeToRefs } from 'pinia'
import { ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'

const koreroStore = useKoreroStore()

const { user } = storeToRefs(koreroStore)

const selectedMembers: Ref<string[]> = ref([])

function selectMember(id: string) {
  if (!selectedMembers.value.includes(id)) {
    selectedMembers.value.push(id)
  }
}

function unselectMember(id: string) {
  const i = selectedMembers.value.indexOf(id)
  if (i > -1) {
    selectedMembers.value.splice(i, 1)
  }
}

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

  router.push({ name: 'channel', params: { channelId } })
}
</script>

<template>
  <SmallContainer>
    <HeadingOne class="mb-4">Create a new channel</HeadingOne>

    <form @submit.prevent="createChannel">
      <TextInput label="Channel name" v-model="channelName" />
      <ManageChannelMembers
        :initial-members="selectedMembers"
        @update:add-member="selectMember"
        @update:remove-member="unselectMember"
      ></ManageChannelMembers>
      <button class="btn btn-accent">Create channel</button>
    </form>
  </SmallContainer>
</template>

<style scoped></style>
