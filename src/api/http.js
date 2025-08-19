import axios from 'axios';
import tokenUtils from './token';

// 公共(无需鉴权)接口路径
const PUBLIC_PATHS = ['/user/login', '/user/register', '/auth/refresh', '/auth/validate'];

// 判断是否为公共接口
function isPublicRequest(url) {
  if (!url) return false;
  const str = url.toString();
  return PUBLIC_PATHS.some((p) => str.includes(p));
}

// 创建axios实例，仅负责HTTP配置与拦截器
const httpClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// 请求拦截器：附加token（非公共接口）
httpClient.interceptors.request.use(
  (config) => {
    if (!isPublicRequest(config.url)) {
      const token = localStorage.getItem('token');
      if (token) {
        // Sa-Token 默认前端携带 Cookie 即可，也可通过自定义请求头 satoken 传递
        // 这里同时设置 Authorization 兼容后端网关，优先按项目约定修改
        config.headers['satoken'] = token;
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器：统一处理返回与错误（后端约定：code=0 表示成功）
httpClient.interceptors.response.use(
  (response) => {
    const res = response.data;
    // 标准结果：{ code, message, data }
    if (res && typeof res === 'object' && 'code' in res) {
      if (res.code === 0) {
        return res.data;
      }
      const msg = res.message || '请求失败';
      console.error('Business Error:', msg);
      return Promise.reject(new Error(msg));
    }
    // 非标准结果（如文件流等）直接返回
    return response.data;
  },
  (error) => {
    let message = '网络错误';

    const status = error?.response?.status;
    const reqUrl = error?.config?.url || '';
    const isPublic = isPublicRequest(reqUrl);

    if (error.response) {
      switch (status) {
        case 400:
          message = error.response.data?.message || '请求参数错误';
          break;
        case 401:
          if (isPublic) {
            message = error.response.data?.message || '用户名或密码错误';
          } else {
            message = error.response.data?.message || '请先登录';
            tokenUtils.removeToken();
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }
          break;
        case 403:
          message = error.response.data?.message || '拒绝访问';
          break;
        case 404:
          message = error.response.data?.message || '请求地址错误';
          break;
        case 500:
          message = error.response.data?.message || '服务器内部错误';
          break;
        default:
          message = error.response.data?.message || '未知错误';
      }
    } else if (error.request) {
      message = '网络连接超时，请检查网络';
    } else {
      message = error.message;
    }

    console.error('HTTP Error:', message, 'URL:', reqUrl);
    return Promise.reject(new Error(message));
  }
);

export default httpClient; 