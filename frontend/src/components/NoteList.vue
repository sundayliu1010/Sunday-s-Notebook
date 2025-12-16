<template>
  <div class="note-list">
    <div class="note-list-header">
      <h3>🌸 Daily Notes</h3>
      <button @click="createNewNote" class="btn btn-primary btn-sm">
        + 新建
      </button>
    </div>

    <div class="note-list-content">
      <!-- 加载状态 -->
      <div v-if="notesStore.isLoading" class="loading">
        加载中...
      </div>

      <!-- 笔记列表 -->
      <div v-else-if="notesStore.notes.length > 0" class="notes">
        <div
          v-for="note in notesStore.notesByDate"
          :key="note.id"
          class="note-item"
          :class="{ active: note.id === currentNoteId }"
          @click="openNote(note.id)"
        >
          <h4 class="note-title">{{ note.title || '无标题' }}</h4>
          <p class="note-preview">{{ getPreview(note.content) }}</p>
          <div class="note-meta">
            <span class="note-date">{{ formatDate(note.updated_at) }}</span>
            <button
              @click.stop="deleteNote(note.id)"
              class="delete-btn"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <p>还没有笔记</p>
        <button @click="createNewNote" class="btn btn-primary btn-sm">
          创建第一篇笔记
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useNotesStore } from '@/stores/notes'

const router = useRouter()
const notesStore = useNotesStore()

// 当前选中的笔记ID
const currentNoteId = router.currentRoute.value.params.id

const createNewNote = () => {
  router.push('/note')
}

const openNote = (noteId: number) => {
  router.push(`/note/${noteId}`)
}

const deleteNote = async (noteId: number) => {
  if (confirm('确定要删除这篇笔记吗？')) {
    try {
      await notesStore.deleteNote(noteId)
    } catch (error) {
      console.error('删除笔记失败:', error)
      alert('删除失败，请重试')
    }
  }
}

const getPreview = (content: string): string => {
  return content.length > 80 ? content.substring(0, 80) + '...' : content
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 1) {
    return '今天'
  } else if (diffDays === 2) {
    return '昨天'
  } else if (diffDays <= 7) {
    return `${diffDays - 1} 天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}
</script>

<style scoped>
.note-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;
}

.note-list-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: blur(10px);
}

.note-list-header h3 {
  margin: 0;
  color: #e4e4e7;
  font-size: 16px;
  text-shadow: 0 2px 10px rgba(255, 182, 193, 0.2);
}

.btn-sm {
  padding: 4px 12px;
  font-size: 12px;
}

.note-list-content {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
}

.loading {
  text-align: center;
  padding: 20px;
  color: rgba(228, 228, 231, 0.8);
}

.notes {
  /* 笔记列表样式 */
}

.note-item {
  padding: 15px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0 10px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.note-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-left: 3px solid #ff69b4;
  transform: translateX(2px);
}

.note-item.active {
  background: rgba(255, 105, 180, 0.15);
  border-left: 3px solid #ff69b4;
  box-shadow: 0 2px 10px rgba(255, 105, 180, 0.2);
}

.note-title {
  font-size: 14px;
  font-weight: 500;
  color: #e4e4e7;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.note-preview {
  font-size: 12px;
  color: rgba(228, 228, 231, 0.7);
  line-height: 1.4;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.note-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: rgba(228, 228, 231, 0.6);
}

.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  border-radius: 2px;
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.delete-btn:hover {
  opacity: 1;
  background: rgba(255, 105, 180, 0.2);
  border-radius: 4px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: rgba(228, 228, 231, 0.8);
}

.empty-state p {
  margin-bottom: 15px;
}

/* 滚动条样式 */
.note-list-content::-webkit-scrollbar {
  width: 6px;
}

.note-list-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.note-list-content::-webkit-scrollbar-thumb {
  background: rgba(255, 105, 180, 0.3);
  border-radius: 3px;
}

.note-list-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 105, 180, 0.5);
}
</style>