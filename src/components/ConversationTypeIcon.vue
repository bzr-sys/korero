<script setup lang="ts">
import DiscussionSVG from '@/components/DiscussionSVG.vue'
import MeetingSVG from '@/components/MeetingSVG.vue'
import QuestionSVG from '@/components/QuestionSVG.vue'
import AnnouncementSVG from '@/components/AnnouncementSVG.vue'
import PollSVG from '@/components/PollSVG.vue'
import BrainstormSVG from '@/components/BrainstormSVG.vue'
import { ConversationType } from '@/types'
import { computed, type Component } from 'vue'

const { type, width = '18px' } = defineProps<{ type: ConversationType; width?: string }>()

// TODO need to make SVG title ids unique for accessibility
// Could create a composable and generate a unique ID on mount to append to id and aria-labelledby

const iconMap: Record<ConversationType, Component> = {
  [ConversationType.DISCUSSION]: DiscussionSVG,
  [ConversationType.MEETING]: MeetingSVG,
  [ConversationType.QUESTION]: QuestionSVG,
  [ConversationType.ANNOUNCEMENT]: AnnouncementSVG,
  [ConversationType.POLL]: PollSVG,
  [ConversationType.BRAINSTORM]: BrainstormSVG
}

const getIconComponent = computed(() => (type: ConversationType) => iconMap[type] || null)
</script>

<template>
  <component :is="getIconComponent(type)" :width="width" />
</template>

<style scoped></style>
