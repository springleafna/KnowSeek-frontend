<template>
  <div class="page">
    <h2>用户管理</h2>

    <n-data-table
      :columns="columns"
      :data="userList"
      :loading="loading"
      :bordered="true"
      :single-line="false"
    />

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
import { ref, reactive, onMounted, h } from 'vue'
import { NTag, NDataTable, NPagination, NPopconfirm, NButton, useMessage } from 'naive-ui'
import userApi from '@/api/userApi'

const message = useMessage()

// 响应式数据
const userList = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const totalPages = ref(0)

// 删除用户
const handleDelete = async (user) => {
  try {
    await userApi.deleteUser(user.id).then(res=>{
         getUserList();
    })
  } catch (error) {
    console.error('删除用户失败:', error)
    message.error('删除失败')
  }
}

// 重置密码
const handleResetPassword = async (user) => {
  try {
    await userApi.resetPassword(user.id)
  } catch (error) {
    console.error('重置密码失败:', error)
    message.error('重置失败')
  }
}

// 表格列配置
const columns = [
  {
    title: 'ID',
    key: 'id',
    width: 80
  },
  {
    title: '用户名',
    key: 'username',
    width: 150
  },
  {
    title: '角色',
    key: 'role',
    width: 120,
    render(row) {
      const roleMap = {
        'ADMIN': { text: '管理员', type: 'error' },
        'USER': { text: '普通用户', type: 'info' }
      }
      const roleInfo = roleMap[row.role] || { text: row.role, type: 'default' }
      return h(NTag, { type: roleInfo.type }, { default: () => roleInfo.text })
    }
  },
  {
    title: '所属组织',
    key: 'primaryOrgName'
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    render(row) {
      return h('div', { style: { display: 'flex', gap: '8px' } }, [
        // 删除按钮（带确认弹窗）
        h(
          NPopconfirm,
          {
            onPositiveClick: () => handleDelete(row),
            negativeText: '取消',
            positiveText: '确定',
            placement: 'top'
          },
          {
            trigger: () =>
              h(
                NButton,
                { size: 'small', type: 'error', ghost: true },
                { default: () => '删除' }
              ),
            default: () => `确定删除用户 ${row.username}？`
          }
        ),
        // 重置密码按钮
        h(
          NButton,
          {
            size: 'small',
            type: 'warning',
            ghost: true,
            onClick: () => handleResetPassword(row)
          },
          { default: () => '重置密码' }
        )
      ])
    }
  }
]

// 获取用户列表
const getUserList = async () => {
  loading.value = true
  try {
    const response = await userApi.getUserList({
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })

    if (response.list) {
      userList.value = response.list || []
      total.value = response.total || 0
      totalPages.value = response.pages || 0
    } else {
      message.error(response.message || '获取用户列表失败')
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    message.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 页码变化处理
const handlePageChange = (page) => {
  currentPage.value = page
  getUserList()
}

// 每页大小变化处理
const handlePageSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1 // 重置到第一页
  getUserList()
}

// 组件挂载时加载数据
onMounted(() => {
  getUserList()
})

</script>

<style scoped>
.page {
  height: calc(100vh - 8vh);
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.page h2 {
  margin-bottom: 20px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style> 