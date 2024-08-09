import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SettingsView from '../views/SettingsView.vue'
import NewChannelView from '../views/NewChannelView.vue'
import ChannelView from '../views/ChannelView.vue'
import ChannelViewHome from '../views/ChannelViewHome.vue'
import NewConversationChooseView from '../views/NewConversationChooseView.vue'
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
      path: '/channel/:channelId',
      component: ChannelView,
      children: [
        {
          path: '',
          name: 'channel',
          component: ChannelViewHome,
          meta: { group: 'channelParent' }
        },
        {
          path: 'type/:conversationType',
          name: 'channelByType',
          component: ChannelViewHome,
          meta: { group: 'channelParent' }
        },
        {
          path: 'new/choose',
          name: 'newConversationChoose',
          component: NewConversationChooseView,
          meta: { group: 'channelChild' }
        },
        {
          path: 'new',
          name: 'newConversation',
          component: NewConversationView,
          meta: { group: 'channelChild' }
        }
      ]
    },
    {
      path: '/conversation/:conversationId',
      name: 'conversation',
      component: ConversationView,
      meta: { group: 'channelChild' }
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
