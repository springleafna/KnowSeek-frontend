<template>
  <div class="kb-detail">
    <div class="header">
      <div class="title-wrap">
        <button class="back" @click="goBack">← 返回</button>
        <h2 class="title">{{ kb?.name || '知识库' }}</h2>
        <span class="sub" v-if="kb?.description">{{ kb.description }}</span>
      </div>
      <div class="tools">
        <button class="btn" @click="showUploadModal = true">+ 新增</button>
        <input v-model="keyword" type="text" placeholder="搜索文件名..." @keyup.enter="loadFiles" />
        <button class="btn" @click="loadFiles">刷新</button>
      </div>
    </div>

    <div class="card">
      <div class="table-wrap" v-if="files.length > 0">
        <table class="table">
          <thead>
            <tr>
              <th>文件名</th>
              <th style="width: 120px;">大小</th>
              <th style="width: 120px;">类型</th>
              <th style="width: 180px;">上传时间</th>
              <th style="width: 120px;">状态</th>
              <th style="width: 140px;">可见性</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="file in files" :key="file.id">
              <td class="name-cell">
                <div class="name">{{ file.name }}</div>
                <div class="sub">MD5: {{ file.md5 || '-' }}</div>
              </td>
              <td>{{ formatSize(file.size) }}</td>
              <td>{{ file.type || '-' }}</td>
              <td>{{ formatTime(file.uploadTime) }}</td>
              <td>{{ file.status || '-' }}</td>
              <td>{{ file.isPublic ? '公开' : '私有' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty">暂无文件</div>
    </div>

    <FileUploadModal
      v-model:show="showUploadModal"
      :knowledgeBaseId="kbId"
      @uploaded="handleFileUploaded"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { knowledgeBaseApi } from '@/api/knowledgeBaseApi'
import FileUploadModal from '@/components/FileUploadModal.vue'

const route = useRoute()
const router = useRouter()
const kbId = ref(route.params.id)

const kb = ref(null)
const keyword = ref('')
const files = ref([])
const loading = ref(false)
const showUploadModal = ref(false)

function goBack() {
  router.push({ name: 'Knowledge' })
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

function guessTypeFromName(name) {
  if (!name) return '-'
  const idx = name.lastIndexOf('.')
  if (idx === -1) return '-'
  return name.substring(idx + 1).toLowerCase()
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
.kb-detail { height: 100%; padding: 16px 20px; box-sizing: border-box; }
.header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.title-wrap { display: flex; align-items: center; gap: 10px; }
.title { margin: 0; font-size: 18px; }
.sub { color: #9ca3af; }
.back { height: 32px; padding: 0 10px; border: 1px solid #e5e7eb; background: #fff; border-radius: 8px; cursor: pointer; }
.tools { display: flex; gap: 8px; align-items: center; }
.tools input { height: 32px; padding: 0 10px; border: 1px solid #e5e7eb; border-radius: 8px; outline: none; }
.tools input:focus { border-color: #1a73e8; box-shadow: 0 0 0 3px rgba(26,115,232,0.12); }
.btn { height: 32px; padding: 0 12px; border: 1px solid #e5e7eb; background: #fff; border-radius: 8px; cursor: pointer; }
.card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 8px 24px rgba(17,24,39,0.06); height: calc(100% - 52px); overflow: hidden; display: flex; flex-direction: column; }
.table-wrap { overflow: auto; }
.table { width: 100%; border-collapse: separate; border-spacing: 0; }
.table thead th { text-align: left; background: #f9fafb; color: #6b7280; font-weight: 600; font-size: 12px; padding: 10px 12px; border-bottom: 1px solid #eef0f3; }
.table tbody td { padding: 12px; border-bottom: 1px solid #f5f5f5; color: #111827; }
.name-cell .name { font-weight: 600; }
.name-cell .sub { color: #9ca3af; font-size: 12px; }
.link { background: none; border: none; color: #1a73e8; cursor: pointer; padding: 0 8px 0 0; }
.empty { padding: 40px; color: #6b7280; }
</style> 