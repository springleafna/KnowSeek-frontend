<script setup>
import userApi, { tokenUtils } from '@/api/api'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const router = useRouter()
const showMessage = ref(false)
const messageType = ref('success')
const messageContent = ref('')

const showMessageTip = (content, type = 'success', duration = 3000) => {
  messageContent.value = content
  messageType.value = type
  showMessage.value = true
  setTimeout(() => {
    showMessage.value = false
  }, duration)
}

const handleLogout = async () => {
  try {
    await userApi.logout()
    tokenUtils.removeToken()
    showMessageTip('退出登录成功')
    router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error.message)
    showMessageTip('退出登录失败：' + error.message, 'error')
  }
}
</script>

<template>
  <nav class="navbar">
    <div class="nav-container">
      <h1>KnowSeek</h1>
      <div class="nav-links">
        <router-link to="/login" v-if="!tokenUtils.isLoggedIn()">登录</router-link>
        <router-link to="/register" v-if="!tokenUtils.isLoggedIn()">注册</router-link>
        <button @click="handleLogout" v-if="tokenUtils.isLoggedIn()" class="logout-btn">退出登录</button>
      </div>
    </div>

    <div class="message-container" v-if="showMessage">
      <div class="message" :class="messageType">{{ messageContent }}</div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background-color: #1a73e8;
  padding: 1rem 2rem;
  color: white;
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  margin: 0;
  font-size: 1.5rem;
}

.nav-links {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.nav-links a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.nav-links a:hover {
  background-color: rgba(255, 255, 255, 0.12);
}

.logout-btn {
  background-color: transparent;
  color: white;
  border: 1px solid white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.12);
}

.message-container {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.message {
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  margin-bottom: 10px;
  animation: fadeIn 0.3s;
  background: #fff;
}

.message.success {
  background-color: #f0f9eb;
  color: #22c55e;
  border: 1px solid #e1f3d8;
}

.message.error {
  background-color: #fef0f0;
  color: #ef4444;
  border: 1px solid #fde2e2;
}

.message.warning {
  background-color: #fdf6ec;
  color: #e6a23c;
  border: 1px solid #faecd8;
}

.message.info {
  background-color: #f4f4f5;
  color: #909399;
  border: 1px solid #e9e9eb;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style> 