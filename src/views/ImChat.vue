<template>
  <div class="im-chat-container">
    <!-- 左侧对话列表 -->
    <div class="conversation-list">
      <div class="conversation-header">
        <h3>消息</h3>
        <button class="new-chat-btn" @click="handleNewChat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </button>
      </div>

      <div class="search-box">
        <input
          type="text"
          placeholder="搜索"
          v-model="searchQuery"
          @input="handleSearch"
        />
      </div>

      <div class="conversation-items">
        <div
          v-for="conv in filteredConversations"
          :key="conv.id"
          class="conversation-item"
          :class="{ active: activeConversationId === conv.id }"
          @click="selectConversation(conv.id)"
        >
          <div class="avatar">
            <img :src="conv.avatar" :alt="conv.name" />
            <span v-if="conv.online" class="online-dot"></span>
          </div>
          <div class="conversation-info">
            <div class="conversation-top">
              <span class="name">{{ conv.name }}</span>
              <span class="time">{{ formatMessageTime(conv.lastMessageTime) }}</span>
            </div>
            <div class="conversation-bottom">
              <span class="last-message">{{ conv.lastMessage }}</span>
              <span v-if="conv.unreadCount > 0" class="unread-badge">{{ conv.unreadCount }}</span>
            </div>
          </div>
        </div>

        <div v-if="filteredConversations.length === 0" class="empty-state">
          <p>暂无消息</p>
        </div>
      </div>
    </div>

    <!-- 右侧聊天窗口 -->
    <div class="chat-window">
      <template v-if="activeConversation">
        <!-- 聊天头部 -->
        <div class="chat-header">
          <div class="chat-user-info">
            <div class="avatar">
              <img :src="activeConversation.avatar" :alt="activeConversation.name" />
              <span v-if="activeConversation.online" class="online-dot"></span>
            </div>
            <div class="user-details">
              <h3>{{ activeConversation.name }}</h3>
              <span class="status">{{ activeConversation.online ? '在线' : '离线' }}</span>
            </div>
          </div>
          <div class="chat-actions">
            <button class="action-btn" title="语音通话">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </button>
            <button class="action-btn" title="视频通话">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
            </button>
            <button class="action-btn" title="更多">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="1"/>
                <circle cx="12" cy="5" r="1"/>
                <circle cx="12" cy="19" r="1"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- 聊天消息区域 -->
        <div class="chat-messages" ref="messagesContainer">
          <div
            v-for="(msg, index) in currentMessages"
            :key="index"
            class="message-wrapper"
            :class="{ 'message-sent': msg.isSent, 'message-received': !msg.isSent }"
          >
            <div v-if="!msg.isSent" class="avatar">
              <img :src="activeConversation.avatar" :alt="activeConversation.name" />
            </div>
            <div class="message-content">
              <div class="message-bubble">
                <p v-if="msg.type === 'text'">{{ msg.content }}</p>
                <img v-else-if="msg.type === 'image'" :src="msg.content" alt="图片" />
              </div>
              <span class="message-time">{{ formatMessageTime(msg.timestamp) }}</span>
            </div>
            <div v-if="msg.isSent" class="avatar">
              <img :src="currentUserAvatar" alt="我" />
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="chat-input-area">
          <div class="input-toolbar">
            <button class="toolbar-btn" title="表情">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                <line x1="9" y1="9" x2="9.01" y2="9"/>
                <line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
            </button>
            <button class="toolbar-btn" title="文件">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
            </button>
            <button class="toolbar-btn" title="图片">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </button>
          </div>
          <div class="input-wrapper">
            <textarea
              v-model="inputMessage"
              placeholder="输入消息..."
              @keydown.enter.exact="handleSendMessage"
              @keydown.enter.shift.exact.prevent
              rows="3"
            ></textarea>
          </div>
          <div class="input-actions">
            <button class="send-btn" @click="handleSendMessage" :disabled="!inputMessage.trim()">
              发送
            </button>
          </div>
        </div>
      </template>

      <!-- 未选择对话时的空状态 -->
      <div v-else class="empty-chat">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <p>选择一个对话开始聊天</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'

// 当前用户头像
const currentUserAvatar = ref('https://api.dicebear.com/7.x/avataaars/svg?seed=currentUser')

// 搜索关键词
const searchQuery = ref('')

// 当前激活的对话ID
const activeConversationId = ref('')

// 输入的消息
const inputMessage = ref('')

// 消息容器ref
const messagesContainer = ref(null)

