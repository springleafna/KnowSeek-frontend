/**
 * 知识库相关API服务模块
 */

import http from './http';

export const knowledgeBaseApi = {
  // 创建知识库
  createKnowledgeBase(data) {
    return http.post('/knowledgeBase/create', {
      name: data.name,
      description: data.description
    });
  },

  // 删除知识库
  deleteKnowledgeBase(id) {
    return http.delete(`/knowledgeBase/${id}`);
  },

  // 获取当前用户的知识库列表
  listMyKnowledgeBases() {
    return http.get('/knowledgeBase/list');
  },

  // 更新知识库名称或描述
  updateKnowledgeBase(data) {
    return http.put('/knowledgeBase/update', {
      id: data.id,
      name: data.name,
      description: data.description
    });
  },

  // 获取单个知识库详情
  getKnowledgeBaseById(id) {
    return http.get(`/knowledgeBase/${id}`);
  },

  // 按知识库ID获取文件列表
  listFilesByKnowledgeBaseId(id, params = {}) {
    return http.get(`/knowledgeBase/getFileList/${id}`, { params });
  }
};

export default knowledgeBaseApi; 