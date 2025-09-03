<template>
  <div class="knowledge-page">
    <div class="header">
      <h2>知识库</h2>
      <div class="tools">
        <button class="btn" @click="uploadFiles">+ 新增</button>
        <input v-model="keyword" type="text" placeholder="搜索文件名..." @keyup.enter="loadFiles" />
        <button class="btn" @click="loadFiles">刷新</button>
      </div>
    </div>

    <div class="card">
      <div class="table-wrap" v-if="files.length > 0">
        <table class="table">
          <thead>
            <tr>
              <th style="width: 36px;"><input type="checkbox" v-model="checkedAll" @change="toggleAll" /></th>
              <th>文件名</th>
              <th style="width: 120px;">大小</th>
              <th style="width: 120px;">类型</th>
              <th style="width: 180px;">上传时间</th>
              <th style="width: 160px;">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="file in files" :key="file.id">
              <td><input type="checkbox" v-model="selectedIds" :value="file.id" /></td>
              <td class="name-cell">
                <div class="name">{{ file.name }}</div>
                <div class="sub">MD5: {{ file.md5 || '-' }}</div>
              </td>
              <td>{{ formatSize(file.size) }}</td>
              <td>{{ file.type || '-' }}</td>
              <td>{{ formatTime(file.uploadTime) }}</td>
              <td>
                <button class="link" @click="handleDownload(file)">下载</button>
                <button class="link danger" @click="handleDelete(file)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty">暂无文件</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const keyword = ref('')
const files = ref([])
const selectedIds = ref([])
const checkedAll = computed({
  get() {
    return files.value.length > 0 && selectedIds.value.length === files.value.length
  },
  set(val) {
    if (val) selectedIds.value = files.value.map(f => f.id)
    else selectedIds.value = []
  }
})

function toggleAll() {
  checkedAll.value = !checkedAll.value
}

function formatSize(size) {
  if (!size && size !== 0) return '-'
  const units = ['B','KB','MB','GB','TB']
  let idx = 0
  let s = size
  while (s >= 1024 && idx < units.length - 1) {
    s /= 1024
    idx++
  }
  return `${s.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`
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

async function loadFiles() {
  // 这里预留与后端对接，当前使用占位数据
  const mock = [
    { id: '1', name: '产品白皮书.pdf', size: 1048576, type: 'pdf', uploadTime: new Date(), md5: 'abcd1234' },
    { id: '2', name: '知识库导入模板.xlsx', size: 348160, type: 'xlsx', uploadTime: new Date(Date.now() - 86400000) },
  ]
  files.value = mock.filter(f => !keyword.value || f.name.includes(keyword.value))
  selectedIds.value = []
}

function handleDownload(file) {
  // 预留下载逻辑
  console.log('download', file)
}

function handleDelete(file) {
  // 预留删除逻辑
  files.value = files.value.filter(f => f.id !== file.id)
  selectedIds.value = selectedIds.value.filter(id => id !== file.id)
}

onMounted(loadFiles)
</script>

<style scoped>
.knowledge-page {
  height: 100%;
  padding: 16px 20px;
  box-sizing: border-box;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.header h2 {
  margin: 0;
  font-size: 18px;
}

.tools {
  display: flex;
  gap: 8px;
  align-items: center;
}

.tools input {
  height: 36px;
  padding: 0 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  outline: none;
}

.tools input:focus {
  border-color: #1a73e8;
  box-shadow: 0 0 0 3px rgba(26,115,232,0.12);
}

.btn {
  height: 36px;
  padding: 0 12px;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
}

.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(17,24,39,0.06);
  height: calc(100% - 52px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.table-wrap {
  overflow: auto;
}

.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.table thead th {
  text-align: left;
  background: #f9fafb;
  color: #6b7280;
  font-weight: 600;
  font-size: 12px;
  padding: 10px 12px;
  border-bottom: 1px solid #eef0f3;
}

.table tbody td {
  padding: 12px;
  border-bottom: 1px solid #f5f5f5;
  color: #111827;
}

.name-cell .name {
  font-weight: 600;
}

.name-cell .sub {
  color: #9ca3af;
  font-size: 12px;
}

.link {
  background: none;
  border: none;
  color: #1a73e8;
  cursor: pointer;
  padding: 0 8px 0 0;
}

.link.danger {
  color: #ef4444;
}

.empty {
  padding: 40px;
  color: #6b7280;
}
</style> 