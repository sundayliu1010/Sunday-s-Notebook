import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Note } from '@/types/note'
import { notesApi } from '@/services/notes'

export const useNotesStore = defineStore('notes', () => {
  // 状态
  const notes = ref<Note[]>([])
  const currentNote = ref<Note | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const notesByDate = computed(() => {
    return notes.value.sort((a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
  })

  // 方法
  const fetchNotes = async () => {
    try {
      isLoading.value = true
      error.value = null

      const response = await notesApi.getAllNotes()
      notes.value = response.notes

      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || '获取笔记失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchNote = async (id: number) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await notesApi.getNote(id)
      currentNote.value = response.note

      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || '获取笔记失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createNote = async (noteData: { title: string; content: string }) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await notesApi.createNote(noteData)
      notes.value.unshift(response.note)

      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || '创建笔记失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateNote = async (id: number, noteData: { title: string; content: string }) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await notesApi.updateNote(id, noteData)

      // 更新列表中的笔记
      const index = notes.value.findIndex(note => note.id === id)
      if (index !== -1) {
        notes.value[index] = response.note
      }

      // 更新当前笔记
      if (currentNote.value?.id === id) {
        currentNote.value = response.note
      }

      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || '更新笔记失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteNote = async (id: number) => {
    try {
      isLoading.value = true
      error.value = null

      await notesApi.deleteNote(id)

      // 从列表中移除笔记
      notes.value = notes.value.filter(note => note.id !== id)

      // 如果删除的是当前笔记，清空当前笔记
      if (currentNote.value?.id === id) {
        currentNote.value = null
      }

    } catch (err: any) {
      error.value = err.response?.data?.message || '删除笔记失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const setCurrentNote = (note: Note | null) => {
    currentNote.value = note
  }

  return {
    notes,
    currentNote,
    isLoading,
    error,
    notesByDate,
    fetchNotes,
    fetchNote,
    createNote,
    updateNote,
    deleteNote,
    setCurrentNote
  }
})