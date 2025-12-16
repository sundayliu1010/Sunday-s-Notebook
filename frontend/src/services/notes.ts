import api from './api'
import { mockNotesApi } from './mockApi'
import type { Note, NoteData, NotesResponse, NoteResponse } from '@/types/note'

// 检查是否使用模拟API（当后端不可用时）
const useMockApi = true // 临时设为true，等后端启动后改为false

export const notesApi = {
  // 获取所有笔记
  async getAllNotes(): Promise<NotesResponse> {
    if (useMockApi) {
      return await mockNotesApi.getAllNotes()
    }
    return await api.get('/api/notes')
  },

  // 获取单篇笔记
  async getNote(id: number): Promise<NoteResponse> {
    if (useMockApi) {
      return await mockNotesApi.getNote(id)
    }
    return await api.get(`/api/notes/${id}`)
  },

  // 创建笔记
  async createNote(noteData: NoteData): Promise<NoteResponse> {
    if (useMockApi) {
      return await mockNotesApi.createNote(noteData)
    }
    return await api.post('/api/notes', noteData)
  },

  // 更新笔记
  async updateNote(id: number, noteData: NoteData): Promise<NoteResponse> {
    if (useMockApi) {
      return await mockNotesApi.updateNote(id, noteData)
    }
    return await api.put(`/api/notes/${id}`, noteData)
  },

  // 删除笔记
  async deleteNote(id: number): Promise<{ message: string }> {
    if (useMockApi) {
      return await mockNotesApi.deleteNote(id)
    }
    return await api.delete(`/api/notes/${id}`)
  }
}