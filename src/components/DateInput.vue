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
  <label class="form-control mb-8">
    <div class="label">
      <span class="label-text">{{ props.label }}</span>
    </div>
    <input
      type="datetime-local"
      v-model="model"
      class="input input-bordered"
      :min="dateMin"
      required
    />
  </label>
</template>

<style scoped></style>
