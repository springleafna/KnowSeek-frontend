<template>
  <div class="login-container">
    <div class="left-side">
      <div class="logo-section-left">
        <img src="@/assets/icon/knowseek.png" alt="KnowSeek" class="logo-left" />
      </div>
      <div class="robots-section">
        <img src="@/assets/icon/startup.png" alt="Startup" class="startup-image" />
      </div>
      <div class="bottom-text">
        <h3>知析</h3>
        <p>「检索即生成，问答见真知」</p>
      </div>
    </div>

    <div class="right-side">
      <div class="login-card">
        <!-- Welcome text -->
        <div class="welcome-section">
          <h2>欢迎回来</h2>
          <p>请输入您的账号信息登录系统</p>
        </div>

        <n-form
          ref="formRef"
          :model="model"
          :rules="rules"
          size="large"
          class="login-form"
        >
          <n-form-item path="username" :show-label="false" class="form-group-item">
            <div class="form-group">
              <label>用户名</label>
              <div class="input-wrapper">
                <img src="@/assets/icon/username.png" alt="username" class="input-icon" />
                <n-input
                  v-model:value="model.username"
                  placeholder="请输入用户名"
                  :disabled="loading"
                  :bordered="false"
                  class="custom-input"
                />
              </div>
            </div>
          </n-form-item>

          <n-form-item path="password" :show-label="false" class="form-group-item">
            <div class="form-group">
              <label>密码</label>
              <div class="input-wrapper">
                <img src="@/assets/icon/password.png" alt="password" class="input-icon" />
                <n-input
                  v-model:value="model.password"
                  type="password"
                  placeholder="请输入密码"
                  :disabled="loading"
                  show-password-on="mousedown"
                  :bordered="false"
                  class="custom-input"
                />
              </div>
            </div>
          </n-form-item>

          <div class="form-actions">
            <div class="remember-forgot">
              <n-checkbox>记住我</n-checkbox>
              <a href="#" class="forgot-password">忘记密码?</a>
            </div>

            <n-button
              type="primary"
              block
              size="large"
              :loading="loading"
              @click="handleLogin"
              class="login-button"
            >
              登录
            </n-button>
          </div>
        </n-form>

        <div class="register-section">
          <span>还没有账号？</span>
          <router-link to="/register" class="register-link">
            注册新账号
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import userApi from '@/api/api'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const message = useMessage()
const authStore = useAuthStore()
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
    
    // 先保存token
    authStore.setToken(result.token)
    
    // 然后获取用户信息
    try {
      const userInfo = await userApi.getUserInfo()
      authStore.setUserInfo(userInfo)
    } catch (userInfoError) {
      console.warn('获取用户信息失败:', userInfoError.message)
      // 即使获取用户信息失败，也不影响登录流程
    }
    
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
  min-height: 92vh;
}

.left-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 2rem 2rem 2rem 4rem;
  color: #1f2937;
  position: relative;
  background: linear-gradient(135deg, #FFFFFF 0%, #E8F0FE 100%);
}

.logo-section-left {
  text-align: center;
  padding: 2rem 0;
}

.logo-left {
  height: 60px;
  width: auto;
}

.robots-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.startup-image {
  max-width: 500px;
  max-height: 400px;
  width: auto;
  height: auto;
  object-fit: cover;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.bottom-text {
  text-align: left;
}

.bottom-text h3 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #1f2937;
}

.bottom-text p {
  font-size: 1rem;
  opacity: 0.8;
  margin: 0;
  color: #6b7280;
}

.right-side {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
}

.welcome-section {
  text-align: center;
  margin-bottom: 2rem;
}

.welcome-section h2 {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.welcome-section p {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.login-form {
  margin-bottom: 1.5rem;
}

.form-group-item {
  margin-bottom: 0;
}

.form-group-item :deep(.n-form-item-blank) {
  display: block;
}

.form-group-item :deep(.n-form-item-feedback-wrapper) {
  min-height: 22px;
  padding-top: 4px;
}

.form-group {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  color: #333;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 0 12px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.input-wrapper:focus-within {
  border-color: #4285f4;
  box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.1);
}

.input-icon {
  width: 20px;
  height: 20px;
  margin-right: 12px;
  opacity: 0.6;
}

.custom-input {
  flex: 1;
  background: transparent !important;
}

.custom-input :deep(.n-input__input-el) {
  background: transparent !important;
  border: none !important;
  padding: 12px 0 !important;
  font-size: 0.95rem;
}

.form-actions {
  margin-top: 1.5rem;
}

.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.forgot-password {
  color: #4285f4;
  text-decoration: none;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: #3367d6;
}

/* 覆盖 Naive UI 的默认边框样式 */
.login-button :deep(.n-button__border),
.login-button :deep(.n-button__state-border) {
  border: none !important;
}

.login-button {
  height: 48px;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 8px;
  background: #4285f4 !important;
  border: none !important;
  transition: all 0.3s ease;
}

.login-button:hover {
  background: #3367d6 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3);
}

.login-button:focus {
  background: #4285f4 !important;
  box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
}

.login-button:active {
  background: #2c5bb4 !important;
}

.register-section {
  text-align: center;
  font-size: 0.9rem;
  color: #666;
}

.register-link {
  color: #4285f4;
  text-decoration: none;
  font-weight: 500;
  margin-left: 0.5rem;
  transition: color 0.3s ease;
}

.register-link:hover {
  color: #3367d6;
}

@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }

  .left-side {
    min-height: 200px;
    padding: 2rem;
    text-align: center;
  }

  .startup-image {
    max-width: 250px;
    max-height: 150px;
  }

  .bottom-text h3 {
    font-size: 1.5rem;
  }

  .right-side {
    background: white;
  }

  .login-card {
    padding: 1.5rem;
  }
}
</style>