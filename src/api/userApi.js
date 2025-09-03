/**
 * 用户相关API服务模块
 */

import http from './http';
import tokenUtils from './token';

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
      tokenUtils.removeToken();
    });
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

export default userApi;