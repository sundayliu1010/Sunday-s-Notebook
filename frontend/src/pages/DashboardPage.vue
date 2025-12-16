<template>
  <div class="dashboard-page">
    <!-- 顶部导航栏 -->
    <NavBar />

    <!-- 主要内容区域 -->
    <div class="dashboard-content">
      <!-- 欢迎区域 -->
      <div class="welcome-header">
        <div class="welcome-text">
          <h1>🌸 Hello Kitty Daily Notebook</h1>
          <p>欢迎回来，{{ authStore.user?.username }}！开始您高效的一天吧</p>
        </div>
        <div class="quick-actions">
          <button @click="createNewNote" class="btn btn-primary">
            ✨ 新建笔记
          </button>
          <button @click="openAIChat" class="btn btn-secondary">
            🤖 AI助手
          </button>
        </div>
      </div>

      <!-- 4模块网格布局 -->
      <div class="modules-grid">
        <!-- Daily Notes 模块 -->
        <div class="module daily-notes-module">
          <div class="module-header">
            <h2>📝 Daily Notes</h2>
            <button @click="createNewNote" class="module-action-btn">
              新建笔记
            </button>
          </div>
          <div class="module-content">
            <div v-if="notesStore.notes.length > 0" class="notes-preview">
              <div
                v-for="note in notesStore.notes.slice(0, 3)"
                :key="note.id"
                class="note-item"
                @click="openNote(note.id)"
              >
                <div class="note-title">{{ note.title || '无标题' }}</div>
                <div class="note-preview">{{ getPreview(note.content) }}</div>
                <div class="note-date">{{ formatDate(note.updated_at) }}</div>
              </div>
              <div v-if="notesStore.notes.length > 3" class="view-more">
                <button @click="openNotesList" class="view-more-btn">查看全部 ({{ notesStore.notes.length }})</button>
              </div>
            </div>
            <div v-else class="empty-state">
              <p>还没有任何笔记</p>
              <button @click="createNewNote" class="btn btn-sm btn-primary">创建第一篇笔记</button>
            </div>
          </div>
        </div>

        <!-- 番茄钟模块 -->
        <div class="module pomodoro-module">
          <div class="module-header">
            <h2>🍅 番茄钟</h2>
            <button @click="resetTimer" class="module-action-btn">
              重置
            </button>
          </div>
          <div class="module-content">
            <div class="pomodoro-display">
              <div class="timer-display">{{ formattedTime }}</div>
              <div class="timer-controls">
                <button @click="toggleTimer" class="btn" :class="isRunning ? 'btn-danger' : 'btn-success'">
                  {{ isRunning ? '暂停' : '开始' }}
                </button>
              </div>
              <div class="timer-mode">
                <select v-model="mode" @change="onModeChange" class="mode-select">
                  <option value="work">工作时间 (25分钟)</option>
                  <option value="shortBreak">短休息 (5分钟)</option>
                  <option value="longBreak">长休息 (15分钟)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- 待办清单模块 -->
        <div class="module todo-module">
          <div class="module-header">
            <h2>✅ 待办清单</h2>
            <button @click="addNewTodo" class="module-action-btn">
              添加
            </button>
          </div>
          <div class="module-content">
            <div v-if="todoStore.todos.length > 0" class="todo-list">
              <div
                v-for="todo in todoStore.todos.slice(0, 5)"
                :key="todo.id"
                class="todo-item"
                :class="{ completed: todo.completed }"
              >
                <input
                  type="checkbox"
                  :checked="todo.completed"
                  @change="toggleTodo(todo.id)"
                  class="todo-checkbox"
                >
                <span class="todo-text">{{ todo.text }}</span>
              </div>
              <div v-if="todoStore.todos.length > 5" class="view-more">
                <button @click="openFullTodos" class="view-more-btn">查看全部 ({{ todoStore.todos.length }})</button>
              </div>
            </div>
            <div v-else class="empty-state">
              <p>还没有待办事项</p>
              <button @click="addNewTodo" class="btn btn-sm btn-primary">添加第一个待办</button>
            </div>
          </div>
        </div>

        <!-- 年历模块 -->
        <div class="module calendar-module">
          <div class="module-header">
            <h2>📅 年度规划</h2>
            <button @click="openFullCalendar" class="module-action-btn">
              详细
            </button>
          </div>
          <div class="module-content">
            <div class="calendar-summary">
              <div class="year-controls">
                <button @click="previousYear" class="year-btn">‹</button>
                <span class="current-year">{{ currentYear }}年</span>
                <button @click="nextYear" class="year-btn">›</button>
              </div>

              <div class="year-stats">
                <div class="stat-card">
                  <div class="stat-number">{{ totalGoals }}</div>
                  <div class="stat-label">年度目标</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">{{ totalEvents }}</div>
                  <div class="stat-label">重要事项</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">{{ activeMonths }}</div>
                  <div class="stat-label">活跃月份</div>
                </div>
              </div>

              <div class="recent-months">
                <div class="months-grid">
                  <div
                    v-for="month in getRecentMonths()"
                    :key="month"
                    class="month-mini"
                    @click="openFullCalendar"
                  >
                    <div class="month-name">{{ month }}月</div>
                    <div class="month-dots">
                      <div v-if="getMonthGoalsCount(month) > 0" class="dot goal-dot"></div>
                      <div v-if="getMonthEventsCount(month) > 0" class="dot event-dot"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI聊天浮动组件 -->
    <AIChatWidget />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotesStore } from '@/stores/notes'
