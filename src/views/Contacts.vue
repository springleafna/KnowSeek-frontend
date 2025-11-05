<template>
  <div class="contacts-container">
    <!-- 左侧联系人列表 -->
    <div class="contacts-sidebar">
      <div class="sidebar-header">
        <h3>通讯录</h3>
        <button class="add-contact-btn" @click="handleAddContact" title="添加联系人">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
        </button>
      </div>

      <div class="search-box">
        <input
          type="text"
          placeholder="搜索联系人"
          v-model="searchQuery"
          @input="handleSearch"
        />
      </div>

      <!-- 分组导航 -->
      <div class="group-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-item"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
          <span class="count">{{ tab.count }}</span>
        </button>
      </div>

      <!-- 联系人列表 -->
      <div class="contacts-list">
        <!-- 字母索引分组 -->
        <div v-if="activeTab === 'all' && !searchQuery">
          <div
            v-for="(contacts, letter) in groupedContacts"
            :key="letter"
            class="letter-group"
          >
            <div class="letter-header">{{ letter }}</div>
            <div
              v-for="contact in contacts"
              :key="contact.id"
              class="contact-item"
              :class="{ active: selectedContactId === contact.id }"
              @click="selectContact(contact.id)"
            >
              <div class="avatar">
                <img :src="contact.avatar" :alt="contact.name" />
                <span v-if="contact.online" class="online-dot"></span>
              </div>
              <div class="contact-info">
                <div class="name">{{ contact.name }}</div>
                <div class="status">{{ contact.signature || '这个人很懒，什么都没写' }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 搜索结果或其他标签页 -->
        <div v-else>
          <div
            v-for="contact in filteredContacts"
            :key="contact.id"
            class="contact-item"
            :class="{ active: selectedContactId === contact.id }"
            @click="selectContact(contact.id)"
          >
            <div class="avatar">
              <img :src="contact.avatar" :alt="contact.name" />
              <span v-if="contact.online" class="online-dot"></span>
            </div>
            <div class="contact-info">
              <div class="name">{{ contact.name }}</div>
              <div class="status">{{ contact.signature || '这个人很懒，什么都没写' }}</div>
            </div>
            <div v-if="activeTab === 'starred'" class="star-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
          </div>

          <div v-if="filteredContacts.length === 0" class="empty-state">
            <p>{{ searchQuery ? '未找到相关联系人' : '暂无联系人' }}</p>
          </div>
        </div>

        <!-- 字母索引导航 -->
        <div v-if="activeTab === 'all' && !searchQuery" class="letter-nav">
          <div
            v-for="letter in letterIndex"
            :key="letter"
            class="letter-nav-item"
            @click="scrollToLetter(letter)"
          >
            {{ letter }}
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧联系人详情 -->
    <div class="contact-detail">
      <template v-if="selectedContact">
        <div class="detail-content">
          <!-- 联系人基本信息 -->
          <div class="profile-section">
            <div class="profile-avatar">
              <img :src="selectedContact.avatar" :alt="selectedContact.name" />
              <span v-if="selectedContact.online" class="online-badge">在线</span>
              <span v-else class="offline-badge">离线</span>
            </div>
            <h2 class="profile-name">{{ selectedContact.name }}</h2>
            <p class="profile-signature">{{ selectedContact.signature || '这个人很懒，什么都没写' }}</p>

            <!-- 操作按钮 -->
            <div class="action-buttons">
              <button class="action-btn primary" @click="handleSendMessage">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                发送消息
              </button>
              <button class="action-btn" @click="handleVoiceCall">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                语音通话
              </button>
              <button class="action-btn" @click="handleVideoCall">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="23 7 16 12 23 17 23 7"/>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
                视频通话
              </button>
            </div>
          </div>

          <!-- 详细信息 -->
          <div class="info-section">
            <div class="info-title">个人信息</div>
            <div class="info-list">
              <div class="info-item">
                <span class="label">账号</span>
                <span class="value">{{ selectedContact.username }}</span>
              </div>
              <div class="info-item">
                <span class="label">邮箱</span>
                <span class="value">{{ selectedContact.email || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="label">手机</span>
                <span class="value">{{ selectedContact.phone || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="label">部门</span>
                <span class="value">{{ selectedContact.department || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="label">职位</span>
                <span class="value">{{ selectedContact.position || '-' }}</span>
              </div>
            </div>
          </div>

          <!-- 备注与标签 -->
          <div class="info-section">
            <div class="info-title">备注与���签</div>
            <div class="info-list">
              <div class="info-item">
                <span class="label">备注</span>
                <span class="value editable" @click="handleEditRemark">
                  {{ selectedContact.remark || '点击添加备注' }}
                </span>
              </div>
              <div class="info-item">
                <span class="label">标签</span>
                <div class="tags">
                  <span
                    v-for="tag in selectedContact.tags"
                    :key="tag"
                    class="tag"
                  >
                    {{ tag }}
                  </span>
                  <button class="add-tag-btn" @click="handleAddTag">+ 添加标签</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 其他操作 -->
          <div class="info-section">
            <div class="info-list">
              <div class="info-item clickable" @click="handleToggleStar">
                <span class="label">
                  <svg viewBox="0 0 24 24" :fill="selectedContact.starred ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  {{ selectedContact.starred ? '取消星标' : '设为星标' }}
                </span>
              </div>
              <div class="info-item clickable danger" @click="handleDeleteContact">
                <span class="label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                  删除联系人
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 未选择联系人时的空状态 -->
      <div v-else class="empty-detail">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <p>选择一个联系人查看详情</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 搜索关键词
const searchQuery = ref('')

// 当前激活的标签页
const activeTab = ref('all')

// 选中的联系人ID
const selectedContactId = ref('')

// 模拟联系人数据
const contacts = ref([
  {
    id: '1',
    name: '张三',
    username: 'zhangsan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zhang',
    signature: '努力工作，快乐生活',
    email: 'zhangsan@example.com',
    phone: '138****1234',
    department: '技术部',
    position: '高级工程师',
    online: true,
    starred: true,
    remark: '项目组同事',
    tags: ['同事', '技术'],
    pinyin: 'zhangsan',
    firstLetter: 'Z'
  },
  {
    id: '2',
    name: '李四',
    username: 'lisi',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Li',
    signature: '保持热爱，奔赴山海',
    email: 'lisi@example.com',
    phone: '139****5678',
    department: '产品部',
    position: '产品经理',
    online: true,
    starred: false,
    remark: '',
    tags: ['产品'],
    pinyin: 'lisi',
    firstLetter: 'L'
  },
  {
    id: '3',
    name: '王五',
    username: 'wangwu',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Wang',
    signature: '每天进步一点点',
    email: 'wangwu@example.com',
    phone: '137****9012',
    department: '设计部',
    position: 'UI设计师',
    online: false,
    starred: true,
    remark: '设计负责人',
    tags: ['设计', '创意'],
    pinyin: 'wangwu',
    firstLetter: 'W'
  },
  {
    id: '4',
    name: '赵六',
    username: 'zhaoliu',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zhao',
    signature: '生活不止眼前的苟且',
    email: 'zhaoliu@example.com',
    phone: '136****3456',
    department: '市场部',
    position: '市场总监',
    online: true,
    starred: false,
    remark: '',
    tags: ['市场'],
    pinyin: 'zhaoliu',
    firstLetter: 'Z'
  },
  {
    id: '5',
    name: 'Alice',
    username: 'alice',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    signature: 'Keep calm and carry on',
    email: 'alice@example.com',
    phone: '135****7890',
    department: '技术部',
    position: '前端开发',
    online: false,
    starred: false,
    remark: '',
    tags: ['技术', '前端'],
    pinyin: 'alice',
    firstLetter: 'A'
  },
  {
    id: '6',
    name: 'Bob',
    username: 'bob',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    signature: 'Just do it',
    email: 'bob@example.com',
    phone: '134****2345',
    department: '技术部',
    position: '后端开发',
    online: true,
    starred: true,
    remark: '技术大牛',
    tags: ['技术', '后端'],
    pinyin: 'bob',
    firstLetter: 'B'
  }
])

// 标签页配置
const tabs = computed(() => [
  { key: 'all', label: '全部', count: contacts.value.length },
  { key: 'starred', label: '星标', count: contacts.value.filter(c => c.starred).length },
  { key: 'recent', label: '最近', count: 0 }
])

// 过滤后的联系人列表
const filteredContacts = computed(() => {
  let result = contacts.value

  // 根据标签页过滤
  if (activeTab.value === 'starred') {
    result = result.filter(c => c.starred)
  }

  // 根据搜索关键词过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.username.toLowerCase().includes(query) ||
      c.pinyin.toLowerCase().includes(query)
    )
  }

  return result
})

// 按字母分组的联系人
const groupedContacts = computed(() => {
  const groups = {}

  filteredContacts.value.forEach(contact => {
    const letter = contact.firstLetter.toUpperCase()
    if (!groups[letter]) {
      groups[letter] = []
    }
    groups[letter].push(contact)
  })

  // 排序
  return Object.keys(groups)
    .sort()
    .reduce((acc, key) => {
      acc[key] = groups[key]
      return acc
    }, {})
})

// 字母索引
const letterIndex = computed(() => {
  return Object.keys(groupedContacts.value).sort()
})

// 选中的联系人
const selectedContact = computed(() => {
  return contacts.value.find(c => c.id === selectedContactId.value)
})

// 选择联系人
function selectContact(id) {
  selectedContactId.value = id
}

// 搜索处理
function handleSearch() {
  // 搜索逻辑已在computed中处理
}

// 滚动到指定字母
function scrollToLetter(letter) {
  const element = document.querySelector(`[data-letter="${letter}"]`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// 添加联系人
function handleAddContact() {
  console.log('添加联系人')
  // TODO: 实现添加联系人功能
}

// 发送消息
function handleSendMessage() {
  if (!selectedContact.value) return

  // 跳转到即时通讯页面并打开与该联系人的对话
  router.push({
    name: 'ImChat',
    query: { userId: selectedContact.value.id }
  })
}

// 语音通话
function handleVoiceCall() {
  console.log('语音通话:', selectedContact.value?.name)
  // TODO: 实现语音通话功能
}

// 视频通话
function handleVideoCall() {
  console.log('视频通话:', selectedContact.value?.name)
  // TODO: 实现视频通话功能
}

// 编辑备注
function handleEditRemark() {
  console.log('编辑备注')
  // TODO: 实现编辑备注功能
}

// 添加标签
function handleAddTag() {
  console.log('添加标签')
  // TODO: 实现添加标签功能
}

// 切换星标
function handleToggleStar() {
  if (!selectedContact.value) return
  selectedContact.value.starred = !selectedContact.value.starred
}

// 删除联系人
function handleDeleteContact() {
  if (!selectedContact.value) return
  if (confirm(`确定要删除联系人"${selectedContact.value.name}"吗？`)) {
    const index = contacts.value.findIndex(c => c.id === selectedContactId.value)
    if (index > -1) {
      contacts.value.splice(index, 1)
      selectedContactId.value = ''
    }
  }
}

// 默认选中第一个联系人
if (contacts.value.length > 0) {
  selectedContactId.value = contacts.value[0].id
}
</script>

<style scoped>
.contacts-container {
  display: grid;
  grid-template-columns: 320px 1fr;
  height: calc(100vh - 8vh);
  background: #f7f8fa;
  overflow: hidden;
}

/* 左侧联系人列表 */
.contacts-sidebar {
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.add-contact-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: #1a73e8;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.add-contact-btn:hover {
  background: #1557b0;
  transform: scale(1.05);
}

.add-contact-btn svg {
  width: 20px;
  height: 20px;
}

.search-box {
  padding: 12px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.search-box input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
}

.search-box input:focus {
  border-color: #1a73e8;
  box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
}

.group-tabs {
  display: flex;
  padding: 8px 20px;
  gap: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.tab-item {
  flex: 1;
  padding: 6px 12px;
  border: none;
  background: transparent;
  color: #6b7280;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.tab-item:hover {
  background: #f3f4f6;
}

.tab-item.active {
  background: #e8f0fe;
  color: #1a73e8;
  font-weight: 500;
}

.tab-item .count {
  font-size: 12px;
  opacity: 0.7;
}

.contacts-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  min-height: 0;
}

.letter-group {
  margin-bottom: 4px;
}

.letter-header {
  padding: 8px 20px;
  background: #f9fafb;
  color: #1a73e8;
  font-size: 12px;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 1;
}

.contact-item {
  padding: 12px 20px;
  display: flex;
  gap: 12px;
  cursor: pointer;
  transition: background 0.2s;
  align-items: center;
}

.contact-item:hover {
  background: #f9fafb;
}

.contact-item.active {
  background: #e8f0fe;
}

.contact-item .avatar {
  position: relative;
  flex-shrink: 0;
}

.contact-item .avatar img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}

.online-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  background: #10b981;
  border: 2px solid white;
  border-radius: 50%;
}

.contact-info {
  flex: 1;
  min-width: 0;
}

.contact-info .name {
  font-weight: 500;
  color: #111827;
  font-size: 15px;
  margin-bottom: 2px;
}

.contact-info .status {
  font-size: 12px;
  color: #9ca3af;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.star-icon {
  color: #f59e0b;
  flex-shrink: 0;
}

.star-icon svg {
  width: 16px;
  height: 16px;
}

.letter-nav {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 2;
}

.letter-nav-item {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #1a73e8;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.letter-nav-item:hover {
  background: #e8f0fe;
  border-radius: 50%;
  transform: scale(1.2);
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #9ca3af;
}

/* 右侧联系人详情 */
.contact-detail {
  background: #ffffff;
  overflow-y: auto;
}

.detail-content {
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 24px;
}

.profile-section {
  text-align: center;
  padding-bottom: 32px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 32px;
}

.profile-avatar {
  position: relative;
  display: inline-block;
  margin-bottom: 16px;
}

.profile-avatar img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e5e7eb;
}

.online-badge,
.offline-badge {
  position: absolute;
  bottom: 4px;
  right: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  border: 2px solid white;
}

.online-badge {
  background: #10b981;
  color: white;
}

.offline-badge {
  background: #9ca3af;
  color: white;
}

.profile-name {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #111827;
}

.profile-signature {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  justify-content: center;
}

.action-btn {
  padding: 10px 20px;
  border: 1px solid #e5e7eb;
  background: white;
  color: #6b7280;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.action-btn:hover {
  border-color: #1a73e8;
  color: #1a73e8;
  background: #f9fafb;
}

.action-btn.primary {
  background: #1a73e8;
  color: white;
  border-color: #1a73e8;
}

.action-btn.primary:hover {
  background: #1557b0;
}

.action-btn svg {
  width: 18px;
  height: 18px;
}

.info-section {
  margin-bottom: 32px;
}

.info-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 16px;
}

.info-list {
  background: #f9fafb;
  border-radius: 12px;
  overflow: hidden;
}

.info-item {
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item .label {
  color: #6b7280;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.info-item .label svg {
  width: 16px;
  height: 16px;
}

.info-item .value {
  color: #111827;
  font-size: 14px;
  font-weight: 500;
}

.info-item .value.editable {
  color: #1a73e8;
  cursor: pointer;
}

.info-item .value.editable:hover {
  text-decoration: underline;
}

.info-item.clickable {
  cursor: pointer;
  transition: background 0.2s;
}

.info-item.clickable:hover {
  background: #f3f4f6;
}

.info-item.clickable.danger {
  color: #ef4444;
}

.info-item.clickable.danger:hover {
  background: #fee;
}

.tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}

.tag {
  padding: 4px 10px;
  background: #e8f0fe;
  color: #1a73e8;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.add-tag-btn {
  padding: 4px 10px;
  background: transparent;
  color: #1a73e8;
  border: 1px dashed #1a73e8;
  border-radius: 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-tag-btn:hover {
  background: #e8f0fe;
}

.empty-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #9ca3af;
}

.empty-detail svg {
  width: 64px;
  height: 64px;
}

.empty-detail p {
  font-size: 16px;
  margin: 0;
}

/* 滚动条样式 */
.contacts-list::-webkit-scrollbar,
.contact-detail::-webkit-scrollbar {
  width: 6px;
}

.contacts-list::-webkit-scrollbar-track,
.contact-detail::-webkit-scrollbar-track {
  background: transparent;
}

.contacts-list::-webkit-scrollbar-thumb,
.contact-detail::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.contacts-list::-webkit-scrollbar-thumb:hover,
.contact-detail::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
