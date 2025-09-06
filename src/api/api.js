/**
 * API服务模块
 * 提供用户和文件相关的API服务
 */

import { userApi } from './userApi';
import { fileApi } from './fileApi';
import { organizationApi } from './organizationApi';
import { chatApi } from './chatApi';

// 导出API对象
export { userApi, fileApi, organizationApi, chatApi };

// 默认导出
export default {
  ...userApi,
  ...fileApi,
  ...organizationApi,
  ...chatApi,
};