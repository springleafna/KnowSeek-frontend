<template>
  <div class="landing-page">
    <!-- Background Elements -->
    <div class="background-canvas">
      <div class="grid-pattern"></div>
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
    </div>

    <!-- Navbar (Simplified) -->
    <nav class="navbar">
      <div class="nav-brand">
        <img src="/logo.png" alt="Logo" class="brand-logo" />
        <span class="brand-text">KnowSeek</span>
      </div>
      <div class="nav-links">
        <a href="#features">特性</a>
        <a href="#tech">技术</a>
        <n-button text class="nav-login" @click="goToLogin">登录</n-button>
        <n-button type="primary" round size="small" @click="goToRegister">注册</n-button>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-container">
        <div class="hero-content fade-in-up">
          <div class="logo-badge">
            <span class="badge-dot"></span>
            <span class="badge-text">v2.0 全新发布</span>
          </div>

          <h1 class="hero-title">
            让知识检索<br />
            <span class="gradient-text">快如闪电，智如泉涌</span>
          </h1>

          <p class="hero-description">
            基于 RAG 检索增强生成技术，将您的私有数据转化为智能问答助手。
            <br>安全、精准、可溯源的企业级知识库解决方案。
          </p>

          <div class="hero-actions">
            <n-button type="primary" size="large" round @click="goToRegister" class="btn-glow">
              免费开始使用
              <template #icon>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M16.01 11H4v2h12.01v3L20 12l-3.99-4z"/></svg>
              </template>
            </n-button>
            <n-button size="large" round quaternary class="btn-outline" @click="goToLogin">
              <template #icon>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
              </template>
              观看演示
            </n-button>
          </div>

          <!-- Stats Row -->
          <div class="hero-stats-row">
            <div class="mini-stat">
              <strong>10k+</strong> <span>知识库</span>
            </div>
            <div class="mini-stat">
              <strong>99%</strong> <span>准确率</span>
            </div>
            <div class="mini-stat">
              <strong>20+</strong> <span>格式支持</span>
            </div>
          </div>
        </div>

        <!-- CSS-Only Mockup Visual -->
        <div class="hero-visual fade-in-up delay-200">
          <div class="glass-interface">
            <div class="interface-sidebar">
              <div class="sidebar-item active"></div>
              <div class="sidebar-item"></div>
              <div class="sidebar-item"></div>
            </div>
            <div class="interface-main">
              <div class="chat-bubble ai">
                <div class="skeleton-line w-3-4"></div>
                <div class="skeleton-line w-1-2"></div>
              </div>
              <div class="chat-bubble user">
                <div class="skeleton-line w-2-3"></div>
              </div>
              <div class="chat-bubble ai processing">
                <div class="typing-dots"><span></span><span></span><span></span></div>
              </div>
            </div>
            <div class="floating-card card-1">
              <span>PDF 解析中...</span>
              <div class="progress-bar"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="features-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">重新定义知识管理</h2>
          <p class="section-subtitle">不仅仅是搜索，而是通过 AI 理解您的业务逻辑</p>
        </div>

        <div class="features-grid">
          <div v-for="(feature, index) in features" :key="index" class="feature-card" :class="`feature-${index}`">
            <div class="feature-icon-wrapper">
              <div class="feature-icon" v-html="feature.icon"></div>
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Tech Stack Section (Marquee Style) -->
    <section id="tech" class="tech-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">硬核技术架构</h2>
          <p class="section-subtitle">基于 Spring AI 与现代向量数据库构建</p>
        </div>
        
        <div class="tech-container">
          <div class="tech-grid">
            <div v-for="tech in techStack" :key="tech.name" class="tech-item">
              <span class="tech-emoji">{{ tech.icon }}</span>
              <span class="tech-name">{{ tech.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Modern CTA -->
    <section class="cta-section">
      <div class="cta-card">
        <div class="cta-bg-glow"></div>
        <div class="cta-content">
          <h2 class="cta-title">准备好提升团队效率了吗？</h2>
          <p class="cta-desc">立即加入 KnowSeek，构建您的专属 AI 知识大脑。</p>
          <n-button type="primary" size="large" round class="btn-cta" @click="goToRegister">
            免费开始使用
          </n-button>
        </div>
      </div>
    </section>

    <!-- Minimalist Footer -->
    <footer class="footer">
      <div class="container">
        <div class="footer-wrapper">
          <div class="footer-brand">
            <span class="brand-text">KnowSeek</span>
            <p class="copyright">&copy; 2025 KnowSeek Inc.</p>
          </div>
          <div class="footer-socials">
             <a href="#" class="social-link">Github</a>
             <a href="#" class="social-link">Twitter</a>
             <a href="#" class="social-link">Discord</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { NButton } from 'naive-ui';

const router = useRouter();

const features = [
  {
    title: '语义理解检索',
    description: '不再依赖关键词匹配。AI 能够理解问题的真实意图，从海量文档中通过向量相似度找到最精准的答案。',
    icon: `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`
  },
  {
    title: '全格式解析引擎',
    description: '内置 Apache Tika 深度集成，支持 PDF、Word、Markdown、Excel 甚至扫描件 OCR 识别，自动清洗脏数据。',
    icon: `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`
  },
  {
    title: '企业级权限管控',
    description: '基于 RBAC 的多租户架构。可以为不同部门设置知识库的可见范围，确保敏感数据安全不泄露。',
    icon: `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`
  },
  {
    title: '混合检索增强',
    description: '结合关键词检索 (BM25) 与 向量检索 (Vector) 的优势，配合重排序 (Rerank) 模型，召回率高达 99%。',
    icon: `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`
  }
];

const techStack = [
  { name: 'Spring Boot 3', icon: '🍃' },
  { name: 'OpenAI / Qwen', icon: '🤖' },
  { name: 'PostgreSQL', icon: '🐘' },
  { name: 'pgvector', icon: '🎯' },
  { name: 'Redis Stack', icon: '⚡' },
  { name: 'Elasticsearch', icon: '🔎' },
  { name: 'Docker', icon: '🐳' },
  { name: 'Vue 3', icon: '💚' }
];

function goToLogin() {
  router.push('/login');
}

function goToRegister() {
  router.push('/register');
}
</script>

<style scoped>
/* 
  Modern Reset & Variables 
*/
:root {
  --primary-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  --surface-color: #ffffff;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border-light: #e2e8f0;
}

.landing-page {
  width: 100%;
  min-height: 100vh;
  background-color: #f8fafc;
  color: #1e293b;
  overflow-x: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 
  Background Effects 
*/
.background-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.grid-pattern {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(#e2e8f0 1px, transparent 1px),
    linear-gradient(90deg, #e2e8f0 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0.4;
  mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 90%);
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.4;
  z-index: -1;
}

.orb-1 {
  width: 600px;
  height: 600px;
  background: #818cf8;
  top: -20%;
  right: -10%;
  animation: float 10s ease-in-out infinite;
}

.orb-2 {
  width: 500px;
  height: 500px;
  background: #c084fc;
  bottom: -10%;
  left: -10%;
  animation: float 12s ease-in-out infinite reverse;
}

/* 
  Navbar 
*/
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  z-index: 50;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255,255,255,0.5);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 20px;
  color: #0f172a;
}

.brand-logo {
  height: 32px; /* 限制高度，与文字协调 */
  width: auto;  /* 保持比例 */
  margin-right: 8px; /* 图片和文字的间距 */
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-links a {
  text-decoration: none;
  color: #64748b;
  font-size: 15px;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-links a:hover {
  color: #6366f1;
}

/* 
  Hero Section 
*/
.hero-section {
  position: relative;
  min-height: 100vh;
  padding-top: 120px;
  padding-bottom: 80px;
  display: flex;
  align-items: center;
  z-index: 1;
}

.hero-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.hero-content {
  max-width: 600px;
}

.logo-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 100px;
  margin-bottom: 24px;
}

.badge-dot {
  width: 8px;
  height: 8px;
  background: #6366f1;
  border-radius: 50%;
  box-shadow: 0 0 12px #6366f1;
}

.badge-text {
  font-size: 13px;
  font-weight: 600;
  color: #6366f1;
}

.hero-title {
  font-size: 56px;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 24px;
  letter-spacing: -1.5px;
  color: #0f172a;
}

.gradient-text {
  background: linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: 18px;
  line-height: 1.6;
  color: #475569;
  margin-bottom: 40px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 48px;
}

/* Naive UI Button Overrides */
.btn-glow {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%) !important;
  border: none !important;
  box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.4) !important;
  transition: transform 0.2s ease !important;
  font-weight: 600 !important;
}

.btn-glow:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px -5px rgba(79, 70, 229, 0.5) !important;
}

