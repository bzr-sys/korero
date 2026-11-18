<script setup lang="ts">
import { LoginType } from '@bzr/bazaar'
import { bzr, LANDING_URL, signInRequested, signInReturning } from '@/bazaar'
import LoaderSVG from './LoaderSVG.vue'

// Signed out: send people to the landing page, unless they came from its sign-in
// buttons or are on their way back from Bazaar's sign-in.
if (signInRequested) {
  bzr.login({ type: LoginType.REDIRECT })
} else if (!signInReturning) {
  window.location.replace(LANDING_URL)
}
</script>

<template>
  <div class="grid h-full place-items-center">
    <LoaderSVG width="40px" />
  </div>
</template>
