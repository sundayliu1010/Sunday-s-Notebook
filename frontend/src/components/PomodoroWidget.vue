<template>
  <div class="pomodoro-widget" :style="widgetPosition">
    <div class="widget-header">
      <span>🌸 Hello Kitty 计时器</span>
      <button @click="toggleMinimized" class="minimize-btn">
        {{ isMinimized ? '+' : '−' }}
      </button>
    </div>

    <div v-show="!isMinimized" class="widget-content">
      <div class="timer-display">
        {{ formattedTime }}
      </div>

      <div class="timer-controls">
        <button @click="toggleTimer" class="btn btn-sm" :class="isRunning ? 'btn-danger' : 'btn-primary'">
          {{ isRunning ? '暂停' : '开始' }}
        </button>
        <button @click="resetTimer" class="btn btn-sm btn-secondary">
          重置
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 组件状态
const isMinimized = ref(false)
const isRunning = ref(false)
const timeLeft = ref(25 * 60) // 默认25分钟，以秒为单位
const mode = ref<'work' | 'shortBreak' | 'longBreak'>('work')

// 小组件位置
const widgetPosition = ref({
  position: 'fixed',
  top: '100px',
  right: '20px',
  zIndex: 1000
})

// 计时器引用
let timer: number | null = null

// 计算属性
const formattedTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60)
  const seconds = timeLeft.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

// 方法
const toggleMinimized = () => {
  isMinimized.value = !isMinimized.value
}

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
  // 播放提示音（使用Web Audio API创建简单的提示音）
  playNotificationSound()

  // 显示浏览器通知
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('番茄钟提醒', {
      body: `${getModeText(mode.value)}时间到了！`,
      icon: '/favicon.ico'
    })
  }

  // 桌面 alert 作为备选
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

const playNotificationSound = () => {
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
}

// 请求通知权限
onMounted(async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission()
  }
})

// 清理定时器
onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.pomodoro-widget {
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

.timer-display {
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  color: #e4e4e7;
  margin-bottom: 20px;
  font-family: 'Courier New', monospace;
  background: rgba(20, 20, 30, 0.6);
  backdrop-filter: blur(10px);
  padding: 15px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  text-shadow: 0 2px 10px rgba(255, 182, 193, 0.3);
}

.timer-controls {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
}

.timer-controls .btn {
  flex: 1;
  padding: 8px 12px;
  font-size: 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 2px 10px rgba(99, 102, 241, 0.3);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

.btn-danger {
  background: linear-gradient(135deg, #ff69b4 0%, #ff1493 100%);
  color: white;
  box-shadow: 0 2px 10px rgba(255, 105, 180, 0.3);
}

.btn-danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(255, 105, 180, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #e4e4e7;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.timer-mode {
  margin-top: 10px;
}

.mode-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.08);
  color: #e4e4e7;
  outline: none;
  backdrop-filter: blur(10px);
}

.mode-select:focus {
  border-color: #ff69b4;
  box-shadow: 0 0 0 2px rgba(255, 105, 180, 0.25);
  background: rgba(255, 255, 255, 0.12);
}

.mode-select option {
  background: #1e1e2e;
  color: #e4e4e7;
}
</style>