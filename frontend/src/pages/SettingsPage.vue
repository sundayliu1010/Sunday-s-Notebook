<template>
  <div class="settings-page">
    <!-- 顶部导航栏 -->
    <NavBar />

    <!-- 页面内容 -->
    <div class="settings-container">
      <div class="page-header">
        <button @click="goBack" class="btn btn-secondary">
          ← 返回
        </button>
        <h1>🌸 Hello Kitty 设置</h1>
      </div>

      <!-- API Key 设置组件 -->
      <APIKeySettings />

      <!-- 数据备份区域 -->
      <div class="backup-section">
        <div class="settings-section">
          <h3>💾 数据备份与恢复</h3>

          <!-- 数据统计 -->
          <div class="data-stats">
            <div class="stat-item">
              <span class="stat-icon">📝</span>
              <div class="stat-content">
                <span class="stat-label">笔记数量</span>
                <span class="stat-value">{{ dataStats.notesCount }} 篇</span>
              </div>
            </div>
            <div class="stat-item">
              <span class="stat-icon">📋</span>
              <div class="stat-content">
                <span class="stat-label">待办事项</span>
                <span class="stat-value">{{ dataStats.todosCount }} 个</span>
              </div>
            </div>
            <div class="stat-item">
              <span class="stat-icon">✅</span>
              <div class="stat-content">
                <span class="stat-label">已完成</span>
                <span class="stat-value">{{ dataStats.completedTodosCount }} 个</span>
              </div>
            </div>
            <div class="stat-item">
              <span class="stat-icon">⚙️</span>
              <div class="stat-content">
                <span class="stat-label">API Key</span>
                <span class="stat-value">{{ dataStats.hasApiKey ? '已配置' : '未配置' }}</span>
              </div>
            </div>
            <div class="stat-item">
              <span class="stat-icon">💾</span>
              <div class="stat-content">
                <span class="stat-label">数据大小</span>
                <span class="stat-value">{{ dataStats.estimatedSize }}</span>
              </div>
            </div>
          </div>

          <!-- 备份操作按钮 -->
          <div class="backup-actions">
            <button
              @click="exportData"
              class="btn btn-primary"
              :disabled="isExporting || !DataBackupManager.hasExportableData()"
            >
              <span v-if="!isExporting">📤 导出数据</span>
              <span v-else>📤 导出中...</span>
            </button>

            <button
              @click="importData"
              class="btn btn-secondary"
              :disabled="isImporting"
            >
              <span v-if="!isImporting">📥 导入数据</span>
              <span v-else>📥 导入中...</span>
            </button>

            <input
              ref="importFileInput"
              type="file"
              accept=".json"
              @change="handleFileImport"
              style="display: none"
            />
          </div>

          <!-- 使用说明 -->
          <div class="backup-help">
            <h4>💡 使用说明</h4>
            <div class="help-item">
              <strong>📤 导出数据：</strong>
              <p>将您的所有笔记、设置、待办事项保存为备份文件，建议定期备份重要数据。</p>
            </div>
            <div class="help-item">
              <strong>📥 导入数据：</strong>
              <p>在重装系统或更换设备时，使用备份文件恢复您的所有数据。</p>
            </div>
            <div class="help-item">
              <strong>🔒 数据安全：</strong>
              <p>备份文件仅保存在您的设备上，不会被上传到任何服务器。</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 其他设置区域 -->
      <div class="other-settings">
        <div class="settings-section">
          <h3>🎨 主题设置</h3>
          <div class="setting-item">
            <span>当前主题</span>
            <span class="setting-value">Hello Kitty 深色主题 ✨</span>
          </div>
        </div>

        <div class="settings-section">
          <h3>🗂️ 危险操作</h3>
          <div class="setting-item">
            <span>清除所有数据</span>
            <button @click="clearLocalData" class="btn btn-danger">
              清除本地数据
            </button>
          </div>
          <p class="warning-text">
            ⚠️ 此操作不可撤销，将永久删除所有本地数据！
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import APIKeySettings from '@/components/APIKeySettings.vue'
import { DataBackupManager } from '@/utils/dataBackup'

const router = useRouter()
const storageStatus = ref('')
const isExporting = ref(false)
const isImporting = ref(false)
const importFileInput = ref<HTMLInputElement>()

// 数据统计
const dataStats = ref({
  notesCount: 0,
  todosCount: 0,
  completedTodosCount: 0,
  hasApiKey: false,
  hasUserData: false,
  estimatedSize: '0字节'
})

const goBack = () => {
  router.push('/dashboard')
}

const checkStorageStatus = () => {
  try {
    const dataSize = new Blob([localStorage]).size
    if (dataSize === 0) {
      storageStatus.value = '无数据'
    } else if (dataSize < 1024) {
      storageStatus.value = `${dataSize} 字节`
    } else if (dataSize < 1024 * 1024) {
      storageStatus.value = `${(dataSize / 1024).toFixed(2)} KB`
    } else {
      storageStatus.value = `${(dataSize / (1024 * 1024)).toFixed(2)} MB`
    }
  } catch (error) {
    storageStatus.value = '检查失败'
  }
}

