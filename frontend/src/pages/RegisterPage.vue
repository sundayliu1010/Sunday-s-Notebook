<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-header">
        <h1>AI智能生产力工作台</h1>
        <p>创建您的账户</p>
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="username" class="form-label">用户名</label>
          <input
            id="username"
            v-model="registerForm.username"
            type="text"
            class="form-input"
            placeholder="请输入用户名"
            required
          />
        </div>

        <div class="form-group">
          <label for="email" class="form-label">邮箱</label>
          <input
            id="email"
            v-model="registerForm.email"
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
            v-model="registerForm.password"
            type="password"
            class="form-input"
            placeholder="请输入密码（至少6位）"
            required
            minlength="6"
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword" class="form-label">确认密码</label>
          <input
            id="confirmPassword"
            v-model="registerForm.confirmPassword"
            type="password"
            class="form-input"
            placeholder="请再次输入密码"
            required
          />
        </div>

        <div v-if="authStore.error" class="error-message">
          {{ authStore.error }}
        </div>

        <div v-if="passwordError" class="error-message">
          {{ passwordError }}
        </div>

        <button
          type="submit"
          class="btn btn-primary register-button"
          :disabled="authStore.isLoading"
        >
          {{ authStore.isLoading ? '注册中...' : '注册' }}
        </button>
      </form>

      <div class="register-footer">
        <p>
          已有账户？
          <router-link to="/login" class="login-link">
            立即登录
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 表单数据
const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// 密码错误信息
const passwordError = ref('')

// 处理注册
const handleRegister = async () => {
  // 验证密码
  if (registerForm.password !== registerForm.confirmPassword) {
    passwordError.value = '两次输入的密码不一致'
    return
  }

  if (registerForm.password.length < 6) {
    passwordError.value = '密码长度至少为6位'
    return
  }

  passwordError.value = ''

  try {
    await authStore.register({
      username: registerForm.username,
      email: registerForm.email,
      password: registerForm.password
    })

    // 注册成功，显示成功消息并跳转到登录页
    alert('注册成功！请登录您的账户。')
    router.push('/login')
  } catch (error) {
    console.error('注册失败:', error)
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-container {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h1 {
  color: #333;
  font-size: 28px;
  margin-bottom: 10px;
}

.register-header p {
  color: #666;
  font-size: 16px;
}

.register-form {
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

.register-button {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  margin-top: 10px;
}

.register-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.register-footer {
  text-align: center;
  color: #666;
}

.login-link {
  color: #007bff;
  text-decoration: none;
}

.login-link:hover {
  text-decoration: underline;
}
</style>