<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useKoreroStore } from '@/stores/korero'
import { bzr } from '@/bazaar'
import ManageWorkspaces from './ManageWorkspaces.vue'
import SmallContainer from './SmallContainer.vue'
import BazaarLogoIcon from './BazaarLogoIcon.vue'

const koreroStore = useKoreroStore()
const { currentOrg, orgs } = storeToRefs(koreroStore)

const owners = computed(() =>
  (currentOrg.value?.admins ?? []).map((id) => koreroStore.getUser(id).name).filter(Boolean)
)

// The SDK opens the org list, where owners find "Get Subscription"
function subscribe() {
  bzr.orgs.openPopup(null, () => koreroStore.refresh())
}

const checking = ref(false)
async function checkAgain() {
  checking.value = true
  await koreroStore.refresh()
  checking.value = false
}
</script>

<template>
  <div v-if="currentOrg" class="overflow-y-auto px-4 py-12">
    <SmallContainer>
      <div class="p-6 mb-12 rounded-box border border-base-300 bg-base-100 text-center">
        <p class="text-lg font-semibold mb-1">{{ currentOrg.name }} has no Korero plan</p>
        <p class="pb-4">Korero runs on the organization's Bazaar Team or Business plan.</p>
        <template v-if="koreroStore.isOrgAdmin(currentOrg)">
          <button class="btn btn-accent" @click="subscribe">
            <BazaarLogoIcon width="16px" /> Subscribe in Bazaar
          </button>
          <p class="pt-2 text-sm opacity-70">
            Choose "Get Subscription" next to {{ currentOrg.name }}.
          </p>
        </template>
        <p v-else class="pb-2">
          Ask an owner to subscribe{{ owners.length ? `: ${owners.join(', ')}` : '' }}.
        </p>
        <button class="btn btn-ghost mt-2" :disabled="checking" @click="checkAgain">
          Check again
        </button>
      </div>
      <!-- To switch -->
      <ManageWorkspaces v-if="orgs.length > 1" />
    </SmallContainer>
  </div>
</template>
