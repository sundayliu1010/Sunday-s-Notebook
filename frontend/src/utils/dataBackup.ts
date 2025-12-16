/**
 * 数据备份和恢复工具
 * 用于导出/导入用户的笔记、设置等本地数据
 */

export interface BackupData {
  version: string
  exportDate: string
  user?: {
    username: string
    email: string
    created_at: string
    updated_at: string
  }
  notes: Array<{
    id: number
    title: string
    content: string
    created_at: string
    updated_at: string
  }>
  todos: Array<{
    id: number
    text: string
    is_completed: boolean
    created_date: string
    created_at: string
    updated_at?: string
  }>
  settings: {
    openaiApiKey: string
    theme: string
    pomodoroSettings?: {
      workDuration: number
      shortBreakDuration: number
      longBreakDuration: number
    }
  }
  metadata: {
    totalNotes: number
    totalTodos: number
    completedTodos: number
    dataVersion: string
  }
}

export class DataBackupManager {
  private static readonly BACKUP_VERSION = '1.0'
  private static readonly STORAGE_KEYS = {
    NOTES: 'notes-data',
    TODOS: 'todos',
    USER: 'currentUser',
    API_KEY: 'hello-kitty-openai-api-key',
    THEME: 'hello-kitty-theme',
    MOCK_DATA: 'mock-data'
  }

  /**
   * 导出所有本地数据
   */
  static async exportData(): Promise<BackupData> {
    try {
      const backupData: BackupData = {
        version: this.BACKUP_VERSION,
        exportDate: new Date().toISOString(),
        user: this.getCurrentUser(),
        notes: this.getNotes(),
        todos: this.getTodos(),
        settings: this.getSettings(),
        metadata: this.getMetadata()
      }

      return backupData
    } catch (error) {
      console.error('导出数据失败:', error)
      throw new Error('导出数据失败，请重试')
    }
  }

