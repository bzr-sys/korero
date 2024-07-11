import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ChannelView from '../views/ChannelView.vue'
import NewConversationView from '../views/NewConversationView.vue'
import ConversationView from '../views/ConversationView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
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

export default router