// 模拟对话列表数据
const conversations = ref([
  {
    id: '1',
    name: '张三',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zhang',
    lastMessage: '晚上一起吃饭吗？',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 5),
    unreadCount: 2,
    online: true
  },
  {
    id: '2',
    name: '李四',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Li',
    lastMessage: '项目文档我已经发给你了',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
    unreadCount: 0,
    online: true
  },
  {
    id: '3',
    name: '王五',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Wang',
    lastMessage: '好的，明天见',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
    unreadCount: 0,
    online: false
  },
  {
    id: '4',
    name: '赵六',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zhao',
    lastMessage: '会议时间改到下午3点',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 5),
    unreadCount: 1,
    online: true
  },
  {
    id: '5',
    name: '产品团队',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Team',
    lastMessage: '新版本UI设计稿已上传',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
    unreadCount: 5,
    online: false
  }
])

// 模拟消息数据
const messagesData = ref({
  '1': [
    { id: 1, content: '你好！', isSent: false, type: 'text', timestamp: new Date(Date.now() - 1000 * 60 * 60) },
    { id: 2, content: '你好，有什么事吗？', isSent: true, type: 'text', timestamp: new Date(Date.now() - 1000 * 60 * 55) },
    { id: 3, content: '晚上一起吃饭吗？', isSent: false, type: 'text', timestamp: new Date(Date.now() - 1000 * 60 * 5) }
  ],
  '2': [
    { id: 1, content: '项目文档我已经发给你了', isSent: false, type: 'text', timestamp: new Date(Date.now() - 1000 * 60 * 30) },
    { id: 2, content: '收到，谢谢', isSent: true, type: 'text', timestamp: new Date(Date.now() - 1000 * 60 * 28) }
  ],
  '3': [
    { id: 1, content: '明天能来开会吗？', isSent: true, type: 'text', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3) },
    { id: 2, content: '好的，明天见', isSent: false, type: 'text', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) }
  ],
  '4': [
    { id: 1, content: '会议时间改到下午3点', isSent: false, type: 'text', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5) }
  ],
  '5': [
    { id: 1, content: '大家好', isSent: true, type: 'text', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25) },
    { id: 2, content: '新版本UI设计稿已上传', isSent: false, type: 'text', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) }
  ]
})

// 计算属性：过滤后的对话列表
const filteredConversations = computed(() => {
  if (!searchQuery.value.trim()) {
    return conversations.value
  }
  return conversations.value.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 计算属性：当前激活的对话
const activeConversation = computed(() => {
  return conversations.value.find(conv => conv.id === activeConversationId.value)
})

// 计算属性：当前对话的消息列表
const currentMessages = computed(() => {
  return messagesData.value[activeConversationId.value] || []
})

// 格式化消息时间
function formatMessageTime(time) {
  if (!time) return ''

  const now = new Date()
  const msgTime = new Date(time)
  const diffInSeconds = Math.floor((now - msgTime) / 1000)

  // 小于1分钟
  if (diffInSeconds < 60) {
    return '刚刚'
  }

  // 小于1小时
  if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}分钟前`
  }

  // 小于24小时
  if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}小时前`
  }

  // 小于7天
  if (diffInSeconds < 604800) {
    return `${Math.floor(diffInSeconds / 86400)}天前`
  }

  // 格式化为具体日期
  const year = msgTime.getFullYear()
  const month = String(msgTime.getMonth() + 1).padStart(2, '0')
  const day = String(msgTime.getDate()).padStart(2, '0')

  if (year === now.getFullYear()) {
    return `${month}-${day}`
  }

  return `${year}-${month}-${day}`
}

// 选择对话
function selectConversation(id) {
  activeConversationId.value = id

  // 清除未读消息
  const conv = conversations.value.find(c => c.id === id)
  if (conv) {
    conv.unreadCount = 0
  }

  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
  })
}

// 搜索处理
function handleSearch() {
  // 搜索逻辑已在computed中处理
}

// 新建聊天
function handleNewChat() {
  // TODO: 实现新建聊天功能
  console.log('新建聊天')
}

