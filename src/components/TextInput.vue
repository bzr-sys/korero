<script setup lang="ts">
const model = defineModel<string>({ required: true })

const props = defineProps<{
  label: string
  srOnlyLabel?: boolean
  placeholder?: string
}>()
</script>
<template>
  <label class="form-control relative mb-4">
    <div
      class="label absolute top-[6px] left-[13px] transition-all duration-200 ease-out py-0 px-1 z-20"
      :class="{ 'input-has-content': model.length }"
    >
      <span class="label-text" :class="{ 'sr-only': srOnlyLabel }">{{ props.label }}</span>
    </div>
    <input
      v-model="model"
      type="text"
      class="input input-bordered placeholder:opacity-0 focus:placeholder:opacity-100 placeholder:transition-opacity duration-200 ease-out z-10"
      :placeholder="placeholder"
      required
    />
  </label>
</template>

<style scoped>
.form-control:focus-within .label,
.input-has-content {
  top: -13px;
}
.label::after {
  background: #fff;
  border-radius: 2px;
  content: '';
  height: 100%;
  width: 100%;
  position: absolute;
  left: 0;
  z-index: -1;
}
</style>
