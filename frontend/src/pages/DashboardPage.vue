<template>
  <div class="dashboard-page">
    <!-- 顶部导航栏 -->
    <NavBar />

    <!-- 主要内容区域 -->
    <div class="dashboard-content">
      <div class="dashboard-layout">
        <!-- 左侧边栏 - 笔记列表 -->
        <div class="sidebar">
          <NoteList />
        </div>

        <!-- 主要内容区 -->
        <div class="main-content">
          <div class="welcome-section">
            <h1>欢迎回来，{{ authStore.user?.username }}！</h1>
            <p>这是您的Hello Kitty Daily Notebook</p>
          </div>

          <!-- 快捷操作按钮 -->
          <div class="quick-actions">
            <button @click="createNewNote" class="btn btn-primary">
              ✨ 新建笔记
            </button>
            <button @click="openAIChat" class="btn btn-secondary">
              🌸 Hello Kitty助手
            </button>
          </div>

          <!-- 最近笔记预览 -->
          <div class="recent-notes" v-if="notesStore.notes.length > 0">
            <h3>最近笔记</h3>
            <div class="notes-preview">
              <div
                v-for="note in notesStore.notes.slice(0, 3)"
                :key="note.id"
                class="note-card"
                @click="openNote(note.id)"
              >
                <h4>{{ note.title }}</h4>
                <p>{{ getPreview(note.content) }}</p>
                <small>{{ formatDate(note.updated_at) }}</small>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else class="empty-state">
            <h3>还没有任何笔记</h3>
            <p>点击"新建笔记"开始您的第一篇笔记吧！</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 浮动小组件区域 -->
    <div class="widgets-area">
      <!-- 番茄钟小组件 -->
      <PomodoroWidget />

      <!-- AI聊天小组件 -->
      <AIChatWidget />

      <!-- 待办事项小组件 -->
      <TodoWidget />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotesStore } from '@/stores/notes'
import NavBar from '@/components/NavBar.vue'
import NoteList from '@/components/NoteList.vue'
import PomodoroWidget from '@/components/PomodoroWidget.vue'
import AIChatWidget from '@/components/AIChatWidget.vue'
import TodoWidget from '@/components/TodoWidget.vue'

const router = useRouter()
const authStore = useAuthStore()
const notesStore = useNotesStore()

onMounted(async () => {
  // 组件挂载时加载用户笔记
  try {
    await notesStore.fetchNotes()
  } catch (error) {
    console.error('加载笔记失败:', error)
  }
})

const createNewNote = () => {
  router.push('/note')
}

const openNote = (noteId: number) => {
  router.push(`/note/${noteId}`)
}

const openAIChat = () => {
  // TODO: 实现打开AI聊天功能
  console.log('打开AI聊天')
}

const getPreview = (content: string): string => {
  return content.length > 100 ? content.substring(0, 100) + '...' : content
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: transparent;
}

.dashboard-content {
  padding-top: 60px; /* 为顶部导航栏留出空间 */
}

.dashboard-layout {
  display: flex;
  min-height: calc(100vh - 60px);
}

.sidebar {
  width: 280px;
  background: rgba(30, 30, 46, 0.6);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.3);
}

.main-content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}

.welcome-section {
  margin-bottom: 30px;
}

.welcome-section h1 {
  color: #e4e4e7;
  font-size: 28px;
  margin-bottom: 10px;
  text-shadow: 0 2px 10px rgba(255, 182, 193, 0.2);
}

.welcome-section p {
  color: rgba(228, 228, 231, 0.8);
  font-size: 16px;
}

.quick-actions {
  margin-bottom: 30px;
}

.quick-actions .btn {
  margin-right: 15px;
  margin-bottom: 10px;
}

.recent-notes h3 {
  color: #e4e4e7;
  margin-bottom: 20px;
  text-shadow: 0 2px 10px rgba(255, 182, 193, 0.2);
}

.notes-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.note-card {
  background: rgba(30, 30, 46, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
}

.note-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
  border-color: rgba(255, 105, 180, 0.3);
}

.note-card h4 {
  color: #e4e4e7;
  margin-bottom: 10px;
}

.note-card p {
  color: rgba(228, 228, 231, 0.8);
  margin-bottom: 10px;
  line-height: 1.5;
}

.note-card small {
  color: rgba(228, 228, 231, 0.6);
  font-size: 12px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-state h3 {
  color: rgba(228, 228, 231, 0.8);
  margin-bottom: 10px;
}

.empty-state p {
  color: rgba(228, 228, 231, 0.6);
}

.widgets-area {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 100;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
  }

  .main-content {
    padding: 20px;
  }

  .notes-preview {
    grid-template-columns: 1fr;
  }
}
</style>