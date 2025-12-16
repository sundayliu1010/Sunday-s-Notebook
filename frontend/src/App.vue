<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
// 这里可以放置全局逻辑
</script>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: linear-gradient(135deg, #1e1e2e 0%, #151521 50%, #0a0a15 100%);
  color: #e4e4e7;
  min-height: 100vh;
}

#app {
  min-height: 100vh;
}

/* 通用按钮样式 */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #5558e3 0%, #7c3aed 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #e4e4e7;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

/* 通用表单样式 */
.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.08);
  color: #e4e4e7;
  backdrop-filter: blur(10px);
}

.form-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25);
  background: rgba(255, 255, 255, 0.12);
}

.form-input::placeholder {
  color: rgba(228, 228, 231, 0.6);
}
</style>