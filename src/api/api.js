/**
 * API服务模块
 * 提供统一的API请求服务和用户认证功能
 */

import http from './http';
import tokenUtils from './token';

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

// 兼容：默认导出组合对象
export default {
  ...userApi,
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