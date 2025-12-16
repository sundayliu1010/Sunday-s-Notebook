<template>
  <div class="yearly-calendar-page">
    <div class="page-header">
      <h1>📅 年度规划</h1>
      <div class="year-selector">
        <button @click="previousYear" class="year-btn">‹</button>
        <h2>{{ currentYear }}年</h2>
        <button @click="nextYear" class="year-btn">›</button>
      </div>
    </div>

    <div class="calendar-grid">
      <div
        v-for="(month, index) in months"
        :key="index"
        class="month-card"
        @click="openMonthModal(index + 1)"
      >
        <div class="month-header">
          <h3>{{ month }}月</h3>
          <div class="month-actions">
            <button
              @click.stop="toggleMonthView(index + 1)"
              class="view-btn"
              :class="{ 'active': expandedMonths.includes(index + 1) }"
            >
              {{ expandedMonths.includes(index + 1) ? '收起' : '展开' }}
            </button>
          </div>
        </div>

        <div class="month-preview">
          <div class="month-stats">
            <div class="stat-item">
              <span class="stat-label">目标</span>
              <span class="stat-value">{{ getMonthGoals(index + 1).length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">事项</span>
              <span class="stat-value">{{ getMonthEvents(index + 1).length }}</span>
            </div>
          </div>

          <div v-if="expandedMonths.includes(index + 1)" class="expanded-content">
            <div class="goals-section">
              <h4>🎯 月度目标</h4>
              <div class="goals-list">
                <div
                  v-for="(goal, goalIndex) in getMonthGoals(index + 1)"
                  :key="goalIndex"
                  class="goal-item"
                >
                  <span class="goal-text">{{ goal.text }}</span>
                  <span class="goal-status" :class="goal.status">{{ goal.status === 'completed' ? '已完成' : '进行中' }}</span>
                </div>
                <div v-if="getMonthGoals(index + 1).length === 0" class="empty-state">
                  暂无目标
                </div>
              </div>
            </div>

            <div class="events-section">
              <h4>📌 重要事项</h4>
              <div class="events-list">
                <div
                  v-for="(event, eventIndex) in getMonthEvents(index + 1)"
                  :key="eventIndex"
                  class="event-item"
                >
                  <div class="event-date">{{ event.date }}</div>
                  <div class="event-text">{{ event.text }}</div>
                </div>
                <div v-if="getMonthEvents(index + 1).length === 0" class="empty-state">
                  暂无事项
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 月份详情弹窗 -->
    <div v-if="selectedMonth" class="modal-overlay" @click="closeMonthModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedMonth }}月规划</h3>
          <button @click="closeMonthModal" class="close-btn">×</button>
        </div>

        <div class="modal-body">
          <!-- 目标管理 -->
          <div class="section">
            <div class="section-header">
              <h4>🎯 月度目标</h4>
              <button @click="addNewGoal" class="add-btn">+ 添加目标</button>
            </div>
            <div class="goals-management">
              <div
                v-for="(goal, index) in currentMonthGoals"
                :key="index"
                class="goal-management-item"
              >
                <input
                  v-model="goal.text"
                  class="goal-input"
                  placeholder="输入目标内容"
                >
                <select v-model="goal.status" class="status-select">
                  <option value="pending">进行中</option>
                  <option value="completed">已完成</option>
                </select>
                <button @click="removeGoal(index)" class="remove-btn">删除</button>
              </div>
              <div v-if="currentMonthGoals.length === 0" class="empty-state">
                点击上方按钮添加第一个目标
              </div>
            </div>
          </div>

          <!-- 事项管理 -->
          <div class="section">
            <div class="section-header">
              <h4>📌 重要事项</h4>
              <button @click="addNewEvent" class="add-btn">+ 添加事项</button>
            </div>
            <div class="events-management">
              <div
                v-for="(event, index) in currentMonthEvents"
                :key="index"
                class="event-management-item"
              >
                <input
                  v-model="event.date"
                  type="date"
                  class="date-input"
                >
                <input
                  v-model="event.text"
                  class="event-input"
                  placeholder="输入事项内容"
                >
                <button @click="removeEvent(index)" class="remove-btn">删除</button>
              </div>
              <div v-if="currentMonthEvents.length === 0" class="empty-state">
                点击上方按钮添加第一个事项
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="saveMonthData" class="save-btn">保存</button>
          <button @click="closeMonthModal" class="cancel-btn">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

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

const currentYear = ref(new Date().getFullYear())
const selectedMonth = ref<number | null>(null)
const expandedMonths = ref<number[]>([])

const months = [
  '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'
]

const yearData = ref<Record<number, MonthData>>({})

const currentMonthGoals = ref<Goal[]>([])
const currentMonthEvents = ref<Event[]>([])

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

const getMonthGoals = (month: number): Goal[] => {
  return getMonthData(month).goals || []
}

const getMonthEvents = (month: number): Event[] => {
  return getMonthData(month).events || []
}

const previousYear = () => {
  currentYear.value--
}

const nextYear = () => {
  currentYear.value++
}

const toggleMonthView = (month: number) => {
  const index = expandedMonths.value.indexOf(month)
  if (index > -1) {
    expandedMonths.value.splice(index, 1)
  } else {
    expandedMonths.value.push(month)
  }
}

const openMonthModal = (month: number) => {
  selectedMonth.value = month
  const monthData = getMonthData(month)
  currentMonthGoals.value = [...monthData.goals]
  currentMonthEvents.value = [...monthData.events]
}

const closeMonthModal = () => {
  selectedMonth.value = null
  currentMonthGoals.value = []
  currentMonthEvents.value = []
}

const addNewGoal = () => {
  currentMonthGoals.value.push({
    text: '',
    status: 'pending'
  })
}

const addNewEvent = () => {
  currentMonthEvents.value.push({
    date: new Date().toISOString().split('T')[0],
    text: ''
  })
}

const removeGoal = (index: number) => {
  currentMonthGoals.value.splice(index, 1)
}

const removeEvent = (index: number) => {
  currentMonthEvents.value.splice(index, 1)
}

const saveMonthData = () => {
  if (selectedMonth.value) {
    if (!yearData.value[currentYear.value]) {
      yearData.value[currentYear.value] = { goals: {}, events: {} }
    }

    yearData.value[currentYear.value].goals[selectedMonth.value] = currentMonthGoals.value.filter(goal => goal.text.trim() !== '')
    yearData.value[currentYear.value].events[selectedMonth.value] = currentMonthEvents.value.filter(event => event.text.trim() !== '')

    saveToLocalStorage()
    closeMonthModal()
  }
}

const saveToLocalStorage = () => {
  localStorage.setItem('yearly-calendar-data', JSON.stringify(yearData.value))
}

const loadFromLocalStorage = () => {
  const saved = localStorage.getItem('yearly-calendar-data')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      yearData.value = parsed[currentYear.value] || {}
    } catch (error) {
      console.error('加载数据失败:', error)
    }
  }
}

