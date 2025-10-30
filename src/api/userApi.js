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
    return http.put('/user/resetPassword', null, { params: { id } })
  },
  /**
   * 修改密码
   * @param {Object} params - 密码参数
   * @param {string} params.oldPassword - 原密码
   * @param {string} params.newPassword - 新密码
   */
  changePassword(params) {
    return http.put('/user/changePassword', {
      oldPassword: params.oldPassword,
      newPassword: params.newPassword
    })
  },
  /**
   * 更新个人资料
   * @param {Object} data - 个人资料数据
   * @param {string} data.nickname - 昵称
   * @param {string} data.email - 邮箱
   * @param {string} data.phone - 手机号
   * @param {string} data.bio - 个人简介
   */
  updateProfile(data) {
    return http.put('/user/profile', data)
  }
};

export default userApi;