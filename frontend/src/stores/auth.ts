import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types/user'
import { authApi } from '@/services/auth'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token') || localStorage.getItem('mock-token'))
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // 方法
  const login = async (credentials: { email: string; password: string }) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await authApi.login(credentials)

      // 保存token和用户信息
      token.value = response.token
      user.value = response.user
      localStorage.setItem('token', response.token)
      // 如果是模拟token，也保存到mock-token
      if (response.token.startsWith('mock-token-')) {
        localStorage.setItem('mock-token', response.token)
      }

      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || '登录失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData: {
    username: string
    email: string
    password: string
  }) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await authApi.register(userData)

      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || '注册失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('mock-token')
  }

  const checkAuth = async () => {
    if (!token.value) return false

    try {
      const response = await authApi.getCurrentUser()
      user.value = response.user
      return true
    } catch (error) {
      logout()
      return false
    }
  }

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth
  }
})