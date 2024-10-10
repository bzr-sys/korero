<script setup lang="ts">
import BaseCard from '@/components/BaseCard.vue'
import HeadingOne from '@/components/HeadingOne.vue'
import FormatDateString from '@/components/FormatDateString.vue'
import ManageChannelMembers from '@/components/ManageChannelMembers.vue'
import HeadingTwo from '@/components/HeadingTwo.vue'
import { useRoute } from 'vue-router'
import { useKoreroStore } from '@/stores/korero'
import { ConversationType } from '@/types'
import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'
import { storeToRefs } from 'pinia'
import ConversationTypeIcon from '@/components/ConversationTypeIcon.vue'
import ConversationList from '@/components/ConversationList.vue'

const route = useRoute()
const koreroStore = useKoreroStore()
const { currentChannel, groups, user, conversations } = storeToRefs(koreroStore)

const channelId = ref(route.params.channelId as string)

watch(route, async (route) => {
  channelId.value = route.params.channelId as string
})

const channelConversations = computed(() => {
  return conversations.value.filter((c) => c.channelId === channelId.value)
})

const conversationTypeParam = ref(route.params.conversationType as ConversationType)

const filteredConversations = computed(() => {
  if (!conversationTypeParam.value) {
    return channelConversations.value
  }
  return channelConversations.value.filter((c) => c.type === conversationTypeParam.value)
})

watch(route, async (newRoute) => {
  conversationTypeParam.value = newRoute.params.conversationType as ConversationType
})

function userName(id: string) {
  const user = koreroStore.getUser(id)
  if (user.id) {
    return user.name
  }
  return id
}

if (currentChannel.value) {
  koreroStore.getGroup(currentChannel.value.group)
}

const members: ComputedRef<string[]> = computed(() => {
  if (!currentChannel.value) {
    return []
  }
  if (groups.value[currentChannel.value.group]) {
    return groups.value[currentChannel.value.group].members
  }
  koreroStore.getGroup(currentChannel.value.group)
  return []
})

const manageMembers: Ref<boolean> = ref(false)

function addMember(id: string) {
  console.log('add member', id)
  if (currentChannel.value) {
    koreroStore.addGroupMember(currentChannel.value.group, id)
  }
  manageMembers.value = false
}
function removeMember(id: string) {
  if (currentChannel.value) {
    koreroStore.removeGroupMember(currentChannel.value.group, id)
  }
  manageMembers.value = false
}
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-3">
    <div class="col-span-2">
      <div class="flex gap-4 justify-between items-center pb-2">
        <HeadingOne class="capitalize"
          >{{ conversationTypeParam ? conversationTypeParam : 'Conversation' }}s</HeadingOne
        >

        <RouterLink
          class="btn btn-xs"
          :to="{ name: 'newConversationChoose', params: { channelId } }"
          >New conversation</RouterLink
        >
      </div>

      <p v-if="koreroStore.conversations.length === 0" class="text-center py-12">
        Be the first to create a conversation.
      </p>
      <p
        v-else-if="conversationTypeParam && filteredConversations.length === 0"
        class="text-center py-12"
      >
        There are no {{ conversationTypeParam }}s here yet.
      </p>

      <div class="py-4 px-6 rounded border border-slate-200">
        <ConversationList :conversations="filteredConversations" />
      </div>
    </div>
    <div>
      <HeadingTwo class="pt-1 pb-4">
        Members
        <div v-if="manageMembers">
          <button class="btn btn-sm" @click="manageMembers = false">Done</button>
        </div>

        <button v-else class="btn btn-xs" @click="manageMembers = true">Manage</button>
      </HeadingTwo>
      <ManageChannelMembers
        v-if="manageMembers"
        :initial-members="members.filter((id) => id !== user.id)"
        @update:add-member="addMember"
        @update:remove-member="removeMember"
      ></ManageChannelMembers>
      <div v-else>
        <span v-for="member in members" :key="member" class="badge badge-secondary badge-sm mr-2">{{
          userName(member)
        }}</span>
      </div>
      <div class="pt-4">
        <HeadingTwo>Conversation types</HeadingTwo>
        <ul class="menu bg-slate-50 border-slate-200 border rounded-box my-2">
          <li>
            <RouterLink
              :to="{ name: 'channel', params: { channelId } }"
              :class="{ active: !conversationTypeParam }"
              >View all conversations</RouterLink
            >
          </li>
          <li v-for="(type, index) in ConversationType" :key="index">
            <RouterLink
              :to="{ name: 'channelByType', params: { channelId, conversationType: type } }"
              class="capitalize flex gap-2 items-center"
              :class="{ active: type === conversationTypeParam }"
            >
              <ConversationTypeIcon :type="type" />
              <span>{{ type }}s</span>
            </RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
