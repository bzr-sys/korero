<script setup lang="ts">
// @ts-ignore Complains about editor types and I was unable to find a solution
import Editor from '@toast-ui/editor'
import '@toast-ui/editor/dist/toastui-editor.css'
import type { EditorType } from 'node_modules/@toast-ui/editor/types'
import { onMounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    height?: string
    initialEditType?: EditorType
  }>(),
  {
    height: '500px',
    initialEditType: 'markdown'
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
  <div>
    <div ref="editor"></div>
  </div>
</template>

<style scoped></style>
