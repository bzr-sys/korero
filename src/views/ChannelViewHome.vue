<script setup lang="ts">
import ChannelBreadcrumbNav from '@/components/ChannelBreadcrumbNav.vue'
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

const route = useRoute()
const koreroStore = useKoreroStore()
const { currentChannel, groups, user, conversations } = storeToRefs(koreroStore)

const channelId = route.params.channelId as string

const channelConversations = computed(() => {
  return conversations.value.filter((c) => c.channelId === channelId)
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

console.log(groups)
</script>

<template>
  <ChannelBreadcrumbNav />

  <div class="grid gap-6 lg:grid-cols-3">
    <div class="col-span-2">
      <div class="flex gap-4 justify-between items-end">
        <HeadingOne class="capitalize"
          >{{ conversationTypeParam ? conversationTypeParam : 'Conversation' }}s</HeadingOne
        >

        <RouterLink
          class="btn btn-sm btn-accent"
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

      <div class="grid gap-4 py-4">
        <BaseCard v-for="conversation in filteredConversations" :key="conversation.id">
          <div class="badge badge-accent">{{ conversation.type }}</div>
          <h2 class="card-title">
            <RouterLink
              :to="{ name: 'conversation', params: { conversationId: conversation.id } }"
              >{{ conversation.title }}</RouterLink
            >
          </h2>
          <div class="italic text-xs">
            By {{ koreroStore.getUser(conversation.authorId).name }} on
            <FormatDateString :dateString="conversation.created" :defaultCss="false" />
          </div>
        </BaseCard>
      </div>
    </div>
    <div>
      <HeadingTwo class="pt-1 pb-4">
        Members
        <div v-if="manageMembers">
          <button class="btn btn-sm" @click="manageMembers = false">Done</button>
        </div>

        <button v-else class="btn btn-sm" @click="manageMembers = true">Manange</button>
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
      <HeadingTwo class="pt-1 pb-4">Conversation types</HeadingTwo>
      <ul class="menu bg-slate-50 border-slate-200 border rounded-box">
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
            class="capitalize"
            :class="{ active: type === conversationTypeParam }"
            >{{ type }}s</RouterLink
          >
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped></style>
