import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SettingsView from '../views/SettingsView.vue'
import NewChannelView from '../views/NewChannelView.vue'
import ChannelView from '../views/ChannelView.vue'
import NewConversationView from '../views/NewConversationView.vue'
import ConversationView from '../views/ConversationView.vue'
import { bzr } from '@/bazaar'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: false }
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView
    },
    {
      path: '/channel/new',
      name: 'newChannel',
      component: NewChannelView
    },
    {
      path: '/channel/:id',
      name: 'channel',
      component: ChannelView
    },
    {
      path: '/channel/:id/new',
      name: 'newConversation',
      component: NewConversationView
    },
    {
      path: '/conversation/:id',
      name: 'conversation',
      component: ConversationView
    }
  ]
})

router.beforeEach((to, from, next) => {
  // If route requires auth
  if (to.matched.some((record) => record.meta.requiresAuth !== false)) {
    if (!bzr.isLoggedIn()) {
      // Redirect to the sign in view if no token found and route requires auth
      next({ name: 'home' })
      return
    }
  }

  next()
})

export default router
