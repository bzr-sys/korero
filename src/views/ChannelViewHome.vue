<script setup lang="ts">
import HeadingOne from '@/components/HeadingOne.vue'
import ManageChannelMembers from '@/components/ManageChannelMembers.vue'
import HeadingTwo from '@/components/HeadingTwo.vue'
import { useRoute } from 'vue-router'
import { useKoreroStore } from '@/stores/korero'
import { ConversationType } from '@/types'
import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'
import { storeToRefs } from 'pinia'
import ConversationTypeIcon from '@/components/ConversationTypeIcon.vue'
import ConversationList from '@/components/ConversationList.vue'
import ChevronDownSVG from '@/components/ChevronDownSVG.vue'
import ChevronUpSVG from '@/components/ChevronUpSVG.vue'

const route = useRoute()
const koreroStore = useKoreroStore()
const { currentChannel, groups, user, conversations } = storeToRefs(koreroStore)

const channelId = ref(route.params.channelId as string)
const conversationTypeParam = ref(route.params.conversationType as ConversationType)
const manageMembers: Ref<boolean> = ref(false)
const isMembersDropdownExpanded = ref(false)

if (currentChannel.value) {
  koreroStore.getGroup(currentChannel.value.group)
}

watch(route, async (route) => {
  channelId.value = route.params.channelId as string
  conversationTypeParam.value = route.params.conversationType as ConversationType
})

const channelConversations = computed(() => {
  return conversations.value.filter((c) => c.channelId === channelId.value)
})

const filteredConversations = computed(() => {
  if (!conversationTypeParam.value) {
    return channelConversations.value
  }
  return channelConversations.value.filter((c) => c.type === conversationTypeParam.value)
})

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

function addMember(id: string) {
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

function userName(id: string) {
  const user = koreroStore.getUser(id)
  if (user.id) {
    return user.name
  }
  return id
}

function toggleMembersDropdown(): void {
  isMembersDropdownExpanded.value = !isMembersDropdownExpanded.value
}
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-3 max-w-screen-2xl">
    <div class="lg:col-span-2">
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

      <div class="py-4 px-6 rounded border border-slate-200">
        <p v-if="koreroStore.conversations.length === 0" class="text-center py-12">
          Be the first to create a conversation.
        </p>
        <div
          v-else-if="conversationTypeParam && filteredConversations.length === 0"
          class="text-center py-12"
        >
          <p class="pb-4">Create your first {{ conversationTypeParam }} in this channel.</p>
          <RouterLink
            :to="{
              name: 'newConversation',
              params: { channelId },
              query: { type: conversationTypeParam }
            }"
            class="btn btn-accent"
            >Create {{ conversationTypeParam }}</RouterLink
          >
        </div>
        <ConversationList :conversations="filteredConversations" />
      </div>
    </div>
    <div>
      <div class="flex gap-4 justify-between items-center pb-2">
        <HeadingTwo>Members</HeadingTwo>
        <button
          class="btn btn-xs"
          @click="toggleMembersDropdown"
          :aria-expanded="isMembersDropdownExpanded"
          aria-label="Manage channel members card"
        >
          Manage
          <ChevronDownSVG v-show="!isMembersDropdownExpanded" width="12px" />
          <ChevronUpSVG v-show="isMembersDropdownExpanded" width="12px" />
        </button>
      </div>

      <div class="px-6 py-4 rounded border border-slate-200">
        <div v-if="isMembersDropdownExpanded" :aria-hidden="!isMembersDropdownExpanded">
          <ManageChannelMembers
            :initial-members="members.filter((id) => id !== user.id)"
            @update:add-member="addMember"
            @update:remove-member="removeMember"
          ></ManageChannelMembers>
        </div>
        <ul v-else class="text-sm">
          <li v-for="member in members" :key="member">{{ userName(member) }}</li>
        </ul>
      </div>

      <div class="pt-4">
        <HeadingTwo>Conversation types</HeadingTwo>
        <ul class="menu bg-white border-slate-200 border rounded-box my-2">
          <li>
            <RouterLink
              :to="{ name: 'channel', params: { channelId } }"
              :class="{ active: !conversationTypeParam }"
              >View all conversations</RouterLink
            >
          </li>
          <li v-for="(type, index) in ConversationType" :key="index">
            <RouterLink
              :to="{
                name: 'channelByType',
                params: { channelId, conversationType: type }
              }"
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
