<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">账号设置</h2>
      <p class="page-subtitle">管理您的个人资料、安全设置及系统偏好</p>
    </div>

    <n-grid :x-gap="24" :y-gap="24" responsive="screen" item-responsive>
      <!-- 左侧：个人概览卡片 -->
      <n-grid-item span="24 m:8 l:6">
        <n-card :bordered="false" class="profile-summary-card">
          <div class="profile-header">
            <n-avatar
              :size="100"
              :style="{ backgroundColor: stringToColor(userInfo?.username || 'U') }"
              class="profile-avatar"
            >
              {{ (userInfo?.username || 'U').substring(0, 1).toUpperCase() }}
            </n-avatar>
            <h3 class="profile-name">{{ userInfo?.nickname || userInfo?.username }}</h3>
            <div class="profile-badges">
              <n-tag :type="userInfo?.role === 'ADMIN' ? 'error' : 'primary'" round size="small">
                {{ userInfo?.role === 'ADMIN' ? '管理员' : '普通用户' }}
              </n-tag>
              <n-tag :bordered="false" round size="small" type="default">
                {{ userInfo?.primaryOrgName || '暂无组织' }}
              </n-tag>
            </div>
            <p class="profile-bio">{{ userInfo?.bio || '这个人很懒，什么都没写~' }}</p>
          </div>
          
          <n-divider />
          
          <div class="profile-meta">
            <div class="meta-item">
              <n-icon :component="TimeOutline" />
              <span>注册于 {{ formatDate(userInfo?.createdAt).split(' ')[0] }}</span>
            </div>
            <div class="meta-item">
              <n-icon :component="MailOutline" />
              <span>{{ userInfo?.email || '未绑定邮箱' }}</span>
            </div>
          </div>
        </n-card>
      </n-grid-item>

      <!-- 右侧：设置选项卡 -->
      <n-grid-item span="24 m:16 l:18">
        <n-card :bordered="false" class="settings-tabs-card">
          <n-tabs type="line" animated size="large" justify-content="start">
            
            <!-- Tab 1: 基本资料 -->
            <n-tab-pane name="general" tab="基本资料">
              <template #tab>
                <n-space align="center" :size="4">
                  <n-icon :component="PersonOutline" /> 基本资料
                </n-space>
              </template>
              
              <div class="tab-content">
                <n-form
                  ref="profileFormRef"
                  :model="profileForm"
                  :rules="profileRules"
                  label-placement="top"
                  require-mark-placement="right-hanging"
                >
                  <n-grid :x-gap="24" :cols="2">
                    <n-gi>
                      <n-form-item label="昵称" path="nickname">
                        <n-input v-model:value="profileForm.nickname" placeholder="怎么称呼您？" />
                      </n-form-item>
                    </n-gi>
                    <n-gi>
                      <n-form-item label="手机号" path="phone">
                        <n-input v-model:value="profileForm.phone" placeholder="绑定手机号" />
                      </n-form-item>
                    </n-gi>
                    <n-gi span="2">
                      <n-form-item label="邮箱" path="email">
                        <n-input v-model:value="profileForm.email" placeholder="绑定邮箱地址" />
                      </n-form-item>
                    </n-gi>
                    <n-gi span="2">
                      <n-form-item label="个人简介" path="bio">
                        <n-input
                          v-model:value="profileForm.bio"
                          type="textarea"
                          placeholder="介绍一下自己吧..."
                          :autosize="{ minRows: 3, maxRows: 5 }"
                          show-count
                          maxlength="200"
                        />
                      </n-form-item>
                    </n-gi>
                  </n-grid>
                  
                  <div class="form-actions">
                    <n-button type="primary" @click="handleUpdateProfile" :loading="profileLoading">
                      保存更改
                    </n-button>
                    <n-button quaternary @click="handleResetProfileForm">重置</n-button>
                  </div>
                </n-form>
              </div>
            </n-tab-pane>

            <!-- Tab 2: 安全设置 -->
            <n-tab-pane name="security" tab="安全设置">
              <template #tab>
                <n-space align="center" :size="4">
                  <n-icon :component="LockClosedOutline" /> 安全设置
                </n-space>
              </template>
              
              <div class="tab-content small-width">
                <n-alert type="info" show-icon style="margin-bottom: 24px">
                  为了您的账号安全，建议定期更换密码。
                </n-alert>

                <n-form
                  ref="passwordFormRef"
                  :model="passwordForm"
                  :rules="passwordRules"
                  label-placement="top"
                >
                  <n-form-item label="当前密码" path="oldPassword">
                    <n-input
                      v-model:value="passwordForm.oldPassword"
                      type="password"
                      show-password-on="click"
                      placeholder="验证当前密码"
                    />
                  </n-form-item>
                  <n-form-item label="新密码" path="newPassword">
                    <n-input
                      v-model:value="passwordForm.newPassword"
                      type="password"
                      show-password-on="click"
                      placeholder="6-20位字符"
                    />
                  </n-form-item>
                  <n-form-item label="确认新密码" path="confirmPassword">
                    <n-input
                      v-model:value="passwordForm.confirmPassword"
                      type="password"
                      show-password-on="click"
                      placeholder="再次输入新密码"
                    />
                  </n-form-item>
                  
                  <div class="form-actions">
                    <n-button type="primary" @click="handleChangePassword" :loading="passwordLoading">
                      更新密码
                    </n-button>
                  </div>
                </n-form>
              </div>
            </n-tab-pane>

            <!-- Tab 3: 系统偏好 -->
            <n-tab-pane name="preference" tab="系统偏好">
              <template #tab>
                <n-space align="center" :size="4">
                  <n-icon :component="SettingsOutline" /> 系统偏好
                </n-space>
              </template>
              
              <div class="tab-content">
                <n-list hoverable clickable>
                  <n-list-item>
                    <template #prefix>
                      <n-icon :component="MoonOutline" class="setting-icon" />
                    </template>
                    <div class="setting-item-content">
                      <div class="setting-title">深色模式</div>
                      <div class="setting-desc">开启舒适护眼的深色外观</div>
                    </div>
                    <template #suffix>
                      <n-switch v-model:value="isDarkMode" @update:value="handleThemeChange" />
                    </template>
                  </n-list-item>

                  <n-list-item>
                    <template #prefix>
                      <n-icon :component="NotificationsOutline" class="setting-icon" />
                    </template>
                    <div class="setting-item-content">
                      <div class="setting-title">消息通知</div>
                      <div class="setting-desc">接收系统更新与重要提醒</div>
                    </div>
                    <template #suffix>
                      <n-switch v-model:value="notificationEnabled" @update:value="handleNotificationChange" />
                    </template>
                  </n-list-item>
                </n-list>
              </div>
            </n-tab-pane>

          </n-tabs>
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import {
  NCard, NTabs, NTabPane, NGrid, NGridItem, NGi, NAvatar, NTag, NDivider,
  NForm, NFormItem, NInput, NButton, NSwitch, NList, NListItem, NIcon, NSpace, NAlert,
  useMessage
} from 'naive-ui'
import { 
  PersonOutline, 
  LockClosedOutline, 
  SettingsOutline, 
  TimeOutline, 
  MailOutline,
  MoonOutline,
  NotificationsOutline
} from '@vicons/ionicons5'
import { useAuthStore } from '@/stores/authStore'
import userApi from '@/api/userApi'

