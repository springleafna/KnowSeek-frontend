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
        
        <!-- 上传信息 -->
        <div v-if="uploadStatus.uploading && uploadStatus.uploadId" class="upload-info">
          <p>上传ID: {{ uploadStatus.uploadId }}</p>
          <p>分片进度: {{ uploadStatus.uploadedChunks.size }}/{{ uploadStatus.totalChunks }}</p>
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
    
    // 5. 保存上传ID
    uploadStatus.uploadId = initResult.uploadId;
    
    // 6. 开始分片上传
    const completeResult = await uploadChunks(file);
    
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

// 上传所有分片
const uploadChunks = async (file) => {
  const chunkMd5List = [];
  
  // 是否应该是异步上传？
  for (let i = 0; i < uploadStatus.totalChunks; i++) {
    const start = i * uploadStatus.chunkSize;
    const end = Math.min(file.size, start + uploadStatus.chunkSize);
    const chunk = file.slice(start, end);
    
    try {
      // 先上传分片到阿里云OSS获取ETag和索引


      // 计算分片MD5
      const chunkMd5 = await fileApi.calculateChunkMD5(chunk);
      chunkMd5List.push(chunkMd5);
      
      // 将分片信息发送到到服务端进行保存
      const chunkResult = await fileApi.uploadChunk({
        uploadId: uploadStatus.uploadId,
        chunkIndex: i + 1, // 后端分片索引从1开始
        fileName: file.name,
        chunkMd5: chunkMd5,
        ETag: `etag-${i + 1}`,
        chunkSize: chunk.size
      });
      
      // 标记分片已上传
      uploadStatus.uploadedChunks.add(i);
      updateTotalProgress();
      
    } catch (error) {
      console.error(`分片${i + 1}上传失败:`, error);
      throw new Error(`分片${i + 1}上传失败: ${error.message}`);
    }
  }
  
  // 所有分片上传完成后，调用完成接口
  const completeResult = await fileApi.completeUpload({
    uploadId: uploadStatus.uploadId,
    fileName: file.name,
    fileMd5: await fileApi.calculateFileMD5(file),
    chunkTotal: uploadStatus.totalChunks,
    chunkMd5List: chunkMd5List
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
</style>