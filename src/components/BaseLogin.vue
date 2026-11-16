<script setup lang="ts">
import { bzr } from '@/bazaar'
import { ConversationType } from '@/types'
import LogoTextSVG from './LogoTextSVG.vue'
import BazaarLogoIcon from './BazaarLogoIcon.vue'
import ConversationTypeIcon from './ConversationTypeIcon.vue'
import LandingPricing from './LandingPricing.vue'

function login(): void {
  bzr.login()
}

const types = [
  { type: ConversationType.ANNOUNCEMENT, text: 'Share a memo, closed to comments.' },
  { type: ConversationType.DISCUSSION, text: 'Talk a topic through, on your own time.' },
  { type: ConversationType.QUESTION, text: 'Collect answers and mark the best one.' },
  { type: ConversationType.POLL, text: 'Gather votes by a due date.' },
  { type: ConversationType.BRAINSTORM, text: 'Collect ideas, then discuss them.' },
  { type: ConversationType.MEETING, text: 'Build the agenda together before you meet.' }
]

// The hero's sample channel
const sample = [
  { type: ConversationType.ANNOUNCEMENT, title: 'Q4 roadmap is live', meta: 'Ana Ruiz · Monday' },
  {
    type: ConversationType.POLL,
    title: 'Where should the offsite be?',
    meta: 'Ben Okafor · Monday'
  },
  {
    type: ConversationType.QUESTION,
    title: 'Who owns the design tokens?',
    meta: 'Ana Ruiz · Tuesday'
  },
  { type: ConversationType.MEETING, title: 'Thursday sync agenda', meta: 'Cleo Park · Wednesday' }
]
</script>

