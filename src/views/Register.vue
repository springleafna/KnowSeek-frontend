<template>
  <div class="register-container">
    <div class="left-side">
      <div class="register-card">
        <div class="welcome-section">
          <h2>加入知析</h2>
          <p>创建您的账号，开启智能问答之旅</p>
        </div>

        <!-- Registration form -->
        <n-form
          ref="formRef"
          :model="model"
          :rules="rules"
          size="large"
          class="register-form"
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

          <n-form-item path="confirmPassword" :show-label="false" class="form-group-item">
            <div class="form-group">
              <label>确认密码</label>
              <div class="input-wrapper">
                <img src="@/assets/icon/password.png" alt="password" class="input-icon" />
                <n-input
                  v-model:value="model.confirmPassword"
                  type="password"
                  placeholder="请再次输入密码"
                  :disabled="loading"
                  show-password-on="mousedown"
                  :bordered="false"
                  class="custom-input"
                />
              </div>
            </div>
          </n-form-item>

          <div class="form-actions">
            <div class="terms-section">
              <n-checkbox>我已阅读并同意<a href="#" class="terms-link">用户协议</a>和<a href="#" class="terms-link">隐私政策</a></n-checkbox>
            </div>

            <n-button
              type="primary"
              block
              size="large"
              :loading="loading"
              @click="handleRegister"
              class="register-button"
            >
              注册
            </n-button>
          </div>
        </n-form>

        <div class="login-section">
          <span>已有账号？</span>
          <router-link to="/login" class="login-link">
            立即登录
          </router-link>
        </div>
      </div>
    </div>

    <div class="right-side">
      <div class="logo-section-right">
        <img src="@/assets/icon/knowseek.png" alt="KnowSeek" class="logo-right" />
      </div>
      <div class="image-section">
        <img src="@/assets/icon/startup2.png" alt="Startup" class="startup-image" />
      </div>
      <div class="bottom-text">
        <h3>知析</h3>
        <p>「检索即生成，问答见真知」</p>
      </div>
    </div>
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
  min-height: 92vh;
}

.left-side {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.register-card {
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

.register-form {
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

.terms-section {
  margin-bottom: 1.5rem;
  font-size: 0.85rem;
}

.terms-link {
  color: #4285f4;
  text-decoration: none;
  transition: color 0.3s ease;
}

.terms-link:hover {
  color: #3367d6;
}

/* 覆盖 Naive UI 的默认边框样式 */
.register-button :deep(.n-button__border),
.register-button :deep(.n-button__state-border) {
  border: none !important;
}

.register-button {
  height: 48px;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 8px;
  background: #4285f4 !important;
  border: none !important;
  transition: all 0.3s ease;
}

.register-button:hover {
  background: #3367d6 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3);
}

.register-button:focus {
  background: #4285f4 !important;
  box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
}

.register-button:active {
  background: #2c5bb4 !important;
}

.login-section {
  text-align: center;
  font-size: 0.9rem;
  color: #666;
}

.login-link {
  color: #4285f4;
  text-decoration: none;
  font-weight: 500;
  margin-left: 0.5rem;
  transition: color 0.3s ease;
}

.login-link:hover {
  color: #3367d6;
}

.right-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 2rem 2rem 2rem 4rem;
  color: #1f2937;
  position: relative;
  background: linear-gradient(135deg, #FFFFFF 0%, #E8F0FE 100%);
}

.logo-section-right {
  text-align: center;
  padding: 2rem 0;
}

.logo-right {
  height: 60px;
  width: auto;
}

.image-section {
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

@media (max-width: 768px) {
  .register-container {
    flex-direction: column;
  }

  .left-side {
    background: white;
    order: 2;
  }

  .register-card {
    padding: 1.5rem;
  }

  .right-side {
    min-height: 200px;
    padding: 2rem;
    text-align: center;
    order: 1;
  }

  .startup-image {
    max-width: 250px;
    max-height: 150px;
  }

  .bottom-text h3 {
    font-size: 1.5rem;
  }
}
</style>