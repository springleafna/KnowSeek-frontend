import http from './http';
import { useAuthStore } from '@/stores/authStore';

// AI 对话相关 API 服务模块
export const chatApi = {
  // 普通对话：POST /chat/send
  sendMessage(params) {
    return http.post('/chat/send', {
      message: params.message,
      conversationId: params.conversationId,
      useKnowledgeBase: params.useKnowledgeBase,
    });
  },

  // 流式对话：POST /chat/stream (SSE)
  // 返回 { abort, finished }，并通过回调 onMessage/onComplete/onError 通知
  streamMessage(params, handlers = {}) {
    const { onMessage, onComplete, onError } = handlers;

    const controller = new AbortController();
    const signal = controller.signal;

    const authStore = useAuthStore();
    const token = authStore.getToken();

    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = token;
    }

    const finished = fetch('/api/chat/stream', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: params.message,
        conversationId: params.conversationId,
        useKnowledgeBase: params.useKnowledgeBase,
      }),
      signal,
      credentials: 'include',
    })
      .then(async (response) => {
        if (!response.ok || !response.body) {
          const text = await response.text().catch(() => '');
          throw new Error(text || `流式请求失败: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // 解析SSE格式: data: xxx\n\n
          let idx;
          while ((idx = buffer.indexOf('\n\n')) !== -1) {
            const chunk = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 2);

            const lines = chunk.split('\n');
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;
              if (trimmed.startsWith('data:')) {
                const dataStr = trimmed.slice(5).trim();
                if (dataStr === '[DONE]') {
                  onComplete && onComplete();
                } else {
                  try {
                    const data = JSON.parse(dataStr);
                    onMessage && onMessage(data);
                  } catch (e) {
                    // 非JSON则原样回传
                    onMessage && onMessage(dataStr);
                  }
                }
              }
            }
          }
        }

        onComplete && onComplete();
      })
      .catch((err) => {
        if (err.name === 'AbortError') return; // 主动中止
        onError && onError(err);
      });

    return {
      abort: () => controller.abort(),
      finished,
    };
  },

  // 清除对话历史：DELETE /chat/conversation/{conversationId}
  clearConversation(conversationId) {
    return http.delete(`/chat/conversation/${encodeURIComponent(conversationId)}`);
  },

  // 获取会话列表：GET /chat/conversations
  getConversations() {
    return http.get('/chat/conversations');
  },

  // 新建会话：POST /chat/conversations
  createConversation(params) {
    return http.post('/chat/conversations', {
      title: params?.title,
    });
  },

  // 获取会话详情：GET /chat/conversations/{conversationId}
  getConversation(conversationId) {
    return http.get(`/chat/conversations/${encodeURIComponent(conversationId)}`);
  },

  // 删除会话：DELETE /chat/conversations/{conversationId}
  deleteConversation(conversationId) {
    return http.delete(`/chat/conversations/${encodeURIComponent(conversationId)}`);
  },
};

export default chatApi; 