import NavBar from '@/components/NavBar.vue'
import AIChatWidget from '@/components/AIChatWidget.vue'

interface Goal {
  text: string
  status: 'pending' | 'completed'
}

interface Event {
  date: string
  text: string
}

interface MonthData {
  goals: Goal[]
  events: Event[]
}

const router = useRouter()
const authStore = useAuthStore()
const notesStore = useNotesStore()

// 简单的本地待办事项管理
const todos = ref<Array<{
  id: number
  text: string
  completed: boolean
}>>([
  { id: 1, text: '完成项目报告', completed: false },
  { id: 2, text: '学习新技术', completed: false },
  { id: 3, text: '健身运动', completed: true }
])

let todoIdCounter = 4

// 番茄钟相关状态
const isRunning = ref(false)
const timeLeft = ref(25 * 60)
const mode = ref<'work' | 'shortBreak' | 'longBreak'>('work')

// 年历相关状态
const currentYear = ref(new Date().getFullYear())
const yearData = ref<Record<number, MonthData>>({})

// 计时器引用
let timer: number | null = null

// 计算属性
const formattedTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60)
  const seconds = timeLeft.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const totalGoals = computed(() => {
  let total = 0
  const year = yearData.value[currentYear.value]
  if (year && year.goals) {
    Object.values(year.goals).forEach(monthGoals => {
      total += monthGoals.length
    })
  }
  return total
})

const totalEvents = computed(() => {
  let total = 0
  const year = yearData.value[currentYear.value]
  if (year && year.events) {
    Object.values(year.events).forEach(monthEvents => {
      total += monthEvents.length
    })
  }
  return total
})

const activeMonths = computed(() => {
  const year = yearData.value[currentYear.value]
  if (!year) return 0

  let activeCount = 0
  const months = Object.keys(year.goals).concat(Object.keys(year.events))
  const uniqueMonths = [...new Set(months)]

  uniqueMonths.forEach(month => {
    const monthNum = parseInt(month)
    if (year.goals[monthNum]?.length > 0 || year.events[monthNum]?.length > 0) {
      activeCount++
    }
  })

  return activeCount
})

onMounted(async () => {
  // 加载用户笔记
  try {
    await notesStore.fetchNotes()
    loadCalendarData()
    loadTodosFromStorage()
  } catch (error) {
    console.error('加载数据失败:', error)
  }
})

// 番茄钟方法
const toggleTimer = () => {
  if (isRunning.value) {
    pauseTimer()
  } else {
    startTimer()
  }
}

const startTimer = () => {
  isRunning.value = true
  timer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      pauseTimer()
      notifyTimerComplete()
    }
  }, 1000)
}

const pauseTimer = () => {
  isRunning.value = false
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const resetTimer = () => {
  pauseTimer()
  setModeTime(mode.value)
}

const onModeChange = () => {
  resetTimer()
}

const setModeTime = (newMode: typeof mode.value) => {
  switch (newMode) {
    case 'work':
      timeLeft.value = 25 * 60
      break
    case 'shortBreak':
      timeLeft.value = 5 * 60
      break
    case 'longBreak':
      timeLeft.value = 15 * 60
      break
  }
}

const notifyTimerComplete = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  } catch (error) {
    console.error('播放提示音失败:', error)
  }

  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('番茄钟提醒', {
      body: `${getModeText(mode.value)}时间到了！`,
      icon: '/favicon.ico'
    })
  }

  alert(`${getModeText(mode.value)}时间到了！`)
}

