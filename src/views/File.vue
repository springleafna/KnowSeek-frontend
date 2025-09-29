<template>
  <div class="file-list-container">
    <!-- 头部区域 -->
    <div class="header">
      <h1>文件列表</h1>
      <div class="header-right">
        <!-- 文件名搜索框 -->
        <div class="search-box">
          <img :src="searchIcon" alt="search" class="search-icon" />
          <input 
            type="text" 
            placeholder="搜索文件名..." 
            v-model="queryParams.fileName"
            @keyup.enter="handleSearch"
          />
        </div>
        <!-- 知识库搜索框 -->
        <div class="search-box">
          <img :src="searchIcon" alt="search" class="search-icon" />
          <input 
            type="text" 
            placeholder="搜索知识库..." 
            v-model="queryParams.kbName"
            @keyup.enter="handleSearch"
          />
        </div>
        <button class="refresh-btn" @click="fetchFileList">
          <img :src="refreshIcon" alt="refresh" class="refresh-icon" />
          <span>刷新</span>
        </button>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-container">
      <table class="file-table">
        <thead>
          <tr>
            <th @click="handleSortChange('fileName')">
              文件名
              <span class="sort-icon">▲▼</span>
            </th>
            <th @click="handleSortChange('knowledgeBaseName')">
              知识库
              <span class="sort-icon">▲▼</span>
            </th>
            <th @click="handleSortChange('totalSize')">
              大小
              <span class="sort-icon">▲▼</span>
            </th>
            <th @click="handleSortChange('type')">
              类型
              <span class="sort-icon">▲▼</span>
            </th>
            <th @click="handleSortChange('createdAt')">
              上传时间
              <span class="sort-icon">▲▼</span>
            </th>
            <th @click="handleSortChange('status')">
              状态
              <span class="sort-icon">▲▼</span>
            </th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!loading && fileList.length === 0">
            <td colspan="7" class="empty-cell">暂无文件</td>
          </tr>
          <tr v-for="file in fileList" :key="file.id">
            <td>
              <div class="file-name-cell">
                <img :src="getFileIcon(file.fileName)" alt="file-icon" class="file-icon" />
                <span class="file-name-text">{{ file.fileName }}</span>
              </div>
            </td>
            <td>{{ file.knowledgeBaseName }}</td>
            <td>{{ file.totalSize }}</td>
            <td>{{ file.type }}</td>
            <td>{{ formatDateTime(file.createdAt) }}</td>
            <td>
              <span :class="['status-badge', getStatusClass(file.status)]">
                {{ file.status }}
              </span>
            </td>
            <td>
              <div class="action-icons">
                <img :src="previewIcon" alt="preview" title="预览（暂未实现）" />
                <img :src="downloadIcon" alt="download" title="下载（暂未实现）" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 底部和分页 -->
    <div class="footer">
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

// --- 静态资源导入 ---
import searchIcon from '@/assets/file/search.png';
import refreshIcon from '@/assets/file/refresh.png';
import pdfIcon from '@/assets/file/pdf.png';
import xlsxIcon from '@/assets/file/xlsx.png';
import docxIcon from '@/assets/file/docx.png';
import pptxIcon from '@/assets/file/pptx.png';
import jpgIcon from '@/assets/file/jpg.png';
import previewIcon from '@/assets/file/preview-true.png';
import downloadIcon from '@/assets/file/download-true.png';
import defaultIcon from '@/assets/file/jpg.png';

// --- 初始化 ---
const message = useMessage();

// --- 响应式状态定义 ---
const fileList = ref([]);
const loading = ref(false);

