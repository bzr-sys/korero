<script setup lang="ts">
import HeadingOne from '@/components/HeadingOne.vue'
import TextInput from '@/components/TextInput.vue'
import SmallContainer from '@/components/SmallContainer.vue'
import { useKoreroStore } from '@/stores/korero'
import { storeToRefs } from 'pinia'
import { ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import ManageChannelMembers from '@/components/ManageChannelMembers.vue'

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
  <SmallContainer>
    <div class="mt-12 p-6 rounded border border-slate-200">
      <HeadingOne class="mb-4">Create a new <span class="text-accent">channel</span></HeadingOne>
      <form @submit.prevent="createChannel">
        <TextInput label="Channel name" v-model="channelName" />
        <div class="font-bold">Members</div>
        <ManageChannelMembers
          :initialMembers="selectedMembers"
          @update:addMember="(id) => selectedMembers.push(id)"
          @update:removeMember="(id) => (selectedMembers = selectedMembers.filter((m) => m !== id))"
        />
        <div class="mt-8">
          <button class="btn btn-accent">Create channel</button>
        </div>
      </form>
    </div>
  </SmallContainer>
</template>

<style scoped></style>
