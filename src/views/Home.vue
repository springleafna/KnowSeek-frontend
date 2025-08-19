<template>
  <div class="home-container">
    <h2>主页</h2>

    <section class="upload-section">
      <h3>文件上传</h3>
      <div class="upload-box">
        <input type="file" @change="onFileChange" />
        <p v-if="selectedFileName">已选择：{{ selectedFileName }}</p>
        <button :disabled="!selectedFile" @click="handleUpload">上传</button>
      </div>
    </section>

    <section class="actions">
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import userApi, { tokenUtils } from '@/api/api';

const router = useRouter();
const selectedFile = ref(null);
const selectedFileName = ref('');

const onFileChange = (e) => {
  const file = e.target.files?.[0];
  selectedFile.value = file || null;
  selectedFileName.value = file ? file.name : '';
};

const handleUpload = async () => {
  // 仅做占位，后续接后端接口
  if (!selectedFile.value) return;
  alert(`模拟上传：${selectedFileName.value}`);
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
</style> 