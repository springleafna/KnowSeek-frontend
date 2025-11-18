<template>
  <n-modal v-model:show="visible" preset="dialog" title="文件上传" style="width: 600px;">
    <n-space vertical size="large">
      <!-- 文件选择 -->
      <n-upload
        ref="uploadRef"
        :default-file-list="[]"
        :max="1"
        :disabled="uploadStatus.uploading"
        @change="onFileChange"
        accept="*"
        :show-file-list="false"
      >
        <n-upload-dragger>
          <div style="margin-bottom: 12px;">
            <n-icon size="48" :depth="3">
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              </svg>
            </n-icon>
          </div>
          <n-text style="font-size: 16px;">
            点击或者拖拽文件到该区域来上传
          </n-text>
        </n-upload-dragger>
      </n-upload>
      
      <!-- 已选择的文件 -->
      <div v-if="selectedFileName">
        <n-alert type="info" :bordered="false">
          已选择文件：{{ selectedFileName }}
        </n-alert>
      </div>
      
      <!-- 并发数设置 -->
      <div v-if="selectedFile && !uploadStatus.uploading">
        <n-form-item label="并发上传分片数">
          <n-select 
            v-model:value="uploadStatus.maxConcurrency" 
            :options="concurrencyOptions"
            :disabled="uploadStatus.uploading"
            style="width: 200px;"
          />
          <template #feedback>
            <n-text depth="3" style="font-size: 12px;">
              建议根据网络情况调整
            </n-text>
          </template>
        </n-form-item>
      </div>
    </n-space>

    <!-- 上传进度卡片 -->
    <n-card v-if="uploadStatus.uploading || uploadStatus.paused" title="上传进度" style="margin-top: 1rem;" :bordered="false">
      <n-space vertical>
        <n-progress 
          type="line" 
          :percentage="uploadStatus.progress"
          :show-indicator="true"
          :processing="uploadStatus.uploading"
        />
        
        <n-descriptions :column="2" size="small">
          <n-descriptions-item label="上传ID">
            {{ uploadStatus.uploadId || '--' }}
          </n-descriptions-item>
          <n-descriptions-item label="分片进度">
            {{ uploadStatus.uploadedChunks.size }}/{{ uploadStatus.totalChunks }}
          </n-descriptions-item>
          <n-descriptions-item label="最大并发数">
            {{ uploadStatus.maxConcurrency }}
          </n-descriptions-item>
          <n-descriptions-item label="分片大小">
            {{ (uploadStatus.chunkSize / 1024 / 1024).toFixed(1) }}MB
          </n-descriptions-item>
          <n-descriptions-item label="状态">
            {{ uploadStatus.paused ? '已暂停' : '上传中' }}
          </n-descriptions-item>
        </n-descriptions>
      </n-space>
    </n-card>
    
    <!-- 错误信息 -->
    <n-alert v-if="uploadStatus.error" type="error" style="margin-top: 1rem;">
      {{ uploadStatus.error }}
    </n-alert>

    <template #action>
      <n-space>
        <n-button @click="handleCancel">取消</n-button>
        <n-button 
          v-if="uploadStatus.uploading && !uploadStatus.paused"
          tertiary
          :disabled="!uploadStatus.uploadId"
          @click="handlePause"
        >暂停</n-button>
        <n-button 
          v-if="uploadStatus.paused"
          tertiary
          :disabled="!uploadStatus.uploadId || !selectedFile"
          @click="handleResume"
        >继续</n-button>
        <n-button 
          v-if="uploadStatus.uploading || uploadStatus.paused"
          quaternary
          :disabled="!uploadStatus.uploadId"
          @click="handleCancelUpload"
        >取消上传</n-button>
        <n-button 
          type="primary"
          :disabled="!selectedFile || uploadStatus.uploading || uploadStatus.paused" 
          :loading="uploadStatus.uploading"
          @click="handleUpload"
        >
          {{ uploadStatus.uploading ? '上传中...' : '开始上传' }}
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup>
import { ref, reactive, watchEffect } from 'vue'
import { useMessage } from 'naive-ui'
import { fileApi } from '@/api/api'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  knowledgeBaseId: {
    type: [String, Number],
    default: undefined
  }
})

const emit = defineEmits(['update:show', 'uploaded'])

const message = useMessage()
const selectedFile = ref(null)
const selectedFileName = ref('')
const uploadRef = ref(null)

const visible = ref(false)

// 监听props.show的变化
watchEffect(() => {
  visible.value = props.show
})

// 监听visible的变化，同步到父组件
watchEffect(() => {
  if (!visible.value && props.show) {
    emit('update:show', false)
    resetForm()
  }
})

const concurrencyOptions = [
  { label: '1个分片', value: 1 },
  { label: '2个分片', value: 2 },
  { label: '3个分片', value: 3 },
  { label: '5个分片', value: 5 },
  { label: '8个分片', value: 8 }
]

