<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="navbar-brand">
        <h1>🌸 Daily Notebook</h1>
      </div>

      <div class="navbar-actions">
        <div class="user-info" v-if="authStore.user">
          <button @click="goToCalendar" class="calendar-btn" title="年历">
            📅
          </button>
          <button @click="goToSettings" class="settings-btn" title="AI设置">
            ⚙️
          </button>
          <span>👤 {{ authStore.user.username }}</span>
          <button @click="handleLogout" class="logout-btn">
            退出
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const goToSettings = () => {
  router.push('/settings')
}

const goToCalendar = () => {
  router.push('/calendar')
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(30, 30, 46, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  z-index: 1000;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
}

.navbar-brand h1 {
  color: #e4e4e7;
  font-size: 20px;
  margin: 0;
  font-weight: 600;
  text-shadow: 0 2px 10px rgba(255, 182, 193, 0.3);
}

.navbar-actions {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
  color: #e4e4e7;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #e4e4e7;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.settings-btn {
  background: none;
  border: none;
  color: #e4e4e7;
  cursor: pointer;
  font-size: 16px;
  padding: 6px 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  margin-right: 10px;
}

.settings-btn:hover {
  background: rgba(255, 105, 180, 0.2);
  transform: translateY(-1px);
}

.calendar-btn {
  background: none;
  border: none;
  color: #e4e4e7;
  cursor: pointer;
  font-size: 16px;
  padding: 6px 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  margin-right: 10px;
}

.calendar-btn:hover {
  background: rgba(99, 102, 241, 0.2);
  transform: translateY(-1px);
}

.logout-btn:hover {
  background: rgba(255, 69, 129, 0.2);
  border-color: rgba(255, 69, 129, 0.5);
  transform: translateY(-1px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar-container {
    padding: 12px 15px;
  }

  .navbar-brand h1 {
    font-size: 16px;
  }

  .user-info {
    gap: 10px;
    font-size: 14px;
  }

  .logout-btn {
    padding: 4px 8px;
    font-size: 12px;
  }
}
</style>