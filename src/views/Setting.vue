<template>
  <div class="page">
    <h2>个人设置</h2>

    <div class="setting-container">
      <!-- 个人信息卡片 -->
      <n-card title="个人信息" class="setting-card">
        <n-descriptions :column="2" bordered>
          <n-descriptions-item label="用户名">
            {{ userInfo?.username || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="角色">
            <n-tag :type="userInfo?.role === 'ADMIN' ? 'error' : 'info'">
              {{ userInfo?.role === 'ADMIN' ? '管理员' : '普通用户' }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="所属组织">
            {{ userInfo?.primaryOrgName || '未加入组织' }}
          </n-descriptions-item>
          <n-descriptions-item label="注册时间">
            {{ formatDate(userInfo?.createdAt) }}
          </n-descriptions-item>
        </n-descriptions>
      </n-card>

      <!-- 修改密码卡片 -->
      <n-card title="修改密码" class="setting-card">
        <n-form
          ref="passwordFormRef"
          :model="passwordForm"
          :rules="passwordRules"
          label-placement="left"
          label-width="100"
          require-mark-placement="right-hanging"
        >
          <n-form-item label="原密码" path="oldPassword">
            <n-input
              v-model:value="passwordForm.oldPassword"
              type="password"
              placeholder="请输入原密码"
              show-password-on="click"
              @keydown.enter="handleChangePassword"
            />
          </n-form-item>
          <n-form-item label="新密码" path="newPassword">
            <n-input
              v-model:value="passwordForm.newPassword"
              type="password"
              placeholder="请输入新密码（6-20位）"
              show-password-on="click"
              @keydown.enter="handleChangePassword"
            />
          </n-form-item>
          <n-form-item label="确认密码" path="confirmPassword">
            <n-input
              v-model:value="passwordForm.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              show-password-on="click"
              @keydown.enter="handleChangePassword"
            />
          </n-form-item>
          <n-form-item :show-label="false">
            <div class="form-actions">
              <n-button type="primary" @click="handleChangePassword" :loading="passwordLoading">
                修改密码
              </n-button>
              <n-button @click="handleResetPasswordForm">
                重置
              </n-button>
            </div>
          </n-form-item>
        </n-form>
      </n-card>

      <!-- 个人资料卡片 -->
      <n-card title="个人资料" class="setting-card">
        <n-form
          ref="profileFormRef"
          :model="profileForm"
          :rules="profileRules"
          label-placement="left"
          label-width="100"
          require-mark-placement="right-hanging"
        >
          <n-form-item label="昵称" path="nickname">
            <n-input
              v-model:value="profileForm.nickname"
              placeholder="请输入昵称"
              maxlength="20"
              show-count
            />
          </n-form-item>
          <n-form-item label="邮箱" path="email">
            <n-input
              v-model:value="profileForm.email"
              placeholder="请输入邮箱地址"
            />
          </n-form-item>
          <n-form-item label="手机号" path="phone">
            <n-input
              v-model:value="profileForm.phone"
              placeholder="请输入手机号"
              maxlength="11"
            />
          </n-form-item>
          <n-form-item label="个人简介" path="bio">
            <n-input
              v-model:value="profileForm.bio"
              type="textarea"
              placeholder="介绍一下自己吧"
              :autosize="{ minRows: 3, maxRows: 6 }"
              maxlength="200"
              show-count
            />
          </n-form-item>
          <n-form-item :show-label="false">
            <div class="form-actions">
              <n-button type="primary" @click="handleUpdateProfile" :loading="profileLoading">
                保存资料
              </n-button>
              <n-button @click="handleResetProfileForm">
                重置
              </n-button>
            </div>
          </n-form-item>
        </n-form>
      </n-card>

      <!-- 系统偏好设置卡片 -->
      <n-card title="系统偏好" class="setting-card">
        <n-form label-placement="left" label-width="100">
          <n-form-item label="主题模式">
            <n-switch
              v-model:value="isDarkMode"
              @update:value="handleThemeChange"
            >
              <template #checked>
                深色
              </template>
              <template #unchecked>
                浅色
              </template>
            </n-switch>
          </n-form-item>
          <n-form-item label="消息通知">
            <n-switch
              v-model:value="notificationEnabled"
              @update:value="handleNotificationChange"
            >
              <template #checked>
                开启
              </template>
              <template #unchecked>
                关闭
              </template>
            </n-switch>
          </n-form-item>
        </n-form>
      </n-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import {
  NCard,
  NDescriptions,
  NDescriptionsItem,
  NTag,
  NForm,
  NFormItem,
  NInput,
  NButton,
  NSwitch,
  useMessage
} from 'naive-ui'
import { useAuthStore } from '@/stores/authStore'
import userApi from '@/api/userApi'

const message = useMessage()
const authStore = useAuthStore()

// 用户信息
const userInfo = computed(() => authStore.userInfo)

// 表单引用
const passwordFormRef = ref(null)
const profileFormRef = ref(null)

// 加载状态
const passwordLoading = ref(false)
const profileLoading = ref(false)

// 修改密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 个人资料表单
const profileForm = reactive({
  nickname: userInfo.value?.nickname || '',
  email: userInfo.value?.email || '',
  phone: userInfo.value?.phone || '',
  bio: userInfo.value?.bio || ''
})

// 系统偏好设置
const isDarkMode = ref(localStorage.getItem('theme') === 'dark')
const notificationEnabled = ref(localStorage.getItem('notification') !== 'false')

// 密码验证规则
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应为6-20位', trigger: 'blur' },
    {
      validator: (rule, value) => {
        if (value === passwordForm.oldPassword) {
          return new Error('新密码不能与原密码相同')
        }
        return true
      },
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value) => {
        if (value !== passwordForm.newPassword) {
          return new Error('两次输入的密码不一致')
        }
        return true
      },
      trigger: ['blur', 'input']
    }
  ]
}

