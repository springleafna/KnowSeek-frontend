/**
 * 文件相关API服务模块
 */

import http from './http';
import SparkMD5 from 'spark-md5';

export const fileApi = {
  /**
   * 【新增】获取文件列表
   * @param {object} params - 查询参数
   * @param {number} params.pageNum - 当前页码
   * @param {number} params.pageSize - 每页数量
   * @param {string} [params.kbName] - 知识库名称（模糊搜索）
   * @param {string} [params.fileName] - 文件名称（模糊搜索）
   * @param {string} [params.sortBy] - 排序字段 (fileName, totalSize, status, createdAt, type)
   * @param {string} [params.sortOrder] - 排序顺序 (asc, desc)
   * @returns {Promise}
   */
  getFileList(params) {
    return http.get('/file/getFileList', { params });
  },

  /**
   * 初始化分片上传
   * @param {object} params - 请求参数
   * @returns {Promise}
   */
  initUpload(params) {
    return http.post('/file/init', {
      fileName: params.fileName,
      fileMd5: params.fileMd5,
      fileSize: params.fileSize,
      chunkTotal: params.chunkTotal,
      knowledgeBaseId: params.knowledgeBaseId
    });
  },

  /**
   * 上传文件分片
   * @param {object} params - 请求参数
   * @returns {Promise}
   */
  uploadChunk(params) {
    return http.post('/file/chunk', {
      uploadId: params.uploadId,
      chunkIndex: params.chunkIndex,
      ETag: params.ETag,
      chunkSize: params.chunkSize
    });
  },

  /**
   * 完成分片上传
   * @param {object} params - 请求参数
   * @returns {Promise}
   */
  completeUpload(params) {
    return http.post('/file/complete', {
      uploadId: params.uploadId,
      fileName: params.fileName,
      chunkTotalSize: params.chunkTotalSize,
      knowledgeBaseId: params.knowledgeBaseId
    });
  },
  
  /**
   * 计算文件MD5值（分块读取）
   * @param {File} file - 文件对象
   * @returns {Promise<string>}
   */
  calculateFileMD5(file) {
    return new Promise((resolve, reject) => {
      const blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
      const chunkSize = 5242880; // 5MB每分片大小
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
  
  /**
   * 计算分片MD5值
   * @param {Blob} chunk - 文件分片对象
   * @returns {Promise<string>}
   */
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
  },

  /**
   * 删除文件
   * @param {number} id - 文件ID
   * @returns {Promise}
   */
  deleteFile(id) {
    return http.delete('/file/delete', { params: { id } });
  }
};

export default fileApi;