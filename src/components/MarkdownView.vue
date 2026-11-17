<script setup lang="ts">
import { computed } from 'vue'
import { markdownToHTML } from '@/markdown'

const props = defineProps<{
  markdown: string
}>()

const html = computed(() => markdownToHTML(props.markdown))
</script>

<template>
  <div class="bg-slate-100 p-4 rounded">
    <!-- eslint-disable-next-line vue/no-v-html -- built from the editor's schema, not raw HTML -->
    <div class="md-content" v-html="html"></div>
  </div>
</template>
