import { createRouter, createWebHistory } from 'vue-router'
import Landing from '@/views/Landing.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Chat from '@/views/Chat.vue'
import Knowledge from '@/views/Knowledge.vue'
import Organization from '@/views/Organization.vue'
import Users from '@/views/Users.vue'
import File from '@/views/File.vue'
import AppLayout from '@/layouts/AppLayout.vue'
import Setting from '@/views/Setting.vue'
import { useAuthStore } from '@/stores/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Landing',
      component: Landing
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/register',
      name: 'Register',
      component: Register
    },
    {
      path: '/app',
      component: AppLayout,
      children: [
        { path: '', redirect: '/app/chat' },
        { path: 'chat', name: 'Chat', component: Chat },
        { path: 'knowledge', name: 'Knowledge', component: Knowledge },
        { path: 'knowledge/:id', name: 'KnowledgeDetail', component: () => import('@/views/KnowledgeDetail.vue') },
        { path: 'organization', name: 'Organization', component: Organization },
        { path: 'users', name: 'Users', component: Users },
        { path: 'file', name: 'File', component: File },
        { path: 'setting', name: 'Setting', component: Setting },
      ]
    }
  ],
})

// 简单路由守卫：未登录仅允许访问公开页面
router.beforeEach((to, from, next) => {
  const publicPages = ['/', '/login', '/register']
  const isPublic = publicPages.includes(to.path)
  const authStore = useAuthStore()
  const loggedIn = authStore.isAuthenticated

  // 如果已登录且访问首页，重定向到应用
  if (loggedIn && to.path === '/') {
    return next('/app/chat')
  }

  // 如果未登录且访问受保护页面，重定向到登录
  if (!isPublic && !loggedIn) {
    return next('/login')
  }

  next()
})

export default router
