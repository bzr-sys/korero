<script setup lang="ts">
import LogoIconSVG from './LogoIconSVG.vue'
</script>

<template>
  <footer class="footer px-8 py-4">
    <div class="grid-flow-col items-center">
      <LogoIconSVG width="36px" />
      <div>
        <div>
          <strong>&copy; {{ new Date().getFullYear() }} Korero</strong>
        </div>
        <div>Communicate effectively with your team.</div>
      </div>
    </div>
  </footer>
</template>

<style scoped></style>
