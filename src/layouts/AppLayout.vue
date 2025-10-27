<template>
  <div class="app-layout">
    <aside class="app-sidebar" :class="{ collapsed: isCollapsed }">
      <nav class="menu">
        <router-link to="/app/chat" class="menu-item" active-class="active">
          <img src="@/assets/icon/chat.png" alt="AI对话" class="menu-icon">
          <span class="menu-text">AI对话</span>
        </router-link>
        <router-link to="/app/knowledge" class="menu-item" :class="{ active: isKnowledgeActive }">
          <img src="@/assets/icon/knowledgeBase.png" alt="知识库" class="menu-icon">
          <span class="menu-text">知识库</span>
        </router-link>
        <router-link to="/app/file" class="menu-item" active-class="active">
          <img src="@/assets/icon/fileList.png" alt="文件列表" class="menu-icon">
          <span class="menu-text">文件列表</span>
        </router-link>
        <router-link v-if="authStore.isAdmin" to="/app/organization" class="menu-item" active-class="active">
          <img src="@/assets/icon/organization.png" alt="组织管理" class="menu-icon">
          <span class="menu-text">组织管理</span>
        </router-link>
        <router-link v-if="authStore.isAdmin" to="/app/users" class="menu-item" active-class="active">
          <img src="@/assets/icon/user.png" alt="用户管理" class="menu-icon">
          <span class="menu-text">用户管理</span>
        </router-link>
        <router-link to="/app/setting" class="menu-item" active-class="active">
          <img src="@/assets/icon/user.png" alt="个人设置" class="menu-icon">
          <span class="menu-text">个人设置</span>
        </router-link>
      </nav>
      <button class="toggle-btn" @click="toggleSidebar" :title="isCollapsed ? '展开侧边栏' : '收起侧边栏'">
        <svg class="toggle-icon" :class="{ rotated: isCollapsed }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
    </aside>
    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRoute } from 'vue-router'

const isCollapsed = ref(false)
const authStore = useAuthStore()
const route = useRoute()

// 判断知识库菜单是否激活（包括详情页）
const isKnowledgeActive = computed(() => {
  return route.path.startsWith('/app/knowledge')
})

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
.app-layout {
  --bg-page: #f7f8fa;
  --bg-card: #ffffff;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --accent: #1a73e8; /* Google 蓝 */
  --accent-weak: #e8f0fe;
  --border: #e5e7eb;
  --radius-lg: 12px;
  --radius-md: 10px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 8px 24px rgba(17,24,39,0.06);

  display: grid;
  grid-template-columns: 240px 1fr;
  height: 100%;
  background: var(--bg-page);
  color: var(--text-primary);
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
  transition: grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.app-layout:has(.app-sidebar.collapsed) {
  grid-template-columns: 64px 1fr;
}

.app-sidebar {
  background: var(--bg-card);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.brand {
  padding: 18px 20px;
  font-weight: 600;
  color: var(--text-primary);
}

.menu {
  display: flex;
  flex-direction: column;
  padding: 6px;
  gap: 4px;
  flex: 1;
}

.menu-item {
  padding: 10px 12px;
  color: var(--text-primary);
  border-radius: var(--radius-md);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 500;
  font-family: "Microsoft YaHei", "微软雅黑", sans-serif;
  white-space: nowrap;
  overflow: hidden;
  position: relative;
}

.menu-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  object-fit: contain;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-text {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 1;
}

.app-sidebar.collapsed .menu-text {
  opacity: 0;
}

.app-sidebar.collapsed .menu-item {
  padding: 10px 12px;
}

.app-sidebar.collapsed .menu-icon {
  transform: translateX(4px);
}

.menu-item:hover {
  background: #f3f4f6;
}

.menu-item.active {
  background: var(--accent-weak);
  color: var(--accent);
  font-weight: 600;
}

.toggle-btn {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 36px;
  height: 36px;
  border: 1px solid var(--border);
  border-radius: 50%;
  background: var(--bg-card);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.toggle-btn:hover {
  background: #f3f4f6;
  box-shadow: var(--shadow-md);
}

.toggle-icon {
  width: 18px;
  height: 18px;
  color: var(--text-secondary);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-icon.rotated {
  transform: rotate(180deg);
}

.content {
  height: 100%;
  overflow: hidden;
  background: var(--bg-page);
}
</style> 