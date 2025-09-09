<template>
  <div class="app-layout">
    <aside class="app-sidebar">
      <div class="brand">KnowSeek</div>
      <nav class="menu">
        <router-link to="/chat" class="menu-item" active-class="active">AI对话</router-link>
        <router-link to="/file" class="menu-item" active-class="active">文件列表</router-link>
        <router-link to="/knowledge" class="menu-item" active-class="active">知识库</router-link>
        <router-link to="/organization" class="menu-item" active-class="active">组织管理</router-link>
        <router-link to="/users" class="menu-item" active-class="active">用户管理</router-link>
      </nav>
    </aside>
    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
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
  height: 100vh;
  background: var(--bg-page);
  color: var(--text-primary);
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
}

.app-sidebar {
  background: var(--bg-card);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
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
}

.menu-item {
  padding: 10px 12px;
  color: var(--text-primary);
  border-radius: var(--radius-md);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-item:hover {
  background: #f3f4f6;
}

.menu-item.active {
  background: var(--accent-weak);
  color: var(--accent);
  font-weight: 600;
}

.content {
  height: 100vh;
  overflow: hidden;
  background: var(--bg-page);
}
</style> 