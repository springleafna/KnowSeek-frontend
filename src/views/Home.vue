<template>
  <div class="home-container">
    <h2>主页</h2>

    <section class="upload-section">
      <h3>文件上传</h3>
      <div class="upload-box">
        <input type="file" @change="onFileChange" :disabled="uploadStatus.uploading" />
        <p v-if="selectedFileName">已选择：{{ selectedFileName }}</p>
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
  partUploadUrls: {},
  chunkSize: 2 * 1024 * 1024, // 2MB 分片大小
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
    
    // 5. 保存上传ID和分片上传URL
    uploadStatus.uploadId = initResult.uploadId;
    uploadStatus.partUploadUrls = initResult.partUploadUrls;
    
    // 6. 开始分片上传
    await uploadChunks(file);
    
    alert('文件上传成功！');
  } catch (error) {
    console.error('上传失败:', error);
    uploadStatus.error = error.message || '上传失败';
    alert(`上传失败: ${uploadStatus.error}`);
  } finally {
    uploadStatus.uploading = false;
  }
};

// 上传所有分片
const uploadChunks = async (file) => {
  const chunkPromises = [];
  
  for (let i = 0; i < uploadStatus.totalChunks; i++) {
    const start = i * uploadStatus.chunkSize;
    const end = Math.min(file.size, start + uploadStatus.chunkSize);
    const chunk = file.slice(start, end);
    
    // 获取当前分片的上传URL
    const uploadUrl = uploadStatus.partUploadUrls[i + 1]; // 注意：后端分片索引从1开始
    
    if (!uploadUrl) {
      throw new Error(`分片${i+1}的上传URL不存在`);
    }
    
    // 创建上传Promise
    const uploadPromise = fileApi.uploadChunk(uploadUrl, chunk, (progressEvent) => {
      // 计算单个分片的上传进度
      const chunkProgress = progressEvent.loaded / progressEvent.total;
      // 更新总体进度
      updateTotalProgress();
    }).then(() => {
      // 标记分片已上传
      uploadStatus.uploadedChunks.add(i);
      updateTotalProgress();
    });
    
    chunkPromises.push(uploadPromise);
  }
  
  // 等待所有分片上传完成
  await Promise.all(chunkPromises);
};

// 更新总体上传进度
const updateTotalProgress = () => {
  const completedChunks = uploadStatus.uploadedChunks.size;
  uploadStatus.progress = Math.floor((completedChunks / uploadStatus.totalChunks) * 100);
};

const handleLogout = async () => {
  try {
    await userApi.logout();
  } catch (_) {}
  tokenUtils.removeToken();
  router.push('/login');
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
</style>