<script setup lang="ts">
import { bzr } from '@/bazaar'
import LogoTextSVG from './LogoTextSVG.vue'
import BazaarLogoIcon from './BazaarLogoIcon.vue'
import HeadingOne from './HeadingOne.vue'

function login(): void {
  bzr.login()
}
</script>

<template>
  <div class="grid min-h-full grid-rows-[auto_1fr_auto] px-8 max-w-7xl mx-auto">
    <header class="sticky flex py-8">
      <a href="https://koreroapp.com/" class="relative flex gap-3">
        <LogoTextSVG width="130px" />
        <span class="absolute bottom-0 right-0 translate-y-full text-[0.6rem]">
          Powered by Bazaar
        </span>
      </a>
    </header>

    <main class="text-center py-12">
      <HeadingOne>Welcome to Korero</HeadingOne>
      <div class="text-lg pt-2 pb-8 opacity-70">To get started, please sign in</div>
      <button @click="login" class="btn btn-lg">
        <BazaarLogoIcon width="20px" /> Continue with Bazaar
      </button>
    </main>

    <footer class="py-8 opacity-70">
      <nav>
        <ul
          class="flex flex-wrap justify-center text-xs [&>li:not(:first-child)]:before:content-['•'] [&>li:not(:first-child)]:before:px-2 [&>li>a]:whitespace-nowrap"
        >
          <li><a href="https://koreroapp.com/">Koreroapp.com</a></li>
          <li><a href="https://bzr.dev/">Powered by Bazaar</a></li>
          <li><a href="https://koreroapp.com/terms/">Terms</a></li>
          <li><a href="https://koreroapp.com/privacy/">Privacy</a></li>
          <li><a href="https://koreroapp.com/acceptable-use-policy/">Acceptable Use Policy</a></li>
        </ul>
      </nav>
    </footer>
  </div>
</template>

<style scoped>
ul > li:not(:first-child):before {
  content: '•';
  padding: 0 2px;
}
</style>
