<template>
  <div class="kb-container">
    <!-- Header -->
    <div class="kb-header">
      <h1 class="kb-title">知识库</h1>
      <p class="kb-subtitle">探索我们的知识资源，提升您的技能和知识水平</p>
    </div>

    <!-- Search & Controls -->
    <n-space class="kb-controls" wrap align="center">
      <n-input
        v-model:value="searchTerm"
        placeholder="搜索知识库..."
        clearable
        style="max-width: 420px; width: 100%"
      >
        <template #prefix>
          <n-icon>
            <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z"/></svg>
          </n-icon>
        </template>
      </n-input>

      <n-select
        v-model:value="selectedCategory"
        :options="categoryOptions"
        style="width: 160px"
        placeholder="选择分类"
        clearable
      />

      <n-button-group>
        <n-button :type="viewMode === 'grid' ? 'primary' : 'default'" quaternary @click="setViewMode('grid')">
          <n-icon size="16" style="margin-right: 6px">
            <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M10 3H3v7h7V3m11 0h-7v7h7V3M10 14H3v7h7v-7m11 0h-7v7h7v-7Z"/></svg>
          </n-icon>
          网格
        </n-button>
        <n-button :type="viewMode === 'list' ? 'primary' : 'default'" quaternary @click="setViewMode('list')">
          <n-icon size="16" style="margin-right: 6px">
            <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M3 5h18v2H3V5m0 6h18v2H3v-2m0 6h18v2H3v-2Z"/></svg>
          </n-icon>
          列表
        </n-button>
      </n-button-group>

      <n-button type="primary" @click="openCreate">新增</n-button>
    </n-space>

    <!-- Result count -->
    <div class="kb-count">
      找到 {{ filteredItems.length }} 个结果
      <template v-if="selectedCategory && selectedCategory !== '全部'">
        ，在 "{{ selectedCategory }}" 分类中
      </template>
    </div>

    <!-- Content -->
    <div v-if="filteredItems.length > 0">
      <n-grid v-if="viewMode === 'grid'" cols="1 s:2 l:3" x-gap="24" y-gap="24" responsive="screen">
        <n-grid-item v-for="item in filteredItems" :key="item.id">
          <n-card :segmented="{ content: true, footer: true }" class="kb-card kb-card--hover" @click="onView(item)" style="cursor: pointer;">
            <template #header>
              <div class="kb-card-header">
                <div class="kb-type">
                  <n-tag size="small" type="info" round>
                    {{ item.typeLabel }}
                  </n-tag>
                  <n-tag v-if="authStore.userInfo?.primaryKbId === item.id" size="small" type="success" round>
                    默认
                  </n-tag>
                </div>
                <n-tag size="small" type="default" round> {{ item.category || '未分类' }} </n-tag>
              </div>
              <div class="kb-card-title">{{ item.title }}</div>
              <div class="kb-card-desc">{{ item.description || '暂无描述' }}</div>
            </template>

            <div class="kb-tags" v-if="item.tags && item.tags.length">
              <n-space :size="6" wrap>
                <n-tag v-for="t in item.tags" :key="t" size="small" type="default" round bordered>
                  {{ t }}
                </n-tag>
              </n-space>
            </div>

            <div class="kb-card-meta">
              <div class="kb-meta-row">
                <span>创建时间: {{ item.lastUpdated }}</span>
                <span v-if="item.readTime">{{ item.readTime }}</span>
              </div>
            </div>

            <template #footer>
              <n-space justify="space-between">
                <n-space>
                  <n-button size="small" type="primary" secondary @click.stop="onView(item)">查看</n-button>
                  <n-button size="small" @click.stop="onEdit(item)">编辑</n-button>
                </n-space>
                <n-button
                  v-if="authStore.userInfo?.primaryKbId !== item.id"
                  size="small"
                  type="primary"
                  quaternary
                  @click.stop="setPrimary(item)"
                >
                  设为默认
                </n-button>
              </n-space>
            </template>
          </n-card>
        </n-grid-item>
      </n-grid>

      <div v-else class="kb-list">
        <n-card v-for="item in filteredItems" :key="item.id" :segmented="{ content: true, footer: true }" class="kb-card-list kb-card kb-card--hover" @click="onView(item)" style="cursor: pointer;">
          <template #header>
            <div class="kb-list-header">
              <div>
                <div class="kb-card-title">
                  {{ item.title }}
                  <n-tag v-if="authStore.userInfo?.primaryKbId === item.id" size="small" type="success" round style="margin-left: 8px">
                    默认
                  </n-tag>
                </div>
                <div class="kb-card-desc">{{ item.description || '暂无描述' }}</div>
              </div>
              <n-tag size="small" type="default" round>{{ item.category || '未分类' }}</n-tag>
            </div>
          </template>
          <div class="kb-tags" v-if="item.tags && item.tags.length">
            <n-space :size="6" wrap>
              <n-tag v-for="t in item.tags" :key="t" size="small" bordered round>
                {{ t }}
              </n-tag>
            </n-space>
          </div>
          <div class="kb-card-meta">
            <div class="kb-meta-row">
              <span>创建时间: {{ item.lastUpdated }}</span>
            </div>
          </div>
          <template #footer>
            <n-space justify="space-between">
              <n-space>
                <n-button size="small" type="primary" secondary @click.stop="onView(item)">查看</n-button>
                <n-button size="small" @click.stop="onEdit(item)">编辑</n-button>
              </n-space>
              <n-button
                v-if="authStore.userInfo?.primaryKbId !== item.id"
                size="small"
                type="primary"
                quaternary
                @click.stop="setPrimary(item)"
              >
                设为默认
              </n-button>
            </n-space>
          </template>
        </n-card>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="kb-empty">
      <n-empty description="未找到相关内容">
        <template #extra>
          <n-text depth="3">尝试调整搜索关键词或选择不同分类</n-text>
        </template>
      </n-empty>
    </div>

    <!-- Create / Edit Modal -->
    <n-modal v-model:show="showEditModal" :title="isEdit ? '编辑知识库' : '新增知识库'" preset="dialog">
      <n-form ref="formRef" :model="formModel" :rules="formRules" label-placement="left" label-width="80">
        <n-form-item label="名称" path="name">
          <n-input v-model:value="formModel.name" placeholder="请输入名称" maxlength="20" show-count />
        </n-form-item>
        <n-form-item label="描述" path="description">
          <n-input v-model:value="formModel.description" type="textarea" placeholder="请输入描述" maxlength="50" show-count :autosize="{ minRows: 3, maxRows: 5 }" />
        </n-form-item>
      </n-form>
      <template #action>
        <n-space>
          <n-button @click="closeModal">取消</n-button>
          <n-button type="primary" :loading="saving" @click="submitForm">保存</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useMessage, NInput, NButton, NGrid, NGridItem, NCard, NTag, NEmpty, NText, NSpace, NIcon, NSelect, NButtonGroup } from 'naive-ui';
