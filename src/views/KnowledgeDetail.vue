<template>
  <div class="kb-detail">
    <!-- 头部区域 -->
    <div class="header">
      <div class="title-wrap">
        <button class="back-btn" @click="goBack">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>返回</span>
        </button>
        <div class="title-content">
          <div class="title-row">
            <svg class="kb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h2 class="title">{{ kb?.name || '知识库' }}</h2>
            <span class="file-count" v-if="files.length > 0">{{ files.length }} 个文件</span>
          </div>
          <p class="description" v-if="kb?.description">{{ kb.description }}</p>
        </div>
      </div>

      <div class="tools">
        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8" stroke-width="2"/>
            <path d="M21 21l-4.35-4.35" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <input
            v-model="keyword"
            type="text"
            placeholder="搜索文件名..."
            @keyup.enter="loadFiles"
            class="search-input"
          />
        </div>
        <button class="refresh-btn" @click="loadFiles" :disabled="loading">
          <svg class="icon" :class="{ spinning: loading }" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>刷新</span>
        </button>
        <button class="primary-btn" @click="showUploadModal = true">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 4v16m8-8H4" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span>上传文件</span>
        </button>
      </div>
    </div>

    <!-- 文件列表卡片 -->
    <div class="card">
      <div class="table-wrap" v-if="!loading && files.length > 0">
        <table class="table">
          <thead>
            <tr>
              <th style="width: 35%;">文件名</th>
              <th style="width: 10%;">大小</th>
              <th style="width: 9%;">类型</th>
              <th style="width: 16%;">上传时间</th>
              <th style="width: 10%;">状态</th>
              <th style="width: 8%;">可见性</th>
              <th style="width: 12%;">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="file in files" :key="file.id" class="file-row" :class="{ 'row-canceled': isCanceledStatus(file.status) }">
              <td class="name-cell">
                <div class="file-info">
                  <div class="file-icon" :class="`type-${file.type}`">
                    <svg v-if="['pdf'].includes(file.type)" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
                      <path d="M14 2v6h6M10 13h4m-4 4h4m-7-8h1" stroke="white" stroke-width="1"/>
                    </svg>
                    <svg v-else-if="['doc', 'docx'].includes(file.type)" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
                    </svg>
                    <svg v-else-if="['txt', 'md'].includes(file.type)" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
                    </svg>
                  </div>
                  <div class="file-text">
                    <div class="name">{{ file.name }}</div>
                  </div>
                </div>
              </td>
              <td class="size-cell">{{ file.size }}</td>
              <td>
                <span class="type-tag">{{ file.type || '-' }}</span>
              </td>
              <td class="time-cell">{{ formatTime(file.uploadTime) }}</td>
              <td>
                <span class="status-tag" :class="`status-${file.status}`">
                  {{ getStatusText(file.status) }}
                </span>
              </td>
              <td>
                <span class="visibility-tag" :class="{ public: file.isPublic }">
                  <svg class="tag-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path v-if="file.isPublic" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path v-else d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  {{ file.isPublic ? '公开' : '私有' }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="action-btn preview-btn" title="预览" @click="openDetail(file)" :disabled="isCanceledStatus(file.status)">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke-width="2"/>
                      <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke-width="2"/>
                    </svg>
                  </button>
                  <button class="action-btn download-btn" @click="handleDownload(file)" title="下载" :disabled="isCanceledStatus(file.status)">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                  <button class="action-btn delete-btn" @click="handleDelete(file)" title="删除文件">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Loading 状态 -->
      <div v-else-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h3>还没有文件</h3>
        <p>点击"上传文件"按钮添加您的第一个文件</p>
        <button class="primary-btn" @click="showUploadModal = true" style="margin-top: 16px;">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 4v16m8-8H4" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span>上传文件</span>
        </button>
      </div>
    </div>

    <FileUploadModal
      v-model:show="showUploadModal"
      :knowledgeBaseId="kbId"
      @uploaded="handleFileUploaded"
    />
    <n-modal v-model:show="detailVisible" preset="dialog" :title="currentFile ? `文件详情 - ${currentFile.name}` : '文件详情'" style="width: 800px;">
      <div v-if="detailLoading" class="loading-state">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>
      <div v-else class="detail-modal-content">
        <div v-if="chunkDetails.length === 0" class="empty-state">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <h3>暂无分片内容</h3>
          <p>该文件未返回分片文本</p>
        </div>
        <div v-else style="display: flex; flex-direction: column; gap: 12px;">
          <div v-for="chunk in chunkDetails" :key="chunk.chunkIndex" class="chunk-card">
            <div class="chunk-header">
              <span class="chunk-index">分片 #{{ chunk.chunkIndex }}</span>
            </div>
            <div class="chunk-text">{{ chunk.chunkText }}</div>
          </div>
        </div>
      </div>
      <template #action>
        <button class="refresh-btn" @click="detailVisible = false">
          <span>关闭</span>
        </button>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDialog, useMessage } from 'naive-ui'
