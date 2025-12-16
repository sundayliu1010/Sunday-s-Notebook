<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1>AI智能生产力工作台</h1>
        <p>登录您的账户</p>
      </div>

      <!-- 快速登录按钮 -->
      <div class="quick-login">
        <button @click="quickLogin" class="btn btn-secondary quick-login-btn">
          ⚡ 快速登录（测试用）
        </button>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email" class="form-label">邮箱</label>
          <input
            id="email"
            v-model="loginForm.email"
            type="email"
            class="form-input"
            placeholder="请输入您的邮箱"
            required
          />
        </div>

        <div class="form-group">
          <label for="password" class="form-label">密码</label>
          <input
            id="password"
            v-model="loginForm.password"
            type="password"
            class="form-input"
            placeholder="请输入您的密码"
            required
          />
        </div>

        <div v-if="authStore.error" class="error-message">
          {{ authStore.error }}
        </div>

        <button
          type="submit"
          class="btn btn-primary login-button"
          :disabled="authStore.isLoading"
        >
          {{ authStore.isLoading ? '登录中...' : '登录' }}
        </button>
      </form>

      <div class="login-footer">
        <p>
          还没有账户？
          <router-link to="/register" class="register-link">
            立即注册
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 表单数据
const loginForm = reactive({
  email: '',
  password: ''
})

// 处理登录
const handleLogin = async () => {
  try {
    await authStore.login(loginForm)
    router.push('/dashboard')
  } catch (error) {
    console.error('登录失败:', error)
  }
}

// 快速登录（用于测试）
const quickLogin = async () => {
  try {
    // 使用模拟数据快速登录
    await authStore.login({
      email: 'test@example.com',
      password: 'test123'
    })
    router.push('/dashboard')
  } catch (error) {
    console.error('快速登录失败:', error)
    // 如果API调用失败，直接设置模拟状态
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
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-container {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  color: #333;
  font-size: 28px;
  margin-bottom: 10px;
}

.login-header p {
  color: #666;
  font-size: 16px;
}

.login-form {
  margin-bottom: 20px;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
}

.login-button {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  margin-top: 10px;
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.quick-login {
  text-align: center;
  margin-bottom: 20px;
}

.quick-login-btn {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.quick-login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.login-footer {
  text-align: center;
  color: #666;
}

.register-link {
  color: #007bff;
  text-decoration: none;
}

.register-link:hover {
  text-decoration: underline;
}
</style>