<template>
  <div class="min-h-full bg-base-100">
    <header class="max-w-6xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between gap-4">
      <a href="https://koreroapp.com/" class="flex flex-col items-end">
        <LogoTextSVG width="120px" />
        <span class="text-[0.6rem] opacity-70">Powered by Bazaar</span>
      </a>
      <nav class="flex items-center gap-1">
        <a href="#pricing" class="btn btn-sm btn-ghost">Pricing</a>
        <button @click="login" class="btn btn-sm">Sign in</button>
      </nav>
    </header>

    <main class="overflow-x-clip">
      <section
        class="max-w-6xl mx-auto px-4 sm:px-8 pt-8 pb-16 sm:pt-16 sm:pb-24 grid gap-12 lg:grid-cols-[1.1fr_1fr] items-center"
      >
        <div class="flex flex-col gap-6">
          <p class="text-sm font-medium text-accent">Async communication for teams</p>
          <h1 class="text-4xl sm:text-6xl font-semibold tracking-tight text-balance">
            Team talk that doesn't need a meeting.
          </h1>
          <p class="text-lg opacity-80 max-w-xl">
            Korero gives each topic its own place: announcements, discussions, questions, polls,
            brainstorms and meeting agendas, sorted into channels. Everyone replies when it suits
            them.
          </p>
          <div class="flex flex-col items-start gap-3">
            <button @click="login" class="btn btn-lg btn-accent">
              <BazaarLogoIcon width="20px" /> Continue with Bazaar
            </button>
            <p class="text-sm opacity-70">Sign in with a free Bazaar account.</p>
          </div>
        </div>

        <div class="relative" aria-hidden="true">
          <div class="absolute -inset-4 sm:-inset-8 rounded-[2rem] bg-mint-soft -rotate-2"></div>
          <div
            class="relative rounded-box border border-base-300 bg-base-100 shadow-xl overflow-hidden"
          >
            <div class="flex items-center gap-2 px-5 py-3 border-b border-base-300 bg-base-200">
              <span class="font-medium"># design</span>
              <span class="text-xs opacity-60">Acme Studio</span>
            </div>
            <ul class="flex flex-col divide-y divide-base-300">
              <li v-for="s in sample" :key="s.title" class="flex items-center gap-3 px-5 py-4">
                <span class="grid place-items-center p-2.5 rounded-full bg-mint-soft shrink-0">
                  <ConversationTypeIcon :type="s.type" />
                </span>
                <div class="min-w-0">
                  <div class="font-medium truncate">{{ s.title }}</div>
                  <div class="text-xs opacity-60">{{ s.meta }}</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section class="bg-base-200 border-y border-base-300">
        <div class="max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-20 flex flex-col gap-10">
          <div class="max-w-2xl flex flex-col gap-3">
            <h2 class="text-3xl font-semibold tracking-tight">
              Pick the right shape for each topic
            </h2>
            <p class="opacity-80">
              A poll isn't a discussion, and an announcement isn't a question. Korero has a
              conversation type for each, so threads stay short and decisions stay findable.
            </p>
          </div>
          <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <li
              v-for="t in types"
              :key="t.type"
              class="flex gap-4 p-5 rounded-box border border-base-300 bg-base-100"
            >
              <span class="grid place-items-center size-11 rounded-full bg-mint-soft shrink-0">
                <ConversationTypeIcon :type="t.type" width="22px" />
              </span>
              <div>
                <h3 class="font-semibold capitalize">{{ t.type }}</h3>
                <p class="text-sm opacity-80">{{ t.text }}</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <section class="max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-20 grid gap-10 lg:grid-cols-3">
        <div class="flex flex-col gap-3">
          <h2 class="text-3xl font-semibold tracking-tight">Your organization owns the data</h2>
          <p class="opacity-80">
            Korero runs on Bazaar. Channels and conversations live in your organization's Bazaar
            account, not in a database Korero runs.
          </p>
        </div>
        <ul class="lg:col-span-2 grid gap-6 sm:grid-cols-3">
          <li class="flex flex-col gap-1">
            <strong class="font-semibold">One sign-in</strong>
            <span class="text-sm opacity-80"
              >Members use their own free Bazaar account. No new password.</span
            >
          </li>
          <li class="flex flex-col gap-1">
            <strong class="font-semibold">Access in one place</strong>
            <span class="text-sm opacity-80"
              >Remove someone from the organization and their access ends at once.</span
            >
          </li>
          <li class="flex flex-col gap-1">
            <strong class="font-semibold">Stays when people go</strong>
            <span class="text-sm opacity-80"
              >The data belongs to the organization, not to whoever set Korero up.</span
            >
          </li>
        </ul>
      </section>

      <section id="pricing" class="bg-base-200 border-y border-base-300">
        <div class="max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-20 flex flex-col gap-10">
          <div class="max-w-2xl flex flex-col gap-3">
            <h2 class="text-3xl font-semibold tracking-tight">Pricing</h2>
            <p class="opacity-80">
              Korero has no fee of its own. It runs on your organization's Bazaar plan, which also
              covers every other Bazaar app your team uses.
            </p>
          </div>
          <LandingPricing />
          <p class="text-sm opacity-70">
            Monthly, tax included. Every member needs a free Bazaar account.
            <a href="https://bzr.dev/pricing" class="link">All Bazaar plans</a>
          </p>
        </div>
      </section>

      <section
        class="max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-20 text-center flex flex-col items-center gap-5"
      >
        <h2 class="text-3xl font-semibold tracking-tight">Start your first channel</h2>
        <button @click="login" class="btn btn-lg btn-accent">
          <BazaarLogoIcon width="20px" /> Continue with Bazaar
        </button>
      </section>
    </main>

    <footer class="border-t border-base-300 px-4 py-8">
      <nav aria-label="Footer">
        <ul class="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs opacity-70">
          <li><a href="https://koreroapp.com/" class="link link-hover">Koreroapp.com</a></li>
          <li><a href="https://bzr.dev/" class="link link-hover">Powered by Bazaar</a></li>
          <li><a href="https://koreroapp.com/terms/" class="link link-hover">Terms</a></li>
          <li><a href="https://koreroapp.com/privacy/" class="link link-hover">Privacy</a></li>
          <li>
            <a href="https://koreroapp.com/acceptable-use-policy/" class="link link-hover"
              >Acceptable Use Policy</a
            >
          </li>
        </ul>
      </nav>
    </footer>
  </div>
</template>
