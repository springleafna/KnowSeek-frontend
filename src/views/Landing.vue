<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-background">
        <div class="gradient-orb orb-1"></div>
        <div class="gradient-orb orb-2"></div>
        <div class="gradient-orb orb-3"></div>
      </div>

      <div class="hero-content">
        <div class="logo-badge">
          <span class="badge-icon">🔍</span>
          <span class="badge-text">KnowSeek</span>
        </div>

        <h1 class="hero-title">
          智能知识检索系统
          <span class="gradient-text">AI-Powered Knowledge Hub</span>
        </h1>

        <p class="hero-description">
          基于大语言模型与向量检索技术，为您提供快速、精准、安全的智能问答体验
        </p>

        <div class="hero-actions">
          <n-button type="primary" size="large" round @click="goToRegister" class="btn-primary">
            立即开始
            <template #icon>
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M13.3 17.275q-.3-.3-.288-.725t.313-.7L16.15 13H5q-.425 0-.713-.288T4 12q0-.425.288-.713T5 11h11.15L13.3 8.15q-.3-.3-.3-.713t.3-.712q.3-.3.713-.3t.712.3l4.6 4.6q.15.15.213.325t.062.35q0 .175-.063.35t-.212.325l-4.6 4.6q-.275.275-.687.275t-.713-.275Z"/>
              </svg>
            </template>
          </n-button>

          <n-button size="large" round @click="goToLogin" class="btn-secondary">
            登录账号
            <template #icon>
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M13.3 17.275q-.3-.3-.288-.725t.313-.7L16.15 13H5q-.425 0-.713-.288T4 12q0-.425.288-.713T5 11h11.15L13.3 8.15q-.3-.3-.3-.713t.3-.712q.3-.3.713-.3t.712.3l4.6 4.6q.15.15.213.325t.062.35q0 .175-.063.35t-.212.325l-4.6 4.6q-.275.275-.687.275t-.713-.275Z"/>
              </svg>
            </template>
          </n-button>
        </div>

        <div class="hero-stats">
          <div class="stat-item">
            <div class="stat-value">99.9%</div>
            <div class="stat-label">系统可用性</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-value">&lt;2s</div>
            <div class="stat-label">平均响应时间</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-value">100+</div>
            <div class="stat-label">文件格式支持</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="section-header">
        <h2 class="section-title">为什么选择 KnowSeek？</h2>
        <p class="section-subtitle">强大的功能，极致的体验</p>
      </div>

      <div class="features-grid">
        <div v-for="feature in features" :key="feature.title" class="feature-card">
          <div class="feature-icon" v-html="feature.icon"></div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-description">{{ feature.description }}</p>
        </div>
      </div>
    </section>

    <!-- Tech Stack Section -->
    <section class="tech-section">
      <div class="section-header">
        <h2 class="section-title">强大而可靠的底层架构</h2>
        <p class="section-subtitle">采用业界领先的技术栈，保障系统稳定性与可扩展性</p>
      </div>

      <div class="tech-grid">
        <div v-for="tech in techStack" :key="tech.name" class="tech-badge">
          <span class="tech-icon" v-html="tech.icon"></span>
          <span class="tech-name">{{ tech.name }}</span>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-content">
        <h2 class="cta-title">准备好开启智能检索之旅了吗？</h2>
        <p class="cta-description">立即注册，体验 AI 驱动的知识管理系统</p>
        <n-button type="primary" size="large" round @click="goToRegister" class="btn-cta">
          免费开始使用
        </n-button>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-left">
          <div class="footer-logo">
            <span class="logo-icon">🔍</span>
            <span class="logo-text">KnowSeek</span>
          </div>
          <p class="footer-description">智能知识检索，让信息触手可及</p>
        </div>

        <div class="footer-links">
          <div class="footer-column">
            <h4 class="footer-heading">产品</h4>
            <a href="#features" class="footer-link">功能特性</a>
            <a href="#tech" class="footer-link">技术架构</a>
          </div>

          <div class="footer-column">
            <h4 class="footer-heading">资源</h4>
            <a href="#" class="footer-link">文档中心</a>
            <a href="#" class="footer-link">API 接口</a>
          </div>

          <div class="footer-column">
            <h4 class="footer-heading">关于</h4>
            <a href="#" class="footer-link">关于我们</a>
            <a href="#" class="footer-link">联系我们</a>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2025 KnowSeek. All rights reserved.</p>
        <div class="footer-badges">
          <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License" />
          <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" />
        </div>
      </div>
    </footer>

    <!-- Floating Help Button -->
    <div class="floating-help" @click="showHelp = true">
      <svg viewBox="0 0 24 24" width="24" height="24">
        <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
      </svg>
    </div>

    <!-- Help Modal -->
    <n-modal v-model:show="showHelp" preset="card" title="快速入门指南" style="max-width: 600px;">
      <div class="help-content">
        <div class="help-step">
          <div class="help-step-number">1</div>
          <div class="help-step-content">
            <h4>注册账号</h4>
            <p>点击"立即开始"按钮，填写基本信息完成注册</p>
          </div>
        </div>

        <div class="help-step">
          <div class="help-step-number">2</div>
          <div class="help-step-content">
            <h4>创建知识库</h4>
            <p>上传您的文档资料，系统将自动解析并建立索引</p>
          </div>
        </div>

        <div class="help-step">
          <div class="help-step-number">3</div>
          <div class="help-step-content">
            <h4>开始提问</h4>
            <p>在对话框中输入问题，AI 将基于您的知识库给出精准回答</p>
          </div>
        </div>
      </div>

      <template #footer>
        <n-button type="primary" round @click="showHelp = false">知道了</n-button>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { NButton, NModal } from 'naive-ui';

