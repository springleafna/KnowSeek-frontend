<template>
  <div class="home-container">
    <n-layout content-style="padding: 2rem;">
      <n-h2 style="margin-bottom: 2rem;">主页</n-h2>
      
      <n-card title="文件上传" :bordered="false" size="large">
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
          
          <!-- 上传按钮 -->
          <n-button 
            type="primary" 
            size="large"
            :disabled="!selectedFile || uploadStatus.uploading" 
            :loading="uploadStatus.uploading"
            @click="handleUpload"
            block
          >
            {{ uploadStatus.uploading ? '上传中...' : '开始上传' }}
          </n-button>
        </n-space>
      </n-card>
      
      <!-- 上传进度卡片 -->
      <n-card v-if="uploadStatus.uploading" title="上传进度" style="margin-top: 1rem;" :bordered="false">
        <n-space vertical>
          <n-progress 
            type="line" 
            :percentage="uploadStatus.progress"
            :show-indicator="true"
            processing
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
          </n-descriptions>
        </n-space>
      </n-card>
      
      <!-- 错误信息 -->
      <n-alert v-if="uploadStatus.error" type="error" style="margin-top: 1rem;">
        {{ uploadStatus.error }}
      </n-alert>
    </n-layout>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import userApi, { fileApi } from '@/api/api'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const message = useMessage()
const selectedFile = ref(null)
const selectedFileName = ref('')
const uploadRef = ref(null)

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
  chunkSize: 10 * 1024 * 1024, // 10MB 分片大小
  maxConcurrency: 3, // 最大并发数
  uploadedChunks: new Set(),
  error: ''
})

const onFileChange = ({ fileList }) => {
  const file = fileList[0]?.file
  selectedFile.value = file || null
  selectedFileName.value = file ? file.name : ''
}

const handleUpload = async () => {
  if (!selectedFile.value || uploadStatus.uploading) return
  
  try {
    uploadStatus.uploading = true
    uploadStatus.progress = 0
    uploadStatus.error = ''
    uploadStatus.uploadedChunks.clear()
    
    const file = selectedFile.value
    
    // 1. 计算文件MD5
    const fileMd5 = await fileApi.calculateFileMD5(file)
    
    // 2. 计算分片数量
    const chunkTotal = Math.ceil(file.size / uploadStatus.chunkSize)
    uploadStatus.totalChunks = chunkTotal
    
    // 3. 初始化上传
    const initResult = await fileApi.initUpload({
      fileName: file.name,
      fileMd5: fileMd5,
      fileSize: file.size,
      chunkTotal: chunkTotal
    })
    
    // 4. 检查是否已上传（秒传）
    if (initResult.uploaded) {
      uploadStatus.progress = 100
      message.success('文件已存在，秒传成功！')
      uploadStatus.uploading = false
      return
    }
    
    // 5. 保存上传ID
    uploadStatus.uploadId = initResult.uploadId
    
    // 6. 开始分片上传
    const completeResult = await uploadChunks(file, initResult.partUploadUrls)
    
    // 7. 显示上传结果
    if (completeResult.location) {
      console.log('文件上传成功，访问地址:', completeResult.location)
    }
    
    message.success('文件上传成功！')
  } catch (error) {
    console.error('上传失败:', error)
    uploadStatus.error = error.message || '上传失败'
    message.error(`上传失败: ${uploadStatus.error}`)
  } finally {
    uploadStatus.uploading = false
    uploadStatus.progress = 0
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
  const maxConcurrency = uploadStatus.maxConcurrency; // 使用状态中的并发数
  const uploadTasks = [];
  
  // 创建所有分片的上传任务
  for (let i = 0; i < uploadStatus.totalChunks; i++) {
    const chunkIndex = i + 1;
    const start = i * uploadStatus.chunkSize;
    const end = Math.min(file.size, start + uploadStatus.chunkSize);
    const chunk = file.slice(start, end);

    // 取预签名直传URL（后端Map<Integer, String>，索引从1开始，键可能是数字或字符串）
    const url = partUploadUrls?.[chunkIndex] || partUploadUrls?.[String(chunkIndex)];
    if (!url) {
      throw new Error(`缺少分片 ${chunkIndex} 的预签名URL`);
    }
    
    // 创建单个分片的上传函数
    const uploadChunk = async () => {
      try {
        // 直传到阿里云 OSS（PUT）
        const response = await fetch(url, {
          method: 'PUT',
          body: chunk,
        });

        if (!response.ok) {
          const text = await response.text().catch(() => '');
          throw new Error(`OSS直传失败（分片${chunkIndex}）：${response.status} ${response.statusText} ${text}`);
        }

        // 获取 OSS 返回的 ETag；如未暴露则回退为分片MD5
        let eTag = response.headers.get('ETag') || response.headers.get('etag') || '';
        if (eTag) {
          eTag = eTag.replace(/^\"|\"$/g, '');
        } else {
          console.warn('未获取到 ETag');
        }
        console.log('ETag(分片' + chunkIndex + '):', eTag);

        // 将分片信息上报服务端（保存 ETag 等信息）
        await fileApi.uploadChunk({
          uploadId: uploadStatus.uploadId,
          chunkIndex: chunkIndex,
          ETag: eTag,
          chunkSize: chunk.size
        });
        
        // 标记分片已上传并更新进度
        uploadStatus.uploadedChunks.add(i);
        updateTotalProgress();
        
        return { success: true, chunkIndex, eTag };
      } catch (error) {
        console.error(`分片${chunkIndex}上传失败:`, error);
        return { success: false, chunkIndex, error: error.message };
      }
    };
    
    uploadTasks.push(uploadChunk);
  }
  
  // 使用并发控制上传分片
  const results = await asyncPool(maxConcurrency, uploadTasks);
  
  // 检查上传结果
  const failedChunks = [];
  const successfulChunks = [];
  
  results.forEach((result) => {
    if (result.success) {
      successfulChunks.push(result);
    } else {
      failedChunks.push(result);
    }
  });
  
  // 如果有失败的分片，抛出错误
  if (failedChunks.length > 0) {
    const errorMessages = failedChunks.map(chunk => `分片${chunk.chunkIndex}: ${chunk.error}`).join(', ');
    throw new Error(`以下分片上传失败: ${errorMessages}`);
  }
  
  // 所有分片上传完成后，调用完成接口
  const completeResult = await fileApi.completeUpload({
    uploadId: uploadStatus.uploadId,
    fileName: file.name,
    chunkTotalSize: uploadStatus.totalChunks
  });
  
  // 检查是否需要重新上传某些分片
  if (completeResult.reUpload && completeResult.pendingChunkIndexList.length > 0) {
    throw new Error(`需要重新上传分片: ${completeResult.pendingChunkIndexList.join(', ')}`);
  }
  
  return completeResult;
};

// 更新总体上传进度
const updateTotalProgress = () => {
  const completedChunks = uploadStatus.uploadedChunks.size;
  uploadStatus.progress = Math.floor((completedChunks / uploadStatus.totalChunks) * 100);
};

const handleLogout = async () => {
  try {
    console.log('开始退出登录...');
    const result = await userApi.logout();
    console.log('退出登录成功:', result);
  } catch (error) {
    console.error('退出登录失败:', error);
    console.error('错误详情:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    // 即使退出登录失败，也要清理本地token并跳转
  } finally {
    // 确保清理本地token
    const authStore = useAuthStore();
    authStore.logout();
    console.log('已清理本地token');
    // 跳转到登录页
    router.push('/login');
  }
};
</script>

<style scoped>
.home-container {
  min-height: calc(100vh - 64px);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>