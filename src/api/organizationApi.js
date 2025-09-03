/**
 * 组织/部门相关API服务模块
 */

import http from './http';

export const organizationApi = {
  // 选择主组织标签
  setPrimaryOrg(orgTag) {
    return http.put('/organization/setPrimary', null, {
      params: { orgTag }
    });
  },

  // 获取用户组织列表
  getUserAllOrg() {
    return http.get('/organization/allOrg');
  },

  // Admin：创建组织
  createOrg(data) {
    return http.post('/organization/create', {
      orgTag: data.orgTag,
      orgName: data.orgName,
      parentOrgTag: data.parentOrgTag,
      description: data.description
    });
  },

  // Admin：为用户分配组织
  assignOrgToUser(data) {
    return http.post('/organization/assign', {
      userId: data.userId,
      orgTagList: data.orgTagList
    });
  },

  // Admin：添加组织下级
  addSubOrg(data) {
    return http.post('/organization/addSub', {
      orgTag: data.orgTag,
      subOrgTag: data.subOrgTag
    });
  },

  // Admin：编辑组织
  updateOrg(data) {
    return http.put('/organization/update', {
      orgTag: data.orgTag,
      orgName: data.orgName,
      parentOrgTag: data.parentOrgTag,
      description: data.description
    });
  },

  // Admin：查询所有未删除的组织列表（分页）
  getOrganizationList(params) {
    return http.get('/organization/list', {
      params: {
        pageNum: params.pageNum || 1,
        pageSize: params.pageSize || 10,
        tag: params.tag,
        name: params.name
      }
    });
  },

  // Admin：获取组织树形结构
  getOrganizationTree() {
    return http.get('/organization/tree');
  }
};

export default organizationApi;