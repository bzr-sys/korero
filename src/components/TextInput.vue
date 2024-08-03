<script setup lang="ts">
const model = defineModel()

const props = defineProps<{
  label: string
  srOnlyLabel?: boolean
}>()
</script>
<template>
  <label class="form-control mb-4">
    <div class="label">
      <span class="label-text" :class="{ 'sr-only': srOnlyLabel }">{{ props.label }}</span>
    </div>
    <input v-model="model" type="text" class="input input-bordered" required />
  </label>
</template>

<style scoped></style>
