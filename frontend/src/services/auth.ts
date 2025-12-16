import api from './api'
import { mockAuthApi } from './mockApi'
import type { LoginCredentials, RegisterData, AuthResponse, User } from '@/types/user'

// 检查是否使用模拟API（当后端不可用时）
const useMockApi = true // 临时设为true，等后端启动后改为false

export const authApi = {
  // 用户登录
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (useMockApi) {
      return await mockAuthApi.login(credentials)
    }
    return await api.post('/auth/login', credentials)
  },

  // 用户注册
  async register(userData: RegisterData): Promise<{ message: string }> {
    if (useMockApi) {
      return await mockAuthApi.register(userData)
    }
    return await api.post('/auth/register', userData)
  },

  // 获取当前用户信息
  async getCurrentUser(): Promise<{ user: User }> {
    if (useMockApi) {
      return await mockAuthApi.getCurrentUser()
    }
    return await api.get('/auth/me')
  }
}