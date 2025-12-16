<template>
  <div class="todo-widget" :style="widgetPosition">
    <div class="widget-header">
      <span>🌸 Hello Kitty 待办清单</span>
      <button @click="toggleMinimized" class="minimize-btn">
        {{ isMinimized ? '+' : '−' }}
      </button>
    </div>

    <div v-show="!isMinimized" class="widget-content">
      <!-- 添加新任务 -->
      <div class="add-todo">
        <input
          v-model="newTodoText"
          @keyup.enter="addTodo"
          type="text"
          placeholder="添加新任务..."
          class="todo-input"
        />
        <button @click="addTodo" class="add-btn" :disabled="!newTodoText.trim()">
          +
        </button>
      </div>

      <!-- 任务列表 -->
      <div class="todo-list">
        <div v-if="todos.length === 0" class="empty-state">
          <p>暂无任务</p>
        </div>

        <div
          v-for="todo in todos"
          :key="todo.id"
          class="todo-item"
          :class="{ completed: todo.is_completed }"
        >
          <label class="todo-checkbox">
            <input
              type="checkbox"
              :checked="todo.is_completed"
              @change="toggleTodo(todo.id)"
            />
            <span class="checkmark"></span>
          </label>

          <span class="todo-text" @dblclick="editTodo(todo)">
            {{ todo.text }}
          </span>

          <button @click="deleteTodo(todo.id)" class="delete-btn">
            ×
          </button>
        </div>
      </div>

      <!-- 任务统计 -->
      <div class="todo-stats">
        <span>{{ completedCount }}/{{ totalCount }} 已完成</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'

// 组件状态
const isMinimized = ref(false)
const newTodoText = ref('')

// 小组件位置
const widgetPosition = ref({
  position: 'fixed',
  top: '420px',
  right: '20px',
  zIndex: 999
})

// 任务列表
const todos = ref<Array<{
  id: number
  text: string
  is_completed: boolean
  created_date: string
}>>([])

// 模拟任务ID
let todoIdCounter = 1

// 计算属性
const totalCount = computed(() => todos.value.length)
const completedCount = computed(() => todos.value.filter(todo => todo.is_completed).length)

// 方法
const toggleMinimized = () => {
  isMinimized.value = !isMinimized.value
}

const addTodo = () => {
  const text = newTodoText.value.trim()
  if (!text) return

  const newTodo = {
    id: todoIdCounter++,
    text,
    is_completed: false,
    created_date: new Date().toISOString().split('T')[0]
  }

  todos.value.unshift(newTodo)
  newTodoText.value = ''

  // TODO: 调用后端API保存任务
  saveTodos()
}

const toggleTodo = (todoId: number) => {
  const todo = todos.value.find(t => t.id === todoId)
  if (todo) {
    todo.is_completed = !todo.is_completed
    saveTodos()
  }
}

const deleteTodo = (todoId: number) => {
  const index = todos.value.findIndex(t => t.id === todoId)
  if (index > -1) {
    todos.value.splice(index, 1)
    saveTodos()
  }
}

const editTodo = (todo: any) => {
  const newText = prompt('编辑任务:', todo.text)
  if (newText && newText.trim() !== todo.text) {
    todo.text = newText.trim()
    saveTodos()
  }
}

const saveTodos = () => {
  // TODO: 调用后端API保存任务到数据库
  // 现在先保存到本地存储
  localStorage.setItem('todos', JSON.stringify(todos.value))
}

const loadTodos = () => {
  // TODO: 从后端API加载任务
  // 现在先从本地存储加载
  const savedTodos = localStorage.getItem('todos')
  if (savedTodos) {
    try {
      todos.value = JSON.parse(savedTodos)
      // 更新ID计数器
      const maxId = Math.max(...todos.value.map(t => t.id), 0)
      todoIdCounter = maxId + 1
    } catch (error) {
      console.error('加载任务失败:', error)
      loadSampleTodos()
    }
  } else {
    loadSampleTodos()
  }
}

const loadSampleTodos = () => {
  // 加载一些示例任务
  todos.value = [
    {
      id: todoIdCounter++,
      text: '欢迎使用AI智能生产力工作台！',
      is_completed: false,
      created_date: new Date().toISOString().split('T')[0]
    },
    {
      id: todoIdCounter++,
      text: '尝试创建您的第一篇笔记',
      is_completed: false,
      created_date: new Date().toISOString().split('T')[0]
    },
    {
      id: todoIdCounter++,
      text: '体验番茄钟计时功能',
      is_completed: false,
      created_date: new Date().toISOString().split('T')[0]
    }
  ]
}

// 组件挂载时加载任务
onMounted(() => {
  loadTodos()
})
</script>

<style scoped>
.todo-widget {
  background: rgba(30, 30, 46, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  width: 280px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  user-select: none;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: linear-gradient(135deg, #ff69b4 0%, #ff1493 100%);
  color: white;
  border-radius: 12px 12px 0 0;
  font-size: 13px;
  font-weight: 500;
  backdrop-filter: blur(10px);
}

.minimize-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 14px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.minimize-btn:hover {
  background: rgba(255,255,255,0.2);
}

.widget-content {
  padding: 15px;
}

.add-todo {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
}

.todo-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-size: 12px;
  outline: none;
  background: rgba(255, 255, 255, 0.08);
  color: #e4e4e7;
  backdrop-filter: blur(10px);
}

.todo-input:focus {
  border-color: #ff69b4;
  background: rgba(255, 255, 255, 0.12);
}

.todo-input::placeholder {
  color: rgba(228, 228, 231, 0.6);
}

.add-btn {
  background: linear-gradient(135deg, #ff69b4 0%, #ff1493 100%);
  color: white;
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(255, 105, 180, 0.3);
}

.add-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(255, 105, 180, 0.4);
}

.add-btn:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(228, 228, 231, 0.5);
  cursor: not-allowed;
  box-shadow: none;
}

.todo-list {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 10px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-item.completed {
  opacity: 0.6;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
  color: rgba(228, 228, 231, 0.6);
}

.todo-checkbox {
  position: relative;
  cursor: pointer;
}

.todo-checkbox input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkmark {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  display: block;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.08);
}

.todo-checkbox input[type="checkbox"]:checked + .checkmark {
  background: linear-gradient(135deg, #ff69b4 0%, #ff1493 100%);
  border-color: #ff69b4;
  box-shadow: 0 2px 10px rgba(255, 105, 180, 0.3);
}

.todo-checkbox input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  color: white;
  font-size: 10px;
  position: absolute;
  top: -2px;
  left: 2px;
}

.todo-text {
  flex: 1;
  font-size: 12px;
  cursor: pointer;
  word-break: break-word;
  color: #e4e4e7;
}

.todo-text:hover {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
}

.delete-btn {
  background: none;
  border: none;
  color: rgba(255, 105, 180, 0.8);
  cursor: pointer;
  font-size: 14px;
  padding: 2px;
  border-radius: 2px;
  opacity: 0.8;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  opacity: 1;
  background: rgba(255, 105, 180, 0.2);
}

.empty-state {
  text-align: center;
  padding: 20px;
  color: rgba(228, 228, 231, 0.8);
  font-size: 12px;
}

.todo-stats {
  text-align: center;
  font-size: 11px;
  color: rgba(228, 228, 231, 0.6);
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* 滚动条样式 */
.todo-list::-webkit-scrollbar {
  width: 4px;
}

.todo-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.todo-list::-webkit-scrollbar-thumb {
  background: rgba(255, 105, 180, 0.3);
  border-radius: 2px;
}

.todo-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 105, 180, 0.5);
}
</style>