  /**
   * 导入备份数据
   */
  static async importData(backupData: BackupData): Promise<void> {
    try {
      // 验证备份数据
      this.validateBackupData(backupData)

      // 清除现有数据
      this.clearAllData()

      // 导入用户数据
      if (backupData.user) {
        localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(backupData.user))
      }

      // 导入笔记
      if (backupData.notes && backupData.notes.length > 0) {
        localStorage.setItem(this.STORAGE_KEYS.NOTES, JSON.stringify(backupData.notes))
      }

      // 导入待办事项
      if (backupData.todos && backupData.todos.length > 0) {
        localStorage.setItem(this.STORAGE_KEYS.TODOS, JSON.stringify(backupData.todos))
      }

      // 导入设置
      if (backupData.settings) {
        if (backupData.settings.openaiApiKey) {
          localStorage.setItem(this.STORAGE_KEYS.API_KEY, backupData.settings.openaiApiKey)
        }
        if (backupData.settings.theme) {
          localStorage.setItem(this.STORAGE_KEYS.THEME, backupData.settings.theme)
        }
      }

      // 导入模拟数据（兼容旧版本）
      if (backupData.notes && backupData.user) {
        const mockData = {
          users: [backupData.user],
          notes: backupData.notes,
          userIdCounter: backupData.notes.length + 1,
          noteIdCounter: Math.max(...backupData.notes.map(n => n.id), 0) + 1
        }
        localStorage.setItem(this.STORAGE_KEYS.MOCK_DATA, JSON.stringify(mockData))
      }

    } catch (error) {
      console.error('导入数据失败:', error)
      throw new Error('导入数据失败，请检查备份文件格式')
    }
  }

  /**
   * 下载备份文件
   */
  static downloadBackupFile(data: BackupData): void {
    try {
      const jsonString = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)

      // 生成文件名：Hello Kitty Daily Notebook_YYYY-MM-DD.json
      const date = new Date().toISOString().split('T')[0]
      const filename = `Hello Kitty Daily Notebook_${date}.json`

      // 创建下载链接
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()

      // 清理
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

    } catch (error) {
      console.error('下载备份文件失败:', error)
      throw new Error('下载备份文件失败')
    }
  }

  /**
   * 从文件读取备份数据
   */
  static async readBackupFile(file: File): Promise<BackupData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const result = e.target?.result
          if (typeof result === 'string') {
            const backupData: BackupData = JSON.parse(result)
            resolve(backupData)
          } else {
            reject(new Error('文件格式错误'))
          }
        } catch (error) {
          reject(new Error('解析备份文件失败'))
        }
      }

      reader.onerror = () => {
        reject(new Error('读取文件失败'))
      }

      reader.readAsText(file)
    })
  }

  /**
   * 验证备份数据格式
   */
  private static validateBackupData(data: any): void {
    if (!data || typeof data !== 'object') {
      throw new Error('无效的备份数据')
    }

    if (!data.version) {
      throw new Error('备份数据缺少版本信息')
    }

    if (!data.exportDate) {
      throw new Error('备份数据缺少导出时间')
    }

    // 验证必要的数据结构
    if (data.notes && !Array.isArray(data.notes)) {
      throw new Error('备份数据格式错误：笔记数据应该是数组')
    }

    if (data.todos && !Array.isArray(data.todos)) {
      throw new Error('备份数据格式错误：待办数据应该是数组')
    }
  }

  /**
   * 获取当前用户信息
   */
  private static getCurrentUser() {
    try {
      const userData = localStorage.getItem(this.STORAGE_KEYS.USER)
      return userData ? JSON.parse(userData) : null
    } catch {
      return null
    }
  }

  /**
   * 获取笔记数据
   */
  private static getNotes() {
    try {
      // 从模拟数据中提取用户笔记
      const mockData = localStorage.getItem(this.STORAGE_KEYS.MOCK_DATA)
      if (mockData) {
        const parsed = JSON.parse(mockData)
        return parsed.notes || []
      }
      return []
    } catch {
      return []
    }
  }

  /**
   * 获取待办事项数据
   */
  private static getTodos() {
    try {
      const todosData = localStorage.getItem(this.STORAGE_KEYS.TODOS)
      return todosData ? JSON.parse(todosData) : []
    } catch {
      return []
    }
  }

  /**
   * 获取设置信息
   */
  private static getSettings() {
    return {
      openaiApiKey: localStorage.getItem(this.STORAGE_KEYS.API_KEY) || '',
      theme: localStorage.getItem(this.STORAGE_KEYS.THEME) || 'hello-kitty-dark'
    }
  }

  /**
   * 获取元数据信息
   */
  private static getMetadata() {
    const notes = this.getNotes()
    const todos = this.getTodos()
    const completedTodos = todos.filter(todo => todo.is_completed).length

    return {
      totalNotes: notes.length,
      totalTodos: todos.length,
      completedTodos,
      dataVersion: this.BACKUP_VERSION
    }
  }

  /**
   * 清除所有本地数据
   */
  private static clearAllData(): void {
    try {
      Object.values(this.STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
    } catch (error) {
      console.error('清除本地数据失败:', error)
    }
  }

  /**
   * 检查是否有数据可以导出
   */
  static hasExportableData(): boolean {
    const notes = this.getNotes()
    const todos = this.getTodos()
    const user = this.getCurrentUser()
    const settings = this.getSettings()

    return notes.length > 0 || todos.length > 0 || user || settings.openaiApiKey
  }

  /**
   * 获取数据统计信息
   */
  static getDataStats(): {
    notesCount: number
    todosCount: number
    completedTodosCount: number
    hasApiKey: boolean
    hasUserData: boolean
    estimatedSize: string
  } {
    const notes = this.getNotes()
    const todos = this.getTodos()
    const user = this.getCurrentUser()
    const settings = this.getSettings()

    // 估算数据大小
    let totalSize = 0
    totalSize += JSON.stringify(notes).length
    totalSize += JSON.stringify(todos).length
    totalSize += JSON.stringify(user).length
    totalSize += JSON.stringify(settings).length

    let sizeText = '小于1KB'
    if (totalSize > 1024 * 1024) {
      sizeText = `${(totalSize / (1024 * 1024)).toFixed(2)}MB`
    } else if (totalSize > 1024) {
      sizeText = `${(totalSize / 1024).toFixed(2)}KB`
    } else {
      sizeText = `${totalSize}字节`
    }

    return {
      notesCount: notes.length,
      todosCount: todos.length,
      completedTodosCount: todos.filter(todo => todo.is_completed).length,
      hasApiKey: !!settings.openaiApiKey,
      hasUserData: !!user,
      estimatedSize: sizeText
    }
  }
}