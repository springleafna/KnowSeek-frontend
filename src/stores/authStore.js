import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))
  
  const isAuthenticated = computed(() => !!token.value)
  
  /* 设置token */
  const setToken = (newToken) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
  }
  
  /* 设置用户信息 */
  const setUserInfo = (info) => {
    userInfo.value = info
    if (info) {
      localStorage.setItem('userInfo', JSON.stringify(info))
    } else {
      localStorage.removeItem('userInfo')
    }
  }
  
  /* 登录并保存认证信息 */
  const login = (tokenData, user) => {
    setToken(tokenData)
    setUserInfo(user)
  }
  
  /* 登出并清空所有认证数据 */
  const logout = () => {
    setToken('')
    setUserInfo(null)
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }
  
  /* 获取token */
  const getToken = () => token.value
  
  return {
    token: computed(() => token.value),
    userInfo: computed(() => userInfo.value),
    isAuthenticated,
    setToken,
    setUserInfo,
    login,
    logout,
    getToken
  }
})