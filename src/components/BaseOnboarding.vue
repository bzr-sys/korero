<script setup lang="ts">
import { useKoreroStore } from '@/stores/korero'
import HeadingOne from './HeadingOne.vue'
import BazaarLogoIcon from './BazaarLogoIcon.vue'
import { ref, watch } from 'vue'
import { bzr } from '@/bazaar'
import { useRoute, useRouter, type RouteLocationNormalizedLoadedGeneric } from 'vue-router'
import AlertSVG from './AlertSVG.vue'
import { storeToRefs } from 'pinia'

const route = useRoute()
const router = useRouter()

const koreroStore = useKoreroStore()
const { hasCompletedOnboarding, activeOrgs, user } = storeToRefs(koreroStore)

const START = 'start'
const CREATE_ORG = 'create-org'
const JOIN_ORG = 'join-org'
const USE_ORG = 'use-org'

const currentStep = ref(START)
const noActiveOrgAfterModalClose = ref(false)

function setStepFromRoute(route: RouteLocationNormalizedLoadedGeneric): void {
  if (!route.query.step) return
  currentStep.value = route.query.step as string
  resetNotices()
}

function resetNotices(): void {
  noActiveOrgAfterModalClose.value = false
}

// Set step on page load
setStepFromRoute(route)

// Set step interaction
watch(route, setStepFromRoute)

function openOrgModal() {
  // @ts-ignore
  bzr.orgs.openModal(null, async () => {
    resetNotices()
    await koreroStore.setOrgs()
    if (activeOrgs.value.length > 0) {
      router.push({ name: 'home', query: { step: USE_ORG } })
    } else {
      noActiveOrgAfterModalClose.value = true
    }
  })
}

function handleJustForMe(): void {
  koreroStore.setTeam(user.value.id)
}

function handleUseOrg(orgPrimaryTeamId: string): void {
  koreroStore.setTeam(orgPrimaryTeamId)
}
</script>

<template>
  <div class="overflow-y-auto">
    <div v-if="!hasCompletedOnboarding" class="text-center py-12 px-4 w-[300px] mx-auto">
      <HeadingOne>Welcome!</HeadingOne>

      <Transition name="slide-fade" mode="out-in">
        <!-- Steps -->

        <!-- START -->
        <div v-if="currentStep === START" class="flex flex-col gap-4">
          <div class="text-lg pt-1 pb-6 opacity-70">How will you use Korero?</div>

          <div v-if="activeOrgs.length > 0">
            <RouterLink
              :to="{ name: 'home', query: { step: USE_ORG } }"
              class="btn btn-lg btn-block"
              >Select an organization</RouterLink
            >
          </div>
          <template v-else>
            <div>
              <RouterLink
                :to="{ name: 'home', query: { step: CREATE_ORG } }"
                class="btn btn-lg btn-block"
                >Create an organization</RouterLink
              >
            </div>
            <div>
              <RouterLink
                :to="{ name: 'home', query: { step: JOIN_ORG } }"
                class="btn btn-lg btn-block"
                >Join an organization</RouterLink
              >
            </div>
          </template>

          <div>
            <button @click="handleJustForMe" class="btn btn-md btn-block btn-ghost">
              Just for me
            </button>
          </div>
        </div>

        <!-- CREATE_ORG -->
        <div v-else-if="currentStep === CREATE_ORG" class="flex flex-col gap-4">
          <div class="text-lg pt-1 pb-6 opacity-70">Create a Bazaar organization</div>
          <button @click="openOrgModal" class="btn btn-lg">
            <BazaarLogoIcon width="20px" /> Manage Organizations
          </button>
          <div role="alert" class="alert alert-warning" v-if="noActiveOrgAfterModalClose">
            <AlertSVG />
            <span>Make sure you have at least one organization with an active subscription</span>
          </div>
          <ol class="list-decimal text-left marker:font-bold pl-8">
            <li>Open the Manage Organizations modal</li>
            <li>Click "Create Organization"</li>
            <li>Create an organization</li>
            <li>Click "Activate"</li>
            <li>Choose a plan and subscribe</li>
            <li>
              Close the modal, then
              <button @click="currentStep = USE_ORG" class="link underline text-primary">
                select your organization &rarr;
              </button>
            </li>
          </ol>
        </div>

        <!-- JOIN_ORG -->
        <div v-else-if="currentStep === JOIN_ORG" class="flex flex-col gap-4">
          <div class="text-lg pt-1 pb-6 opacity-70">Search for an organization to join</div>
          <button @click="openOrgModal" class="btn btn-lg">
            <BazaarLogoIcon width="20px" /> Manage Organizations
          </button>
          <ol class="list-decimal text-left marker:font-bold text-sm pl-4 flex flex-col gap-1 pt-2">
            <li>Open the Manage Organizations modal</li>
            <li>Search for an organization</li>
            <li>Select the found organization</li>
            <li>Click "Request Membership"</li>
            <li>Close the modal</li>
            <li>
              When your request is accepted,
              <button @click="currentStep = USE_ORG" class="link underline text-primary">
                select your organization &rarr;
              </button>
            </li>
          </ol>
        </div>

        <!-- USE_ORG -->
        <div v-else-if="currentStep === USE_ORG">
          <div class="text-lg pt-1 pb-6 opacity-70">Select an organization</div>

          <ul class="flex flex-col gap-2">
            <li v-for="org in activeOrgs" :key="org.id">
              <button @click="handleUseOrg(org.primaryTeam.id)" class="btn btn-md btn-block">
                <div class="truncate h-[15px]">{{ org.name }}</div>
              </button>
            </li>
          </ul>
        </div>
      </Transition>
      <div class="mt-8">
        <RouterLink
          v-if="!currentStep || currentStep !== START"
          :to="{ name: 'home', query: { step: START } }"
          class="btn btn-link"
          >Back to start</RouterLink
        >
      </div>
    </div>
  </div>
</template>

<style scoped>
/*
  Enter and leave animations can use different
  durations and timing functions.
*/
.slide-fade-enter-active {
  transition: all 0.1s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.1s ease-out;
}

.slide-fade-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}
</style>
