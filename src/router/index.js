import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Home from '@/views/Home.vue'
import Chat from '@/views/Chat.vue'
import Knowledge from '@/views/Knowledge.vue'
import Organization from '@/views/Organization.vue'
import Users from '@/views/Users.vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { tokenUtils } from '@/api/api'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
      path: '/',
      component: AppLayout,
      children: [
        { path: '', redirect: '/chat' },
        { path: 'home', name: 'Home', component: Home },
        { path: 'chat', name: 'Chat', component: Chat },
        { path: 'knowledge', name: 'Knowledge', component: Knowledge },
        { path: 'organization', name: 'Organization', component: Organization },
        { path: 'users', name: 'Users', component: Users },
      ]
    }
  ],
})

// 简单路由守卫：未登录仅允许访问登录/注册
router.beforeEach((to, from, next) => {
  const publicPages = ['/login', '/register']
  const isPublic = publicPages.includes(to.path)
  const loggedIn = tokenUtils.isLoggedIn()

  if (!isPublic && !loggedIn) {
    return next('/login')
  }
  next()
})

export default router