const router = useRouter();
const showHelp = ref(false);

const features = [
  {
    title: '🧠 智能对话',
    description: '基于大模型的智能回答，支持知识溯源与上下文理解',
    icon: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`
  },
  {
    title: '📁 多格式解析',
    description: 'PDF / Word / TXT 等多种格式自动提取内容',
    icon: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>`
  },
  {
    title: '🔍 增强向量检索',
    description: 'pgvector + 语义相似度实现精准匹配',
    icon: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>`
  },
  {
    title: '☁️ 大文件分片上传',
    description: '断点续传，OSS 直传不卡顿',
    icon: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>`
  },
  {
    title: '🔐 安全防护机制',
    description: '防提示词注入，多层安全过滤',
    icon: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`
  },
  {
    title: '🏢 组织权限管理',
    description: '多租户架构，角色控制访问',
    icon: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`
  }
];

const techStack = [
  { name: 'Spring Boot', icon: '🍃' },
  { name: 'Java 17', icon: '☕' },
  { name: 'MySQL', icon: '🗄️' },
  { name: 'PostgreSQL', icon: '🐘' },
  { name: 'pgvector', icon: '🎯' },
  { name: 'Redis', icon: '⚡' },
  { name: 'Elasticsearch', icon: '🔎' },
  { name: 'RabbitMQ', icon: '🐰' },
  { name: 'Apache Tika', icon: '📄' },
  { name: '阿里云 OSS', icon: '☁️' },
  { name: '通义千问', icon: '🤖' },
  { name: 'Sa-Token', icon: '🔐' },
  { name: 'Spring AI', icon: '🧠' }
];

function goToLogin() {
  router.push('/login');
}

function goToRegister() {
  router.push('/register');
}
</script>

<style scoped>
.landing-page {
  width: 100%;
  overflow-x: hidden;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
}

/* Hero Section */
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 24px 120px;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 0;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
  animation: float 20s infinite ease-in-out;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  top: -250px;
  right: -100px;
  animation-delay: 0s;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  bottom: -100px;
  left: -50px;
  animation-delay: 5s;
}

.orb-3 {
  width: 350px;
  height: 350px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 10s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 30px) scale(0.9);
  }
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 900px;
  text-align: center;
}

.logo-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(56, 123, 233, 0.2);
  border-radius: 50px;
  margin-bottom: 32px;
  box-shadow: 0 4px 12px rgba(56, 123, 233, 0.1);
}

.badge-icon {
  font-size: 20px;
}

.badge-text {
  font-size: 16px;
  font-weight: 600;
  color: #387BE9;
}

.hero-title {
  font-size: 56px;
  font-weight: 800;
  line-height: 1.2;
  margin: 0 0 24px 0;
  color: #1a202c;
  letter-spacing: -1px;
}

.gradient-text {
  display: block;
  margin-top: 12px;
  font-size: 32px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: 18px;
  line-height: 1.8;
  color: #64748b;
  margin: 0 0 40px 0;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 80px;
}

/* 使用深度选择器覆盖 Naive UI 的默认样式 */
.btn-primary :deep(.n-button__border),
.btn-primary :deep(.n-button__state-border) {
  border: none !important;
}

.btn-primary {
  height: 52px;
  padding: 0 40px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border: none !important;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3) !important;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4) !important;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

.btn-primary:focus {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3) !important;
}

.btn-primary:active {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4192 100%) !important;
}

