<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'
import { bzr } from '@/bazaar'
import { storeToRefs } from 'pinia'
import HeadingOne from './HeadingOne.vue'
import SmallContainer from './SmallContainer.vue'
import ManageWorkspaces from './ManageWorkspaces.vue'
import BazaarLogoIcon from './BazaarLogoIcon.vue'

const koreroStore = useKoreroStore()
const { orgs, lostOrg, config, user } = storeToRefs(koreroStore)

// Creating an org and accepting an invite happen in Bazaar
function openOrgModal() {
  bzr.orgs.openPopup(null, () => koreroStore.refresh())
}
</script>

<template>
  <div class="overflow-y-auto px-4 py-12">
    <SmallContainer>
      <div class="text-center pb-8">
        <HeadingOne class="text-3xl">
          {{ orgs.length ? 'Choose an organization' : 'Welcome to Korero' }}
        </HeadingOne>
        <p class="opacity-70 pt-2">
          Korero runs in a Bazaar organization on a Team or Business plan.
        </p>
        <p v-if="lostOrg" role="status" class="mt-4 p-3 rounded-box bg-base-200 text-sm">
          {{
            config?.currentTeam === user.id
              ? 'Personal workspaces are gone. Pick an organization to continue.'
              : 'You are no longer a member of the organization you used last.'
          }}
        </p>
      </div>

      <div
        v-if="orgs.length === 0"
        class="p-6 rounded-box border border-base-300 bg-base-100 text-center"
      >
        <p class="text-lg font-semibold mb-1">You're not in an organization yet</p>
        <p class="pb-4">Create one for your team, or ask a teammate to invite you.</p>
        <button @click="openOrgModal" class="btn btn-accent">
          <BazaarLogoIcon width="16px" /> Create organization
        </button>
        <p class="pt-4 text-sm opacity-70">
          Invited?
          <button @click="openOrgModal" class="link">Accept the invite in Bazaar</button>
        </p>
      </div>
      <ManageWorkspaces v-else />
    </SmallContainer>
  </div>
</template>
