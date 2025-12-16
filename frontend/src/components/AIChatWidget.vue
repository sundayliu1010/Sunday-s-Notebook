<template>
  <div class="ai-chat-widget">
    <!-- 聊天按钮 -->
    <div
      v-show="!isOpen"
      @click="toggleChat"
      class="chat-button"
      title="Hello Kitty助手"
    >
      🌸
    </div>

    <!-- 聊天窗口 -->
    <div v-show="isOpen" class="chat-window">
      <div class="chat-header">
        <span>🌸 Hello Kitty助手</span>
        <button @click.stop="closeChat" class="close-btn" title="关闭聊天窗口">×</button>
      </div>

      <div class="chat-messages" ref="messagesContainer">
        <div
          v-for="message in messages"
          :key="message.id"
          class="message"
          :class="message.role"
        >
          <div class="message-content">{{ message.content }}</div>
          <div class="message-time">{{ formatTime(message.created_at) }}</div>
        </div>

        <div v-if="isLoading" class="message assistant">
          <div class="message-content typing">AI正在思考中...</div>
        </div>
      </div>

      <div class="chat-input">
        <input
          v-model="inputMessage"
          @keypress.enter="sendMessage"
          type="text"
          placeholder="输入您的问题..."
          :disabled="isLoading"
        />
        <button
          @click="sendMessage"
          :disabled="isLoading || !inputMessage.trim()"
          class="send-btn"
        >
          发送
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onMounted, onUnmounted } from 'vue'
import { aiService, handleAIError } from '@/services/ai'

// 状态
const isOpen = ref(false)
const isLoading = ref(false)
const inputMessage = ref('')
const messagesContainer = ref<HTMLElement>()

// 消息列表
const messages = ref<Array<{
  id: number
  role: 'user' | 'assistant'
  content: string
  created_at: string
}>>([])

// 模拟消息ID
let messageIdCounter = 1

// 方法
const toggleChat = () => {
  console.log('toggleChat called, current isOpen:', isOpen.value)
  isOpen.value = !isOpen.value
  console.log('toggleChat new isOpen:', isOpen.value)

  // 如果打开聊天窗口，滚动到底部
  if (isOpen.value) {
    nextTick(() => {
      scrollToBottom()
    })
  }
}

// 专门用于关闭的方法
const closeChat = () => {
  console.log('closeChat called')
  isOpen.value = false
}

// ESC键关闭功能
const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    closeChat()
  }
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return

  const userMessage = {
    id: messageIdCounter++,
    role: 'user' as const,
    content: inputMessage.value.trim(),
    created_at: new Date().toISOString()
  }

  // 添加用户消息
  messages.value.push(userMessage)

  const question = inputMessage.value.trim()
  inputMessage.value = ''
  isLoading.value = true

  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
  })

  try {
    // 准备对话历史
    const conversationHistory = messages.value.map(msg => ({
      role: msg.role,
      content: msg.content
    }))

    // 调用真实AI API
    const response = await aiService.chat(question, conversationHistory)

    // 添加AI回复
    const assistantMessage = {
      id: messageIdCounter++,
      role: 'assistant' as const,
      content: response.reply,
      created_at: new Date().toISOString()
    }
    messages.value.push(assistantMessage)

  } catch (error) {
    console.error('发送消息失败:', error)
    const errorMessage = handleAIError(error)

    // 添加错误消息
    const errorResponse = {
      id: messageIdCounter++,
      role: 'assistant' as const,
      content: errorMessage,
      created_at: new Date().toISOString()
    }
    messages.value.push(errorResponse)
  } finally {
    isLoading.value = false
    nextTick(() => {
      scrollToBottom()
    })
  }
}

