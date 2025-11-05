import http from './http';

/**
 * 即时通讯 API 服务模块
 * 提供用户间即时消息、对话列表等功能的接口
 */
export const imChatApi = {
  /**
   * 获取对话列表
   * GET /im/conversations
   * @returns {Promise<Array>} 对话列表
   */
  getConversations() {
    return http.get('/im/conversations');
  },

  /**
   * 获取单个对话详情
   * GET /im/conversations/:id
   * @param {string} conversationId - 对话ID
   * @returns {Promise<Object>} 对话详情
   */
  getConversation(conversationId) {
    return http.get(`/im/conversations/${conversationId}`);
  },

  /**
   * 创建新对话
   * POST /im/conversations
   * @param {Object} params
   * @param {string} params.userId - 对方用户ID
   * @param {string} params.type - 对话类型: 'single'(单聊) | 'group'(群聊)
   * @returns {Promise<Object>} 新建的对话信息
   */
  createConversation(params) {
    return http.post('/im/conversations', params);
  },

  /**
   * 删除对话
   * DELETE /im/conversations/:id
   * @param {string} conversationId - 对话ID
   * @returns {Promise<Object>} 删除结果
   */
  deleteConversation(conversationId) {
    return http.delete(`/im/conversations/${conversationId}`);
  },

  /**
   * 获取对话消息列表
   * GET /im/conversations/:id/messages
   * @param {string} conversationId - 对话ID
   * @param {Object} params
   * @param {number} params.page - 页码
   * @param {number} params.pageSize - 每页数量
   * @param {string} params.before - 获取此消息ID之前的消息（用于向上滚动加载）
   * @returns {Promise<Array>} 消息列表
   */
  getMessages(conversationId, params = {}) {
    return http.get(`/im/conversations/${conversationId}/messages`, { params });
  },

  /**
   * 发送消息
   * POST /im/messages
   * @param {Object} params
   * @param {string} params.conversationId - 对话ID
   * @param {string} params.content - 消息内容
   * @param {string} params.type - 消息类型: 'text' | 'image' | 'file' | 'audio' | 'video'
   * @param {Object} params.metadata - 消息元数据（如文件信息、图片尺寸等）
   * @returns {Promise<Object>} 发送的消息信息
   */
  sendMessage(params) {
    return http.post('/im/messages', params);
  },

  /**
   * 撤回消息
   * DELETE /im/messages/:id
   * @param {string} messageId - 消息ID
   * @returns {Promise<Object>} 撤回结果
   */
  recallMessage(messageId) {
    return http.delete(`/im/messages/${messageId}`);
  },

  /**
   * 标记消息为已读
   * PUT /im/messages/read
   * @param {Object} params
   * @param {string} params.conversationId - 对话ID
   * @param {Array<string>} params.messageIds - 消息ID列表
   * @returns {Promise<Object>} 标记结果
   */
  markMessagesAsRead(params) {
    return http.put('/im/messages/read', params);
  },

  /**
   * 搜索消息
   * GET /im/messages/search
   * @param {Object} params
   * @param {string} params.keyword - 搜索关键词
   * @param {string} params.conversationId - 对话ID（可选，不传则全局搜索）
   * @returns {Promise<Array>} 搜索结果
   */
  searchMessages(params) {
    return http.get('/im/messages/search', { params });
  },

  /**
   * 获取未读消息数
   * GET /im/unread-count
   * @returns {Promise<Object>} { total: 总未读数, conversations: { conversationId: 未读数 } }
   */
  getUnreadCount() {
    return http.get('/im/unread-count');
  },

  /**
   * 上传文件（图片、文件等）
   * POST /im/upload
   * @param {FormData} formData - 包含文件的表单数据
   * @returns {Promise<Object>} { url: '文件URL', ... }
   */
  uploadFile(formData) {
    return http.post('/im/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * WebSocket 连接（用于实时消息推送）
   * 注意：这不是HTTP请求，需要单独处理
   * @returns {WebSocket} WebSocket连接实例
   */
  connectWebSocket() {
    // 获取token用于WebSocket鉴权
    const token = localStorage.getItem('token') || '';
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';

    // 在WebSocket URL中携带token
    const ws = new WebSocket(`${wsUrl}/im/ws?token=${encodeURIComponent(token)}`);

    return ws;
  },

  /**
   * 获取在线用户列表
   * GET /im/online-users
   * @returns {Promise<Array>} 在线用户列表
   */
  getOnlineUsers() {
    return http.get('/im/online-users');
  },

  /**
   * 获取用户列表（用于创建新对话时选择用户）
   * GET /im/users
   * @param {Object} params
   * @param {string} params.keyword - 搜索关键词
   * @returns {Promise<Array>} 用户列表
   */
  searchUsers(params) {
    return http.get('/im/users', { params });
  },
};