const message = useMessage()
const authStore = useAuthStore()

// 用户信息
const userInfo = computed(() => authStore.userInfo)

// 表单引用
const passwordFormRef = ref(null)
const profileFormRef = ref(null)
const passwordLoading = ref(false)
const profileLoading = ref(false)

// 表单数据
const passwordForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })
const profileForm = reactive({
  nickname: userInfo.value?.nickname || '',
  email: userInfo.value?.email || '',
  phone: userInfo.value?.phone || '',
  bio: userInfo.value?.bio || ''
})

// 设置状态
const isDarkMode = ref(localStorage.getItem('theme') === 'dark')
const notificationEnabled = ref(localStorage.getItem('notification') !== 'false')

// 验证规则 (保持原有逻辑，略微精简写法)
const passwordRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度6-20位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: (r, v) => v === passwordForm.newPassword || '两次密码不一致', trigger: ['blur', 'input'] }
  ]
}

const profileRules = {
  email: [{ pattern: /^\S+@\S+\.\S+$/, message: '邮箱格式不正确', trigger: 'blur' }],
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }]
}

// 辅助函数
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
}

const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return '#' + '00000'.substring(0, 6 - c.length) + c;
}

// 业务逻辑
const handleChangePassword = async () => {
  try {
    await passwordFormRef.value?.validate()
    passwordLoading.value = true
    await userApi.updatePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
      confirmPassword: passwordForm.confirmPassword
    })
    message.success('密码修改成功，请重新登录')
    setTimeout(() => { authStore.logout(); window.location.href = '/login' }, 1500)
  } catch (e) {
    if (!e?.errors) message.error(e?.message || '修改失败')
  } finally {
    passwordLoading.value = false
  }
}