.btn-outline {
  color: #475569 !important;
  font-weight: 600 !important;
}

.hero-stats-row {
  display: flex;
  gap: 40px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.mini-stat strong {
  display: block;
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
}

.mini-stat span {
  font-size: 14px;
  color: #64748b;
}

/* 
  Hero Visual (CSS Mockup) 
*/
.hero-visual {
  perspective: 1000px;
  display: flex;
  justify-content: center;
}

.glass-interface {
  width: 100%;
  max-width: 500px;
  height: 360px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 24px;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.5) inset;
  transform: rotateY(-5deg) rotateX(5deg);
  transition: transform 0.5s ease;
  position: relative;
  display: flex;
  overflow: hidden;
}

.glass-interface:hover {
  transform: rotateY(0) rotateX(0);
}

.interface-sidebar {
  width: 80px;
  background: rgba(255, 255, 255, 0.5);
  border-right: 1px solid rgba(0,0,0,0.05);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-item {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
}

.sidebar-item.active {
  background: #818cf8;
  width: 50%;
}

.interface-main {
  flex: 1;
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chat-bubble {
  padding: 16px;
  border-radius: 16px;
  max-width: 80%;
  animation: fadeInUp 0.5s ease forwards;
}

.chat-bubble.ai {
  background: white;
  border-top-left-radius: 4px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
}

.chat-bubble.user {
  background: #eff6ff;
  align-self: flex-end;
  border-top-right-radius: 4px;
  width: 60%;
}

.skeleton-line {
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-line:last-child {
  margin-bottom: 0;
}

.w-3-4 { width: 75%; }
.w-1-2 { width: 50%; }
.w-2-3 { width: 66%; }

/* Floating Card in Mockup */
.floating-card {
  position: absolute;
  bottom: 30px;
  right: -20px;
  background: white;
  padding: 12px 20px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 160px;
  animation: float 6s ease-in-out infinite;
  border: 1px solid #e2e8f0;
}

.floating-card span {
  font-size: 12px;
  font-weight: 600;
  color: #334155;
}

.progress-bar {
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar::after {
  content: '';
  display: block;
  width: 60%;
  height: 100%;
  background: #6366f1;
  border-radius: 2px;
}

/* 
  Features Section 
*/
.features-section {
  padding: 100px 0;
  position: relative;
  background: white;
}

.section-header {
  text-align: center;
  max-width: 700px;
  margin: 0 auto 64px;
}

.section-title {
  font-size: 36px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 16px;
  letter-spacing: -0.5px;
}

.section-subtitle {
  font-size: 18px;
  color: #64748b;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 32px;
}

.feature-card {
  padding: 32px;
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 24px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.1);
  border-color: #e2e8f0;
}

.feature-icon-wrapper {
  width: 56px;
  height: 56px;
  background: #eff6ff;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  color: #3b82f6;
  transition: all 0.3s ease;
}

.feature-card:hover .feature-icon-wrapper {
  background: #3b82f6;
  color: white;
  transform: scale(1.1);
}

.feature-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
}

.feature-description {
  font-size: 15px;
  line-height: 1.6;
  color: #64748b;
}

/* 
  Tech Section 
*/
.tech-section {
  padding: 80px 0;
  background: #f8fafc;
}

.tech-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  max-width: 1000px;
  margin: 0 auto;
}

.tech-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 12px 24px;
  border-radius: 100px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  transition: all 0.3s ease;
  cursor: default;
}

