<script setup lang="ts">
// @ts-ignore Complains about editor types and I was unable to find a solution
import Editor from '@toast-ui/editor'
import '@toast-ui/editor/dist/toastui-editor.css'
import type { EditorType } from 'node_modules/@toast-ui/editor/types'
import { onMounted, ref, watch } from 'vue'
import ValidationError from '@/components/ValidationError.vue'

const props = withDefaults(
  defineProps<{
    label?: string
    height?: string
    initialEditType?: EditorType
    validationError?: string
  }>(),
  {
    height: '500px',
    initialEditType: 'markdown',
    validationError: ''
  }
)

const emit = defineEmits(['updateValue'])

const editor = ref()
let e: Editor
onMounted(() => {
  e = new Editor({
    el: editor.value,
    height: props.height,
    minHeight: '100px',
    initialEditType: props.initialEditType,
    previewStyle: 'tab',
    usageStatistics: false,
    autofocus: false,
    events: {
      change: () => emit('updateValue', e.getMarkdown())
    }
  })
})

function clearMarkdown() {
  e.setMarkdown('')
}
defineExpose({
  clearMarkdown
})

watch(
  () => props.height,
  (height) => {
    if (e) {
      e.setHeight(height)
    }
  }
)
</script>

<template>
  <div class="editor-wrapper">
    <div class="scroll-wrapper">
      <div v-if="props.label" class="label label-text">{{ props.label }}</div>
      <!-- To be accessible, the alert role element must be present in the DOM before an alert is triggered -->
      <!-- A browser is notified of an alert when its contents change (assistive technologies are subsequently informed of the alert) -->
      <ValidationError>{{ validationError }}</ValidationError>
      <div ref="editor"></div>
    </div>
  </div>
</template>

<style>
.toastui-editor-main {
  background-color: #fff;
}

.editor-wrapper {
  overflow: hidden;
}
.scroll-wrapper {
  overflow-x: scroll;
  width: 100%;
}
</style>