const uploadStatus = reactive({
  uploading: false,
  progress: 0,
  currentChunk: 0,
  totalChunks: 0,
  uploadId: '',
  chunkSize: 0, 
  maxConcurrency: 3, // 最大并发数
  uploadedChunks: new Set(),
  error: '',
  paused: false,
  canceled: false
})

const resetForm = () => {
  selectedFile.value = null
  selectedFileName.value = ''
  uploadStatus.uploading = false
  uploadStatus.progress = 0
  uploadStatus.currentChunk = 0
  uploadStatus.totalChunks = 0
  uploadStatus.uploadId = ''
  uploadStatus.chunkSize = 0
  uploadStatus.uploadedChunks.clear()
  uploadStatus.error = ''
  uploadStatus.paused = false
  uploadStatus.canceled = false
}

const onFileChange = ({ fileList }) => {
  const file = fileList[0]?.file
  selectedFile.value = file || null
  selectedFileName.value = file ? file.name : ''
}

const handleCancel = () => {
  emit('update:show', false)
}

const abortControllers = ref(new Map())

const handlePause = async () => {
  if (!uploadStatus.uploading || uploadStatus.paused || !uploadStatus.uploadId) return
  uploadStatus.paused = true
  try { await fileApi.pauseUpload({ uploadId: uploadStatus.uploadId }) } catch {}
  abortControllers.value.forEach((c) => { try { c.abort() } catch {} })
  uploadStatus.uploading = false
}

const handleResume = async () => {
  if (!uploadStatus.paused || !selectedFile.value || !uploadStatus.uploadId) return
  let resumeInit
  try { resumeInit = await fileApi.resumeUpload({ uploadId: uploadStatus.uploadId }) } catch (e) { uploadStatus.error = e.message || '恢复上传失败'; message.error(uploadStatus.error); return }
  uploadStatus.paused = false
  uploadStatus.uploading = true
  try {
    await uploadChunks(selectedFile.value, resumeInit.partUploadUrls)
    if (!uploadStatus.paused && !uploadStatus.canceled) {
      await fileApi.completeUpload({
        uploadId: uploadStatus.uploadId,
        fileName: selectedFile.value.name,
        chunkTotalSize: uploadStatus.totalChunks,
        knowledgeBaseId: props.knowledgeBaseId
      })
      message.success('文件上传成功！')
      emit('uploaded')
      emit('update:show', false)
    }
  } catch (error) {
    if (uploadStatus.paused || uploadStatus.canceled) return
    uploadStatus.error = error.message || '上传失败'
    message.error(`上传失败: ${uploadStatus.error}`)
  } finally {
    uploadStatus.uploading = false
  }
}

const handleCancelUpload = async () => {
  if (!uploadStatus.uploadId) { resetForm(); return }
  uploadStatus.canceled = true
  try { await fileApi.cancelUpload({ uploadId: uploadStatus.uploadId }) } catch {}
  abortControllers.value.forEach((c) => { try { c.abort() } catch {} })
  abortControllers.value.clear()
  resetForm()
}

/**
 * 根据文件大小返回合适的分片大小（字节）
 * @param {number} fileSize 文件大小（字节）
 * @returns {number|null} 最佳分片大小或null（表示直传）
 */
function getOptimalChunkSize(fileSize) {
  if (fileSize <= 10 * 1024 * 1024) {
    // ≤10MB：不分片（返回 null 或整个文件大小）
    return null; // 表示直传
  } else if (fileSize <= 100 * 1024 * 1024) {
    // 10MB ~ 100MB
    return 8 * 1024 * 1024; // 8MB
  } else if (fileSize <= 500 * 1024 * 1024) {
    // 100MB ~ 500MB
    return 16 * 1024 * 1024; // 16MB
  } else {
    // >500MB
    return 32 * 1024 * 1024; // 32MB
  }
}

