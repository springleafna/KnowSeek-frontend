<template>
  <div class="register-container">
    <n-card class="register-card" :bordered="false">
      <n-h2>注册</n-h2>
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
        <n-form-item label="确认密码" path="confirmPassword">
          <n-input 
            v-model:value="model.confirmPassword" 
            type="password" 
            placeholder="请再次输入密码"
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
            @click="handleRegister"
          >
            注册
          </n-button>
        </n-form-item>
      </n-form>
      <n-text depth="3">
        已有账号？ 
        <router-link to="/login">
          <n-text type="primary">登录</n-text>
        </router-link>
      </n-text>
    </n-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import userApi from '@/api/api'

const router = useRouter()
const message = useMessage()
const loading = ref(false)
const formRef = ref(null)

const model = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

const validatePasswordSame = (rule, value) => {
  return value === model.password
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度必须在6-20位之间', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validatePasswordSame, message: '两次输入的密码不一致', trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true
    
    await userApi.register({ 
      username: model.username, 
      password: model.password 
    })
    
    message.success('注册成功！请登录')
    router.push('/login')
  } catch (error) {
    if (error?.message) {
      console.error('注册失败:', error.message)
      message.error('注册失败：' + error.message)
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 64px);
  padding: 2rem;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.register-card {
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

a {
  text-decoration: none;
}
</style>