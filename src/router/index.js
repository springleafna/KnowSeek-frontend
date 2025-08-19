import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Home from '@/views/Home.vue'
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
      path: '/home',
      name: 'Home',
      component: Home
    },
    {
      path: '/',
      redirect: '/home'
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
