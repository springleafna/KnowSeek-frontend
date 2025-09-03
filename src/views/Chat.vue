<template>
  <div class="chat-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h3>会话</h3>
        <button class="btn" @click="handleCreateConversation" :disabled="loading.conversations">新建</button>
      </div>
      <div class="conversation-list" v-if="!loading.conversations">
        <div
          v-for="item in conversations"
          :key="item.conversationId"
          :class="['conversation-item', { active: item.conversationId === activeConversationId }]"
          @click="selectConversation(item.conversationId)"
        >
          <div class="title">{{ item.title || '未命名会话' }}</div>
          <div class="meta">
            <span class="last">{{ item.lastMessage || '暂无消息' }}</span>
            <span class="time">{{ formatTime(item.lastMessageTime || item.createTime) }}</span>
          </div>
          <button class="delete" @click.stop="handleDeleteConversation(item.conversationId)">删除</button>
        </div>
        <div v-if="conversations.length === 0" class="empty">暂无会话，点击“新建”开始</div>
      </div>
      <div class="loading" v-else>加载会话中...</div>
    </aside>

    <main class="chat-main">
      <div class="chat-header">
        <h3>{{ activeConversationTitle }}</h3>
        <div class="ops">
          <button class="btn ghost" @click="handleClearHistory" :disabled="!activeConversationId || loading.clearing">清空</button>
        </div>
      </div>

      <div class="chat-body" ref="chatBodyRef">
        <div v-if="messages.length === 0" class="placeholder">开始你的提问吧～</div>
        <div v-for="(msg, idx) in messages" :key="idx" class="message" :class="msg.role">
          <div class="bubble">
            <pre class="content">{{ msg.message }}</pre>
            <div class="sub">
              <span>{{ msg.timestamp ? formatTime(msg.timestamp) : '' }}</span>
              <span v-if="msg.fromKnowledgeBase" class="kb">知识库</span>
            </div>
          </div>
        </div>
        <div v-if="streamingText" class="message assistant">
          <div class="bubble">
            <pre class="content">{{ streamingText }}</pre>
          </div>
        </div>
      </div>

      <div class="chat-input">
        <textarea
          v-model="inputText"
          :disabled="loading.sending || loading.streaming"
          placeholder="输入你的问题，Shift+Enter 换行，Enter 发送"
          @keydown.enter.exact.prevent="handleSend(false)"
          @keydown.enter.shift.exact.stop
        />
        <div class="toolbar">
          <label class="kb-switch">
            <input type="checkbox" v-model="useKnowledgeBase" /> 使用知识库
          </label>
          <div class="buttons">
            <button class="btn primary" @click="handleSend(false)" :disabled="!canSend">发送</button>
            <button class="btn" v-if="!loading.streaming" @click="handleSend(true)" :disabled="!canSend">流式发送</button>
            <button class="btn danger" v-else @click="abortStream">停止</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { chatApi } from '@/api/api'

const conversations = ref([])
const activeConversationId = ref('')
const messages = ref([])
const inputText = ref('')
const useKnowledgeBase = ref(true)
const chatBodyRef = ref(null)

const streamingText = ref('')
let streamCtrl = null

const loading = reactive({
  conversations: false,
  sending: false,
  streaming: false,
  clearing: false,
})

const canSend = computed(() => !!inputText.value.trim() && !loading.sending)
const activeConversationTitle = computed(() => {
  const found = conversations.value.find(c => c.conversationId === activeConversationId.value)
  return found?.title || '新会话'
})

