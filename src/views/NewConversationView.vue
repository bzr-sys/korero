<script setup lang="ts">
import { computed, ref } from 'vue'

import { useKoreroStore } from '@/stores/korero'
import router from '@/router'
import BaseCard from '@/components/BaseCard.vue'
import ToastUiEditor from '@/components/ToastUiEditor.vue'
import HeadingOne from '@/components/HeadingOne.vue'
import BaseLegend from '@/components/BaseLegend.vue'
import BreadcrumbNav from '@/components/BreadcrumbNav.vue'
import { ConversationType, Agency } from '@/types'
import type { Meeting, Poll, Brainstorm, Conversation } from '@/types'
import { dateObjToDatetimeLocalFormat } from '@/date'

const channelId = router.currentRoute.value.params.id

const koreroStore = useKoreroStore()

koreroStore.setChannel(channelId as string)

const currentChannel = computed(() => {
  return koreroStore.channels.find((c) => {
    return c.id === channelId
  })
})

const channelName = computed(() => {
  if (currentChannel.value) {
    return currentChannel.value.name
  }
  return channelId
})

async function createConversation() {
  if (!title.value) {
    return
  }
  if (!message.value) {
    messageValidationError.value = 'A message is required'
    return
  }
  //
  let c: Omit<Conversation, 'id'> = {
    channelId: channelId as string,
    authorId: koreroStore.user.id,
    title: title.value,
    archived: false,
    created: dateObjToDatetimeLocalFormat(),
    //
    message: message.value,
    reactions: [],
    //
    type: chosenType.value
  }
  switch (chosenType.value) {
    case ConversationType.MEETING:
      // console.log('case is Meeting')
      c = {
        ...c,
        date: date.value,
        agenda: {
          setting: agendaSetting.value,
          decision: agendaDecision.value,
          due: due.value,
          items: agendaItems.value.map((item, index) => {
            return {
              index,
              title: item.title,
              text: item.text,
              approved: false,
              votes: []
            }
          })
        }
      } as Omit<Meeting, 'id'>
      break
    case ConversationType.POLL:
      c = {
        ...c,
        multipleAnswers: multipleAnswers.value,
        items: pollOptions.value.map((t, i) => {
          return { index: i, text: t, votes: [] }
        }),
        due: due.value
      } as Omit<Poll, 'id'>
      break
    case ConversationType.BRAINSTORM:
      c = {
        ...c,
        due: due.value
      } as Omit<Brainstorm, 'id'>
      break
    case ConversationType.DISCUSSION:
    case ConversationType.ANNOUNCEMENT:
    case ConversationType.QUESTION:
    default:
      break
  }
  const id = await koreroStore.createConversation(c)
  router.push({ name: 'conversation', params: { id: id } })
}

function addAgendaItem() {
  agendaItems.value.push({ ...emptyAgendaItem })
}

function addPollOption() {
  pollOptions.value.push('')
}

const conversationTypes = ref([] as { id: string; value: string }[])
for (const t of Object.values(ConversationType)) {
  conversationTypes.value.push({ id: t, value: t.charAt(0).toUpperCase() + t.slice(1) })
}

const chosenType = ref(ConversationType.DISCUSSION)
const messageDescription = computed(() => {
  switch (chosenType.value) {
    case ConversationType.MEETING:
      return 'What is the meeting about?'
    case ConversationType.POLL:
      return 'What is the poll about?'
    case ConversationType.BRAINSTORM:
      return 'What are you brainstorming?'
    case ConversationType.DISCUSSION:
      return 'Start your discussion'
    case ConversationType.ANNOUNCEMENT:
      return "What's going on?"
    case ConversationType.QUESTION:
      return 'What answers are you seeking?'
    default:
      return 'Start your conversation'
  }
})

const emptyAgendaItem = { title: '', text: '' }

const title = ref('')
const message = ref('')
const pollOptions = ref(['', ''])
const multipleAnswers = ref(false)
const agendaSetting = ref(Agency.OWNER)
const agendaDecision = ref(Agency.OWNER)
const agendaItems = ref([{ ...emptyAgendaItem }])
const due = ref('')
const date = ref('')
const messageValidationError = ref('')

