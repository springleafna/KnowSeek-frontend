<template>
  <n-config-provider :theme="null">
    <n-layout class="chat-layout" has-sider>
      <n-layout-sider
        bordered
        collapse-mode="width"
        :collapsed-width="0"
        :width="300"
        show-trigger
        content-style="padding: 16px; display: flex; flex-direction: column;"
      >
        <n-space vertical :size="16" style="flex: 1; min-height: 0;">
          <n-space justify="space-between" align="center">
            <n-h3 :depth="3" style="margin: 0;">会话</n-h3>
            <n-button
              type="primary"
              size="small"
              @click="handleCreateConversation"
              :loading="loading.conversations"
            >
              新建
            </n-button>
          </n-space>
          
          <n-scrollbar style="flex: 1;">
            <n-spin :show="loading.conversations">
              <n-space vertical :size="8" v-if="!loading.conversations">
                <n-card
                  v-for="item in conversations"
                  :key="item.conversationId"
                  size="small"
                  hoverable
                  :class="{ 'active-conversation': item.conversationId === activeConversationId }"
                  @click="selectConversation(item.conversationId)"
                  style="cursor: pointer;"
                >
                  <template #header>
                    <n-ellipsis>{{ item.title || '未命名会话' }}</n-ellipsis>
                  </template>
                  <template #header-extra>
                    <n-button
                      text
                      type="error"
                      size="tiny"
                      @click.stop="handleDeleteConversation(item.conversationId)"
                    >
                      删除
                    </n-button>
                  </template>
                  <n-space vertical :size="4">
                    <n-ellipsis>{{ item.lastMessage || '暂无消息' }}</n-ellipsis>
                    <n-text depth="3" :style="{ fontSize: '12px' }">
                      {{ formatTime(item.lastMessageTime || item.createTime) }}
                    </n-text>
                  </n-space>
                </n-card>
                
                <n-empty v-if="conversations.length === 0" description="暂无会话，点击「新建」开始" />
              </n-space>
            </n-spin>
          </n-scrollbar>
        </n-space>
      </n-layout-sider>

      <n-layout content-style="display: flex; flex-direction: column; padding: 16px;">
        <n-card style="flex: 1; display: flex; flex-direction: column;" :bordered="false">
          <template #header>
            <n-space justify="space-between" align="center">
              <n-h3 :depth="3" style="margin: 0;">{{ activeConversationTitle }}</n-h3>
              <n-button
                ghost
                @click="handleClearHistory"
                :disabled="!activeConversationId"
                :loading="loading.clearing"
              >
                清空
              </n-button>
            </n-space>
          </template>

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

          <template #footer>
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
                <n-checkbox v-model:checked="useKnowledgeBase">
                  使用知识库
                </n-checkbox>
                
                <n-space :size="8">
                  <n-button
                    type="primary"
                    @click="handleSend(false)"
                    :disabled="!canSend"
                    :loading="loading.sending"
                  >
                    发送
                  </n-button>
                  <n-button
                    v-if="!loading.streaming"
                    @click="handleSend(true)"
                    :disabled="!canSend"
                  >
                    流式发送
                  </n-button>
                  <n-button
                    v-else
                    type="error"
                    @click="abortStream"
                  >
                    停止
                  </n-button>
                </n-space>
              </n-space>
            </n-space>
          </template>
        </n-card>
      </n-layout>
    </n-layout>
  </n-config-provider>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { 
  NConfigProvider, NLayout, NLayoutSider, NCard, NButton, NInput, 
  NSpace, NH3, NScrollbar, NSpin, NEllipsis, NText, NEmpty, 
  NCheckbox, NTag
} from 'naive-ui'
import { marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import { chatApi } from '@/api/api'

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
    handleSend(false);
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

const conversations = ref([])
const activeConversationId = ref('')
const messages = ref([])
const inputText = ref('')
const useKnowledgeBase = ref(true)
const chatBodyRef = ref(null)
const chatBodyBottomRef = ref(null)

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
    const bottom = chatBodyBottomRef.value
    if (bottom && typeof bottom.scrollIntoView === 'function') {
      bottom.scrollIntoView({ behavior: 'smooth', block: 'end' })
      return
    }
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
  await loadConversations()
  if (activeConversationId.value) {
    await loadConversationDetail(activeConversationId.value)
  }
})
</script>

<style scoped>
.chat-layout {
  height: calc(100vh - 64px);
  box-sizing: border-box;
}

.active-conversation {
  background: var(--n-item-color-hover) !important;
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
  background: var(--n-color-primary-popover);
}

.message-card.assistant {
  background: var(--n-card-color);
}

.message-card.streaming {
  border: 1px solid var(--n-color-primary);
}

.chat-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px;
  background: var(--n-body-color);
  min-height: 0;
  max-height: 100%;
}

.markdown-content {
  line-height: 1.6;
  font-size: 14px;
  color: var(--n-text-color);
}

.markdown-content p {
  margin: 8px 0;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  margin: 16px 0 8px 0;
  font-weight: 600;
  color: var(--n-text-color);
}

.markdown-content h1 { font-size: 1.5em; }
.markdown-content h2 { font-size: 1.3em; }
.markdown-content h3 { font-size: 1.2em; }
.markdown-content h4 { font-size: 1.1em; }
.markdown-content h5 { font-size: 1.0em; }
.markdown-content h6 { font-size: 0.9em; }

.markdown-content code {
  background: var(--n-code-color);
  padding: 2px 4px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9em;
  color: var(--n-text-color);
}

.markdown-content pre {
  background: var(--n-code-color);
  padding: 12px 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 12px 0;
  border: 1px solid var(--n-border-color);
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.markdown-content pre:hover {
  border-color: var(--n-color-primary);
  background: var(--n-code-color);
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
  border-left: 4px solid var(--n-color-primary);
  padding-left: 12px;
  margin: 12px 0;
  color: var(--n-text-color-depth-2);
  font-style: italic;
}

.markdown-content ul,
.markdown-content ol {
  padding-left: 20px;
  margin: 8px 0;
}

.markdown-content li {
  margin: 4px 0;
}

.markdown-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 12px 0;
}

.markdown-content th,
.markdown-content td {
  border: 1px solid var(--n-border-color);
  padding: 8px 12px;
  text-align: left;
}

.markdown-content th {
  background: var(--n-table-header-color);
  font-weight: 600;
}

.markdown-content a {
  color: var(--n-color-primary);
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
  line-height: 1.6;
  font-size: 14px;
  color: var(--n-text-color);
  white-space: pre-wrap;
  word-break: break-word;
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

/* 滚动条样式 */
.chat-body::-webkit-scrollbar {
  width: 6px;
}

.chat-body::-webkit-scrollbar-track {
  background: transparent;
}

.chat-body::-webkit-scrollbar-thumb {
  background: var(--n-scrollbar-color);
  border-radius: 3px;
}

.chat-body::-webkit-scrollbar-thumb:hover {
  background: var(--n-scrollbar-color-hover);
}
</style> 