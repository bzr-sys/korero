<script setup lang="ts">
import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer'
import '@toast-ui/editor/dist/toastui-editor-viewer.css'
import { onMounted, ref } from 'vue'

const props = defineProps<{
  initialValue: string
}>()

const viewer = ref()
onMounted(() => {
  new Viewer({
    el: viewer.value,
    usageStatistics: false,
    initialValue: props.initialValue
  })
})
</script>

<template>
  <div class="bg-base-200 p-4 rounded-box">
    <div ref="viewer"></div>
  </div>
</template>

<style scoped></style>
