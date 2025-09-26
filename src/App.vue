<script setup>
import AppHeader from '@/components/AppHeader.vue'
</script>

<template>
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
