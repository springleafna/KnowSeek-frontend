/**
 * 操作日志相关API服务模块
 */

import http from './http';

export const operationLogApi = {
  /**
   * 分页查询操作日志
   * @param {Object} params - 查询参数
   * @param {number} params.pageNum - 页码
   * @param {number} params.pageSize - 每页大小
   * @param {number} [params.userId] - 用户ID
   * @param {string} [params.moduleName] - 模块名称
   * @param {string} [params.operationType] - 操作类型
   * @param {string} [params.responseResult] - 响应结果（success/fail）
   * @param {string} [params.startTime] - 开始时间（yyyy-MM-dd HH:mm:ss）
   * @param {string} [params.endTime] - 结束时间（yyyy-MM-dd HH:mm:ss）
   * @param {string} [params.roleName] - 角色名称（ADMIN、USER）
   */
  getOperationLogList(params = { pageNum: 1, pageSize: 10 }) {
    return http.get('/operationLog/list', { params })
  }
};

export default operationLogApi;