.tech-item:hover {
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.tech-name {
  font-weight: 600;
  color: #475569;
  font-size: 15px;
}

/* 
  CTA Section 
*/
.cta-section {
  padding: 100px 24px;
}

.cta-card {
  max-width: 1000px;
  margin: 0 auto;
  background: #1e293b;
  border-radius: 32px;
  padding: 64px;
  text-align: center;
  position: relative;
  overflow: hidden;
  color: white;
}

.cta-bg-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at top right, #4f46e5, transparent 60%),
              radial-gradient(circle at bottom left, #c084fc, transparent 60%);
  opacity: 0.2;
}

.cta-content {
  position: relative;
  z-index: 1;
}

.cta-title {
  font-size: 42px;
  font-weight: 700;
  margin-bottom: 24px;
}

.cta-desc {
  font-size: 18px;
  color: #cbd5e1;
  margin-bottom: 40px;
}

.btn-cta {
  height: 56px;
  padding: 0 40px;
  font-size: 18px;
  font-weight: 600;
  background: white !important;
  color: #4f46e5 !important;
  border: none !important;
}

.btn-cta:hover {
  background: #f8fafc !important;
  transform: scale(1.05);
}

/* 
  Footer 
*/
.footer {
  padding: 40px 0;
  border-top: 1px solid #e2e8f0;
  background: white;
}

.footer-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-brand {
  display: flex;
  align-items: baseline;
  gap: 16px;
}

.brand-text {
  font-weight: 800;
  font-size: 18px;
  color: #0f172a;
}

.copyright {
  font-size: 14px;
  color: #94a3b8;
}

.footer-socials {
  display: flex;
  gap: 24px;
}

.social-link {
  color: #64748b;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.social-link:hover {
  color: #0f172a;
}

/* 
  Animations & Media Queries 
*/
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in-up {
  animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  opacity: 0;
}

.delay-200 { animation-delay: 0.2s; }

@media (max-width: 960px) {
  .hero-container {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 40px;
  }

  .hero-content {
    margin: 0 auto;
  }

  .hero-actions {
    justify-content: center;
  }

  .hero-stats-row {
    justify-content: center;
  }
  
  .hero-title {
    font-size: 42px;
  }
  
  .nav-links {
    display: none; /* In real app, use hamburger menu */
  }

  .glass-interface {
    height: 300px;
  }

  .cta-title {
    font-size: 32px;
  }
  
  .cta-card {
    padding: 40px 24px;
  }
}
</style>