import { knowledgeBaseApi } from '@/api/knowledgeBaseApi';
// 额外引入的组件（仅用于类型提示与自动引入）
import { NForm, NFormItem, NModal } from 'naive-ui';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const message = useMessage();
const router = useRouter();
const authStore = useAuthStore();

const searchTerm = ref('');
const viewMode = ref('grid'); // 'grid' | 'list'
const selectedCategory = ref('全部');

const rawItems = ref([]);

function formatDateTime(ts) {
  if (!ts) return '';
  try {
    const d = new Date(ts);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  } catch (e) {
    return String(ts);
  }
}

function normalize(vo) {
  return {
    id: vo.id,
    title: vo.name,
    description: vo.description,
    category: vo.category || '未分类',
    typeLabel: '文档',
    lastUpdated: formatDateTime(vo.createdAt),
    tags: vo.tags || [],
  };
}

const categoryOptions = computed(() => {
  const set = new Set(['全部']);
  rawItems.value.forEach((it) => set.add(it.category || '未分类'));
  return Array.from(set).map((v) => ({ label: v, value: v }));
});

const filteredItems = computed(() => {
  const term = searchTerm.value.trim().toLowerCase();
  const cat = selectedCategory.value;
  return rawItems.value.filter((it) => {
    const matchesSearch = !term
      || (it.title || '').toLowerCase().includes(term)
      || (it.description || '').toLowerCase().includes(term)
      || (it.category || '').toLowerCase().includes(term);
    const matchesCategory = !cat || cat === '全部' || it.category === cat;
    return matchesSearch && matchesCategory;
  });
});