const pagination = ref({
  pageNum: 1,
  pageSize: 10, // 默认每页10条
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

// Naive UI 分页事件处理
function handlePageUpdate(newPage) {
  pagination.value.pageNum = newPage;
  fetchFileList();
}

function handlePageSizeUpdate(newPageSize) {
  pagination.value.pageSize = newPageSize;
  pagination.value.pageNum = 1; // 切换每页数量时，回到第一页
  fetchFileList();
}

function getFileIcon(fileName) {
  if (!fileName) return defaultIcon;
  const extension = fileName.split('.').pop().toLowerCase();
  switch (extension) {
    case 'pdf': return pdfIcon;
    case 'xlsx': return xlsxIcon;
    case 'docx': return docxIcon;
    case 'pptx': return pptxIcon;
    case 'jpg': case 'jpeg': case 'png': return jpgIcon;
    default: return defaultIcon;
  }
}

function getStatusClass(status) {
    if (status === '处理中') return 'status-processing';
    if (status === '上传完成' || status === '处理完成') return 'status-uploaded';
    return 'status-default';
}

function formatDateTime(dateTimeStr) {
  if (!dateTimeStr) return '-';
  try {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(' ', ' ');
  } catch {
    return dateTimeStr;
  }
}

onMounted(() => {
  fetchFileList();
});
</script>

<style scoped>
/* 容器和头部样式 (基本不变) */
.file-list-container {
  padding: 22px;
  background-color: #f7f8fa;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  height: calc(100vh - 8vh);
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h1 {
  font-size: 22px;
  font-weight: 500;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-box {
  position: relative;
}

.search-box input {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 8px 12px 8px 34px;
  width: 180px; /* 调整宽度以容纳两个搜索框 */
  outline: none;
  transition: border-color 0.3s;
}
.search-box input:focus {
  border-color: #1890ff;
}
.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
}

.refresh-btn {
  border: 1px solid #e0e0e0;
  background-color: #fff;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}
.refresh-btn:hover {
  background-color: #f9f9f9;
}
.refresh-icon {
  width: 14px;
  height: 14px;
}

.table-container {
  position: relative; /* 为遮罩层提供定位上下文 */
  flex-grow: 1;
  background-color: #fff;
  border-radius: 8px;
  overflow-x: auto;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #f0f0f0;
}

/* 加载遮罩层的样式 */
.loading-overlay {
  position: absolute;
  top: 58px; /* 58px 大约是表头的高度，让加载提示出现在表头下方 */
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7); /* 半透明背景 */
  display: flex;
  align-items: flex-start; /* 顶部对齐 */
  justify-content: center;
  z-index: 10;
  padding-top: 40px; /* 向下一些间距 */
  color: #666;
  font-size: 14px;
}

.file-table {
  width: 100%;
  border-collapse: collapse;
}

.file-table th {
  background-color: #fafafa;
  font-weight: 500;
  color: #555;
  text-align: left;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}
.file-table th:hover {
  background-color: #f5f5f5;
}

.sort-icon {
  color: #aaa;
  display: inline-block;
  margin-left: 4px;
  font-size: 12px;
}

.file-table td {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: #333;
  white-space: nowrap;
}
.file-table tbody tr:last-child td {
  border-bottom: none;
}
.file-table tbody tr:hover {
    background-color: #f9faff;
}
.loading-cell, .empty-cell {
    text-align: center;
    color: #999;
    height: 200px;
}

.file-name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 350px; /* 防止文件名过长 */
}
.file-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}
.file-name-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.status-badge {
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  display: inline-block;
  border: 1px solid;
}
.status-uploaded {
  background-color: #e6f7ff;
  color: #1890ff;
  border-color: #91d5ff;
}
.status-processing {
  background-color: #fffbe6;
  color: #faad14;
  border-color: #ffe58f;
}
.status-default {
  background-color: #f5f5f5;
  color: #555;
  border-color: #e0e0e0;
}

.action-icons {
  display: flex;
  align-items: center;
  gap: 16px;
}
.action-icons img {
  width: 18px;
  height: 18px;
  cursor: pointer;
  opacity: 0.7;
}
.action-icons img:hover {
  opacity: 1;
}

/* 底部和分页样式 (重点修改) */
.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  flex-shrink: 0;
}

.footer-info {
  font-size: 14px;
  color: #888;
}

/* 使用 :deep() 选择器来覆盖 Naive UI 的内部样式 */
:deep(.n-pagination .n-pagination-item) {
  background-color: #fff;
  border: 1px solid #e0e0e0;
}
:deep(.n-pagination .n-pagination-item:hover) {
  border-color: #1890ff;
  color: #1890ff;
}
:deep(.n-pagination .n-pagination-item--active) {
  background-color: #1890ff;
  color: #fff;
  border-color: #1890ff;
}
:deep(.n-pagination .n-select) {
  --n-border: 1px solid #e0e0e0 !important;
  --n-border-hover: 1px solid #1890ff !important;
  --n-border-active: 1px solid #1890ff !important;
  --n-border-focus: 1px solid #1890ff !important;
  --n-box-shadow-focus: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
}
</style>