const handleUpdateProfile = async () => {
  try {
    await profileFormRef.value?.validate()
    profileLoading.value = true
    const updateData = { ...profileForm }
    await userApi.updateProfile(updateData)
    authStore.setUserInfo({ ...userInfo.value, ...updateData })
    message.success('个人资料已保存')
  } catch (e) {
    if (!e?.errors) message.error(e?.message || '保存失败')
  } finally {
    profileLoading.value = false
  }
}

const handleResetProfileForm = () => {
  Object.assign(profileForm, {
    nickname: userInfo.value?.nickname || '',
    email: userInfo.value?.email || '',
    phone: userInfo.value?.phone || '',
    bio: userInfo.value?.bio || ''
  })
}

const handleThemeChange = (val) => {
  localStorage.setItem('theme', val ? 'dark' : 'light')
  message.info(`已切换至${val ? '深色' : '浅色'}模式`)
}

const handleNotificationChange = (val) => {
  localStorage.setItem('notification', val ? 'true' : 'false')
  message.success('设置已保存')
}

onMounted(() => {
  if (userInfo.value) handleResetProfileForm()
})
</script>

<style scoped>
.page-container {
  padding: 24px;
  height: calc(100vh - 8vh);
  background-color: #f3f4f6;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.page-subtitle {
  color: #6b7280;
  margin: 4px 0 0;
  font-size: 14px;
}

/* 左侧概览卡片 */
.profile-summary-card {
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0 10px;
}

.profile-avatar {
  margin-bottom: 16px;
  font-size: 32px;
  font-weight: 600;
  border: 4px solid #eff6ff;
}

.profile-name {
  margin: 0 0 8px;
  font-size: 20px;
  color: #111827;
}

.profile-badges {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.profile-bio {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
  max-width: 90%;
}

.profile-meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
  padding: 8px 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #4b5563;
  font-size: 14px;
}

/* 右侧 Tabs 卡片 */
.settings-tabs-card {
  border-radius: 12px;
  min-height: 500px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.tab-content {
  padding: 24px 0;
}

.tab-content.small-width {
  max-width: 480px;
}

.form-actions {
  margin-top: 24px;
  display: flex;
  gap: 12px;
}

/* 系统偏好列表项样式 */
.setting-item-content {
  flex: 1;
  padding-left: 8px;
}

.setting-title {
  font-weight: 500;
  color: #1f2937;
  font-size: 15px;
}

.setting-desc {
  font-size: 13px;
  color: #9ca3af;
  margin-top: 2px;
}

.setting-icon {
  font-size: 22px;
  color: #6b7280;
  margin-right: 8px;
}

:deep(.n-list-item) {
  padding: 20px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

:deep(.n-list-item:hover) {
  background-color: #f9fafb;
}
</style>
