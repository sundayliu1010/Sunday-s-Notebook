import type { User, LoginCredentials, RegisterData, AuthResponse } from '@/types/user'
import type { Note, NoteData, NotesResponse, NoteResponse } from '@/types/note'

// 模拟数据存储
class MockDataStore {
  private users: User[] = []
  private notes: Note[] = []
  private currentUserId: number | null = null
  private userIdCounter = 1
  private noteIdCounter = 1

  // 用户相关方法
  async register(userData: RegisterData): Promise<{ message: string }> {
    // 检查用户名和邮箱是否已存在
    const existingUser = this.users.find(
      user => user.username === userData.username || user.email === userData.email
    )

    if (existingUser) {
      throw new Error('用户名或邮箱已存在')
    }

    // 创建新用户
    const newUser: User = {
      id: this.userIdCounter++,
      username: userData.username,
      email: userData.email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    this.users.push(newUser)
    this.saveToLocalStorage()

    return { message: '注册成功' }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // 查找用户（模拟验证，实际应用中需要验证密码）
    const user = this.users.find(
      user => user.email === credentials.email
    )

    if (!user) {
      throw new Error('邮箱或密码错误')
    }

    // 生成模拟token
    const token = `mock-token-${user.id}-${Date.now()}`

    this.currentUserId = user.id
    localStorage.setItem('mock-token', token)

    return {
      user,
      token
    }
  }

  async getCurrentUser(): Promise<{ user: User }> {
    const token = localStorage.getItem('mock-token')
    if (!token) {
      throw new Error('未登录')
    }

    // 从token解析用户ID（简化版）
    const userId = parseInt(token.split('-')[2])
    const user = this.users.find(u => u.id === userId)

    if (!user) {
      throw new Error('用户不存在')
    }

    return { user }
  }

  // 笔记相关方法
  async getAllNotes(): Promise<NotesResponse> {
    const userId = this.getCurrentUserId()
    const userNotes = this.notes.filter(note => note.user_id === userId)
    return { notes: userNotes }
  }

  async getNote(noteId: number): Promise<NoteResponse> {
    const userId = this.getCurrentUserId()
    const note = this.notes.find(n => n.id === noteId && n.user_id === userId)

    if (!note) {
      throw new Error('笔记不存在')
    }

    return { note }
  }

  async createNote(noteData: NoteData): Promise<NoteResponse> {
    const userId = this.getCurrentUserId()

    const newNote: Note = {
      id: this.noteIdCounter++,
      user_id: userId,
      title: noteData.title,
      content: noteData.content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    this.notes.push(newNote)
    this.saveToLocalStorage()

    return { note: newNote }
  }

  async updateNote(noteId: number, noteData: NoteData): Promise<NoteResponse> {
    const userId = this.getCurrentUserId()
    const noteIndex = this.notes.findIndex(n => n.id === noteId && n.user_id === userId)

    if (noteIndex === -1) {
      throw new Error('笔记不存在')
    }

    this.notes[noteIndex] = {
      ...this.notes[noteIndex],
      title: noteData.title,
      content: noteData.content,
      updated_at: new Date().toISOString()
    }

    this.saveToLocalStorage()
    return { note: this.notes[noteIndex] }
  }

  async deleteNote(noteId: number): Promise<{ message: string }> {
    const userId = this.getCurrentUserId()
    const noteIndex = this.notes.findIndex(n => n.id === noteId && n.user_id === userId)

    if (noteIndex === -1) {
      throw new Error('笔记不存在')
    }

    this.notes.splice(noteIndex, 1)
    this.saveToLocalStorage()

    return { message: '笔记已删除' }
  }

  // 工具方法
  private getCurrentUserId(): number {
    if (this.currentUserId) {
      return this.currentUserId
    }

    const token = localStorage.getItem('mock-token')
    if (!token) {
      throw new Error('未登录')
    }

    this.currentUserId = parseInt(token.split('-')[2])
    return this.currentUserId
  }

  private saveToLocalStorage() {
    localStorage.setItem('mock-data', JSON.stringify({
      users: this.users,
      notes: this.notes,
      userIdCounter: this.userIdCounter,
      noteIdCounter: this.noteIdCounter
    }))
  }

  private loadFromLocalStorage() {
    const data = localStorage.getItem('mock-data')
    if (data) {
      try {
        const parsed = JSON.parse(data)
        this.users = parsed.users || []
        this.notes = parsed.notes || []
        this.userIdCounter = parsed.userIdCounter || 1
        this.noteIdCounter = parsed.noteIdCounter || 1
      } catch (error) {
        console.error('加载本地数据失败:', error)
      }
    }
  }

  // 初始化时加载数据
  constructor() {
    this.loadFromLocalStorage()
  }
}

// 创建单例实例
const mockDataStore = new MockDataStore()

// 模拟延迟的辅助函数
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms))

// 导出模拟API
export const mockAuthApi = {
  register: async (userData: RegisterData) => {
    await delay(800) // 模拟网络延迟
    return mockDataStore.register(userData)
  },

  login: async (credentials: LoginCredentials) => {
    await delay(800)
    return mockDataStore.login(credentials)
  },

  getCurrentUser: async () => {
    await delay(300)
    return mockDataStore.getCurrentUser()
  }
}

export const mockNotesApi = {
  getAllNotes: async () => {
    await delay(300)
    return mockDataStore.getAllNotes()
  },

  getNote: async (noteId: number) => {
    await delay(300)
    return mockDataStore.getNote(noteId)
  },

  createNote: async (noteData: NoteData) => {
    await delay(500)
    return mockDataStore.createNote(noteData)
  },

  updateNote: async (noteId: number, noteData: NoteData) => {
    await delay(500)
    return mockDataStore.updateNote(noteId, noteData)
  },

  deleteNote: async (noteId: number) => {
    await delay(300)
    return mockDataStore.deleteNote(noteId)
  }
}