const clearLocalData = () => {
  if (confirm('确定要清除所有本地数据吗？这将删除所有笔记、API Key等设置。')) {
    try {
      localStorage.clear()
      storageStatus.value = '无数据'
      dataStats.value = {
        notesCount: 0,
        todosCount: 0,
        completedTodosCount: 0,
        hasApiKey: false,
        hasUserData: false,
        estimatedSize: '0字节'
      }
      alert('✅ 本地数据已清除')

      // 重新加载页面以重置状态
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error('清除数据失败:', error)
      alert('❌ 清除数据失败')
    }
  }
}

// 导出数据
const exportData = async () => {
  try {
    isExporting.value = true

    const backupData = await DataBackupManager.exportData()
    DataBackupManager.downloadBackupFile(backupData)

    alert('✅ 数据导出成功！文件已下载到您的下载文件夹')
  } catch (error) {
    console.error('导出数据失败:', error)
    alert('❌ 导出数据失败：' + (error as Error).message)
  } finally {
    isExporting.value = false
  }
}

// 导入数据
const importData = () => {
  if (importFileInput.value) {
    importFileInput.value.click()
  }
}

const handleFileImport = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  try {
    isImporting.value = true

    // 验证文件类型
    if (!file.name.endsWith('.json')) {
      throw new Error('请选择有效的备份文件 (.json 格式)')
    }

    // 验证文件大小 (限制10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('备份文件过大，请选择小于10MB的文件')
    }

    const backupData = await DataBackupManager.readBackupFile(file)

    // 确认导入
    const confirmMessage = `即将导入以下数据：
📝 笔记: ${backupData.notes?.length || 0} 篇
📋 待办事项: ${backupData.todos?.length || 0} 个
⚙️ API Key: ${backupData.settings?.openaiApiKey ? '已配置' : '未配置'}

这将覆盖当前所有本地数据。确定要继续吗？`

    if (confirm(confirmMessage)) {
      await DataBackupManager.importData(backupData)
      alert('✅ 数据导入成功！页面将自动刷新以加载新数据')

      // 重新加载页面
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    }
  } catch (error) {
    console.error('导入数据失败:', error)
    alert('❌ 导入数据失败：' + (error as Error).message)
  } finally {
    isImporting.value = false
    // 清空文件输入，允许重复选择同一个文件
    if (importFileInput.value) {
      importFileInput.value.value = ''
    }
  }
}

const updateDataStats = () => {
  dataStats.value = DataBackupManager.getDataStats()
}

onMounted(() => {
  checkStorageStatus()
  updateDataStats()
})
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: transparent;
}

.settings-container {
  padding-top: 80px;
  max-width: 800px;
  margin: 0 auto;
  padding-left: 20px;
  padding-right: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(30, 30, 46, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.page-header h1 {
  color: #e4e4e7;
  margin: 0;
  font-size: 24px;
  text-shadow: 0 2px 10px rgba(255, 182, 193, 0.3);
}

.other-settings {
  margin-top: 30px;
}

.settings-section {
  background: rgba(30, 30, 46, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.settings-section h3 {
  color: #e4e4e7;
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: 600;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-value {
  color: #ff69b4;
  font-weight: 500;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #e4e4e7;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  margin-top: 15px;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.btn-primary {
  background: linear-gradient(135deg, #ff69b4, #ff1493);
  color: white;
  border: none;
  font-weight: 500;
  box-shadow: 0 4px 15px rgba(255, 105, 180, 0.3);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #ff1493, #ff69b4);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(255, 105, 180, 0.4);
}

.btn-danger {
  background: rgba(220, 53, 69, 0.8);
  color: white;
  border: 1px solid rgba(220, 53, 69, 0.5);
  font-weight: 500;
}

.btn-danger:hover {
  background: rgba(220, 53, 69, 0.9);
  border-color: rgba(220, 53, 69, 0.7);
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

/* 备份区域样式 */
.backup-section {
  margin-bottom: 30px;
}

.data-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
  padding: 20px;
  background: rgba(20, 20, 35, 0.4);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  background: rgba(255, 105, 180, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 105, 180, 0.2);
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: rgba(255, 105, 180, 0.15);
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 24px;
  opacity: 0.8;
}

.stat-content {
  flex: 1;
}

.stat-label {
  display: block;
  color: #a1a1aa;
  font-size: 12px;
  margin-bottom: 4px;
}

.stat-value {
  color: #e4e4e7;
  font-weight: 600;
  font-size: 14px;
}

.backup-actions {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.backup-actions .btn {
  flex: 1;
  min-width: 150px;
}

.backup-help {
  padding: 20px;
  background: rgba(20, 20, 35, 0.4);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.backup-help h4 {
  color: #ff69b4;
  margin-bottom: 15px;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.help-item {
  margin-bottom: 15px;
}

.help-item:last-child {
  margin-bottom: 0;
}

.help-item strong {
  color: #e4e4e7;
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
}

.help-item p {
  color: #a1a1aa;
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
}

.warning-text {
  color: #ff6b6b;
  font-size: 12px;
  margin-top: 8px;
  opacity: 0.8;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .data-stats {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 15px;
  }

  .stat-item {
    padding: 12px;
  }

  .backup-actions {
    flex-direction: column;
  }

  .backup-actions .btn {
    width: 100%;
  }
  .settings-container {
    padding-left: 10px;
    padding-right: 10px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
</style>