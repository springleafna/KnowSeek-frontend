<template>
  <div class="file-list-container">
    <!-- 头部区域 -->
    <div class="header">
      <div class="title-section">
        <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div class="title-content">
          <h1>文件管理</h1>
          <p class="subtitle">管理和查看所有上传的文件</p>
        </div>
      </div>

      <div class="header-right">
        <!-- 文件名搜索框 -->
        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8" stroke-width="2"/>
            <path d="M21 21l-4.35-4.35" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="搜索文件名..."
            v-model="queryParams.fileName"
            @keyup.enter="handleSearch"
            class="search-input"
          />
        </div>
        <!-- 知识库搜索框 -->
        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8" stroke-width="2"/>
            <path d="M21 21l-4.35-4.35" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="搜索知识库..."
            v-model="queryParams.kbName"
            @keyup.enter="handleSearch"
            class="search-input"
          />
        </div>
        <button class="refresh-btn" @click="fetchFileList" :disabled="loading">
          <svg class="btn-icon" :class="{ spinning: loading }" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>刷新</span>
        </button>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-container">
      <table class="file-table" v-if="!loading && fileList.length > 0">
        <thead>
          <tr>
            <th @click="handleSortChange('fileName')" class="sortable">
              文件名
              <svg class="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M7 15l5 5 5-5M7 9l5-5 5 5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </th>
            <th @click="handleSortChange('knowledgeBaseName')" class="sortable">
              知识库
              <svg class="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M7 15l5 5 5-5M7 9l5-5 5 5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </th>
            <th @click="handleSortChange('totalSize')" class="sortable">
              大小
              <svg class="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M7 15l5 5 5-5M7 9l5-5 5 5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </th>
            <th @click="handleSortChange('type')" class="sortable">
              类型
              <svg class="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M7 15l5 5 5-5M7 9l5-5 5 5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </th>
            <th @click="handleSortChange('createdAt')" class="sortable">
              上传时间
              <svg class="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M7 15l5 5 5-5M7 9l5-5 5 5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </th>
            <th @click="handleSortChange('status')" class="sortable">
              状态
              <svg class="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M7 15l5 5 5-5M7 9l5-5 5 5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="file in fileList" :key="file.id" class="file-row">
            <td>
              <div class="file-name-cell">
                <div class="file-icon-wrapper" :class="getFileIconClass(file.fileName)">
                  <svg class="file-svg-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
                  </svg>
                </div>
                <span class="file-name-text">{{ file.fileName }}</span>
              </div>
            </td>
            <td>
              <span class="kb-badge">{{ file.knowledgeBaseName }}</span>
            </td>
            <td class="size-cell">{{ file.totalSize }}</td>
            <td>
              <span class="type-tag">{{ getFileType(file.fileName) }}</span>
            </td>
            <td class="time-cell">{{ formatDateTime(file.createdAt) }}</td>
            <td>
              <span :class="['status-badge', getStatusClass(file.status)]">
                {{ file.status }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button class="action-btn preview-btn" title="预览">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke-width="2"/>
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke-width="2"/>
                  </svg>
                </button>
                <button class="action-btn download-btn" title="下载">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

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
        <h3>暂无文件</h3>
        <p>还没有上传任何文件</p>
      </div>
    </div>

    <!-- 底部和分页 -->
    <div class="footer" v-if="fileList.length > 0">
      <div class="footer-info">{{ paginationInfoText }}</div>
      <n-pagination
        :item-count="pagination.total"
        v-model:page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[5, 10, 20, 50]"
        show-size-picker
        @update:page="handlePageUpdate"
        @update:page-size="handlePageSizeUpdate"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { fileApi } from '@/api/fileApi';
import { NPagination, useMessage } from 'naive-ui';

// --- 初始化 ---
const message = useMessage();

// --- 响应式状态定义 ---
const fileList = ref([]);
const loading = ref(false);

const pagination = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

const queryParams = ref({
  fileName: '',
  kbName: '',
  sortBy: 'createdAt',
  sortOrder: 'desc'
});

// --- 计算属性 ---
const paginationInfoText = computed(() => {
  if (pagination.value.total === 0) return '共 0 条';
  const start = (pagination.value.pageNum - 1) * pagination.value.pageSize + 1;
  const end = Math.min(start + pagination.value.pageSize - 1, pagination.value.total);
  return `显示 ${start} 到 ${end} 条，共 ${pagination.value.total} 条`;
});

// --- 方法定义 ---

async function fetchFileList() {
  loading.value = true;
  try {
    const params = { ...pagination.value, ...queryParams.value };
    const responseData = await fileApi.getFileList(params);
    fileList.value = responseData.list;
    pagination.value.total = responseData.total;
  } catch (error) {
    console.error("请求文件列表时发生异常:", error);
    fileList.value = [];
    pagination.value.total = 0;
    message.error("获取文件列表失败，请稍后重试");
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  pagination.value.pageNum = 1;
  fetchFileList();
}

function handleSortChange(column) {
  if (queryParams.value.sortBy === column) {
    queryParams.value.sortOrder = queryParams.value.sortOrder === 'asc' ? 'desc' : 'asc';
  } else {
    queryParams.value.sortBy = column;
    queryParams.value.sortOrder = 'desc';
  }
  fetchFileList();
}

function handlePageUpdate(newPage) {
  pagination.value.pageNum = newPage;
  fetchFileList();
}

function handlePageSizeUpdate(newPageSize) {
  pagination.value.pageSize = newPageSize;
  pagination.value.pageNum = 1;
  fetchFileList();
}

function getFileIconClass(fileName) {
  if (!fileName) return 'icon-default';
  const extension = fileName.split('.').pop().toLowerCase();
  switch (extension) {
    case 'pdf': return 'icon-pdf';
    case 'xlsx': case 'xls': return 'icon-excel';
    case 'docx': case 'doc': return 'icon-word';
    case 'pptx': case 'ppt': return 'icon-ppt';
    case 'jpg': case 'jpeg': case 'png': case 'gif': return 'icon-image';
    case 'txt': case 'md': return 'icon-text';
    default: return 'icon-default';
  }
}

function getFileType(fileName) {
  if (!fileName) return '-';
  const extension = fileName.split('.').pop().toLowerCase();
  return extension.toUpperCase();
}

function getStatusClass(status) {
  if (status === '处理中') return 'status-processing';
  if (status === '上传完成' || status === '处理完成') return 'status-completed';
  if (status === '失败') return 'status-failed';
  return 'status-default';
}

function formatDateTime(dateTimeStr) {
  if (!dateTimeStr) return '-';
  try {
    const date = new Date(dateTimeStr);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${d} ${hh}:${mm}`;
  } catch {
    return dateTimeStr;
  }
}

onMounted(() => {
  fetchFileList();
});
</script>

<style scoped>
.file-list-container {
  height: calc(100vh - 8vh);
  padding: 24px 32px;
  box-sizing: border-box;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  flex-direction: column;
}

/* 头部样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-icon {
  width: 32px;
  height: 32px;
  color: #1a73e8;
  flex-shrink: 0;
}

.title-content h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: #111827;
  letter-spacing: -0.5px;
}

.subtitle {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 搜索框 */
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
  width: 200px;
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

.btn-icon {
  width: 18px;
  height: 18px;
}

.spinning {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 表格容器 */
.table-container {
  position: relative;
  flex: 1;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
}

.file-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.file-table thead th {
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
  white-space: nowrap;
}

.file-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: all 0.2s;
}

.file-table th.sortable:hover {
  background: linear-gradient(180deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #1a73e8;
}

.sort-icon {
  width: 14px;
  height: 14px;
  display: inline-block;
  margin-left: 4px;
  opacity: 0.5;
  vertical-align: middle;
}

.file-table tbody td {
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

/* 文件名单元格 */
.file-name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 400px;
}

.file-icon-wrapper {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.file-svg-icon {
  width: 20px;
  height: 20px;
}

.icon-pdf {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.icon-excel {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.icon-word {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.icon-ppt {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.icon-image {
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
  color: white;
}

.icon-text {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.icon-default {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
}

.file-name-text {
  font-weight: 600;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

/* 知识库徽章 */
.kb-badge {
  display: inline-block;
  padding: 4px 12px;
  background: linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%);
  color: #1e40af;
  font-size: 13px;
  font-weight: 600;
  border-radius: 6px;
  border: 1px solid #bfdbfe;
}

.size-cell {
  color: #6b7280;
  font-weight: 500;
}

.time-cell {
  color: #6b7280;
  font-size: 13px;
}

/* 类型标签 */
.type-tag {
  display: inline-block;
  padding: 4px 10px;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
}

/* 状态标签 */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid;
}

.status-processing {
  background: #dbeafe;
  color: #1e40af;
  border-color: #60a5fa;
}

.status-completed {
  background: #d1fae5;
  color: #065f46;
  border-color: #34d399;
}

.status-failed {
  background: #fee2e2;
  color: #991b1b;
  border-color: #f87171;
}

.status-default {
  background: #f3f4f6;
  color: #6b7280;
  border-color: #d1d5db;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  padding: 0;
}

.action-btn svg {
  width: 16px;
  height: 16px;
  color: #6b7280;
}

.action-btn:hover {
  border-color: #1a73e8;
  background: #f0f7ff;
  transform: translateY(-1px);
}

.action-btn:hover svg {
  color: #1a73e8;
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

/* 底部和分页 */
.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  flex-shrink: 0;
}

.footer-info {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

/* Naive UI 分页样式覆盖 */
:deep(.n-pagination .n-pagination-item) {
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s;
}

:deep(.n-pagination .n-pagination-item:hover) {
  border-color: #1a73e8;
  color: #1a73e8;
  transform: translateY(-1px);
}

:deep(.n-pagination .n-pagination-item--active) {
  background: linear-gradient(135deg, #1a73e8 0%, #1557b0 100%);
  color: #fff;
  border-color: #1a73e8;
  box-shadow: 0 2px 4px rgba(26, 115, 232, 0.3);
}

:deep(.n-pagination .n-pagination-quick-jumper) {
  color: #6b7280;
}

:deep(.n-pagination .n-input) {
  border-radius: 8px;
}

:deep(.n-pagination .n-select) {
  --n-border: 1px solid #e5e7eb !important;
  --n-border-hover: 1px solid #1a73e8 !important;
  --n-border-active: 1px solid #1a73e8 !important;
  --n-border-focus: 1px solid #1a73e8 !important;
  --n-box-shadow-focus: 0 0 0 2px rgba(26, 115, 232, 0.2) !important;
  --n-border-radius: 8px !important;
}

/* 响应式 */
@media (max-width: 1400px) {
  .file-list-container {
    padding: 16px 20px;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-right {
    width: 100%;
    justify-content: flex-end;
  }

  .search-input {
    width: 160px;
  }
}

@media (max-width: 768px) {
  .file-name-cell {
    max-width: 200px;
  }
}
</style>