const simulateAIResponse = async (question: string) => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))

  // 生成模拟回复
  let response = '这是一个模拟的AI回复。'

  if (question.includes('你好') || question.includes('hi')) {
    response = '你好！我是您的AI助手，很高兴为您服务！有什么可以帮助您的吗？'
  } else if (question.includes('笔记')) {
    response = '关于笔记功能，您可以创建、编辑和管理您的笔记。我还能够帮助您润色和续写笔记内容，提供智能洞察分析。'
  } else if (question.includes('番茄钟')) {
    response = '番茄钟是一种时间管理方法，通过工作和休息的循环来提高专注度。您可以使用我们的番茄钟小组件来管理工作时间！'
  } else if (question.includes('帮助')) {
    response = '我可以帮助您：\n• 回答问题和提供信息\n• 协助创作和编辑内容\n• 提供学习建议\n• 聊天陪伴\n\n您有什么具体需要帮助的吗？'
  } else {
    const responses = [
      '这是一个很有趣的问题！让我想想...',
      '我理解您的想法。在我看来...',
      '这确实值得深入探讨。我的建议是...',
      '感谢您的提问！基于我的理解...'
    ]
    response = responses[Math.floor(Math.random() * responses.length)] + ' 目前我还在学习阶段，等我接入更强大的AI模型后，就能给您更好的回复了！'
  }

  const aiMessage = {
    id: messageIdCounter++,
    role: 'assistant' as const,
    content: response,
    created_at: new Date().toISOString()
  }

  messages.value.push(aiMessage)
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 加载聊天历史（模拟）
onMounted(() => {
  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeyPress)

  // TODO: 从后端加载聊天历史
  // 现在先添加一条欢迎消息
  const welcomeMessage = {
    id: messageIdCounter++,
    role: 'assistant' as const,
    content: '🌸 你好！我是Hello Kitty助手，很高兴为你服务！有什么可以帮助你的吗？',
    created_at: new Date().toISOString()
  }
  messages.value.push(welcomeMessage)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyPress)
})
</script>

<style scoped>
.ai-chat-widget {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.chat-button {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #ff69b4 0%, #ff1493 50%, #ff69b4 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(255, 105, 180, 0.4);
  font-size: 28px;
  transition: all 0.3s ease;
  user-select: none;
  border: 2px solid rgba(255, 255, 255, 0.3);
  animation: sparkle 2s ease-in-out infinite alternate;
}

@keyframes sparkle {
  0% {
    box-shadow: 0 4px 20px rgba(255, 105, 180, 0.4), 0 0 10px rgba(255, 105, 180, 0.2);
  }
  100% {
    box-shadow: 0 4px 25px rgba(255, 105, 180, 0.6), 0 0 20px rgba(255, 105, 180, 0.4);
  }
}

.chat-button:hover {
  transform: scale(1.1) rotate(5deg);
  animation: sparkle 1s ease-in-out infinite alternate;
}

.chat-window {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 350px;
  height: 500px;
  background: rgba(30, 30, 46, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  background: linear-gradient(135deg, #ff69b4 0%, #ff1493 100%);
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  backdrop-filter: blur(10px);
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.close-btn:hover {
  background: rgba(255,255,255,0.2);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: rgba(20, 20, 30, 0.6);
  backdrop-filter: blur(10px);
}

.message {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}

.message.user {
  align-items: flex-end;
}

.message.assistant {
  align-items: flex-start;
}

.message-content {
  max-width: 80%;
  padding: 10px 15px;
  border-radius: 18px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.message.user .message-content {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border-bottom-right-radius: 4px;
  box-shadow: 0 2px 10px rgba(99, 102, 241, 0.3);
}

.message.assistant .message-content {
  background: rgba(255, 255, 255, 0.1);
  color: #e4e4e7;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-bottom-left-radius: 4px;
  backdrop-filter: blur(10px);
}

.message-content.typing {
  color: rgba(228, 228, 231, 0.7);
  font-style: italic;
}

.message-time {
  font-size: 11px;
  color: rgba(228, 228, 231, 0.6);
  margin-top: 4px;
  padding: 0 5px;
}

.chat-input {
  padding: 15px;
  background: rgba(20, 20, 30, 0.8);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 10px;
  backdrop-filter: blur(10px);
}

.chat-input input {
  flex: 1;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 8px 15px;
  font-size: 14px;
  outline: none;
  background: rgba(255, 255, 255, 0.08);
  color: #e4e4e7;
}

.chat-input input:focus {
  border-color: #ff69b4;
  background: rgba(255, 255, 255, 0.12);
}

.chat-input input:disabled {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(228, 228, 231, 0.5);
}

.chat-input input::placeholder {
  color: rgba(228, 228, 231, 0.6);
}

.send-btn {
  background: linear-gradient(135deg, #ff69b4 0%, #ff1493 100%);
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(255, 105, 180, 0.3);
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(255, 105, 180, 0.4);
}

.send-btn:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(228, 228, 231, 0.5);
  cursor: not-allowed;
  box-shadow: none;
}

/* 滚动条样式 */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-window {
    width: calc(100vw - 40px);
    right: -10px;
    height: 70vh;
  }

  .chat-button {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
}
</style>