<template>
  <div class="calendar-widget" :style="widgetPosition">
    <div class="widget-header">
      <span>📅 年度规划</span>
      <button @click="toggleMinimized" class="minimize-btn">
        {{ isMinimized ? '+' : '−' }}
      </button>
    </div>

    <div v-show="!isMinimized" class="widget-content">
      <div class="year-controls">
        <button @click="previousYear" class="year-btn">‹</button>
        <span class="current-year">{{ currentYear }}年</span>
        <button @click="nextYear" class="year-btn">›</button>
      </div>

      <div class="calendar-mini">
        <div class="months-grid">
          <div
            v-for="(month, index) in months"
            :key="index"
            class="month-mini"
            @click="openFullCalendar"
          >
            <div class="month-name">{{ month }}月</div>
            <div class="month-stats">
              <div class="goals-count">
                <span class="emoji">🎯</span>
                <span class="count">{{ getMonthGoalsCount(index + 1) }}</span>
              </div>
              <div class="events-count">
                <span class="emoji">📌</span>
                <span class="count">{{ getMonthEventsCount(index + 1) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="widget-actions">
        <button @click="openFullCalendar" class="btn btn-primary btn-sm">
          查看完整年历
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

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
const isMinimized = ref(false)
const currentYear = ref(new Date().getFullYear())

const months = [
  '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'
]

// 小组件位置 - 可以调整位置避免与其他组件重叠
const widgetPosition = ref({
  position: 'fixed',
  top: '400px', // 调整到下方位置
  right: '20px',
  zIndex: 1000
})

const yearData = ref<Record<number, MonthData>>({})

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

const previousYear = () => {
  currentYear.value--
  loadFromLocalStorage()
}

const nextYear = () => {
  currentYear.value++
  loadFromLocalStorage()
}

const toggleMinimized = () => {
  isMinimized.value = !isMinimized.value
}

const openFullCalendar = () => {
  router.push('/calendar')
}

const loadFromLocalStorage = () => {
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

onMounted(() => {
  loadFromLocalStorage()
})
</script>

<style scoped>
.calendar-widget {
  background: rgba(30, 30, 46, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  width: 320px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  user-select: none;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.year-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.year-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  font-size: 16px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.year-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.current-year {
  color: #e4e4e7;
  font-weight: bold;
  min-width: 60px;
  text-align: center;
}

.calendar-mini {
  margin-bottom: 15px;
}

.months-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.month-mini {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.month-mini:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(102, 126, 234, 0.5);
  transform: translateY(-2px);
}

.month-name {
  font-size: 12px;
  font-weight: bold;
  color: #e4e4e7;
  text-align: center;
  margin-bottom: 6px;
}

.month-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
}

.goals-count, .events-count {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 10px;
  color: #a1a1aa;
}

.emoji {
  font-size: 12px;
}

.count {
  font-weight: bold;
  color: #e4e4e7;
}

.widget-actions {
  display: flex;
  justify-content: center;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 11px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .calendar-widget {
    width: 280px;
    position: relative;
    top: auto;
    right: auto;
    margin: 10px;
  }

  .months-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>