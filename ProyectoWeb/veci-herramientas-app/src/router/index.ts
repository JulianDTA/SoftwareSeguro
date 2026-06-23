import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Importar todas las vistas
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import ToolsView from '../views/ToolsView.vue'
import MyLoansView from '../views/MyLoansView.vue'
import UserProfileView from '../views/UserProfileView.vue'
import AdminView from '../views/AdminView.vue'
import NotificationsView from '../views/NotificationsView.vue'
import ChatView from '../views/ChatView.vue'
import UnavailableToolsView from '../views/UnavailableToolsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard', 
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guest: true }, 
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/tools',
      name: 'tools',
      component: ToolsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/my-loans',
      name: 'my-loans',
      component: MyLoansView,
      meta: { requiresAuth: true },
    },
    {
      path: '/user/:id',
      name: 'user-profile',
      component: UserProfileView,
      meta: { requiresAuth: true },
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      meta: { requiresAuth: true },
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: NotificationsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
    {
      path: '/chat',
      name: 'chat',
      component: ChatView,
      meta: { requiresAuth: true },
    },
    {
      path: '/unavailable',
      name: 'unavailable',
      component: UnavailableToolsView,
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to, _from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    await auth.login()
    return
  }

  if (to.meta.guest && auth.isAuthenticated) {
    return next({ name: 'dashboard' })
  }

  next()
})

export default router