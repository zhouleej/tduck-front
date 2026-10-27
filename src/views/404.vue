<template>
  <div class="status-container">
    <!-- 背景极光光晕 -->
    <div class="blur-glow glow-1"></div>
    <div class="blur-glow glow-2"></div>
    <div class="blur-glow glow-3"></div>

    <!-- 漂浮装饰微动画元素 -->
    <div class="floating-shape shape-1"></div>
    <div class="floating-shape shape-2"></div>
    <div class="floating-shape shape-3"></div>

    <!-- 毛玻璃效果卡片 -->
    <div class="glass-card">
      <div class="error-code-wrapper">
        <h1 class="error-code">404</h1>
        <div class="error-code-bg">404</div>
      </div>

      <h2 class="error-title">抱歉，页面好像迷失了...</h2>
      <p class="error-desc">您访问的页面可能已经被移走，或者输入的网址有误。</p>

      <div class="action-buttons">
        <button class="btn-action btn-home" @click="goHome">
          <i class="el-icon-house icon-btn"></i>
          返回系统首页
        </button>
        <button class="btn-action btn-back" @click="goBack">
          <i class="el-icon-back icon-btn"></i>
          返回上一页
        </button>
      </div>

      <div class="card-footer">
        <span class="footer-text">云卷问卷数据系统</span>
        <span class="footer-divider">|</span>
        <a href="/" target="_blank" class="footer-link">联系开发者</a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Page404',
  methods: {
    goHome() {
      this.$router.push('/')
    },
    goBack() {
      if (window.history.length > 1) {
        this.$router.go(-1)
      } else {
        this.$router.push('/')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap');

.status-container {
  position: relative;
  display: flex;
  height: 100vh;
  width: 100vw;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #f6f8fc;
  font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

/* 极光背景流光 */
.blur-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.65;
  pointer-events: none;
  z-index: 1;
}

.glow-1 {
  top: 10%;
  left: 15%;
  width: 450px;
  height: 450px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.16) 0%, rgba(99, 102, 241, 0) 70%);
  animation: glowMove1 20s infinite alternate ease-in-out;
}

.glow-2 {
  bottom: 10%;
  right: 15%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, rgba(236, 72, 153, 0) 70%);
  animation: glowMove2 25s infinite alternate ease-in-out;
}

.glow-3 {
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, rgba(45, 212, 191, 0.12) 0%, rgba(45, 212, 191, 0) 70%);
  animation: glowMove3 18s infinite alternate ease-in-out;
}

/* 漂浮装饰微动画 */
.floating-shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(99, 102, 241, 0.08);
  backdrop-filter: blur(5px);
  pointer-events: none;
  z-index: 2;
}

.shape-1 {
  top: 20%;
  right: 25%;
  width: 60px;
  height: 60px;
  animation: floatShape1 12s infinite ease-in-out;
}

.shape-2 {
  bottom: 25%;
  left: 20%;
  width: 40px;
  height: 40px;
  animation: floatShape2 15s infinite ease-in-out;
}

.shape-3 {
  bottom: 70%;
  left: 30%;
  width: 30px;
  height: 30px;
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  animation: floatShape3 10s infinite ease-in-out;
}

/* 毛玻璃核心卡片 */
.glass-card {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 90%;
  max-width: 580px;
  padding: 50px 40px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px) saturate(190%);
  -webkit-backdrop-filter: blur(20px) saturate(190%);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 20px 50px -12px rgba(99, 102, 241, 0.1), 0 0 40px rgba(99, 102, 241, 0.04);
  text-align: center;
  transform: translateY(0);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: cardFadeIn 1s cubic-bezier(0.16, 1, 0.3, 1);
}

.glass-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 30px 60px -10px rgba(99, 102, 241, 0.15), 0 0 50px rgba(99, 102, 241, 0.06);
}

/* 404 文字与霓虹发光阴影效果 */
.error-code-wrapper {
  position: relative;
  height: 160px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-code {
  font-size: 130px;
  font-weight: 800;
  line-height: 1;
  margin: 0;
  background: linear-gradient(135deg, #818cf8 0%, #4f46e5 50%, #312e81 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: textFloat 4s infinite ease-in-out;
  letter-spacing: -2px;
  z-index: 2;
}

.error-code-bg {
  position: absolute;
  font-size: 130px;
  font-weight: 800;
  line-height: 1;
  margin: 0;
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(99, 102, 241, 0.15);
  top: 5px;
  left: 2px;
  z-index: 1;
  letter-spacing: -2px;
  animation: textFloatShadow 4s infinite ease-in-out;
}

/* 标题与描述 */
.error-title {
  font-size: 24px;
  color: #1e293b;
  font-weight: 600;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
}

.error-desc {
  font-size: 15px;
  color: #64748b;
  line-height: 1.6;
  max-width: 400px;
  margin: 0 0 35px 0;
}

/* 按钮区 */
.action-buttons {
  display: flex;
  gap: 16px;
  margin-bottom: 40px;
  width: 100%;
  justify-content: center;
}

.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  border: none;
}

.icon-btn {
  font-size: 16px;
  margin-right: 8px;
}

.btn-home {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
}

.btn-home:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45);
  filter: brightness(1.05);
}

.btn-home:active {
  transform: translateY(0);
}

.btn-back {
  background: rgba(241, 245, 249, 0.8);
  color: #475569;
  border: 1px solid rgba(226, 232, 240, 1);
}

.btn-back:hover {
  background: rgba(226, 232, 240, 0.8);
  color: #0f172a;
  border-color: rgba(203, 213, 225, 1);
  transform: translateY(-2px);
}

.btn-back:active {
  transform: translateY(0);
}

/* 页脚 */
.card-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #94a3b8;
  margin-top: 10px;
}

.footer-text {
  color: #94a3b8;
}

.footer-divider {
  color: #e2e8f0;
}

.footer-link {
  color: #4f46e5;
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: #6366f1;
  text-decoration: underline;
}

/* CSS 动画关键帧 */
@keyframes glowMove1 {
  0% {
    top: 5%;
    left: 10%;
  }
  100% {
    top: 25%;
    left: 30%;
  }
}

@keyframes glowMove2 {
  0% {
    bottom: 5%;
    right: 10%;
  }
  100% {
    bottom: 25%;
    right: 30%;
  }
}

@keyframes glowMove3 {
  0% {
    top: 55%;
    left: 45%;
  }
  100% {
    top: 35%;
    left: 55%;
  }
}

@keyframes floatShape1 {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

@keyframes floatShape2 {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(15px) rotate(-120deg);
  }
}

@keyframes floatShape3 {
  0%,
  100% {
    transform: translateY(0) translate(0) scale(1);
  }
  50% {
    transform: translateY(-10px) translateX(10px) scale(1.1);
  }
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes textFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes textFloatShadow {
  0%,
  100% {
    transform: translateY(0) translate(0, 0);
  }
  50% {
    transform: translateY(-8px) translate(4px, 2px);
  }
}

/* 响应式调整 */
@media (max-width: 640px) {
  .glass-card {
    padding: 35px 24px;
  }
  .error-code {
    font-size: 100px;
  }
  .error-code-bg {
    font-size: 100px;
  }
  .error-code-wrapper {
    height: 120px;
  }
  .error-title {
    font-size: 20px;
  }
  .action-buttons {
    flex-direction: column;
    width: 100%;
    gap: 12px;
  }
  .btn-action {
    width: 100%;
  }
}
</style>