// 个人资料验证规则
const profileRules = {
  nickname: [
    { max: 20, message: '昵称不能超过20个字符', trigger: 'blur' }
  ],
  email: [
    {
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: '请输入有效的邮箱地址',
      trigger: 'blur'
    }
  ],
  phone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入有效的手机号',
      trigger: 'blur'
    }
  ],
  bio: [
    { max: 200, message: '个人简介不能超过200个字符', trigger: 'blur' }
  ]
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const hh = String(date.getHours()).padStart(2, '0')
    const mm = String(date.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${d} ${hh}:${mm}`
  } catch {
    return dateStr
  }
}

// 修改密码
const handleChangePassword = async () => {
  try {
    await passwordFormRef.value?.validate()
    passwordLoading.value = true

    await userApi.changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })

    message.success('密码修改成功，请重新登录')

    // 重置表单
    handleResetPasswordForm()

    // 延迟后退出登录
    setTimeout(() => {
      authStore.logout()
      window.location.href = '/login'
    }, 1500)
  } catch (error) {
    if (error?.errors) {
      // 表单验证错误，不显示消息
      return
    }
    console.error('修改密码失败:', error)
    message.error(error?.message || '修改密码失败')
  } finally {
    passwordLoading.value = false
  }
}

// 重置密码表单
const handleResetPasswordForm = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordFormRef.value?.restoreValidation()
}

// 更新个人资料
const handleUpdateProfile = async () => {
  try {
    await profileFormRef.value?.validate()
    profileLoading.value = true

    const updateData = {
      nickname: profileForm.nickname,
      email: profileForm.email,
      phone: profileForm.phone,
      bio: profileForm.bio
    }

    await userApi.updateProfile(updateData)

    // 更新本地用户信息
    const updatedUserInfo = { ...userInfo.value, ...updateData }
    authStore.setUserInfo(updatedUserInfo)

    message.success('个人资料更新成功')
  } catch (error) {
    if (error?.errors) {
      // 表单验证错误，不显示消息
      return
    }
    console.error('更新资料失败:', error)
    message.error(error?.message || '更新资料失败')
  } finally {
    profileLoading.value = false
  }
}

// 重置个人资料表单
const handleResetProfileForm = () => {
  profileForm.nickname = userInfo.value?.nickname || ''
  profileForm.email = userInfo.value?.email || ''
  profileForm.phone = userInfo.value?.phone || ''
  profileForm.bio = userInfo.value?.bio || ''
  profileFormRef.value?.restoreValidation()
}

// 主题切换
const handleThemeChange = (value) => {
  isDarkMode.value = value
  localStorage.setItem('theme', value ? 'dark' : 'light')
  message.info(`已切换至${value ? '深色' : '浅色'}模式`)
  // 这里可以添加实际的主题切换逻辑
}

// 通知设置
const handleNotificationChange = (value) => {
  notificationEnabled.value = value
  localStorage.setItem('notification', value ? 'true' : 'false')
  message.info(`消息通知已${value ? '开启' : '关闭'}`)
}

// 初始化用户资料表单
onMounted(() => {
  if (userInfo.value) {
    profileForm.nickname = userInfo.value.nickname || ''
    profileForm.email = userInfo.value.email || ''
    profileForm.phone = userInfo.value.phone || ''
    profileForm.bio = userInfo.value.bio || ''
  }
})
</script>

<style scoped>
.page {
  height: calc(100vh - 8vh);
  padding: 20px;
  overflow-y: auto;
}

.page h2 {
  margin-bottom: 24px;
}

.setting-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.setting-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.form-actions {
  display: flex;
  gap: 12px;
}

/* 优化表单布局 */
:deep(.n-form-item) {
  margin-bottom: 20px;
}

:deep(.n-form-item:last-child) {
  margin-bottom: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .setting-container {
    max-width: 100%;
  }

  :deep(.n-descriptions) {
    --n-item-label-width: 80px !important;
  }

  :deep(.n-form-item .n-form-item-label) {
    width: 80px !important;
  }
}
</style>
