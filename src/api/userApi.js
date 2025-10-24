/**
 * 用户相关API服务模块
 */

import http from './http';
import { useAuthStore } from '@/stores/authStore';

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
    return http.post('/user/logout').finally(() => {
      const authStore = useAuthStore();
      authStore.logout();
    });
  },
  getUserInfo() {
    return http.get('/user/info');
  },
  /**
   * 管理员获取用户列表
   * @param {Object} params - 查询参数
   * @param {number} params.pageNum - 页码
   * @param {number} params.pageSize - 每页大小
   */
  getUserList(params = { pageNum: 1, pageSize: 10 }) {
    return http.get('/user/list', { params })
  },
  deleteUser(id) {
   return http.delete('/user/delete', {
      params: {
        id
      }
    })
  },
  resetPassword(id) {
    http.put('/user/resetPassword', {
      params: {
        id
      }
    })
  }
};

export default userApi;