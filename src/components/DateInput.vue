<script setup lang="ts">
import { isoToDatetimeLocalInputStr } from '@/date'

const model = defineModel()

const props = defineProps<{
  label: string
}>()

/** Min date is now */
const dateMin = isoToDatetimeLocalInputStr(new Date().toISOString())
</script>

<template>
  <label class="flex flex-col gap-1.5 mb-6">
    <span class="text-sm font-medium">{{ props.label }}</span>
    <input
      type="datetime-local"
      v-model="model"
      class="input w-full sm:max-w-xs"
      :min="dateMin"
      required
    />
  </label>
</template>

<style scoped></style>