function formatTime(t) {
  if (!t) return ''
  try {
    const date = typeof t === 'string' ? new Date(t) : t
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const hh = String(date.getHours()).padStart(2, '0')
    const mm = String(date.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${d} ${hh}:${mm}`
  } catch (e) {
    return ''
  }
}

function scrollToBottom() {
  nextTick(() => {
    const el = chatBodyRef.value
    if (!el) return
    el.scrollTop = el.scrollHeight
  })
}

async function loadConversations() {
  loading.conversations = true
  try {
    const list = await chatApi.getConversations()
    conversations.value = Array.isArray(list) ? list : []
    if (!activeConversationId.value && conversations.value.length > 0) {
      activeConversationId.value = conversations.value[0].conversationId
    }
  } catch (e) {
    console.error('获取会话失败', e)
  } finally {
    loading.conversations = false
  }
}

async function selectConversation(id) {
  if (id === activeConversationId.value) return
  activeConversationId.value = id
  await loadConversationDetail(id)
}

async function loadConversationDetail(id) {
  try {
    await chatApi.getConversation(id)
    messages.value = []
  } catch (e) {
    console.error('获取会话详情失败', e)
  }
}

async function handleCreateConversation() {
  try {
    const conv = await chatApi.createConversation({ title: `会话 ${conversations.value.length + 1}` })
    await loadConversations()
    if (conv?.conversationId) {
      activeConversationId.value = conv.conversationId
    }
  } catch (e) {
    console.error('创建会话失败', e)
  }
}

async function handleDeleteConversation(id) {
  try {
    await chatApi.deleteConversation(id)
    if (id === activeConversationId.value) {
      activeConversationId.value = ''
      messages.value = []
    }
    await loadConversations()
  } catch (e) {
    console.error('删除会话失败', e)
  }
}

async function handleClearHistory() {
  if (!activeConversationId.value) return
  loading.clearing = true
  try {
    await chatApi.clearConversation(activeConversationId.value)
    messages.value = []
  } catch (e) {
    console.error('清空历史失败', e)
  } finally {
    loading.clearing = false
  }
}

async function handleSend(stream) {
  const text = inputText.value.trim()
  if (!text) return

  if (!activeConversationId.value) {
    try {
      const conv = await chatApi.createConversation({ title: `会话 ${conversations.value.length + 1}` })
      activeConversationId.value = conv?.conversationId || ''
      await loadConversations()
      if (!activeConversationId.value) return
    } catch (e) {
      return
    }
  }

  messages.value.push({ role: 'user', message: text, timestamp: new Date() })
  inputText.value = ''
  scrollToBottom()

  if (!stream) {
    loading.sending = true
    try {
      const res = await chatApi.sendMessage({
        message: text,
        conversationId: activeConversationId.value,
        useKnowledgeBase: useKnowledgeBase.value,
      })
      messages.value.push({
        role: 'assistant',
        message: res?.message || '',
        timestamp: res?.timestamp || new Date(),
        fromKnowledgeBase: res?.fromKnowledgeBase,
      })
      if (res?.conversationId && res.conversationId !== activeConversationId.value) {
        activeConversationId.value = res.conversationId
        await loadConversations()
      }
    } catch (e) {
      messages.value.push({ role: 'assistant', message: `错误：${e.message}`, timestamp: new Date() })
    } finally {
      loading.sending = false
      scrollToBottom()
    }
    return
  }

  loading.streaming = true
  streamingText.value = ''
  try {
    const ctrl = chatApi.streamMessage(
      {
        message: text,
        conversationId: activeConversationId.value,
        useKnowledgeBase: useKnowledgeBase.value,
      },
      {
        onMessage(data) {
          if (typeof data === 'string') {
            streamingText.value += data
          } else if (data && typeof data === 'object') {
            if (data.message) streamingText.value += data.message
            if (data.conversationId && data.conversationId !== activeConversationId.value) {
              activeConversationId.value = data.conversationId
            }
          }
          scrollToBottom()
        },
        onComplete() {
          if (streamingText.value) {
            messages.value.push({ role: 'assistant', message: streamingText.value, timestamp: new Date() })
            streamingText.value = ''
          }
          loading.streaming = false
          loadConversations()
          scrollToBottom()
        },
        onError(err) {
          messages.value.push({ role: 'assistant', message: `错误：${err.message}`, timestamp: new Date() })
          streamingText.value = ''
          loading.streaming = false
          scrollToBottom()
        },
      }
    )
    streamCtrl = ctrl
  } catch (e) {
    messages.value.push({ role: 'assistant', message: `错误：${e.message}`, timestamp: new Date() })
    loading.streaming = false
  }
}

function abortStream() {
  if (streamCtrl && typeof streamCtrl.abort === 'function') {
    streamCtrl.abort()
  }
  loading.streaming = false
  streamingText.value = ''
}

onMounted(async () => {
  await loadConversations()
  if (activeConversationId.value) {
    await loadConversationDetail(activeConversationId.value)
  }
})
</script>

<style scoped>
.chat-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  height: 100%;
  gap: 16px;
  padding: 16px 20px;
  box-sizing: border-box;
}

.sidebar {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(17,24,39,0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid #f0f0f0;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 15px;
}

.btn {
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #111827;
  border-radius: 8px;
  cursor: pointer;
}

.btn.primary {
  background: #1a73e8;
  border-color: #1a73e8;
  color: #fff;
}

.btn.ghost {
  background: #fff;
}

.btn.danger {
  background: #ef4444;
  border-color: #ef4444;
  color: #fff;
}

.btn[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.conversation-list {
  overflow: auto;
  padding: 8px 0;
}

.conversation-item {
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f7f7f7;
  position: relative;
}

.conversation-item.active {
  background: #f9fbff;
}

.conversation-item .title {
  font-weight: 600;
  color: #111827;
}

.conversation-item .meta {
  margin-top: 4px;
  display: flex;
  justify-content: space-between;
  color: #6b7280;
  font-size: 12px;
}

.conversation-item .delete {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #fff;
  color: #ef4444;
  border: 1px solid #f3d2d2;
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
}

.empty {
  padding: 16px;
  color: #6b7280;
}

.loading {
  padding: 16px;
}

.chat-main {
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100%;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(17,24,39,0.06);
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.chat-body {
  overflow: auto;
  padding: 16px;
  background: #fafafa;
}

.placeholder {
  color: #6b7280;
}

.message {
  display: flex;
  margin-bottom: 12px;
}

.message.user {
  justify-content: flex-end;
}

.message .bubble {
  max-width: 70%;
  background: #fff;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}

.message.user .bubble {
  background: #e8f0fe;
  border-color: #e3ebfd;
}

.message .content {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
}

.message .sub {
  margin-top: 6px;
  font-size: 12px;
  color: #6b7280;
  display: flex;
  gap: 8px;
}

.message .kb {
  color: #22c55e;
}

.chat-input {
  border-top: 1px solid #f0f0f0;
  padding: 12px 16px;
  background: #fff;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.chat-input textarea {
  width: 100%;
  min-height: 110px;
  resize: vertical;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  box-sizing: border-box;
  outline: none;
  background: #fff;
}

.chat-input textarea:focus {
  border-color: #1a73e8;
  box-shadow: 0 0 0 3px rgba(26,115,232,0.15);
}

.toolbar {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.kb-switch {
  user-select: none;
  color: #374151;
}

.buttons button {
  margin-left: 8px;
}

.buttons button[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}
</style> 