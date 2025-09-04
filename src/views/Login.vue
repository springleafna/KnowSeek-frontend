<template>
  <div class="login-container">
    <n-card class="login-card" :bordered="false">
      <n-h2>登录</n-h2>
      <n-form 
        ref="formRef" 
        :model="model" 
        :rules="rules" 
        size="large"
      >
        <n-form-item label="用户名" path="username">
          <n-input 
            v-model:value="model.username" 
            placeholder="请输入用户名"
            :disabled="loading"
          />
        </n-form-item>
        <n-form-item label="密码" path="password">
          <n-input 
            v-model:value="model.password" 
            type="password" 
            placeholder="请输入密码"
            :disabled="loading"
            show-password-on="mousedown"
          />
        </n-form-item>
        <n-form-item>
          <n-button 
            type="primary" 
            block 
            size="large"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </n-button>
        </n-form-item>
      </n-form>
      <n-text depth="3">
        还没有账号？ 
        <router-link to="/register">
          <n-text type="primary">注册</n-text>
        </router-link>
      </n-text>
    </n-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import userApi, { tokenUtils } from '@/api/api'

const router = useRouter()
const message = useMessage()
const loading = ref(false)
const formRef = ref(null)

const model = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true
    
    const result = await userApi.login({ 
      username: model.username, 
      password: model.password 
    })
    
    tokenUtils.setToken(result.token)
    message.success('登录成功！')
    router.push('/')
  } catch (error) {
    if (error?.message) {
      console.error('登录失败:', error.message)
      message.error('登录失败：' + error.message)
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 64px);
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

a {
  text-decoration: none;
}
</style>