function setViewMode(mode) {
  viewMode.value = mode;
}

function onView(item) {
  router.push({ name: 'KnowledgeDetail', params: { id: item.id } });
}

// 新增 / 编辑 相关
const showEditModal = ref(false);
const isEdit = ref(false);
const saving = ref(false);
const editingId = ref(null);
const formRef = ref(null);
const formModel = ref({
  name: '',
  description: ''
});
const formRules = {
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
    { max: 20, message: '名称最多20个字', trigger: ['input', 'blur'] }
  ],
  description: [
    { max: 50, message: '描述最多50个字', trigger: ['input', 'blur'] }
  ]
};

function openCreate() {
  isEdit.value = false;
  editingId.value = null;
  formModel.value = { name: '', description: '' };
  showEditModal.value = true;
}

function onEdit(item) {
  isEdit.value = true;
  editingId.value = item.id;
  formModel.value = { name: item.title || '', description: item.description || '' };
  showEditModal.value = true;
}

function closeModal() {
  showEditModal.value = false;
}

async function submitForm() {
  if (!formRef.value) return;
  try {
    saving.value = true;
    await formRef.value.validate();
    if (isEdit.value && editingId.value) {
      await knowledgeBaseApi.updateKnowledgeBase({
        id: editingId.value,
        name: formModel.value.name,
        description: formModel.value.description
      });
      message.success('更新成功');
    } else {
      await knowledgeBaseApi.createKnowledgeBase({
        name: formModel.value.name,
        description: formModel.value.description
      });
      message.success('创建成功');
    }
    showEditModal.value = false;
    await fetchList();
  } catch (err) {
    if (err && err.message) {
      message.error(err.message);
    }
  } finally {
    saving.value = false;
  }
}

async function fetchList() {
  try {
    const list = await knowledgeBaseApi.listMyKnowledgeBases();
    rawItems.value = Array.isArray(list) ? list.map(normalize) : [];
  } catch (err) {
    message.error(err.message || '获取知识库列表失败');
  }
}

async function setPrimary(item) {
  try {
    await knowledgeBaseApi.setPrimaryKnowledgeBase(item.id);
    message.success(`已将"${item.title}"设为默认知识库`);

    // 更新本地用户信息中的 primaryKbId
    if (authStore.userInfo) {
      const updatedUserInfo = { ...authStore.userInfo, primaryKbId: item.id };
      authStore.setUserInfo(updatedUserInfo);
    }
  } catch (err) {
    message.error(err.message || '设置默认知识库失败');
  }
}

onMounted(fetchList);
</script>

<style scoped>
.kb-container {
  height: calc(100vh - 8vh);
  padding: 24px;
}
.kb-header {
  margin-bottom: 16px;
}
.kb-title {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
}
.kb-subtitle {
  margin: 0;
  color: #666;
}
.kb-controls {
  margin: 16px 0 12px;
}
.kb-count {
  color: #888;
  margin-bottom: 16px;
}
/* Cards */
.kb-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}
.kb-card--hover {
  transition: box-shadow .2s ease;
}
.kb-card--hover:hover {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}
.kb-card-title {
  font-size: 18px;
  font-weight: 600;
  margin-top: 6px;
}
.kb-card-desc {
  color: #6b7280;
  margin-top: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.kb-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.kb-type {
  display: flex;
  align-items: center;
  gap: 8px;
}
.kb-tags {
  margin: 8px 0 4px;
}
.kb-card-meta {
  color: #888;
  font-size: 12px;
}
.kb-meta-row {
  display: flex;
  justify-content: space-between;
}
.kb-list .kb-card-list + .kb-card-list {
  margin-top: 16px;
}
.kb-empty {
  padding: 60px 0;
}
</style> 