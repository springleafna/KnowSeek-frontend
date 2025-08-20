/**
 * API服务模块
 * 提供统一的API请求服务和用户认证功能
 */

import http from './http';
import tokenUtils from './token';
import SparkMD5 from 'spark-md5';

// 用户相关API（仅职责：定义接口）
export const userApi = {
  login(params) {
    return http.post('/user/login', {
      username: params.username,
      password: params.password,
    });
  },
  register(params) {
    return http.post('/user/register', {
      username: params.username,
      password: params.password,
    });
  },
  logout() {
    return http.post('/user/logout');
  },
  getUserInfo() {
    return http.get('/user/info');
  },
  updateUserInfo(params) {
    return http.put('/user/update', params);
  },
  changePassword(params) {
    return http.put('/user/change-password', params);
  },
  validateToken() {
    return http.get('/auth/validate');
  },
  refreshToken() {
    return http.post('/auth/refresh');
  },
};

// 文件上传相关API
export const fileApi = {
  // 文件上传初始化
  initUpload(params) {
    return http.post('/file/init', {
      fileName: params.fileName,
      fileMd5: params.fileMd5,
      fileSize: params.fileSize,
      chunkTotal: params.chunkTotal
    });
  },
  
  // 上传文件分片
  uploadChunk(chunkUrl, chunk, onProgress) {
    const formData = new FormData();
    formData.append('file', chunk);
    
    return http.post(chunkUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: onProgress
    });
  },
  
  // 计算文件MD5
  calculateFileMD5(file) {
    return new Promise((resolve, reject) => {
      const blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
      const chunkSize = 2097152; // 2MB
      const chunks = Math.ceil(file.size / chunkSize);
      let currentChunk = 0;
      const spark = new SparkMD5.ArrayBuffer();
      const fileReader = new FileReader();

      fileReader.onload = function(e) {
        spark.append(e.target.result);
        currentChunk++;

        if (currentChunk < chunks) {
          loadNext();
        } else {
          resolve(spark.end());
        }
      };

      fileReader.onerror = function() {
        reject(new Error('文件读取失败'));
      };

      function loadNext() {
        const start = currentChunk * chunkSize;
        const end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;
        fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
      }

      loadNext();
    });
  }
};

// 兼容：默认导出组合对象
export default {
  ...userApi,
  ...fileApi,
  tokenUtils,
};

// 兼容：保持原有的具名导出
export { tokenUtils };
export const login = userApi.login;
export const register = userApi.register;
export const logout = userApi.logout;
export const isLoggedIn = tokenUtils.isLoggedIn;
export const getToken = tokenUtils.getToken;
export const clearToken = tokenUtils.removeToken;