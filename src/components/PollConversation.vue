<script setup lang="ts">
import { computed, ref } from 'vue'

import { useKoreroStore } from '@/stores/korero'
import ToastUiViewer from '@/components/ToastUiViewer.vue'
import ToastUiEditor from '@/components/ToastUiEditor.vue'
import { type Poll, PollType, MessageType } from '@/types'

const koreroStore = useKoreroStore()
// We know the conversation is a poll
const poll = koreroStore.currentConversation as Poll

const newMessage = ref('')
const editor = ref<InstanceType<typeof ToastUiEditor> | null>(null)
async function postMessage() {
  if (!newMessage.value) {
    return
  }
  await koreroStore.createMessage({
    conversationId: poll.id,
    type: MessageType.COMMENT,
    text: newMessage.value
  })
  newMessage.value = ''
  editor.value?.clearMarkdown()
}

const chosenOption = ref()
const checkedOption = ref([] as boolean[])
checkedOption.value = poll.items.map(() => false)
const canVote = computed(() => {
  for (const item of poll.items) {
    for (const vote of item.votes) {
      if (vote === koreroStore.user.id) {
        return false
      }
    }
  }
  return true
})
async function votePoll() {
  if (!canVote.value) {
    return
  }
  if (!chosenOption && checkedOption.value.every((c) => !c)) {
    return
  }
  for (let i in poll.items) {
    if (poll.items[i].index === chosenOption.value || checkedOption.value[i]) {
      poll.items[i].votes.push(koreroStore.user.id)
    }
  }
  await koreroStore.updateConversation(poll.id, {
    items: poll.items
  })
}
</script>

<template>
  <div class="border p-4">
    <ToastUiViewer :initialValue="poll.message" />
  </div>

  <div>
    <div v-if="new Date(poll.due) > new Date()">
      <p>Due: {{ poll.due }}</p>
      <div v-if="canVote">
        <div v-if="poll.pollType === PollType.SINGLE">
          <div v-for="option in poll.items">
            <input
              type="radio"
              :id="option.index.toString()"
              :value="option.index"
              v-model="chosenOption"
            />
            <label :for="option.index.toString()">{{ option.text }}</label>
          </div>
        </div>

        <div v-if="poll.pollType === PollType.MULTIPLE">
          <div v-for="option in poll.items">
            <input
              type="checkbox"
              :id="option.index.toString()"
              :value="option.index"
              v-model="checkedOption[option.index]"
            />
            <label :for="option.index.toString()">{{ option.text }}</label>
          </div>
        </div>

        <button
          @click="votePoll()"
          class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded self-center"
        >
          Submit poll
        </button>
      </div>
      <div v-else>
        You already voted:
        <div v-for="option in poll.items">
          <p>
            {{ option.text }}
            {{ option.votes.includes(koreroStore.user.id) ? '<- your choice' : '' }}
          </p>
        </div>
      </div>
    </div>
    <div v-else>
      <div v-for="option in poll.items">
        <p>{{ option.text }}: {{ option.votes.length }}</p>
      </div>
    </div>
  </div>

  <!-- Start comment thread -->

  <div v-for="message in koreroStore.messages" :key="message.id" class="border p-4">
    <ToastUiViewer :initialValue="message.text" />
  </div>

  <div>
    <p>Write a comment</p>
    <ToastUiEditor
      @updateValue="(t) => (newMessage = t)"
      height="auto"
      initialEditType="markdown"
      ref="editor"
    />
    <button
      @click="postMessage"
      class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded self-center"
    >
      Post Message
    </button>
  </div>
</template>

<style></style>