const dateMin = dateObjToDatetimeLocalFormat()
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <BreadcrumbNav>
      <li>
        <RouterLink :to="{ name: 'channel', params: { id: channelId } }">
          <span class="sr-only">Channel name: </span>{{ channelName }}
        </RouterLink>
      </li>
      <li>New conversation</li>
    </BreadcrumbNav>

    <HeadingOne class="pb-6">Create a new conversation</HeadingOne>

    <form @submit.prevent="createConversation">
      <fieldset>
        <BaseLegend>Choose conversation type</BaseLegend>
        <div class="max-w-xs mb-8">
          <div v-for="t in conversationTypes" :key="t.id" class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">{{ t.value }}</span>
              <input type="radio" class="radio" :value="t.id" v-model="chosenType" />
            </label>
          </div>
        </div>
      </fieldset>

      <label class="form-control mb-8">
        <div class="label">
          <span class="label-text">Title</span>
        </div>
        <input v-model="title" type="text" class="input input-bordered" required />
      </label>

      <div>
        <ToastUiEditor
          @updateValue="(t) => (message = t)"
          :label="messageDescription"
          height="auto"
          initialEditType="markdown"
          :validationError="messageValidationError"
          class="mb-8"
        />

        <!-- MEETING -->

        <div v-if="chosenType === ConversationType.MEETING">
          <label class="form-control mb-8">
            <div class="label">
              <span class="label-text">Date</span>
            </div>
            <input
              type="datetime-local"
              v-model="date"
              class="input input-bordered"
              :min="dateMin"
              required
            />
          </label>

          <fieldset>
            <BaseLegend>Agenda settings</BaseLegend>
            <div class="max-w-xs mb-8">
              <div class="form-control">
                <label class="label cursor-pointer">
                  <span class="label-text">You set agenda now</span>
                  <input type="radio" class="radio" :value="Agency.OWNER" v-model="agendaSetting" />
                </label>
              </div>
              <div class="form-control">
                <label class="label cursor-pointer">
                  <span class="label-text">Set agenda collaboratively</span>
                  <input
                    type="radio"
                    class="radio"
                    :value="Agency.COLLAB"
                    v-model="agendaSetting"
                  />
                </label>
              </div>
            </div>
          </fieldset>

          <div v-if="agendaSetting === Agency.COLLAB">
            <label class="form-control mb-8">
              <div class="label">
                <span class="label-text">Agenda Item Proposal Due Date</span>
              </div>
              <input
                type="datetime-local"
                v-model="due"
                class="input input-bordered"
                :min="dateMin"
                required
              />
            </label>

            <fieldset>
              <legend class="sr-only">Agenda Proposed Items Decision Process</legend>
              <div class="max-w-xs mb-8">
                <div class="form-control">
                  <label :for="'AgendaDecision' + Agency.OWNER" class="label cursor-pointer">
                    <span class="label-text">You decide about agenda items</span>
                    <input
                      type="radio"
                      :id="'AgendaDecision' + Agency.OWNER"
                      class="radio"
                      :value="Agency.OWNER"
                      v-model="agendaDecision"
                    />
                  </label>
                </div>
                <div class="form-control">
                  <label :for="'AgendaDecision' + Agency.COLLAB" class="label cursor-pointer">
                    <span class="label-text">Vote for agenda items</span>
                    <input
                      type="radio"
                      :id="'AgendaDecision' + Agency.COLLAB"
                      class="radio"
                      :value="Agency.COLLAB"
                      v-model="agendaDecision"
                    />
                  </label>
                </div>
              </div>
            </fieldset>
          </div>

          <fieldset>
            <BaseLegend>Agenda items</BaseLegend>

            <button class="btn btn-sm mb-4" type="button" @click="addAgendaItem">Add item</button>

            <BaseCard v-for="(item, index) in agendaItems" :key="index" class="mb-4">
              <div>Agenda item {{ index + 1 }}</div>

              <label class="form-control mb-8">
                <div class="label">
                  <span class="label-text">Title</span>
                </div>
                <input v-model="item.title" type="text" class="input input-bordered" required />
              </label>

              <!-- Description is optional -->
              <ToastUiEditor
                @updateValue="(t) => (item.text = t)"
                label="Description"
                height="auto"
                initialEditType="markdown"
              />
            </BaseCard>
          </fieldset>
        </div>

        <!-- POLL -->

        <div v-else-if="chosenType === ConversationType.POLL">
          <label class="form-control mb-8">
            <div class="label">
              <span class="label-text">Due</span>
            </div>
            <input
              type="datetime-local"
              v-model="due"
              class="input input-bordered"
              :min="dateMin"
              required
            />
          </label>

          <fieldset class="mb-4">
            <BaseLegend>Poll options</BaseLegend>

            <button class="btn btn-sm mb-4" type="button" @click="addPollOption">Add option</button>

            <label v-for="(option, index) in pollOptions" :key="index" class="form-control mb-4">
              <div class="label">
                <span class="label-text sr-only">Option {{ index + 1 }}</span>
              </div>
              <input
                v-model="pollOptions[index]"
                type="text"
                class="input input-bordered"
                required
              />
            </label>
          </fieldset>

          <div class="form-control max-w-xs mb-8">
            <label class="label cursor-pointer">
              <span class="label-text">Allow multiple answers</span>
              <input v-model="multipleAnswers" type="checkbox" class="toggle" />
            </label>
          </div>
        </div>

        <!-- BRAINSTORM -->

        <label v-else-if="chosenType === ConversationType.BRAINSTORM" class="form-control mb-8">
          <div class="label">
            <span class="label-text">Due</span>
          </div>
          <input
            type="datetime-local"
            v-model="due"
            class="input input-bordered"
            :min="dateMin"
            required
          />
        </label>
      </div>

      <button class="btn btn-accent mt-4">Create conversation</button>
    </form>
  </div>
</template>

<style></style>
