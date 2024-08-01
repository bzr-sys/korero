<script setup lang="ts">
import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer'
import '@toast-ui/editor/dist/toastui-editor-viewer.css'
import { onMounted, ref } from 'vue'
import BaseCard from './BaseCard.vue'

const props = defineProps<{
  initialValue: string
}>()

const viewer = ref()
onMounted(() => {
  const e = new Viewer({
    el: viewer.value,
    usageStatistics: false,
    initialValue: props.initialValue
  })
})
</script>

<template>
  <div class="bg-slate-100 p-4">
    <div ref="viewer"></div>
  </div>
</template>

<style scoped></style>
