<script setup lang="ts">
import { ref } from 'vue'

// Bazaar's org plans (monthly, tax included), as on bzr.dev/pricing.
// One value per size: Small, Medium, Large.
const sizes = ['Small', 'Medium', 'Large']
const plans = [
  {
    name: 'Team',
    who: 'Small teams and clubs, one shared space',
    prices: ['$10', '$18', '$32'],
    per: '/month, flat',
    specs: [
      { label: 'Shared database', values: ['2 GB', '4 GB', '8 GB'] },
      { label: 'Shared files', values: ['8 GB', '16 GB', '32 GB'] },
      { label: 'API calls / month', values: ['1.5M', '2M', '3M'] }
    ],
    memberSpecs: [],
    extras: ['Same price for any number of members', 'Email support']
  },
  {
    name: 'Business',
    who: 'Members get their own space too',
    prices: ['$25', '$45', '$80'],
    per: '/member/month',
    specs: [
      {
        label: 'Shared database',
        values: ['4 GB per member', '8 GB per member', '16 GB per member']
      },
      {
        label: 'Shared files',
        values: ['16 GB per member', '32 GB per member', '64 GB per member']
      }
    ],
    memberSpecs: [
      { label: 'Database', values: ['1 GB', '2 GB', '4 GB'] },
      { label: 'Files', values: ['4 GB', '8 GB', '16 GB'] },
      { label: 'API calls / month', values: ['2M', '3M', '5M'] }
    ],
    extras: ['Everything in Team', '30-day audit log']
  }
]
const size = ref(plans.map(() => 0))
</script>

<template>
  <div class="grid gap-5 md:grid-cols-2">
    <div
      v-for="(plan, p) in plans"
      :key="plan.name"
      class="flex flex-col gap-5 p-5 sm:p-7 rounded-box border border-base-300 bg-base-100"
    >
      <div>
        <h3 class="text-xl font-semibold">{{ plan.name }}</h3>
        <p class="text-sm opacity-70">{{ plan.who }}</p>
      </div>
      <p class="flex items-baseline gap-1.5">
        <span class="text-4xl font-semibold tracking-tight">{{ plan.prices[size[p]] }}</span>
        <span class="text-sm opacity-70">{{ plan.per }}</span>
      </p>
      <div class="join w-full" role="group" :aria-label="`${plan.name} size`">
        <button
          v-for="(label, i) in sizes"
          :key="label"
          type="button"
          class="join-item btn btn-sm flex-1"
          :class="size[p] === i ? 'btn-neutral' : 'btn-ghost border-base-300'"
          :aria-pressed="size[p] === i"
          @click="size[p] = i"
        >
          {{ label }}
        </button>
      </div>
      <dl class="flex flex-col gap-2 text-sm">
        <div v-for="s in plan.specs" :key="s.label" class="flex justify-between gap-4">
          <dt class="opacity-70">{{ s.label }}</dt>
          <dd class="font-medium text-right">{{ s.values[size[p]] }}</dd>
        </div>
      </dl>
      <div v-if="plan.memberSpecs.length" class="flex flex-col gap-2 text-sm">
        <span class="text-xs font-semibold uppercase tracking-wider opacity-60"
          >Each member also gets</span
        >
        <dl class="flex flex-col gap-2">
          <div v-for="s in plan.memberSpecs" :key="s.label" class="flex justify-between gap-4">
            <dt class="opacity-70">{{ s.label }}</dt>
            <dd class="font-medium text-right">{{ s.values[size[p]] }}</dd>
          </div>
        </dl>
      </div>
      <ul class="flex flex-col gap-1.5 text-sm border-t border-base-300 pt-4 mt-auto">
        <li v-for="e in plan.extras" :key="e" class="flex gap-2">
          <span class="text-accent" aria-hidden="true">✓</span>{{ e }}
        </li>
      </ul>
    </div>
  </div>
</template>
