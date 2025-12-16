<template>
  <div class="simple-dashboard">
    <NavBar />

    <div class="content">
      <h1>Hello Dashboard</h1>
      <p>欢迎 {{ authStore.user?.username }}!</p>

      <div class="modules">
        <div class="module">
          <h2>📝 Daily Notes</h2>
          <p>这里会显示笔记</p>
        </div>

        <div class="module">
          <h2>🍅 番茄钟</h2>
          <p>{{ formattedTime }}</p>
          <button @click="toggleTimer" class="btn">
            {{ isRunning ? '暂停' : '开始' }}
          </button>
        </div>

        <div class="module">
          <h2>✅ 待办清单</h2>
          <div v-for="todo in todos" :key="todo.id" class="todo-item">
            <input type="checkbox" v-model="todo.completed">
            {{ todo.text }}
          </div>
        </div>

        <div class="module">
          <h2>📅 年度规划</h2>
          <p>{{ currentYear }}年</p>
          <button @click="openCalendar" class="btn">查看完整年历</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import NavBar from '@/components/NavBar.vue'

const router = useRouter()
const authStore = useAuthStore()

// 番茄钟状态
const isRunning = ref(false)
const timeLeft = ref(25 * 60)
let timer: number | null = null

// 待办事项
const todos = ref([
  { id: 1, text: '测试待办1', completed: false },
  { id: 2, text: '测试待办2', completed: true }
])

// 年历
const currentYear = ref(new Date().getFullYear())

const formattedTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60)
  const seconds = timeLeft.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const toggleTimer = () => {
  if (isRunning.value) {
    isRunning.value = false
    if (timer) clearInterval(timer)
  } else {
    isRunning.value = true
    timer = setInterval(() => {
      if (timeLeft.value > 0) {
        timeLeft.value--
      } else {
        isRunning.value = false
        clearInterval(timer!)
      }
    }, 1000)
  }
}

const openCalendar = () => {
  router.push('/calendar')
}

onMounted(() => {
  console.log('SimpleDashboard mounted')
})
</script>

<style scoped>
.simple-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.content {
  padding: 100px 20px 40px;
}

h1 {
  color: white;
  text-align: center;
  margin-bottom: 20px;
}

.modules {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.module {
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.module h2 {
  margin-top: 0;
  color: #333;
}

.todo-item {
  margin: 5px 0;
}

.btn {
  background: #6366f1;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
}

.btn:hover {
  background: #4f46e5;
}
</style>