import { knowledgeBaseApi } from '@/api/knowledgeBaseApi'
import { fileApi } from '@/api/fileApi'
import FileUploadModal from '@/components/FileUploadModal.vue'

const route = useRoute()
const router = useRouter()
const dialog = useDialog()
const message = useMessage()
const kbId = ref(route.params.id)

const kb = ref(null)
const keyword = ref('')
const files = ref([])
const loading = ref(false)
const showUploadModal = ref(false)
const detailVisible = ref(false)
const detailLoading = ref(false)
const chunkDetails = ref([])
const currentFile = ref(null)

function goBack() {
  router.push({ name: 'Knowledge' })
}

function formatTime(t) {
  if (!t) return '-'
  try {
    const d = typeof t === 'string' ? new Date(t) : t
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    const ss = String(d.getSeconds()).padStart(2, '0')
    return `${y}-${m}-${day} ${hh}:${mm}:${ss}`
  } catch {
    return '-'
  }
}

function guessTypeFromName(name) {
  if (!name) return '-'
  const idx = name.lastIndexOf('.')
  if (idx === -1) return '-'
  return name.substring(idx + 1).toLowerCase()
}

function getStatusText(status) {
  const statusMap = {
    'pending': '待处理',
    'processing': '处理中',
    'completed': '已完成',
    'failed': '失败',
    'success': '成功'
  }
  return statusMap[status] || status || '-'
}

function isCanceledStatus(status) {
  if (!status) return false
  const s = String(status).toLowerCase()
  return s.includes('cancel') || String(status).includes('取消')
}

async function loadKb() {
  try {
    kb.value = await knowledgeBaseApi.getKnowledgeBaseById(kbId.value)
  } catch (e) {
    kb.value = null
  }
}

async function loadFiles() {
  loading.value = true
  try {
    const params = {}
    const list = await knowledgeBaseApi.listFilesByKnowledgeBaseId(kbId.value, params)
    let mapped = Array.isArray(list) ? list.map(vo => ({
      id: vo.id,
      md5: vo.fileMd5,
      name: vo.fileName,
      size: vo.totalSize,
      type: guessTypeFromName(vo.fileName),
      uploadTime: vo.createdAt,
      status: vo.status,
      isPublic: vo.isPublic,
      knowledgeBaseName: vo.knowledgeBaseName,
      orgTag: vo.orgTag,
    })) : []
    if (keyword.value) {
      mapped = mapped.filter(f => f.name?.includes(keyword.value))
    }
    files.value = mapped
  } catch (e) {
    files.value = []
  } finally {
    loading.value = false
  }
}

function handleFileUploaded() {
  loadFiles()
}

