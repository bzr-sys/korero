<script setup lang="ts">
const model = defineModel<string>({ required: true })

const props = defineProps<{
  label: string
  srOnlyLabel?: boolean
  placeholder?: string
}>()
</script>
<template>
  <label class="flex flex-col gap-1.5 mb-4">
    <span class="text-sm font-medium" :class="{ 'sr-only': srOnlyLabel }">{{ props.label }}</span>
    <input v-model="model" type="text" class="input w-full" :placeholder="placeholder" required />
  </label>
</template>
