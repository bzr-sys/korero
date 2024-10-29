<script setup lang="ts">
import ToastUiEditor from '@/components/ToastUiEditor.vue'
import ToastUiViewer from '@/components/ToastUiViewer.vue'
import { ref } from 'vue'
import PenToSquareSVG from '@/components/PenToSquareSVG.vue'

const props = withDefaults(
  defineProps<{
    initialValue: string
    editValue: (text: string) => Promise<void>
    canEdit?: boolean
  }>(),
  { canEdit: true }
)

const edit = ref(false)
const message = ref('')

const editor = ref<InstanceType<typeof ToastUiEditor> | null>(null)
const validationError = ref('')

async function cancelEdit() {
  message.value = props.initialValue
  editor.value?.clearMarkdown()
  edit.value = false
}

async function saveEdit() {
  validationError.value = ''
  if (!message.value) {
    validationError.value = 'Text is required'
    return
  }
  if (message.value === props.initialValue) {
    validationError.value = 'Text has not changed'
    return
  }
  await props.editValue(message.value)
  editor.value?.clearMarkdown()
  edit.value = false
}
</script>

<template>
  <div v-if="edit">
    <ToastUiEditor
      @updateValue="(t) => (message = t)"
      :initialValue="props.initialValue"
      height="auto"
      initialEditType="markdown"
      ref="editor"
      :validationError="validationError"
    />
    <div class="pt-2 flex gap-2">
      <button @click="cancelEdit" class="btn btn-xs">Cancel</button>
      <button @click="saveEdit" class="btn btn-xs">Save</button>
    </div>
  </div>
  <div v-else class="relative">
    <div v-if="canEdit" @click="edit = true" class="absolute top-0 right-0 p-1">
      <PenToSquareSVG />
    </div>
    <ToastUiViewer :initialValue="props.initialValue" />
  </div>
</template>

<style scoped></style>
