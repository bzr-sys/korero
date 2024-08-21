<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'
import ChannelBreadcrumbNav from '@/components/ChannelBreadcrumbNav.vue'
import BaseCard from '@/components/BaseCard.vue'
import ToastUiEditor from '@/components/ToastUiEditor.vue'
import HeadingOne from '@/components/HeadingOne.vue'
import BaseLegend from '@/components/BaseLegend.vue'
import TextInput from '@/components/TextInput.vue'
import DateInput from '@/components/DateInput.vue'
import SmallContainer from '@/components/SmallContainer.vue'
import { ConversationType, Agency } from '@/types'
import type { Meeting, Poll, Brainstorm, Conversation, OwnerAgenda, CollabAgenda } from '@/types'
import { dateStrToISO } from '@/date'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const channelId = route.params.channelId as string
const conversationType = route.query.type as ConversationType

const koreroStore = useKoreroStore()

koreroStore.setChannel(channelId)

async function createConversation() {
  if (!title.value) {
    return
  }
  if (chosenType.value !== ConversationType.MEETING && !message.value) {
    messageValidationError.value = 'A message is required'
    return
  }
  //
  let c: Omit<Conversation, 'id'> = {
    channelId: channelId,
    title: title.value,
    authorId: koreroStore.user.id,
    archived: false,
    created: dateStrToISO(),
    //
    reactions: [],
    message: message.value,
    //
    type: chosenType.value
  }
  switch (chosenType.value) {
    case ConversationType.MEETING:
      // TODO collabAgenda `due` should be before meeting `date`
      if (agendaSetting.value === Agency.OWNER) {
        const ownerAgenda: OwnerAgenda = {
          setting: Agency.OWNER,
          text: agendaText.value
        }
        const ownerMeeting: Omit<Meeting, 'id'> = {
          ...c,
          type: ConversationType.MEETING,
          date: dateStrToISO(meetingDate.value),
          agenda: ownerAgenda
        }
        c = ownerMeeting
      }
      if (agendaSetting.value === Agency.COLLAB) {
        const collabAgenda: CollabAgenda = {
          setting: agendaSetting.value,
          decision: agendaDecision.value,
          items: agendaItems.value.map((item, index) => {
            return {
              index,
              title: item.title,
              text: item.text,
              approved: false,
              votes: []
            }
          }),
          due: dateStrToISO(due.value)
        }
        const collabMeeting: Omit<Meeting, 'id'> = {
          ...c,
          type: ConversationType.MEETING,
          date: dateStrToISO(meetingDate.value),
          agenda: collabAgenda
        }
        c = collabMeeting
      }
      break
    case ConversationType.POLL: {
      const poll: Omit<Poll, 'id'> = {
        ...c,
        type: ConversationType.POLL,
        multipleAnswers: multipleAnswers.value,
        items: pollOptions.value.map((t, i) => {
          return { index: i, text: t, votes: [] }
        }),
        due: dateStrToISO(due.value)
      }
      c = poll
      break
    }
    case ConversationType.BRAINSTORM: {
      const brainstorm: Omit<Brainstorm, 'id'> = {
        ...c,
        type: ConversationType.BRAINSTORM,
        due: dateStrToISO(due.value)
      }
      c = brainstorm
      break
    }
    case ConversationType.DISCUSSION:
    case ConversationType.ANNOUNCEMENT:
    case ConversationType.QUESTION:
    default:
      break
  }
  const conversationId = await koreroStore.createConversation(c)
  router.push({ name: 'conversation', params: { conversationId } })
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

const chosenType = ref(conversationType)
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
const agendaText = ref('')
const agendaDecision = ref(Agency.OWNER)
const agendaItems = ref([{ ...emptyAgendaItem }])
const due = ref('')
const meetingDate = ref('')
const messageValidationError = ref('')
</script>

<template>
  <ChannelBreadcrumbNav :currentTitle="`Create a new ${conversationType}`" />
  <SmallContainer>
    <HeadingOne>Create a new {{ conversationType }}</HeadingOne>
    <div class="pb-6 text-xs">
      <RouterLink :to="{ name: 'newConversationChoose', params: { channelId } }" class="link"
        >Choose a different type</RouterLink
      >
    </div>

    <form @submit.prevent="createConversation">
      <input type="hidden" v-model="chosenType" />

      <TextInput label="Title" v-model="title" />

      <div>
        <ToastUiEditor
          v-if="chosenType !== ConversationType.MEETING"
          @updateValue="(t) => (message = t)"
          :label="messageDescription"
          height="auto"
          initialEditType="markdown"
          :validationError="messageValidationError"
          class="mb-4"
        />

        <!-- MEETING -->

        <div v-if="chosenType === ConversationType.MEETING">
          <DateInput label="Date" v-model="meetingDate" />

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

          <template v-if="agendaSetting === Agency.OWNER">
            <!-- Agenda items in a single field for non-collab -->
            <ToastUiEditor
              @updateValue="(t) => (agendaText = t)"
              label="Agenda Items"
              height="auto"
              initialEditType="markdown"
            />
          </template>
          <template v-if="agendaSetting === Agency.COLLAB">
            <DateInput label="Agenda item proposal due date" v-model="due" />

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
            <fieldset>
              <BaseLegend>Agenda items</BaseLegend>

              <BaseCard v-for="(item, index) in agendaItems" :key="index" class="mb-4">
                <div>Agenda item {{ index + 1 }}</div>

                <TextInput label="Title" v-model="item.title" />

                <!-- Description is optional -->
                <ToastUiEditor
                  @updateValue="(t) => (item.text = t)"
                  label="Description"
                  height="auto"
                  initialEditType="markdown"
                />
              </BaseCard>

              <button class="btn btn-sm mb-4" type="button" @click="addAgendaItem">Add item</button>
            </fieldset>
          </template>
        </div>

        <!-- POLL -->

        <div v-else-if="chosenType === ConversationType.POLL">
          <DateInput label="Due" v-model="due" />

          <fieldset class="mb-4">
            <BaseLegend>Poll options</BaseLegend>

            <TextInput
              v-for="(option, index) in pollOptions"
              :key="index"
              :label="`Option ${index + 1}`"
              v-model="pollOptions[index]"
              :srOnlyLabel="true"
            />

            <button class="btn btn-sm mb-4" type="button" @click="addPollOption">Add option</button>
          </fieldset>

          <div class="form-control max-w-xs mb-8">
            <label class="label cursor-pointer">
              <span class="label-text">Allow multiple answers</span>
              <input v-model="multipleAnswers" type="checkbox" class="toggle" />
            </label>
          </div>
        </div>

        <!-- BRAINSTORM -->

        <DateInput
          v-else-if="chosenType === ConversationType.BRAINSTORM"
          label="Due"
          v-model="due"
        />
      </div>

      <button class="btn btn-accent mt-4">Create {{ conversationType }}</button>
    </form>
  </SmallContainer>
</template>

<style></style>
