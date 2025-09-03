/**
 * 文件相关API服务模块
 */

import http from './http';
import SparkMD5 from 'spark-md5';

export const fileApi = {
  initUpload(params) {
    return http.post('/file/init', {
      fileName: params.fileName,
      fileMd5: params.fileMd5,
      fileSize: params.fileSize,
      chunkTotal: params.chunkTotal
    });
  },
  
  uploadChunk(params) {
    return http.post('/file/chunk', {
      uploadId: params.uploadId,
      chunkIndex: params.chunkIndex,
      ETag: params.ETag,
      chunkSize: params.chunkSize
    });
  },
  
  completeUpload(params) {
    return http.post('/file/complete', {
      uploadId: params.uploadId,
      fileName: params.fileName,
      chunkTotalSize: params.chunkTotalSize
    });
  },
  
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
  },
  
  calculateChunkMD5(chunk) {
    return new Promise((resolve, reject) => {
      const spark = new SparkMD5.ArrayBuffer();
      const fileReader = new FileReader();

      fileReader.onload = function(e) {
        spark.append(e.target.result);
        resolve(spark.end());
      };

      fileReader.onerror = function() {
        reject(new Error('分片读取失败'));
      };

      fileReader.readAsArrayBuffer(chunk);
    });
  }
};

export default fileApi;