const getModeText = (modeValue: typeof mode.value): string => {
  switch (modeValue) {
    case 'work':
      return '工作'
    case 'shortBreak':
      return '短休息'
    case 'longBreak':
      return '长休息'
    default:
      return ''
  }
}

// 年历方法
const previousYear = () => {
  currentYear.value--
  loadCalendarData()
}

const nextYear = () => {
  currentYear.value++
  loadCalendarData()
}

const loadCalendarData = () => {
  const saved = localStorage.getItem('yearly-calendar-data')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      yearData.value = parsed || {}
    } catch (error) {
      console.error('加载数据失败:', error)
      yearData.value = {}
    }
  } else {
    yearData.value = {}
  }
}

const getMonthData = (month: number): MonthData => {
  if (!yearData.value[currentYear.value]) {
    yearData.value[currentYear.value] = { goals: {}, events: {} }
  }
  if (!yearData.value[currentYear.value].goals[month]) {
    yearData.value[currentYear.value].goals[month] = []
  }
  if (!yearData.value[currentYear.value].events[month]) {
    yearData.value[currentYear.value].events[month] = []
  }

  return {
    goals: yearData.value[currentYear.value].goals[month],
    events: yearData.value[currentYear.value].events[month]
  }
}

const getMonthGoalsCount = (month: number): number => {
  return getMonthData(month).goals.length
}

const getMonthEventsCount = (month: number): number => {
  return getMonthData(month).events.length
}

const getRecentMonths = (): number[] => {
  const currentMonth = new Date().getMonth() + 1
  const months = []
  for (let i = 0; i < 6; i++) {
    const month = (currentMonth + i - 2) % 12 + 1
    if (month > 0) months.push(month)
  }
  return months.slice(0, 6)
}

// 待办事项方法
const toggleTodo = (todoId: number) => {
  const todo = todos.value.find(t => t.id === todoId)
  if (todo) {
    todo.completed = !todo.completed
    saveTodosToStorage()
  }
}

const addNewTodo = () => {
  const text = prompt('请输入新待办事项:')
  if (text && text.trim()) {
    const newTodo = {
      id: todoIdCounter++,
      text: text.trim(),
      completed: false
    }
    todos.value.push(newTodo)
    saveTodosToStorage()
  }
}

const saveTodosToStorage = () => {
  localStorage.setItem('dashboard-todos', JSON.stringify(todos.value))
}

const loadTodosFromStorage = () => {
  const saved = localStorage.getItem('dashboard-todos')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      todos.value = parsed || []
      // 更新计数器
      if (todos.value.length > 0) {
        todoIdCounter = Math.max(...todos.value.map(t => t.id)) + 1
      }
    } catch (error) {
      console.error('加载待办事项失败:', error)
    }
  }
}

// 笔记相关方法
const createNewNote = () => {
  router.push('/note')
}

const openNote = (noteId: number) => {
  router.push(`/note/${noteId}`)
}

const openNotesList = () => {
  // 可以导航到笔记列表或显示更多笔记
  console.log('打开完整笔记列表')
}

const openFullTodos = () => {
  // 可以导航到完整待办页面
  console.log('打开完整待办列表')
}

const openAIChat = () => {
  // TODO: 实现打开AI聊天功能
  console.log('打开AI聊天')
}

const openFullCalendar = () => {
  router.push('/calendar')
}

const getPreview = (content: string): string => {
  return content.length > 60 ? content.substring(0, 60) + '...' : content
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 清理计时器
onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.dashboard-content {
  padding-top: 80px; /* 为顶部导航栏留出空间 */
  padding: 80px 20px 40px;
  min-height: 100vh;
}

/* 欢迎区域 */
.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.welcome-text h1 {
  color: white;
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.welcome-text p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
}

.quick-actions {
  display: flex;
  gap: 15px;
}

/* 4模块网格布局 */
.modules-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 25px;
  margin-bottom: 40px;
}

.module {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(20px);
  transition: all 0.3s ease;
  overflow: hidden;
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.module:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.8);
}

.module-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.4rem;
  font-weight: 600;
}

.module-action-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.module-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.module-content {
  padding: 25px;
  flex: 1;
}