function handleDelete(file) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除文件 "${file.name}" 吗？此操作无法撤销。`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await fileApi.deleteFile(file.id)
        message.success('文件删除成功')
        loadFiles()
      } catch (error) {
        message.error(error.message || '删除文件失败')
      }
    }
  })
}

async function handleDownload(file) {
  try {
    const downloadUrl = await fileApi.downloadFile(file.id)
    // 创建隐藏的 a 标签进行下载
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = file.name || '下载文件'
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    message.success('开始下载文件')
  } catch (error) {
    message.error(error.message || '下载文件失败')
  }
}

async function openDetail(file) {
  detailVisible.value = true
  detailLoading.value = true
  currentFile.value = file || null
  try {
    const list = await fileApi.getFileDetail(file.id)
    chunkDetails.value = Array.isArray(list) ? list : []
  } catch (error) {
    message.error(error.message || '获取文件详情失败')
    chunkDetails.value = []
  } finally {
    detailLoading.value = false
  }
}

watch(() => route.params.id, (id) => {
  kbId.value = id
  loadKb()
  loadFiles()
})

onMounted(() => {
  loadKb()
  loadFiles()
})
</script>

<style scoped>
.kb-detail {
  height: calc(100vh - 8vh);
  padding: 24px 32px;
  box-sizing: border-box;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

/* 头部区域 */
.header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 20px;
}

.title-wrap {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 16px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
  font-weight: 500;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.back-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.back-btn .icon {
  width: 18px;
  height: 18px;
}

.title-content {
  flex: 1;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.kb-icon {
  width: 28px;
  height: 28px;
  color: #1a73e8;
}

.title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.5px;
}

.file-count {
  padding: 4px 12px;
  background: linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%);
  color: #1e40af;
  font-size: 13px;
  font-weight: 600;
  border-radius: 20px;
  border: 1px solid #bfdbfe;
}

.description {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.6;
  max-width: 600px;
}

/* 工具栏 */
.tools {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  width: 18px;
  height: 18px;
  color: #9ca3af;
  pointer-events: none;
}

.search-input {
  height: 38px;
  padding: 0 12px 0 38px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  outline: none;
  font-size: 14px;
  width: 240px;
  background: white;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.search-input:focus {
  border-color: #1a73e8;
  box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 16px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
  font-weight: 500;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.refresh-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-btn .icon {
  width: 18px;
  height: 18px;
}

.primary-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 20px;
  border: none;
  background: #1a73e8;
  color: white;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(26, 115, 232, 0.3);
}

.primary-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(26, 115, 232, 0.4);
  background: #1557b0;
}

.primary-btn .icon {
  width: 18px;
  height: 18px;
}

/* 卡片 */
.card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  height: calc(100% - 90px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.table-wrap {
  overflow: auto;
  flex: 1;
}

/* 表格样式 */
.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.table thead th {
  position: sticky;
  top: 0;
  z-index: 10;
  text-align: left;
  background: linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%);
  color: #6b7280;
  font-weight: 700;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 14px 16px;
  border-bottom: 2px solid #e5e7eb;
}

.table tbody td {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
  color: #374151;
  font-size: 14px;
  vertical-align: middle;
}

.file-row {
  transition: all 0.2s;
}

.file-row:hover {
  background: #f9fafb;
}
.file-row.row-canceled {
  opacity: 0.6;
  background: #f3f4f6;
}
.file-row.row-canceled:hover {
  background: #f3f4f6;
}

/* 文件信息 */
.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.file-icon svg {
  width: 20px;
  height: 20px;
}

.file-icon.type-pdf {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.file-icon.type-doc,
.file-icon.type-docx {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.file-icon.type-txt,
.file-icon.type-md {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.file-icon:not([class*="type-"]) {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
}

.file-text {
  flex: 1;
  min-width: 0;
}

.name-cell .name {
  font-weight: 600;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.size-cell {
  color: #6b7280;
  font-weight: 500;
}

.time-cell {
  color: #6b7280;
  font-size: 13px;
}

/* 标签样式 */
.type-tag {
  display: inline-block;
  padding: 4px 10px;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
  text-transform: uppercase;
}

.status-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid;
  white-space: nowrap;
  word-break: keep-all;
  line-height: 1;
  gap: 6px;
}

.status-tag.status-pending {
  background: #fef3c7;
  color: #92400e;
  border-color: #fbbf24;
}

.status-tag.status-processing {
  background: #dbeafe;
  color: #1e40af;
  border-color: #60a5fa;
}

.status-tag.status-completed,
.status-tag.status-success {
  background: #d1fae5;
  color: #065f46;
  border-color: #34d399;
}

.status-tag.status-failed {
  background: #fee2e2;
  color: #991b1b;
  border-color: #f87171;
}

.visibility-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: #fef3c7;
  color: #92400e;
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
  border: 1px solid #fbbf24;
  white-space: nowrap;
  word-break: keep-all;
  line-height: 1;
}

.visibility-tag.public {
  background: #d1fae5;
  color: #065f46;
  border-color: #34d399;
}

.visibility-tag .tag-icon {
  width: 14px;
  height: 14px;
}

/* 删除按钮 */
.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn .icon {
  width: 16px;
  height: 16px;
  color: #6b7280;
}

.action-btn:hover {
  border-color: #1a73e8;
  background: #f0f7ff;
  transform: translateY(-1px);
}

.action-btn:hover .icon {
  color: #1a73e8;
}

.action-btn.delete-btn {
  border-color: #fecaca;
  background: #fef2f2;
}

.action-btn.delete-btn .icon {
  color: #dc2626;
}

.action-btn.delete-btn:hover {
  background: #fee2e2;
  border-color: #fca5a5;
}

.action-btn.delete-btn:hover .icon {
  color: #dc2626;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* Loading 状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6b7280;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #1a73e8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.spinning {
  animation: spin 0.8s linear infinite;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 40px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  color: #d1d5db;
  margin-bottom: 20px;
  stroke-width: 1.5;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 700;
  color: #374151;
}

.empty-state p {
  margin: 0;
  color: #9ca3af;
  font-size: 14px;
}

.detail-modal-content {
  max-height: 60vh;
  overflow-y: auto;
}

.chunk-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px 14px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}

.chunk-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.chunk-index {
  font-weight: 700;
  color: #1a73e8;
}

.chunk-text {
  white-space: pre-wrap;
  word-break: break-word;
  color: #374151;
  line-height: 1.6;
}

/* 响应式 */
@media (max-width: 1200px) {
  .kb-detail {
    padding: 16px 20px;
  }

  .header {
    flex-direction: column;
    align-items: stretch;
  }

  .tools {
    justify-content: flex-end;
  }

  .search-input {
    width: 200px;
  }
}
</style>