/* 覆盖 btn-secondary 的 Naive UI 默认样式 */
.btn-secondary :deep(.n-button__border),
.btn-secondary :deep(.n-button__state-border) {
  border: 2px solid #e2e8f0 !important;
}

.btn-secondary {
  height: 52px !important;
  padding: 0 40px !important;
  font-size: 16px !important;
  font-weight: 600 !important;
  background: white !important;
  color: #475569 !important;
  transition: all 0.3s ease;
}

.btn-secondary:hover :deep(.n-button__border),
.btn-secondary:hover :deep(.n-button__state-border) {
  border-color: #cbd5e1 !important;
}

.btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1) !important;
  background: white !important;
}

.btn-secondary:focus {
  background: white !important;
  box-shadow: 0 0 0 2px rgba(226, 232, 240, 0.3) !important;
}

.btn-secondary:focus :deep(.n-button__border),
.btn-secondary:focus :deep(.n-button__state-border) {
  border-color: #cbd5e1 !important;
}

.btn-secondary:active {
  background: #f8f9fa !important;
}

.hero-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 48px;
  padding: 32px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #387BE9;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: #e2e8f0;
}

/* Features Section */
.features-section {
  padding: 120px 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 64px;
}

.section-title {
  font-size: 42px;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: #1a202c;
}

.section-subtitle {
  font-size: 18px;
  color: #64748b;
  margin: 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
}

.feature-card {
  padding: 40px 32px;
  background: white;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  cursor: pointer;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  border-color: #cbd5e1;
}

.feature-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border-radius: 16px;
  margin-bottom: 24px;
  color: #667eea;
  transition: all 0.3s ease;
}

.feature-card:hover .feature-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.feature-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #1a202c;
}

.feature-description {
  font-size: 15px;
  line-height: 1.6;
  color: #64748b;
  margin: 0;
}

/* Tech Stack Section */
.tech-section {
  padding: 120px 24px;
  background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
}

.tech-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}

.tech-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 50px;
  font-size: 15px;
  font-weight: 500;
  color: #475569;
  transition: all 0.3s ease;
  cursor: pointer;
}

.tech-badge:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(102, 126, 234, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.tech-icon {
  font-size: 20px;
}

/* CTA Section */
.cta-section {
  padding: 120px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  text-align: center;
}

.cta-content {
  max-width: 800px;
  margin: 0 auto;
}

.cta-title {
  font-size: 42px;
  font-weight: 700;
  color: white;
  margin: 0 0 16px 0;
}

.cta-description {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 40px 0;
}

/* 覆盖 btn-cta 的 Naive UI 默认样式 */
.btn-cta :deep(.n-button__border),
.btn-cta :deep(.n-button__state-border) {
  border: none !important;
}

.btn-cta {
  height: 56px;
  padding: 0 48px;
  font-size: 18px;
  font-weight: 600;
  background: white !important;
  color: #667eea !important;
  border: none !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2) !important;
}

.btn-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3) !important;
  background: white !important;
}

.btn-cta:focus {
  background: white !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2) !important;
}

.btn-cta:active {
  background: #f8f8f8 !important;
}

/* Footer */
.footer {
  background: #1a202c;
  color: white;
  padding: 64px 24px 32px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto 48px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 48px;
}

.footer-left {
  max-width: 300px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.logo-icon {
  font-size: 24px;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
}

.footer-description {
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
}

.footer-links {
  display: flex;
  gap: 64px;
}

.footer-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-heading {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.footer-link {
  color: #94a3b8;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: white;
}

.footer-bottom {
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 32px;
  border-top: 1px solid #334155;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  color: #94a3b8;
  font-size: 14px;
}

.footer-badges {
  display: flex;
  gap: 8px;
}

/* Floating Help Button */
.floating-help {
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  z-index: 1000;
}

.floating-help:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.5);
}

/* Help Modal */
.help-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.help-step {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.help-step-number {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.help-step-content h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
}

.help-step-content p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 36px;
  }

  .gradient-text {
    font-size: 24px;
  }

  .hero-description {
    font-size: 16px;
  }

  .hero-actions {
    flex-direction: column;
  }

  .hero-stats {
    flex-direction: column;
    gap: 24px;
  }

  .stat-divider {
    width: 100%;
    height: 1px;
  }

  .section-title {
    font-size: 32px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .footer-content {
    flex-direction: column;
  }

  .footer-links {
    flex-direction: column;
    gap: 32px;
  }

  .floating-help {
    bottom: 16px;
    right: 16px;
    width: 48px;
    height: 48px;
  }
}
</style>