/* Daily Notes 模块样式 */
.daily-notes-module .module-header {
  background: linear-gradient(135deg, #ff69b4 0%, #ff1493 100%);
  color: white;
}

.daily-notes-module .module-header h2 {
  color: white;
}

.notes-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.note-item {
  background: rgba(30, 30, 46, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.note-item:hover {
  background: rgba(30, 30, 46, 0.1);
  border-color: rgba(255, 105, 180, 0.3);
  transform: translateY(-2px);
}

.note-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  font-size: 1.1rem;
}

.note-preview {
  color: #666;
  line-height: 1.5;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.note-date {
  color: #999;
  font-size: 0.8rem;
}

.view-more {
  text-align: center;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.view-more-btn {
  background: none;
  border: 1px solid rgba(255, 105, 180, 0.5);
  color: #ff69b4;
  padding: 6px 12px;
  border-radius: 15px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.view-more-btn:hover {
  background: rgba(255, 105, 180, 0.1);
  border-color: rgba(255, 105, 180, 0.8);
}

/* 番茄钟模块样式 */
.pomodoro-module .module-header {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
}

.pomodoro-module .module-header h2 {
  color: white;
}

.pomodoro-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.timer-display {
  font-size: 3rem;
  font-weight: bold;
  color: #333;
  font-family: 'Courier New', monospace;
  background: rgba(30, 30, 46, 0.1);
  padding: 20px 30px;
  border-radius: 15px;
  border: 2px solid rgba(99, 102, 241, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.timer-controls {
  width: 100%;
}

.timer-controls .btn {
  width: 100%;
  padding: 12px;
  font-size: 1.1rem;
}

.mode-select {
  width: 100%;
  padding: 10px;
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 8px;
  background: white;
  color: #333;
  font-size: 0.9rem;
  outline: none;
}

.mode-select:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25);
}

/* 待办清单模块样式 */
.todo-module .module-header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.todo-module .module-header h2 {
  color: white;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(30, 30, 46, 0.05);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.todo-item:hover {
  background: rgba(30, 30, 46, 0.1);
}

.todo-item.completed {
  opacity: 0.6;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
  color: #999;
}

.todo-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.todo-text {
  flex: 1;
  color: #333;
  font-size: 0.95rem;
}

/* 年历模块样式 */
.calendar-module .module-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.calendar-module .module-header h2 {
  color: white;
}

.calendar-summary {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.year-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.year-btn {
  background: rgba(102, 126, 234, 0.2);
  border: none;
  color: #667eea;
  font-size: 1.2rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.year-btn:hover {
  background: rgba(102, 126, 234, 0.3);
  transform: scale(1.1);
}

.current-year {
  font-size: 1.3rem;
  font-weight: bold;
  color: #333;
  min-width: 80px;
  text-align: center;
}

.year-stats {
  display: flex;
  justify-content: space-around;
  gap: 15px;
}

.stat-card {
  text-align: center;
  flex: 1;
  padding: 15px 10px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 10px;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.stat-number {
  font-size: 1.8rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

.months-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.month-mini {
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.month-mini:hover {
  background: rgba(102, 126, 234, 0.2);
  border-color: rgba(102, 126, 234, 0.4);
  transform: translateY(-2px);
}

.month-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}

.month-dots {
  display: flex;
  justify-content: center;
  gap: 4px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.goal-dot {
  background: #10b981;
}

.event-dot {
  background: #f59e0b;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.empty-state p {
  margin-bottom: 15px;
  font-size: 1rem;
}

/* 按钮样式 */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.9rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .modules-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .welcome-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .quick-actions {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .dashboard-content {
    padding: 80px 15px 30px;
  }

  .welcome-header {
    padding: 20px;
  }

  .welcome-text h1 {
    font-size: 1.8rem;
  }

  .modules-grid {
    gap: 15px;
  }

  .module {
    min-height: 350px;
  }

  .module-header {
    padding: 15px 20px;
  }

  .module-content {
    padding: 20px;
  }

  .timer-display {
    font-size: 2.5rem;
    padding: 15px 20px;
  }

  .year-stats {
    flex-direction: column;
    gap: 10px;
  }

  .months-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .welcome-text h1 {
    font-size: 1.5rem;
  }

  .quick-actions {
    flex-direction: column;
    width: 100%;
  }

  .quick-actions .btn {
    width: 100%;
  }

  .timer-display {
    font-size: 2rem;
    padding: 10px 15px;
  }
}
</style>