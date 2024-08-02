<script setup lang="ts">
import { computed, ref } from 'vue'

import { useKoreroStore } from '@/stores/korero'
import ToastUiViewer from '@/components/ToastUiViewer.vue'
import ToastUiEditor from '@/components/ToastUiEditor.vue'
import FormatDateString from '@/components/FormatDateString.vue'
import BaseLegend from './BaseLegend.vue'
import HeadingTwo from './HeadingTwo.vue'
import CircleCheckSVG from './CircleCheckSVG.vue'
import CirclePlainSVG from './CirclePlainSVG.vue'
import ChatMessage from './ChatMessage.vue'
import { type Poll, MessageType } from '@/types'

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
  if (!chosenOption.value && checkedOption.value.every((c) => !c)) {
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
  <FormatDateString class="text-center" :dateString="poll.due" />

  <ToastUiViewer :initialValue="poll.message" class="mb-4" />

  <!-- if due date in future -->
  <template v-if="new Date(poll.due) > new Date()">
    <template v-if="canVote">
      <fieldset v-if="!poll.multipleAnswers" class="max-w-xs">
        <BaseLegend>Select one</BaseLegend>

        <div v-for="option in poll.items" :key="option.index" class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">{{ option.text }}</span>
            <input type="radio" class="radio" :value="option.index" v-model="chosenOption" />
          </label>
        </div>
      </fieldset>
      <fieldset v-else class="max-w-xs">
        <BaseLegend>Select one or more</BaseLegend>
        <div class="form-control" v-for="option in poll.items" :key="option.index">
          <label class="label cursor-pointer">
            <span class="label-text">{{ option.text }}</span>
            <input
              :value="option.index"
              v-model="checkedOption[option.index]"
              type="checkbox"
              class="toggle"
            />
          </label>
        </div>
      </fieldset>

      <div>
        <button @click="votePoll()" class="btn btn-accent">Submit poll</button>
      </div>
    </template>
    <div v-else class="max-w-xs">
      <BaseLegend>You already voted</BaseLegend>

      <div class="form-control" v-for="option in poll.items" :key="option.index">
        <label class="label">
          <span class="label-text">{{ option.text }}</span>
          <CircleCheckSVG v-if="option.votes.includes(koreroStore.user.id)" />
          <CirclePlainSVG v-else />
        </label>
      </div>
    </div>
  </template>
  <!-- if due date in past -->
  <div v-else class="max-w-xs">
    <BaseLegend>Results</BaseLegend>
    <div class="form-control" v-for="option in poll.items" :key="option.index">
      <label class="label">
        <span class="label-text">{{ option.text }}</span>
        <div>{{ option.votes.length }}</div>
      </label>
    </div>
  </div>

  <HeadingTwo class="pt-8 text-center">Comments</HeadingTwo>

  <ChatMessage v-for="message in koreroStore.messages" :key="message.id" :message="message" />

  <div>
    <ToastUiEditor
      @updateValue="(t) => (newMessage = t)"
      label="Leave a comment"
      height="auto"
      initialEditType="markdown"
      ref="editor"
    />
    <button @click="postMessage" class="btn mt-4">Comment</button>
  </div>
</template>

<style></style>
