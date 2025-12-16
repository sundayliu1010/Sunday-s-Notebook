<template>
  <div class="test-page">
    <h1>测试页面</h1>
    <p>如果你看到这个页面，说明路由工作正常</p>
    <p>用户信息：{{ authStore.user?.username || '未登录' }}</p>
    <p>是否已认证：{{ authStore.isAuthenticated }}</p>

    <button @click="quickLogin" class="test-btn">
      快速登录
    </button>

    <router-link to="/dashboard" class="test-link">
      前往Dashboard
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const quickLogin = () => {
  const now = new Date().toISOString()
  authStore.token = 'mock-token-' + Date.now()
  authStore.user = {
    id: 1,
    username: '测试用户',
    email: 'test@example.com',
    created_at: now,
    updated_at: now
  }
  localStorage.setItem('token', authStore.token)
  localStorage.setItem('mock-token', authStore.token)
  router.push('/dashboard')
}
</script>

<style scoped>
.test-page {
  padding: 20px;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: white;
}

.test-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  margin: 10px;
  cursor: pointer;
}

.test-link {
  display: block;
  color: #fbbf24;
  text-decoration: none;
  margin: 10px;
}
</style>