const handleUpload = async () => {
  if (!selectedFile.value || uploadStatus.uploading) return
  
  const startTime = new Date()
  console.log(`[LOG] 文件上传开始时间: ${startTime.toLocaleString('zh-CN', { hour12: false })}`)

  try {
    uploadStatus.uploading = true
    uploadStatus.progress = 0
    uploadStatus.error = ''
    uploadStatus.uploadedChunks.clear()
    
    const file = selectedFile.value
    
    // 1. 根据文件大小动态获取并设置分片大小
    const optimalChunkSize = getOptimalChunkSize(file.size);
    
    // 如果 optimalChunkSize 为 null (小文件)，则将整个文件作为单个分片处理
    // 否则使用计算出的最佳分片大小
    uploadStatus.chunkSize = optimalChunkSize === null ? file.size : optimalChunkSize;

    // 2. 计算文件MD5
    const fileMd5 = await fileApi.calculateFileMD5(file)
    
    // 3. 计算分片数量
    // 这里的 uploadStatus.chunkSize 已经是动态计算后的值
    const chunkTotal = Math.ceil(file.size / uploadStatus.chunkSize)
    uploadStatus.totalChunks = chunkTotal
    
    // 4. 初始化上传（携带知识库ID）
    const initResult = await fileApi.initUpload({
      fileName: file.name,
      fileMd5: fileMd5,
      fileSize: file.size,
      chunkTotal: chunkTotal,
      knowledgeBaseId: props.knowledgeBaseId
    })
    
    // 5. 检查是否已上传（秒传）
    if (initResult.status === 0) {
      uploadStatus.progress = 100
      message.success('文件已存在，秒传成功！')
      uploadStatus.uploading = false
      emit('uploaded')
      emit('update:show', false)
      return
    }
    
    // 6. 保存上传ID
    uploadStatus.uploadId = initResult.uploadId
    
    // 7. 开始分片上传
    await uploadChunks(file, initResult.partUploadUrls)
    
    if (uploadStatus.paused || uploadStatus.canceled) return
    // 8. 完成上传（携带知识库ID）
    await fileApi.completeUpload({
      uploadId: uploadStatus.uploadId,
      fileName: file.name,
      chunkTotalSize: uploadStatus.totalChunks,
      knowledgeBaseId: props.knowledgeBaseId
    })

    const endTime = new Date()
    console.log(`[LOG] 文件上传完成时间: ${endTime.toLocaleString('zh-CN', { hour12: false })} (耗时: ${endTime - startTime}ms)`)
    
    message.success('文件上传成功！')
    emit('uploaded')
    emit('update:show', false)
  } catch (error) {
    console.error('上传失败:', error)
    uploadStatus.error = error.message || '上传失败'
    message.error(`上传失败: ${uploadStatus.error}`)
  } finally {
    uploadStatus.uploading = false
  }
}

// 并发控制函数
const asyncPool = async (concurrency, tasks) => {
  const results = [];
  const executing = new Set();
  
  for (const task of tasks) {
    const promise = task();
    results.push(promise);
    
    executing.add(promise);
    promise.then(() => executing.delete(promise));
    
    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }
  
  return Promise.all(results);
};

// 上传所有分片
const uploadChunks = async (file, partUploadUrls) => {
  const maxConcurrency = uploadStatus.maxConcurrency
  const keys = partUploadUrls ? Object.keys(partUploadUrls) : []
  let indices = keys.length ? keys.map((k) => Number(k)).sort((a, b) => a - b) : Array.from({ length: uploadStatus.totalChunks }, (_, i) => i + 1)
  indices = indices.filter((idx) => !uploadStatus.uploadedChunks.has(idx))
  const queue = [...indices]
  const executing = new Set()
  const failures = []

  const startOne = (idx) => {
    const i = idx - 1
    const start = i * uploadStatus.chunkSize
    const end = Math.min(file.size, start + uploadStatus.chunkSize)
    const chunk = file.slice(start, end)
    const url = partUploadUrls?.[idx] || partUploadUrls?.[String(idx)]
    if (!url) throw new Error(`缺少分片 ${idx} 的预签名URL`)
    const controller = new AbortController()
    abortControllers.value.set(idx, controller)
    const p = (async () => {
      try {
        const response = await fetch(url, { method: 'PUT', body: chunk, signal: controller.signal })
        if (!response.ok) {
          const text = await response.text().catch(() => '')
          throw new Error(`OSS直传失败（分片${idx}）：${response.status} ${response.statusText} ${text}`)
        }
        let eTag = response.headers.get('ETag') || response.headers.get('etag') || ''
        if (eTag) eTag = eTag.replace(/^\"|\"$/g, '')
        await fileApi.uploadChunk({ uploadId: uploadStatus.uploadId, chunkIndex: idx, ETag: eTag, chunkSize: chunk.size })
        uploadStatus.uploadedChunks.add(idx)
        updateTotalProgress()
      } catch (e) {
        if (controller.signal.aborted || uploadStatus.paused || uploadStatus.canceled) return
        failures.push({ chunkIndex: idx, error: e.message })
      } finally {
        abortControllers.value.delete(idx)
        executing.delete(p)
      }
    })()
    executing.add(p)
  }

  while (queue.length && !uploadStatus.paused && !uploadStatus.canceled) {
    while (executing.size < maxConcurrency && queue.length && !uploadStatus.paused && !uploadStatus.canceled) {
      const next = queue.shift()
      startOne(next)
    }
    if (executing.size === 0) break
    await Promise.race(Array.from(executing))
  }

  await Promise.all(Array.from(executing))

  if (uploadStatus.paused || uploadStatus.canceled) return { success: false }
  if (failures.length > 0) {
    const errorMessages = failures.map((c) => `分片${c.chunkIndex}: ${c.error}`).join(', ')
    throw new Error(`以下分片上传失败: ${errorMessages}`)
  }
  return { success: true }
}

// 更新总体上传进度
const updateTotalProgress = () => {
  const completedChunks = uploadStatus.uploadedChunks.size;
  uploadStatus.progress = Math.floor((completedChunks / uploadStatus.totalChunks) * 100);
};
</script>