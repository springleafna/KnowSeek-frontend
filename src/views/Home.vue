<template>
  <div class="home-container">
    <h2>主页</h2>

    <section class="upload-section">
      <h3>文件上传</h3>
      <div class="upload-box">
        <input type="file" @change="onFileChange" :disabled="uploadStatus.uploading" />
        <p v-if="selectedFileName">已选择：{{ selectedFileName }}</p>
        
        <!-- 并发数设置 -->
        <div class="concurrency-setting" v-if="selectedFile && !uploadStatus.uploading">
          <label>并发数：</label>
          <select v-model="uploadStatus.maxConcurrency" :disabled="uploadStatus.uploading">
            <option value="1">1个分片</option>
            <option value="2">2个分片</option>
            <option value="3">3个分片</option>
            <option value="5">5个分片</option>
            <option value="8">8个分片</option>
          </select>
          <span class="concurrency-hint">（建议根据网络情况调整）</span>
        </div>
        
        <button 
          :disabled="!selectedFile || uploadStatus.uploading" 
          @click="handleUpload"
        >
          {{ uploadStatus.uploading ? '上传中...' : '上传' }}
        </button>
        
        <!-- 上传进度条 -->
        <div v-if="uploadStatus.uploading" class="progress-container">
          <div class="progress-bar" :style="{width: uploadStatus.progress + '%'}"></div>
          <span class="progress-text">{{ uploadStatus.progress }}%</span>
        </div>
        
        <!-- 错误信息 -->
        <p v-if="uploadStatus.error" class="error-message">{{ uploadStatus.error }}</p>
        
        <!-- 上传信息 -->
        <div v-if="uploadStatus.uploading && uploadStatus.uploadId" class="upload-info">
          <p>上传ID: {{ uploadStatus.uploadId }}</p>
          <p>分片进度: {{ uploadStatus.uploadedChunks.size }}/{{ uploadStatus.totalChunks }}</p>
          <p>并发上传: 最多{{ uploadStatus.maxConcurrency }}个分片同时上传</p>
          <p>分片大小: {{ (uploadStatus.chunkSize / 1024 / 1024).toFixed(1) }}MB</p>
        </div>
      </div>
    </section>

    <section class="actions">
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import userApi, { tokenUtils, fileApi } from '@/api/api';

const router = useRouter();
const selectedFile = ref(null);
const selectedFileName = ref('');

// 分片上传相关状态
const uploadStatus = reactive({
  uploading: false,
  progress: 0,
  currentChunk: 0,
  totalChunks: 0,
  uploadId: '',
  chunkSize: 2 * 1024 * 1024, // 10MB 分片大小
  maxConcurrency: 3, // 最大并发数
  uploadedChunks: new Set(),
  error: ''
});

const onFileChange = (e) => {
  const file = e.target.files?.[0];
  selectedFile.value = file || null;
  selectedFileName.value = file ? file.name : '';
};

const handleUpload = async () => {
  if (!selectedFile.value || uploadStatus.uploading) return;
  
  try {
    uploadStatus.uploading = true;
    uploadStatus.progress = 0;
    uploadStatus.error = '';
    uploadStatus.uploadedChunks.clear();
    
    const file = selectedFile.value;
    
    // 1. 计算文件MD5
    const fileMd5 = await fileApi.calculateFileMD5(file);
    
    // 2. 计算分片数量
    const chunkTotal = Math.ceil(file.size / uploadStatus.chunkSize);
    uploadStatus.totalChunks = chunkTotal;
    
    // 3. 初始化上传
    const initResult = await fileApi.initUpload({
      fileName: file.name,
      fileMd5: fileMd5,
      fileSize: file.size,
      chunkTotal: chunkTotal
    });
    
    // 4. 检查是否已上传（秒传）
    if (initResult.uploaded) {
      uploadStatus.progress = 100;
      alert('文件已存在，秒传成功！');
      uploadStatus.uploading = false;
      return;
    }
    
    // 5. 保存上传ID
    uploadStatus.uploadId = initResult.uploadId;
    
    // 6. 开始分片上传
    const completeResult = await uploadChunks(file, initResult.partUploadUrls);
    
    // 7. 显示上传结果
    if (completeResult.location) {
      console.log('文件上传成功，访问地址:', completeResult.location);
    }
    
    alert('文件上传成功！');
  } catch (error) {
    console.error('上传失败:', error);
    uploadStatus.error = error.message || '上传失败';
    alert(`上传失败: ${uploadStatus.error}`);
  } finally {
    uploadStatus.uploading = false;
    uploadStatus.progress = 0;
  }
};

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
    tokenUtils.removeToken();
    console.log('已清理本地token');
    // 跳转到登录页
    router.push('/login');
  }
};
</script>

<style scoped>
.home-container {
  max-width: 720px;
  margin: 30px auto;
  padding: 20px;
}

.upload-section {
  margin-top: 20px;
}

.upload-box {
  border: 1px dashed #bbb;
  border-radius: 8px;
  padding: 20px;
}

button {
  margin-top: 10px;
  padding: 8px 16px;
  border: none;
  background: #007bff;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background: #9fbff1;
  cursor: not-allowed;
}

.logout-btn {
  background: #ff4d4f;
}

.actions {
  margin-top: 30px;
}

/* 进度条样式 */
.progress-container {
  margin-top: 15px;
  width: 100%;
  height: 20px;
  background-color: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.progress-bar {
  height: 100%;
  background-color: #4caf50;
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  text-align: center;
  line-height: 20px;
  color: #333;
  font-size: 12px;
}

.error-message {
  color: #ff4d4f;
  margin-top: 10px;
}

.upload-info {
  margin-top: 15px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-size: 14px;
}

.upload-info p {
  margin: 5px 0;
  color: #666;
}

.concurrency-setting {
  margin: 15px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.concurrency-setting label {
  font-weight: bold;
  color: #333;
}

.concurrency-setting select {
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.concurrency-setting select:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.concurrency-hint {
  font-size: 12px;
  color: #666;
  font-style: italic;
}
</style>