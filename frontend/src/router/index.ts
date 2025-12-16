import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('@/pages/TestPage.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/LoginPage.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/pages/RegisterPage.vue')
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/pages/WorkingDashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/note/:id?',
      name: 'note-editor',
      component: () => import('@/pages/NoteEditorPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/pages/SettingsPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/calendar',
      name: 'yearly-calendar',
      component: () => import('@/pages/YearlyCalendarPage.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// 路由守卫 - 检查用户是否已登录
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if ((to.name === 'login' || to.name === 'register') && authStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router