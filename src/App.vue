<script setup>
import { NConfigProvider, lightTheme } from 'naive-ui'
import AppHeader from '@/components/AppHeader.vue'

const themeOverrides = {
  common: {
    primaryColor: '#387be9',
    primaryColorHover: '#5a93f0',
    primaryColorPressed: '#2a5fb8',
    // 全局基础圆角（影响 Button、Input、Select 等多数组件）
    borderRadius: '12px'
  },
  // 显式设置 Dialog 的圆角
  Dialog: {
    borderRadius: '12px'
  },
  Button: {
    borderRadius: '12px'
  },
  Card: {
    borderRadius: '12px'
  },
  // 如果你用到 Message、Notification 等，也可以设置
  Message: {
    borderRadius: '12px'
  }
}
</script>

<template>
  <n-config-provider
    :theme="lightTheme"
    :theme-overrides="themeOverrides"
  >
    <n-message-provider>
      <n-dialog-provider>
        <n-layout style="height: 100vh;">
          <AppHeader />
          <n-layout-content embedded style="padding: 0;">
            <router-view />
          </n-layout-content>
        </n-layout>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>