<template>
  <div class="page">
    <h2>操作日志管理</h2>

    <!-- 搜索筛选区域 -->
    <div class="search-wrapper">
      <n-space>
        <n-input
          v-model:value="searchForm.moduleName"
          placeholder="模块名称"
          clearable
          style="width: 150px"
        />
        <n-select
          v-model:value="searchForm.operationType"
          placeholder="操作类型"
          clearable
          :options="operationTypeOptions"
          style="width: 120px"
        />
        <n-select
          v-model:value="searchForm.responseResult"
          placeholder="响应结果"
          clearable
          :options="responseResultOptions"
          style="width: 120px"
        />
        <n-select
          v-model:value="searchForm.roleName"
          placeholder="角色"
          clearable
          :options="roleNameOptions"
          style="width: 120px"
        />
        <n-date-picker
          v-model:value="dateRange"
          type="datetimerange"
          clearable
          :default-time="['00:00:00', '23:59:59']"
          style="width: 340px"
        />
        <n-button type="primary" @click="handleSearch">
          查询
        </n-button>
        <n-button @click="handleReset">
          重置
        </n-button>
      </n-space>
    </div>

    <!-- 数据表格 -->
    <div class="table-wrapper">
      <n-data-table
        :columns="columns"
        :data="logList"
        :loading="loading"
        :bordered="true"
        :single-line="false"
        :scroll-x="1200"
        :max-height="tableMaxHeight"
      />
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <n-pagination
        v-model:page="currentPage"
        v-model:page-size="pageSize"
        :item-count="total"
        show-size-picker
        :page-sizes="[10, 20, 30, 50]"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, h } from 'vue'
import {
  NTag,
  NDataTable,
  NPagination,
  NInput,
  NSelect,
  NDatePicker,
  NButton,
  NSpace,
  useMessage
} from 'naive-ui'
import operationLogApi from '@/api/operationLogApi'

const message = useMessage()

// 响应式数据
const logList = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dateRange = ref(null)
const tableMaxHeight = ref(400)

// 计算表格最大高度
const calcTableHeight = () => {
  // 页面高度 - 头部(8vh) - padding(40px) - 标题(约50px) - 搜索区(约50px) - 分页区(约60px)
  const height = window.innerHeight * 0.92 - 40 - 50 - 50 - 60
  tableMaxHeight.value = Math.max(height, 200)
}

// 搜索表单
const searchForm = ref({
  moduleName: '',
  operationType: null,
  responseResult: null,
  roleName: null
})

// 操作类型选项
const operationTypeOptions = [
  { label: '查询', value: '查询' },
  { label: '新增', value: '新增' },
  { label: '修改', value: '修改' },
  { label: '删除', value: '删除' },
  { label: '登录', value: '登录' },
  { label: '登出', value: '登出' },
  { label: '导出', value: '导出' },
  { label: '导入', value: '导入' },
  { label: '上传', value: '上传' },
  { label: '下载', value: '下载' },
  { label: '其他', value: '其他' }
]

// 响应结果选项
const responseResultOptions = [
  { label: '成功', value: 'success' },
  { label: '失败', value: 'fail' }
]

// 角色选项
const roleNameOptions = [
  { label: '管理员', value: 'ADMIN' },
  { label: '普通用户', value: 'USER' }
]

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  try {
    const date = new Date(dateTime)
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const hh = String(date.getHours()).padStart(2, '0')
    const mm = String(date.getMinutes()).padStart(2, '0')
    const ss = String(date.getSeconds()).padStart(2, '0')
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
  } catch {
    return dateTime
  }
}