// 发送消息
function handleSendMessage(e) {
  // 如果是Shift+Enter，允许换行
  if (e && e.shiftKey) {
    return
  }

  // 阻止默认的Enter换行行为
  if (e) {
    e.preventDefault()
  }

  const message = inputMessage.value.trim()
  if (!message || !activeConversationId.value) {
    return
  }

  // 添加新消息到当前对话
  const newMessage = {
    id: Date.now(),
    content: message,
    isSent: true,
    type: 'text',
    timestamp: new Date()
  }

  if (!messagesData.value[activeConversationId.value]) {
    messagesData.value[activeConversationId.value] = []
  }

  messagesData.value[activeConversationId.value].push(newMessage)

  // 更新对话列表中的最后消息
  const conv = conversations.value.find(c => c.id === activeConversationId.value)
  if (conv) {
    conv.lastMessage = message
    conv.lastMessageTime = new Date()
  }

  // 清空输入框
  inputMessage.value = ''

  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
  })

  // TODO: 调用API发送消息
  // await imChatApi.sendMessage({ conversationId: activeConversationId.value, content: message })
}

// 滚动到底部
function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 组件挂载时选择第一个对话
onMounted(() => {
  if (conversations.value.length > 0) {
    selectConversation(conversations.value[0].id)
  }
})
</script>

<style scoped>
.im-chat-container {
  display: grid;
  grid-template-columns: 320px 1fr;
  height: calc(100vh - 8vh);
  background: #f7f8fa;
  overflow: hidden;
}

/* 左侧对话列表 */
.conversation-list {
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.conversation-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.conversation-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.new-chat-btn {
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

.new-chat-btn:hover {
  background: #1557b0;
  transform: scale(1.05);
}

.new-chat-btn svg {
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

.conversation-items {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.conversation-item {
  padding: 12px 20px;
  display: flex;
  gap: 12px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #f3f4f6;
}

.conversation-item:hover {
  background: #f9fafb;
}

.conversation-item.active {
  background: #e8f0fe;
}

.conversation-item .avatar {
  position: relative;
  flex-shrink: 0;
}

.conversation-item .avatar img {
  width: 48px;
  height: 48px;
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

.conversation-info {
  flex: 1;
  min-width: 0;
}

.conversation-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.conversation-top .name {
  font-weight: 600;
  color: #111827;
  font-size: 15px;
}

.conversation-top .time {
  font-size: 12px;
  color: #6b7280;
}

.conversation-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.conversation-bottom .last-message {
  font-size: 13px;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.unread-badge {
  background: #ef4444;
  color: white;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  font-weight: 600;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #9ca3af;
}

/* 右侧聊天窗口 */
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f7f8fa;
}

.chat-header {
  background: white;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-user-info .avatar {
  position: relative;
}

.chat-user-info .avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-details h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.user-details .status {
  font-size: 12px;
  color: #10b981;
}

.chat-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: #6b7280;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f3f4f6;
  color: #1a73e8;
}

.action-btn svg {
  width: 20px;
  height: 20px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-wrapper {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.message-wrapper.message-sent {
  justify-content: flex-end;
}

.message-wrapper.message-received {
  justify-content: flex-start;
}

.message-wrapper .avatar img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 60%;
}

.message-sent .message-content {
  align-items: flex-end;
}

.message-received .message-content {
  align-items: flex-start;
}

.message-bubble {
  padding: 10px 14px;
  border-radius: 12px;
  word-break: break-word;
}

.message-sent .message-bubble {
  background: #1a73e8;
  color: white;
  border-bottom-right-radius: 4px;
}

.message-received .message-bubble {
  background: white;
  color: #111827;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.message-bubble p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.message-bubble img {
  max-width: 100%;
  border-radius: 8px;
}

.message-time {
  font-size: 11px;
  color: #9ca3af;
  padding: 0 4px;
}

.chat-input-area {
  background: white;
  border-top: 1px solid #e5e7eb;
  padding: 16px 24px;
}

.input-toolbar {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
}

.toolbar-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #6b7280;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  background: #f3f4f6;
  color: #1a73e8;
}

.toolbar-btn svg {
  width: 18px;
  height: 18px;
}

.input-wrapper {
  margin-bottom: 12px;
}

.input-wrapper textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: none;
  outline: none;
  transition: all 0.2s;
}

.input-wrapper textarea:focus {
  border-color: #1a73e8;
  box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
}

.input-actions {
  display: flex;
  justify-content: flex-end;
}

.send-btn {
  padding: 8px 24px;
  background: #1a73e8;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: #1557b0;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #9ca3af;
}

.empty-chat svg {
  width: 64px;
  height: 64px;
}

.empty-chat p {
  font-size: 16px;
  margin: 0;
}

/* 滚动条样式 */
.conversation-items::-webkit-scrollbar,
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.conversation-items::-webkit-scrollbar-track,
.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.conversation-items::-webkit-scrollbar-thumb,
.chat-messages::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.conversation-items::-webkit-scrollbar-thumb:hover,
.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
