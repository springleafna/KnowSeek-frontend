<script setup>
import userApi, { tokenUtils } from '@/api/api'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { ref, onMounted } from 'vue'

const router = useRouter()
const message = useMessage()

const user = ref(null)

const fetchUserInfo = async () => {
  if (!tokenUtils.isLoggedIn()) {
    user.value = null
    return
  }
  try {
    const res = await userApi.getUserInfo()
    // 后端返回结构兼容：可能是 { data: { ... } } 或直接是 { ... }
    user.value = res?.data?.data ?? res?.data ?? res ?? null
  } catch (error) {
    console.error('获取用户信息失败:', error.message)
  }
}

onMounted(() => {
  fetchUserInfo()
})

const handleLogout = async () => {
  try {
    await userApi.logout()
    tokenUtils.removeToken()
    user.value = null
    message.success('退出登录成功')
    router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error.message)
    message.error('退出登录失败：' + error.message)
  }
}

const dropdownOptions = [
  { label: '退出登录', key: 'logout' }
]

const handleSelect = (key) => {
  if (key === 'logout') {
    handleLogout()
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
        <!-- 登录后显示头像 + 用户名 + 下拉菜单 -->
        <n-dropdown
          v-if="tokenUtils.isLoggedIn()"
          :options="dropdownOptions"
          trigger="hover"
          @select="handleSelect"
        >
          <div class="user-entry">
            <n-avatar
              round
              size="small"
              :src="user?.avatar || user?.avatarUrl"
            >
              {{ (user?.username?.[0] || user?.name?.[0] || 'U').toUpperCase() }}
            </n-avatar>
            <span class="username">{{ user?.username || user?.name || '用户' }}</span>
          </div>
        </n-dropdown>
      </n-space>
    </div>
  </n-layout-header>
</template>

<style scoped>
.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
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

.user-entry {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.username {
  font-size: 14px;
  color: #333;
}
</style> 