// 格式化日期为请求参数格式
const formatDateForRequest = (timestamp) => {
  if (!timestamp) return null
  const date = new Date(timestamp)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  const ss = String(date.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
}

// 表格列配置
const columns = [
  {
    title: '用户ID',
    key: 'userId',
    width: 80,
    render(row) {
      return row.userId === 0 ? '未登录' : row.userId
    }
  },
  {
    title: '角色',
    key: 'roleName',
    width: 80,
    render(row) {
      return row.roleName === null ? '未登录' : row.roleName
    }
  },
  {
    title: '模块名称',
    key: 'moduleName',
    width: 120
  },
  {
    title: '操作类型',
    key: 'operationType',
    width: 100,
    render(row) {
      const typeMap = {
        '查询': 'info',
        '新增': 'success',
        '修改': 'warning',
        '删除': 'error',
        '登录': 'primary',
        '登出': 'default',
        '导出': 'info',
        '导入': 'info',
        '上传': 'info',
        '下载': 'info',
        '其他': 'default'
      }
      const type = typeMap[row.operationType] || 'default'
      return h(NTag, { type, size: 'small' }, { default: () => row.operationType })
    }
  },
  {
    title: '操作描述',
    key: 'description',
    width: 150,
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '请求路径',
    key: 'requestUrl',
    width: 180,
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '请求方式',
    key: 'requestMethod',
    width: 80,
    render(row) {
      const methodMap = {
        'GET': 'info',
        'POST': 'success',
        'PUT': 'warning',
        'DELETE': 'error'
      }
      const type = methodMap[row.requestMethod] || 'default'
      return h(NTag, { type, size: 'small' }, { default: () => row.requestMethod })
    }
  },
  {
    title: '请求参数',
    key: 'requestParams',
    width: 200,
    ellipsis: {
      tooltip: true
    },
    render(row) {
      if (!row.requestParams) return '-'
      try {
        return typeof row.requestParams === 'string'
          ? row.requestParams
          : JSON.stringify(row.requestParams)
      } catch {
        return row.requestParams
      }
    }
  },
  {
    title: 'IP地址',
    key: 'ipAddress',
    width: 130
  },
  {
    title: '响应结果',
    key: 'responseResult',
    width: 90,
    render(row) {
      const isSuccess = row.responseResult === 'success'
      return h(
        NTag,
        { type: isSuccess ? 'success' : 'error', size: 'small' },
        { default: () => isSuccess ? '成功' : '失败' }
      )
    }
  },
  {
    title: '响应信息',
    key: 'responseMessage',
    width: 150,
    ellipsis: {
      tooltip: true
    },
    render(row) {
      return row.responseMessage === null ? '无' : row.responseMessage
    }
  },
  {
    title: '耗时(ms)',
    key: 'executionTime',
    width: 90,
    render(row) {
      const time = row.executionTime
      if (time === null || time === undefined) return '-'
      let type = 'success'
      if (time > 1000) type = 'error'
      else if (time > 500) type = 'warning'
      return h(NTag, { type, size: 'small' }, { default: () => `${time}ms` })
    }
  },
  {
    title: '操作时间',
    key: 'operationTime',
    width: 170,
    render(row) {
      return formatDateTime(row.operationTime)
    }
  }
]

// 获取操作日志列表
const getLogList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }

    // 添加搜索条件
    if (searchForm.value.moduleName) {
      params.moduleName = searchForm.value.moduleName
    }
    if (searchForm.value.operationType) {
      params.operationType = searchForm.value.operationType
    }
    if (searchForm.value.responseResult) {
      params.responseResult = searchForm.value.responseResult
    }
    if (searchForm.value.roleName) {
      params.roleName = searchForm.value.roleName
    }
    if (dateRange.value && dateRange.value.length === 2) {
      params.startTime = formatDateForRequest(dateRange.value[0])
      params.endTime = formatDateForRequest(dateRange.value[1])
    }

    const response = await operationLogApi.getOperationLogList(params)

    if (response.list) {
      logList.value = response.list || []
      total.value = response.total || 0
    } else {
      message.error(response.message || '获取操作日志列表失败')
    }
  } catch (error) {
    console.error('获取操作日志列表失败:', error)
    message.error('获取操作日志列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  getLogList()
}

// 重置搜索
const handleReset = () => {
  searchForm.value = {
    moduleName: '',
    operationType: null,
    responseResult: null,
    roleName: null
  }
  dateRange.value = null
  currentPage.value = 1
  getLogList()
}

// 页码变化处理
const handlePageChange = (page) => {
  currentPage.value = page
  getLogList()
}

// 每页大小变化处理
const handlePageSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  getLogList()
}

// 组件挂载时加载数据
onMounted(() => {
  calcTableHeight()
  window.addEventListener('resize', calcTableHeight)
  getLogList()
})

// 组件卸载时移除监听
onUnmounted(() => {
  window.removeEventListener('resize', calcTableHeight)
})
</script>

<style scoped>
.page {
  height: calc(100vh - 8vh);
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page h2 {
  margin-bottom: 20px;
  flex-shrink: 0;
}

.search-wrapper {
  margin-bottom: 16px;
  flex-shrink: 0;
}

.table-wrapper {
  flex: 1;
  overflow: hidden;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  flex-shrink: 0;
}
</style>
