<template>
  <div class="api-key-settings">
    <div class="settings-card">
      <h3>🌸 Hello Kitty AI 配置</h3>

      <div class="api-status" :class="{ 'configured': isConfigured, 'not-configured': !isConfigured }">
        <span class="status-icon">
          {{ isConfigured ? '✅' : '⚠️' }}
        </span>
        <span class="status-text">
          {{ isConfigured ? 'AI API 已配置' : '需要配置 OpenAI API Key' }}
        </span>
      </div>

      <div class="api-key-form" v-if="!isConfigured || showApiKeyInput">
        <div class="form-group">
          <label for="apiKey" class="form-label">
            OpenAI API Key
          </label>
          <input
            id="apiKey"
            v-model="localApiKey"
            type="password"
            class="form-input"
            placeholder="sk-..."
            @input="validateApiKey"
          />
          <small class="form-help">
            您的API Key将被安全存储在本地浏览器中
          </small>
        </div>

        <div class="actions">
          <button
            @click="saveApiKey"
            class="btn btn-primary"
            :disabled="!isValidApiKey"
          >
            保存配置
          </button>
          <button
            v-if="isConfigured && !showApiKeyInput"
            @click="showApiKeyInput = true"
            class="btn btn-secondary"
          >
            修改API Key
          </button>
          <button
            @click="showApiKeyInput = false"
            v-if="showApiKeyInput"
            class="btn btn-secondary"
          >
            取消
          </button>
        </div>
      </div>

      <div class="help-section" v-if="isConfigured">
        <h4>📖 使用说明</h4>
        <ul>
          <li><strong>文本润色</strong>: 选中笔记中的文字，点击"✨ 润色"按钮</li>
          <li><strong>文本续写</strong>: 选中文字，点击"➡️ 续写"按钮</li>
          <li><strong>智能洞察</strong>: 在笔记页面点击"🧠 智能洞察"按钮</li>
          <li><strong>Hello Kitty聊天</strong>: 点击右下角🌸图标与我对话</li>
        </ul>
      </div>

      <div class="help-section">
        <h4>🔑 获取API Key</h4>
        <ol>
          <li>访问 <a href="https://platform.openai.com/" target="_blank">OpenAI Platform</a></li>
          <li>注册或登录您的账户</li>
          <li>进入 "API Keys" 页面</li>
          <li>点击 "Create new secret key"</li>
          <li>复制生成的API Key并粘贴到上方输入框</li>
        </ol>
        <p class="tip">
          💡 新账户通常有免费额度，足够体验所有AI功能
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { aiService } from '@/services/ai'

// 响应式数据
const localApiKey = ref('')
const showApiKeyInput = ref(false)
const isValidApiKey = ref(false)

// 计算属性
const isConfigured = computed(() => {
  return aiService.checkConfiguration().isConfigured
})

// 方法
const validateApiKey = () => {
  // OpenAI API Key 通常以 sk- 开头，长度在51个字符左右
  const openAIKeyPattern = /^sk-[A-Za-z0-9]{48}$/
  isValidApiKey.value = openAIKeyPattern.test(localApiKey.value) || localApiKey.value.length >= 20
}

const saveApiKey = () => {
  if (!isValidApiKey.value) {
    alert('请输入有效的OpenAI API Key')
    return
  }

  try {
    // 设置API Key
    aiService.setApiKey(localApiKey.value)

    // 保存到本地存储
    localStorage.setItem('hello-kitty-openai-api-key', localApiKey.value)

    // 显示成功消息
    alert('✅ API Key 配置成功！Hello Kitty AI 已准备就绪 🌸')

    // 重置输入状态
    showApiKeyInput.value = false
    localApiKey.value = ''
    isValidApiKey.value = false

  } catch (error) {
    console.error('保存API Key失败:', error)
    alert('❌ 保存API Key失败，请重试')
  }
}

const loadApiKey = () => {
  try {
    const savedApiKey = localStorage.getItem('hello-kitty-openai-api-key')
    if (savedApiKey) {
      aiService.setApiKey(savedApiKey)
    } else {
      showApiKeyInput.value = true
    }
  } catch (error) {
    console.error('加载API Key失败:', error)
    showApiKeyInput.value = true
  }
}

// 组件挂载时加载已保存的API Key
onMounted(() => {
  loadApiKey()
})
</script>

<style scoped>
.api-key-settings {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.settings-card {
  background: rgba(30, 30, 46, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.settings-card h3 {
  color: #e4e4e7;
  margin-bottom: 20px;
  text-align: center;
  font-size: 20px;
  text-shadow: 0 2px 10px rgba(255, 182, 193, 0.3);
}

.api-status {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  font-weight: 500;
}

.api-status.configured {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #22c55e;
}

.api-status.not-configured {
  background: rgba(251, 146, 60, 0.1);
  border: 1px solid rgba(251, 146, 60, 0.3);
  color: #fb923c;
}

.status-icon {
  font-size: 18px;
}

.api-key-form {
  margin-bottom: 25px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  color: #e4e4e7;
  font-weight: 500;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.08);
  color: #e4e4e7;
  outline: none;
  transition: all 0.3s ease;
  font-family: 'Courier New', monospace;
}

.form-input:focus {
  border-color: #ff69b4;
  box-shadow: 0 0 0 2px rgba(255, 105, 180, 0.25);
  background: rgba(255, 255, 255, 0.12);
}

.form-input::placeholder {
  color: rgba(228, 228, 231, 0.6);
}

.form-help {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  color: rgba(228, 228, 231, 0.6);
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: linear-gradient(135deg, #ff69b4 0%, #ff1493 100%);
  color: white;
  box-shadow: 0 2px 10px rgba(255, 105, 180, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(255, 105, 180, 0.4);
}

.btn-primary:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(228, 228, 231, 0.5);
  cursor: not-allowed;
  box-shadow: none;
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

.help-section {
  margin-bottom: 25px;
}

.help-section h4 {
  color: #e4e4e7;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 600;
}

.help-section ul, .help-section ol {
  color: rgba(228, 228, 231, 0.8);
  line-height: 1.6;
  padding-left: 20px;
}

.help-section li {
  margin-bottom: 8px;
}

.help-section a {
  color: #ff69b4;
  text-decoration: none;
}

.help-section a:hover {
  text-decoration: underline;
}

.tip {
  margin-top: 15px;
  padding: 12px;
  background: rgba(255, 105, 180, 0.1);
  border: 1px solid rgba(255, 105, 180, 0.2);
  border-radius: 8px;
  color: rgba(228, 228, 231, 0.8);
  font-size: 13px;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .api-key-settings {
    padding: 10px;
  }

  .settings-card {
    padding: 20px;
  }

  .actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>