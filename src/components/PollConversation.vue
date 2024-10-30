<script setup lang="ts">
import { computed, ref } from 'vue'
import { useKoreroStore } from '@/stores/korero'
import EditViewer from '@/components/EditViewer.vue'
import DueDate from './DueDate.vue'
import BaseLegend from './BaseLegend.vue'
import HeadingTwo from './HeadingTwo.vue'
import CircleCheckSVG from './CircleCheckSVG.vue'
import CirclePlainSVG from './CirclePlainSVG.vue'
import ChatMessage from './ChatMessage.vue'
import MessageForm from '@/components/MessageForm.vue'
import ValidationError from './ValidationError.vue'
import { getPluralEnding } from '@/utils/getPluralEnding'
import type { Poll } from '@/types'
import { storeToRefs } from 'pinia'

const koreroStore = useKoreroStore()
const { currentConversation, orderedMessages, user } = storeToRefs(koreroStore)

// We know the conversation is a poll
const poll = computed(() => currentConversation.value as Poll)

const chosenOption = ref()
const checkedOption = ref([] as boolean[])
const optionValidationError = ref('')
checkedOption.value = poll.value.items.map(() => false)
const canVote = computed(() => {
  for (const item of poll.value.items) {
    for (const vote of item.votes) {
      if (vote === user.value.id) {
        return false
      }
    }
  }
  return true
})
async function votePoll() {
  optionValidationError.value = ''

  if (!canVote.value) {
    optionValidationError.value = 'You cannot vote.'
    return
  }
  if (!chosenOption.value && chosenOption.value !== 0 && checkedOption.value.every((c) => !c)) {
    optionValidationError.value = poll.value.multipleAnswers
      ? 'Choose at least one option'
      : 'Choose an option'
    return
  }
  for (let i in poll.value.items) {
    if (poll.value.items[i].index === chosenOption.value || checkedOption.value[i]) {
      poll.value.items[i].votes.push(user.value.id)
    }
  }
  await koreroStore.updateConversation(poll.value.id, {
    items: poll.value.items
  })
}
</script>

<template>
  <DueDate label="Vote by" :dateString="poll.due" />

  <EditViewer
    :initialValue="poll.message"
    :editValue="koreroStore.editConversation(currentConversation?.id)"
  />

  <!-- if due date in future -->
  <template v-if="new Date(poll.due) > new Date()">
    <template v-if="canVote">
      <fieldset v-if="!poll.multipleAnswers" class="max-w-xs">
        <ValidationError>{{ optionValidationError }}</ValidationError>
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
          <CircleCheckSVG v-if="option.votes.includes(user.id)" />
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

  <HeadingTwo class="pt-4"
    >{{ orderedMessages.length }} Comment{{ getPluralEnding(orderedMessages) }}</HeadingTwo
  >

  <ChatMessage v-for="message in orderedMessages" :key="message.id" :message="message" />

  <MessageForm />
</template>

<style></style>
