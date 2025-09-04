<script setup>
import userApi, { tokenUtils } from '@/api/api'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'

const router = useRouter()
const message = useMessage()

const handleLogout = async () => {
  try {
    await userApi.logout()
    tokenUtils.removeToken()
    message.success('退出登录成功')
    router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error.message)
    message.error('退出登录失败：' + error.message)
  }
}
</script>

<template>
  <n-layout-header bordered>
    <div class="nav-container">
      <n-text tag="h1" class="logo">KnowSeek</n-text>
      <n-space>
        <router-link to="/login" v-if="!tokenUtils.isLoggedIn()">
          <n-button text>登录</n-button>
        </router-link>
        <router-link to="/register" v-if="!tokenUtils.isLoggedIn()">
          <n-button text>注册</n-button>
        </router-link>
        <n-button @click="handleLogout" v-if="tokenUtils.isLoggedIn()" type="default" ghost>
          退出登录
        </n-button>
      </n-space>
    </div>
  </n-layout-header>
</template>

<style scoped>
.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  height: 64px;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

a {
  text-decoration: none;
}
</style> 