<template>
  <n-config-provider :theme="null">
    <n-layout class="chat-layout" has-sider>
      <n-layout-sider
        bordered
        collapse-mode="width"
        :collapsed-width="0"
        :width="300"
        show-trigger
        content-style="padding: 0; display: flex; flex-direction: column;"
      >
        <div style="padding: 16px; display: flex; flex-direction: column; height: 100%;">
          <div style="flex-shrink: 0; margin-bottom: 16px;">
            <n-space justify="space-between" align="center">
              <n-h3 :depth="3" style="margin: 0;">会话</n-h3>
              <n-button
                round
                size="small"
                @click="handleCreateSession"
                :loading="loading.sessions"
                color="#387BE9"
              >
                新建
              </n-button>
            </n-space>
          </div>

          <div class="session-list-wrapper">
            <n-spin :show="loading.sessions">
              <div v-if="!loading.sessions" class="session-cards">
                <n-card
                  v-for="item in sessions"
                  :key="item.id"
                  size="small"
                  hoverable
                  :class="{ 'active-conversation': item.id === activeSessionId }"
                  @click="selectSession(item.id)"
                  style="cursor: pointer; margin-bottom: 8px;"
                >
                  <template #header>
                    <n-ellipsis>{{ item.sessionName || '未命名会话' }}</n-ellipsis>
                  </template>
                  <template #header-extra>
                    <n-dropdown
                      :options="getSessionMenuOptions(item.id)"
                      @select="handleSessionMenuSelect"
                      trigger="click"
                      placement="bottom-start"
                    >
                      <n-button
                        text
                        size="tiny"
                        @click.stop
                      >
                        <n-icon :size="16">
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="2" fill="currentColor"/>
                            <circle cx="12" cy="5" r="2" fill="currentColor"/>
                            <circle cx="12" cy="19" r="2" fill="currentColor"/>
                          </svg>
                        </n-icon>
                      </n-button>
                    </n-dropdown>
                  </template>
                  <n-text depth="3" :style="{ fontSize: '12px' }">
                    {{ formatTime(item.updatedAt || item.createdAt) }}
                  </n-text>
                </n-card>

                <n-empty v-if="sessions.length === 0" description="暂无会话，发送消息将自动创建" />
              </div>
            </n-spin>
          </div>
        </div>
      </n-layout-sider>

      <n-layout content-style="display: flex; flex-direction: column; height: 100%; position: relative;">
        <!-- 聊天消息区域 -->
        <div class="chat-main">
          <div class="chat-header">
            <n-space justify="space-between" align="center">
              <n-h3 :depth="3" style="margin: 0;">{{ activeSessionTitle }}</n-h3>
              <n-button
                strong secondary round
                @click="handleClearHistory"
                :disabled="!activeSessionId"
                :loading="loading.clearing"
              >
                <img 
                  :src="clearIcon" 
                  alt="清空" 
                  style="width: 16px; height: 20px; margin-right: 6px; vertical-align: -3px;"
                />
                清空
              </n-button>
            </n-space>
          </div>

          <div class="chat-body" ref="chatBodyRef">
            <n-empty v-if="messages.length === 0" description="开始你的提问吧～" />

            <n-space vertical :size="16" v-else>
              <div
                v-for="(msg, idx) in messages"
                :key="idx"
                :class="`message-wrapper ${msg.role}`"
              >
                <n-card
                  size="small"
                  :class="`message-card ${msg.role}`"
                  :content-style="{ padding: '12px 16px' }"
                >
                  <div
                    v-if="msg.role === 'assistant'"
                    v-html="renderMarkdown(msg.message)"
                    class="markdown-content"
                    @click="handleCodeCopy"
                  ></div>
                  <div v-else class="user-message">{{ msg.message }}</div>

                  <template #footer>
                    <n-space :size="8" align="center">
                      <n-text depth="3" :style="{ fontSize: '12px' }">
                        {{ msg.timestamp ? formatTime(msg.timestamp) : '' }}
                      </n-text>
                      <n-tag v-if="msg.fromKnowledgeBase" type="success" size="small">
                        知识库
                      </n-tag>
                    </n-space>
                  </template>
                </n-card>
              </div>

              <div v-if="streamingText" class="message-wrapper assistant">
                <n-card
                  size="small"
                  class="message-card assistant streaming"
                  :content-style="{ padding: '12px 16px' }"
                >
                  <div
                    v-html="renderMarkdown(streamingText)"
                    class="markdown-content"
                    @click="handleCodeCopy"
                  ></div>
                  <n-spin :show="true" size="small" style="margin-top: 8px;" />
                </n-card>
              </div>
            </n-space>
            <div ref="chatBodyBottomRef" style="height: 1px;"></div>
          </div>
        </div>

        <!-- 固定在底部的输入区域 -->
        <div class="chat-input-fixed" ref="inputAreaRef">
          <n-card :bordered="true">
            <n-space vertical :size="12">
              <n-input
                v-model:value="inputText"
                type="textarea"
                placeholder="输入你的问题，Shift+Enter 换行，Enter 发送"
                :disabled="loading.sending || loading.streaming"
                :autosize="{ minRows: 3, maxRows: 6 }"
                @keydown="handleKeydown"
              />

              <n-space justify="space-between" align="center">
                <n-space item-style="display: flex;">
                  <n-switch
                    v-model:value="useKnowledgeBase"
                    :rail-style="switchRailStyle"
                    :handle-style="switchHandleStyle"
                  />
                  使用知识库
                </n-space>

                <n-space :size="8">
                  <n-button
                    round
                    v-if="!loading.streaming"
                    @click="handleSend(true)"
                    :disabled="!canSend"
                    color="#387BE9"
                  >
                    <img
                     :src="sendIcon"
                      alt="发送"
                      style="width: 20px; height: 20px; margin-right: 6px; vertical-align: -3px;">
                    发送
                  </n-button>
                  <n-button
                    round
                    v-else
                    type="error"
                    @click="abortStream"
                  >
                    停止
                  </n-button>
                </n-space>
              </n-space>
            </n-space>
          </n-card>
        </div>
      </n-layout>
    </n-layout>
  </n-config-provider>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, h } from 'vue'
