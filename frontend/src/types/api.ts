// API响应的基础接口
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
}

// 错误响应
export interface ApiError {
  message: string
  error_code?: string
}

// AI洞察响应
export interface AIInsightResponse {
  summary: string
  keywords: string[]
  questions: string[]
}

// AI润色/续写响应
export interface AITextResponse {
  original_text: string
  processed_text: string
}

// 待办事项
export interface Todo {
  id: number
  user_id: number
  text: string
  is_completed: boolean
  created_date: string
  created_at: string
  updated_at: string
}

// 聊天消息
export interface ChatMessage {
  id: number
  user_id: number
  role: 'user' | 'assistant'
  content: string
  created_at: string
}