onMounted(() => {
  loadFromLocalStorage()
})
</script>

<style scoped>
.yearly-calendar-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 100px 20px 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 20px;
  text-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.year-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.year-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 1.5rem;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.year-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.year-selector h2 {
  font-size: 2rem;
  margin: 0;
  min-width: 120px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.month-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.month-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

.month-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
}

.month-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.2rem;
}

.view-btn {
  background: #6366f1;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.view-btn:hover {
  background: #4f46e5;
}

.view-btn.active {
  background: #10b981;
}

.month-preview {
  color: #666;
}

.month-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  color: #888;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #6366f1;
}

.expanded-content {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.goals-section, .events-section {
  margin-bottom: 15px;
}

.goals-section h4, .events-section h4 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 1rem;
}

.goal-item, .event-item {
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.goal-text, .event-text {
  flex: 1;
  font-size: 0.9rem;
}

.goal-status {
  font-size: 0.8rem;
  padding: 2px 8px;
  border-radius: 12px;
  background: #fbbf24;
  color: white;
}

.goal-status.completed {
  background: #10b981;
}

.event-date {
  font-size: 0.8rem;
  color: #888;
  margin-right: 10px;
  min-width: 60px;
}

.empty-state {
  text-align: center;
  color: #999;
  font-style: italic;
  padding: 10px;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 15px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.3rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #f5f5f5;
}

.modal-body {
  padding: 20px;
}

.section {
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h4 {
  margin: 0;
  color: #333;
}

.add-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.add-btn:hover {
  background: #059669;
}

.goal-management-item, .event-management-item {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
}

.goal-input, .event-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
}

.date-input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  width: 120px;
}

.status-select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  background: white;
}

.remove-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.remove-btn:hover {
  background: #dc2626;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #eee;
}

.save-btn {
  background: #6366f1;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.save-btn:hover {
  background: #4f46e5;
}

.cancel-btn {
  background: #6b7280;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: #4b5563;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .calendar-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 95%;
    margin: 10px;
  }

  .goal-management-item, .event-management-item {
    flex-direction: column;
    align-items: stretch;
  }

  .date-input {
    width: 100%;
  }
}
</style>