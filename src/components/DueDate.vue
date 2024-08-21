<script setup lang="ts">
import FormatDateString from '@/components/FormatDateString.vue'

defineProps<{ label: string; dateString: string }>()
</script>

<template>
  <div class="text-sm uppercase">
    {{ label }} <FormatDateString :dateString="dateString" :defaultCss="false" />
  </div>
</template>

<style scoped></style>