import { useDialog } from 'naive-ui'
import { marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import { chatApi } from '@/api/api'
import clearIcon from '@/assets/icon/cleared.png';
import sendIcon from '@/assets/icon/send.png';

const dialog = useDialog()

const handleKeydown = (e) => {
  // 检查是否是 Enter 键
  if (e.key === 'Enter') {
    // 检查是否同时按下了 Shift 键 (对应 @keydown.enter.shift.exact.stop)
    if (e.shiftKey) {
      // 这是 Shift + Enter
      // 1. 阻止事件冒泡 (实现 .stop)
      e.stopPropagation();
      // 2. 不做任何其他事情，允许 <textarea> 执行其默认行为（即换行）
      return;
    }
    
    // 如果代码运行到这里，说明是单独按下的 Enter 键 (对应 @keydown.enter.exact.prevent)
    // 1. 阻止默认行为 (实现 .prevent)，即阻止 <textarea> 换行
    e.preventDefault();
    
    // 2. 执行你的发送逻辑
    handleSend(true);
  }
}

// 配置 marked 扩展
marked.use(markedHighlight({
  langPrefix: 'hljs language-',
  highlight(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext'
    try {
      return hljs.highlight(code, { language }).value
    } catch (error) {
      console.warn('代码高亮失败:', error)
      return code
    }
  }
}))

// 配置 marked 选项
marked.setOptions({
  breaks: true,
  gfm: true,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  tables: true,
  pedantic: false
})

// Markdown 渲染函数
function renderMarkdown(content) {
  if (!content) return ''
  try {
    return marked.parse(content, {
      async: false,
      walkTokens: (token) => {
        // 对代码块添加复制按钮等额外功能
        if (token.type === 'code') {
          // 可以在这里添加更多功能
        }
      }
    })
  } catch (error) {
    console.error('Markdown渲染失败:', error)
    return content
  }
}

const sessions = ref([])
const activeSessionId = ref('')
const messages = ref([])
const inputText = ref('')
const useKnowledgeBase = ref(true)
const chatBodyRef = ref(null)
const chatBodyBottomRef = ref(null)
const inputAreaRef = ref(null)

const streamingText = ref('')
let streamCtrl = null

// 知识库开关颜色设置
// 自定义轨道样式
function switchRailStyle({ checked, focused }) {
  return {
    background: checked ? '#387BE9' : '#bfbfbf',
    ...(focused && {
      boxShadow: `0 0 0 2px ${checked ? '#387BE940' : '#bfbfbf40'}`
    })
  }
}

// 自定义滑块（把手）样式
function switchHandleStyle({ checked, focused }) {
  return {
    background: checked ? '#387BE9' : '#fff',
    border: 'none', // 移除默认边框
    ...(focused && {
      boxShadow: '0 0 0 2px #387BE940'
    })
  }
}

// 重命名相关状态
const renamingSessionId = ref('')
const newSessionName = ref('')

const loading = reactive({
  sessions: false,
  sending: false,
  streaming: false,
  clearing: false,
})

const canSend = computed(() => !!inputText.value.trim() && !loading.sending)
const activeSessionTitle = computed(() => {
  const found = sessions.value.find(s => s.id === activeSessionId.value)
  return found?.sessionName || '新会话'
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

// 获取会话菜单选项
function getSessionMenuOptions(sessionId) {
  return [
    {
      label: '重命名',
      key: `rename-${sessionId}`,
      icon: () => h('svg', {
        viewBox: '0 0 24 24',
        fill: 'none',
        xmlns: 'http://www.w3.org/2000/svg',
        style: { width: '16px', height: '16px' }
      }, [
        h('path', {
          d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7',
          stroke: 'currentColor',
          'stroke-width': '2',
          fill: 'none',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round'
        }),
        h('path', {
          d: 'm18.5 2.5 a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
          stroke: 'currentColor',
          'stroke-width': '2',
          fill: 'none',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round'
        })
      ])
    },
    {
      label: '删除',
      key: `delete-${sessionId}`,
      icon: () => h('svg', {
        viewBox: '0 0 24 24',
        fill: 'none',
        xmlns: 'http://www.w3.org/2000/svg',
        style: { width: '16px', height: '16px' }
      }, [
        h('path', {
          d: 'M3 6h18',
          stroke: 'currentColor',
          'stroke-width': '2',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round'
        }),
        h('path', {
          d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
          stroke: 'currentColor',
          'stroke-width': '2',
          fill: 'none',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round'
        })
      ])
    }
  ]
}

// 处理会话菜单选择
async function handleSessionMenuSelect(key) {
  const [action, sessionId] = key.split('-')

  if (action === 'delete') {
    await handleDeleteSession(sessionId)
  } else if (action === 'rename') {
    await handleRenameSession(sessionId)
  }
}

function scrollToBottom() {
  nextTick(() => {
    // 直接滚动聊天区域到底部
    const chatBody = chatBodyRef.value
    if (chatBody) {
      chatBody.scrollTop = chatBody.scrollHeight
      return
    }

    // 备用方案：使用scrollIntoView滚动到底部标记
    const bottom = chatBodyBottomRef.value
    if (bottom && typeof bottom.scrollIntoView === 'function') {
      bottom.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  })
}

async function loadSessions() {
  loading.sessions = true
  try {
    const list = await chatApi.getSessions()
    sessions.value = Array.isArray(list) ? list : []
    if (!activeSessionId.value && sessions.value.length > 0) {
      activeSessionId.value = sessions.value[0].id
    }
  } catch (e) {
    console.error('获取会话失败', e)
  } finally {
    loading.sessions = false
  }
}

async function selectSession(id) {
  if (id === activeSessionId.value) return
  activeSessionId.value = id
  await loadSessionDetail(id)
}

async function loadSessionDetail(id) {
  try {
    // 获取会话基本信息
    await chatApi.getSession(id)

    // 获取会话历史消息
    const historyMessages = await chatApi.getSessionMessages(id)
    if (Array.isArray(historyMessages)) {
      // 转换后端消息格式为前端显示格式
      messages.value = historyMessages.map(msg => ({
        role: msg.role,
        message: msg.content,
        timestamp: msg.createdAt,
        fromKnowledgeBase: msg.metadata && msg.metadata.includes('knowledgeBase')
      }))
    } else {
      messages.value = []
    }

    // 多次尝试滚动到底部，确保DOM渲染完成
    await nextTick()
    scrollToBottom()

    // 延迟再次滚动，确保内容完全加载
    setTimeout(() => {
      scrollToBottom()
    }, 100)

    setTimeout(() => {
      scrollToBottom()
    }, 300)
  } catch (e) {
    console.error('获取会话详情失败', e)
    messages.value = []
  }
}

function handleCreateSession() {
  // 不再直接创建会话，只是设置activeSessionId为空，清空消息列表
  // 实际的会话创建将在用户发送消息时进行
  activeSessionId.value = ''
  messages.value = []
}

async function handleDeleteSession(id) {
  try {
    await chatApi.deleteSession(id)
    if (id === activeSessionId.value) {
      activeSessionId.value = ''
      messages.value = []
    }
    await loadSessions()
  } catch (e) {
    console.error('删除会话失败', e)
  }
}

// 处理重命名会话
async function handleRenameSession(sessionId) {
  const session = sessions.value.find(s => s.id == sessionId)
  if (!session) return

  dialog.create({
    title: '重命名会话',
    content: () => {
      return h('div', { style: 'padding: 16px 0;' }, [
        h('div', { style: 'margin-bottom: 12px; color: #6b7280;' }, '请输入新的会话名称：'),
        h('input', {
          id: 'session-name-input',
          type: 'text',
          value: session.sessionName || '未命名会话',
          style: 'width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;',
          onFocus: (e) => e.target.select()
        })
      ])
    },
    positiveText: '确认',
    negativeText: '取消',
    onPositiveClick: async () => {
      const input = document.getElementById('session-name-input')
      const newName = input?.value?.trim()

      if (!newName) {
        return false // 阻止关闭弹窗
      }

      try {
        // 调用重命名API
        await chatApi.updateSession({
          id: String(sessionId),
          sessionName: newName
        })
        // 重新加载会话列表
        await loadSessions()
        return true // 允许关闭弹窗
      } catch (e) {
        console.error('重命名会话失败', e)
        // 这里可以显示错误提示
        return false // 阻止关闭弹窗
      }
    }
  })
}

async function handleClearHistory() {
  if (!activeSessionId.value) return
  loading.clearing = true
  try {
    // 后端未提供清空历史接口，这里仅清空本地消息展示
    await chatApi.deleteSessionMessages(activeSessionId.value)
    messages.value = []
    await loadSessionDetail(activeSessionId.value)
  } catch (e) {
    console.error('清空历史失败', e)
  } finally {
    loading.clearing = false
  }
}

async function handleSend(stream) {
  const text = inputText.value.trim()
  if (!text) return

  if (!activeSessionId.value) {
    try {
      const sess = await chatApi.createSession({ sessionName: `会话 ${sessions.value.length + 1}` })
      activeSessionId.value = sess?.id || ''
      await loadSessions()
      if (!activeSessionId.value) return
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
        sessionId: activeSessionId.value,
        useKnowledgeBase: useKnowledgeBase.value,
      })
      messages.value.push({
        role: 'assistant',
        message: res?.message || '',
        timestamp: res?.timestamp || new Date(),
        fromKnowledgeBase: res?.fromKnowledgeBase,
      })
      if (res?.sessionId && res.sessionId !== activeSessionId.value) {
        activeSessionId.value = res.sessionId
        await loadSessions()
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
        sessionId: activeSessionId.value,
        useKnowledgeBase: useKnowledgeBase.value,
      },
      {
        onMessage(data) {
          if (typeof data === 'string') {
            streamingText.value += data
          } else if (data && typeof data === 'object') {
            if (data.message) streamingText.value += data.message
            if (data.sessionId && data.sessionId !== activeSessionId.value) {
              activeSessionId.value = data.sessionId
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
          loadSessions()
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

  // 保存已经流式输出的内容到消息列表
  if (streamingText.value.trim()) {
    messages.value.push({
      role: 'assistant',
      message: streamingText.value,
      timestamp: new Date()
    })
    scrollToBottom()
  }

  loading.streaming = false
  streamingText.value = ''
}

// 处理代码复制
async function handleCodeCopy(event) {
  const target = event.target
  if (target.tagName === 'CODE' && target.parentElement.tagName === 'PRE') {
    const code = target.textContent
    try {
      await navigator.clipboard.writeText(code)
      // 这里可以显示复制成功的提示
      console.log('代码已复制到剪贴板')
    } catch (error) {
      console.error('复制失败:', error)
      // 降级到旧方法
      fallbackCopy(code)
    }
  }
}

// 降级复制方法
function fallbackCopy(text) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  document.body.appendChild(textarea)
  textarea.select()
  try {
    document.execCommand('copy')
    console.log('代码已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
  } finally {
    document.body.removeChild(textarea)
  }
}

onMounted(async () => {
  await loadSessions()
  if (activeSessionId.value) {
    await loadSessionDetail(activeSessionId.value)
  }
})
</script>

<style scoped>
.chat-layout {
  height: calc(100vh - 8vh);
  box-sizing: border-box;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  padding-bottom: 20px; /* 为固定输入框预留足够空间 */
  min-height: 0; /* 重要：允许flex子元素收缩 */
  background: #f7f8fa;
}

.chat-header {
  padding: 16px;
  background: #ffffff;
  border-radius: 12px;
  margin-bottom: 16px;
  flex-shrink: 0; /* 头部不收缩 */
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}

.chat-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px;
  background: #ffffff;
  border-radius: 12px;
  min-height: 0; /* 重要：允许滚动 */
  margin-bottom: 180px; /* 为底部输入框留出空间 */
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}

.chat-input-fixed {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: #f7f8fa;
  z-index: 100;
}

.active-conversation {
  background: #e8f0fe !important;
  color: #1a73e8 !important;
  font-weight: 600;
  border-radius: 10px;
}

.active-conversation .n-card__header {
  font-weight: 600 !important;
  color: #1a73e8 !important;
}

.message-wrapper {
  display: flex;
  width: 100%;
  margin-bottom: 16px;
}

.message-wrapper.user {
  justify-content: flex-end;
}

.message-wrapper.assistant {
  justify-content: flex-start;
}

.message-card {
  max-width: 80%;
  word-break: break-word;
}

.message-card.user {
  background: #e8f0fe;
  border-radius: 12px;
}

.message-card.assistant {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}

.message-card.streaming {
  border: 1px solid #1a73e8;
  border-radius: 12px;
}

.markdown-content {
  line-height: 1.7;
  font-size: 15px;
  color: var(--n-text-color);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.markdown-content p {
  margin: 12px 0;
  color: var(--n-text-color);
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  margin: 20px 0 12px 0;
  font-weight: 600;
  color: var(--n-text-color);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.markdown-content h1 { font-size: 1.5em; }
.markdown-content h2 { font-size: 1.3em; }
.markdown-content h3 { font-size: 1.2em; }
.markdown-content h4 { font-size: 1.1em; }
.markdown-content h5 { font-size: 1.0em; }
.markdown-content h6 { font-size: 0.9em; }

.markdown-content code {
  background: var(--n-code-color);
  padding: 3px 6px;
  border-radius: 4px;
  font-family: 'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  font-size: 0.9em;
  color: var(--n-text-color);
  border: 1px solid var(--n-border-color);
}

.markdown-content pre {
  background: #f8f9fa;
  padding: 16px 20px;
  border-radius: 12px;
  overflow-x: auto;
  margin: 16px 0;
  border: 1px solid #e5e7eb;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  line-height: 1.5;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}

.markdown-content pre:hover {
  border-color: #1a73e8;
  background: #f8f9fa;
}

.markdown-content pre::after {
  content: '点击复制';
  position: absolute;
  top: 8px;
  right: 12px;
  font-size: 12px;
  color: var(--n-text-color-depth-3);
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.markdown-content pre:hover::after {
  opacity: 1;
}

.markdown-content pre code {
  background: transparent;
  padding: 0;
  color: inherit;
}

.markdown-content blockquote {
  border-left: 4px solid #1a73e8;
  padding-left: 16px;
  margin: 16px 0;
  color: var(--n-text-color-depth-2);
  font-style: italic;
  background: #ffffff;
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}

/* 列表缩进设置 */
:deep(.markdown-content ul),
:deep(.markdown-content ol) {
  margin-left: 40px !important;
  padding-left: 20px !important;
  margin-top: 12px !important;
  margin-bottom: 12px !important;
  line-height: 1.6 !important;
  text-indent: 0 !important;
  list-style-position: outside !important;
}

:deep(.markdown-content li) {
  margin: 6px 0 !important;
  line-height: 1.6 !important;
  position: relative !important;
  text-indent: 0 !important;
}

.markdown-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
  font-size: 14px;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.markdown-content th,
.markdown-content td {
  border: 1px solid var(--n-border-color);
  padding: 10px 16px;
  text-align: left;
  line-height: 1.5;
}

.markdown-content th {
  background: var(--n-table-header-color);
  font-weight: 600;
}

.markdown-content a {
  color: #1a73e8;
  text-decoration: none;
}

.markdown-content a:hover {
  text-decoration: underline;
}

.markdown-content img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

.user-message {
  line-height: 1.7;
  font-size: 15px;
  color: var(--n-text-color);
  white-space: pre-wrap;
  word-break: break-word;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

/* 代码高亮主题适配 */
.markdown-content .hljs {
  background: var(--n-code-color) !important;
  color: var(--n-text-color) !important;
  border-radius: 8px;
}

/* 流式响应动画 */
.message-card.streaming {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}
/* NaiveUI 输入框圆角样式 */
:deep(.n-input) {
  border-radius: 12px !important;
}

:deep(.n-input__input-el) {
  border-radius: 12px !important;
}

:deep(.n-input--textarea .n-input__input-el) {
  border-radius: 12px !important;
}

/* NaiveUI 卡片圆角样式 */
:deep(.n-card) {
  border-radius: 12px !important;
}

/* 隐藏会话列表滚动条 - 最终方案 */
.session-list-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  scrollbar-width: none !important; /* Firefox */
  -ms-overflow-style: none !important; /* Internet Explorer 10+ */
}

.session-list-wrapper::-webkit-scrollbar {
  display: none !important; /* WebKit */
  width: 0 !important;
  height: 0 !important;
}

.session-cards {
  padding-right: 2px; /* 防止内容贴边 */
}
</style>