<template>
  <div class="note-editor-page">
    <!-- 顶部导航栏 -->
    <NavBar />

    <!-- 编辑器主体 -->
    <div class="editor-container">
      <div class="editor-header">
        <div class="editor-actions">
          <button @click="goBack" class="btn btn-secondary">
            ← 返回
          </button>
          <button @click="saveNote" class="btn btn-primary" :disabled="isLoading">
            {{ isLoading ? '保存中...' : '保存' }}
          </button>
        </div>
        <div class="editor-title">
          <input
            v-model="currentNote.title"
            class="title-input"
            placeholder="请输入标题..."
          />
        </div>
      </div>

      <div class="editor-content">
        <textarea
          v-model="currentNote.content"
          class="content-textarea"
          placeholder="开始编写您的笔记..."
        ></textarea>
      </div>

      <!-- AI功能按钮 -->
      <div class="ai-functions" v-if="selectedText && !isLoading">
        <div class="ai-menu">
          <button @click="polishText" class="btn btn-sm btn-secondary" title="优化文本表达，让内容更清晰流畅">
            ✨ 润色
          </button>
          <button @click="continueText" class="btn btn-sm btn-secondary" title="基于当前内容智能续写">
            ➡️ 续写
          </button>
        </div>
      </div>

      <!-- 全局AI洞察按钮 -->
      <div class="global-insight-btn">
        <button
          @click="generateInsight"
          class="btn btn-primary"
          :disabled="isLoading || !currentNote.content.trim()"
          title="分析整个笔记内容，生成摘要、关键词和思考题"
        >
          <span v-if="!isLoading">🧠 智能洞察</span>
          <span v-else>⏳ 分析中...</span>
        </button>
      </div>

      <!-- AI处理加载提示 -->
      <div v-if="isLoading" class="ai-loading">
        <div class="loading-spinner"></div>
        <p>AI正在处理中，请稍候...</p>
      </div>
    </div>

    <!-- AI洞察弹窗 -->
    <div v-if="insightModal" class="modal-overlay" @click="closeInsightModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>🧠 智能洞察</h3>
          <button @click="closeInsightModal" class="close-btn">×</button>
        </div>
        <div class="modal-body" v-if="insight">
          <div class="insight-section">
            <h4>📝 内容摘要</h4>
            <p>{{ insight.summary }}</p>
          </div>
          <div class="insight-section">
            <h4>🏷️ 关键词</h4>
            <div class="keywords">
              <span v-for="keyword in insight.keywords" :key="keyword" class="keyword-tag">
                {{ keyword }}
              </span>
            </div>
          </div>
          <div class="insight-section" v-if="insight.stats">
            <h4>📊 内容统计</h4>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">字数统计</span>
                <span class="stat-value">{{ insight.stats.wordCount }} 字</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">句子数量</span>
                <span class="stat-value">{{ insight.stats.sentenceCount }} 句</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">平均句长</span>
                <span class="stat-value">{{ insight.stats.avgSentenceLength }} 字/句</span>
              </div>
            </div>
          </div>
          <div class="insight-section">
            <h4>❓ 思考问题</h4>
            <ul>
              <li v-for="question in insight.questions" :key="question">
                {{ question }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useNotesStore } from '@/stores/notes'
import { aiService, handleAIError } from '@/services/ai'
import NavBar from '@/components/NavBar.vue'

const router = useRouter()
const route = useRoute()
const notesStore = useNotesStore()

// 当前笔记数据
const currentNote = reactive({
  id: null as number | null,
  title: '',
  content: ''
})

// 状态
const isLoading = ref(false)
const selectedText = ref('')
const insightModal = ref(false)
const insight = ref(null)

// 计算属性
const isEditing = computed(() => !!route.params.id)

onMounted(async () => {
  if (isEditing.value) {
    // 编辑模式：加载现有笔记
    const noteId = Number(route.params.id)
    try {
      await notesStore.fetchNote(noteId)
      const note = notesStore.currentNote
      if (note) {
        currentNote.id = note.id
        currentNote.title = note.title
        currentNote.content = note.content
      }
    } catch (error) {
      console.error('加载笔记失败:', error)
      router.push('/dashboard')
    }
  }
})

const goBack = () => {
  router.push('/dashboard')
}

const saveNote = async () => {
  if (!currentNote.title.trim()) {
    alert('请输入标题')
    return
  }

  try {
    isLoading.value = true

    if (isEditing.value && currentNote.id) {
      // 更新现有笔记
      await notesStore.updateNote(currentNote.id, {
        title: currentNote.title,
        content: currentNote.content
      })
    } else {
      // 创建新笔记
      await notesStore.createNote({
        title: currentNote.title,
        content: currentNote.content
      })
    }

    router.push('/dashboard')
  } catch (error) {
    console.error('保存笔记失败:', error)
    alert('保存失败，请重试')
  } finally {
    isLoading.value = false
  }
}

// AI功能实现
const polishText = async () => {
  if (!selectedText.value.trim()) {
    alert('请先选择要润色的文本')
    return
  }

  try {
    isLoading.value = true

    // 调用真实AI API
    const result = await aiService.polishText(selectedText.value)
    const polishedText = result.polishedText

    // 替换选中的文本
    const textarea = document.querySelector('.content-textarea') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const beforeText = currentNote.content.substring(0, start)
      const afterText = currentNote.content.substring(end)

      currentNote.content = beforeText + polishedText + afterText

      // 重新设置光标位置
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start, start + polishedText.length)
      }, 0)
    }

    // 清除选中文本状态
    selectedText.value = ''

  } catch (error) {
    console.error('润色失败:', error)
    const errorMessage = handleAIError(error)
    alert(errorMessage)
  } finally {
    isLoading.value = false
  }
}

const continueText = async () => {
  if (!selectedText.value.trim()) {
    alert('请先选择要续写的文本')
    return
  }

  try {
    isLoading.value = true

    // 调用真实AI API
    const result = await aiService.continueText(selectedText.value)
    const continuedText = result.continuedText

    // 在选中文本后插入续写内容
    const textarea = document.querySelector('.content-textarea') as HTMLTextAreaElement
    if (textarea) {
      const end = textarea.selectionEnd
      const beforeText = currentNote.content.substring(0, end)
      const afterText = currentNote.content.substring(end)

      const insertionPoint = end + continuedText.length + 2 // +2 for 换行和空格
      currentNote.content = beforeText + continuedText + '\n\n' + afterText

      // 重新设置光标位置
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(insertionPoint, insertionPoint)
      }, 0)
    }

    // 清除选中文本状态
    selectedText.value = ''

  } catch (error) {
    console.error('续写失败:', error)
    const errorMessage = handleAIError(error)
    alert(errorMessage)
  } finally {
    isLoading.value = false
  }
}

const generateInsight = async () => {
  const content = currentNote.content.trim()
  if (!content) {
    alert('请先编写一些笔记内容再生成洞察')
    return
  }

  try {
    isLoading.value = true

    // 调用真实AI API
    insight.value = await aiService.generateInsight(content)
    insightModal.value = true

  } catch (error) {
    console.error('生成洞察失败:', error)
    const errorMessage = handleAIError(error)
    alert(errorMessage)
  } finally {
    isLoading.value = false
  }
}

// 模拟AI API调用
const simulatePolishAPI = async (text: string): Promise<string> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1500))

  // 智能润色逻辑
  let polished = text

  // 基本文本清理
  polished = polished.replace(/\s+/g, ' ') // 合并多余空格
  polished = polished.replace(/([。！？])\s*([a-zA-Z])/g, '$1 $2') // 中英文间加空格

  // 语言美化
  if (polished.length < 50) {
    // 短文本润色
    if (!polished.includes('很') && !polished.includes('非常')) {
      polished = polished.replace(/^(.*?)([。！？]?)$/, '我觉得$1$2')
    }
  } else {
    // 长文本润色
    if (!polished.includes('首先') && !polished.includes('其次') && !polished.includes('最后')) {
      const sentences = polished.split(/[。！？]/).filter(s => s.trim())
      if (sentences.length >= 2) {
        polished = sentences.map((s, i) => {
          if (i === 0) return `首先，${s}。`
          if (i === sentences.length - 1) return `最后，${s}。`
          return `其次，${s}。`
        }).join('')
      }
    }
  }

  return polished
}

const simulateContinueAPI = async (text: string): Promise<string> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 2000))

  const lowerText = text.toLowerCase()

  // 基于内容的智能续写
  if (lowerText.includes('学习') || lowerText.includes('study')) {
    return `在学习过程中，我们需要制定合理的学习计划。首先，明确学习目标，将大目标分解为小目标。其次，选择合适的学习方法和资源，保持专注和持续性的学习态度。最后，定期回顾和总结学习成果，不断调整学习策略。`
  } else if (lowerText.includes('工作') || lowerText.includes('project')) {
    return `在项目管理中，有几个关键要素需要特别注意：一是明确项目目标和范围，二是合理分配资源和时间，三是建立有效的沟通机制，四是及时识别和应对风险。通过这些方法，我们可以大大提高项目成功的概率。`
  } else if (lowerText.includes('技术') || lowerText.includes('programming')) {
    return `技术发展日新月异，作为技术人员，我们需要保持持续学习的态度。建议关注行业动态，参与开源项目，多与同行交流。同时，要注重基础知识的积累，只有扎实的基础才能支撑更高级的技术应用。`
  } else if (lowerText.includes('生活') || lowerText.includes('生活')) {
    return `生活的质量在于平衡。我们需要在工作和生活之间找到平衡点，既要有事业上的追求，也要有精神世界的丰富。培养兴趣爱好，保持健康的生活方式，与家人朋友保持良好关系，这些都是幸福生活的重要组成部分。`
  } else {
    // 通用续写
    const continuations = [
      `这是一个很有价值的观点。从更深入的角度来看，这个话题涉及到多个层面的考虑。我们需要从实际出发，结合具体情况来制定相应的策略和方法。只有这样，才能真正达到预期的效果。`,
      `基于以上的分析，我们可以得出一些重要的结论。这些结论不仅对当前的情况有指导意义，对未来的发展也具有重要的参考价值。建议在实践中不断检验和完善这些想法。`,
      `这个问题的复杂性在于它涉及多个因素的综合作用。我们需要系统性地思考，考虑到各个方面的相互影响。通过深入分析和实践验证，我们才能找到最适合的解决方案。`
    ]
    return continuations[Math.floor(Math.random() * continuations.length)]
  }
}

const simulateInsightAPI = async (content: string): Promise<any> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 2500))

  // 内容分析
  const wordCount = content.length
  const sentences = content.split(/[。！？]/).filter(s => s.trim())
  const sentenceCount = sentences.length

  // 关键词提取（基于常见词汇和内容分析）
  const keywords = extractKeywords(content)

  // 生成摘要
  const summary = generateSummary(content, sentences)

  // 生成思考问题
  const questions = generateThoughtQuestions(content, keywords)

  return {
    summary,
    keywords,
    questions,
    stats: {
      wordCount,
      sentenceCount,
      avgSentenceLength: Math.round(wordCount / sentenceCount)
    }
  }
}

const extractKeywords = (content: string): string[] => {
  const text = content.toLowerCase()
  const keywordPatterns = [
    'ai', '人工智能', '机器学习', '深度学习', '数据', '算法',
    '开发', '编程', '代码', '技术', '系统', '设计',
    '管理', '项目', '团队', '协作', '效率', '工具',
    '学习', '知识', '技能', '能力', '方法', '策略',
    '分析', '优化', '改进', '创新', '思考', '问题'
  ]

  const foundKeywords: string[] = []
  keywordPatterns.forEach(keyword => {
    if (text.includes(keyword)) {
      foundKeywords.push(keyword)
    }
  })

  // 如果没有找到关键词，添加一些通用的
  if (foundKeywords.length === 0) {
    foundKeywords.push('笔记', '总结', '思考', '分析')
  }

  // 限制关键词数量
  return foundKeywords.slice(0, 6)
}

const generateSummary = (content: string, sentences: string[]): string => {
  if (sentences.length === 0) return '这篇笔记内容较少，主要是初步的想法记录。'

  if (sentences.length <= 2) {
    return `这篇笔记主要讨论了${sentences[0].substring(0, 20)}相关的内容，包含${sentences.length}个主要观点。`
  }

  // 取前几句作为摘要基础
  const mainSentences = sentences.slice(0, 3)
  const summary = mainSentences.map((s, i) => {
    if (i === 0) return `首先${s}`
    if (i === 1) return `其次${s}`
    return `最后${s}`
  }).join('；') + '。'

  return `这篇笔记主要分析了以下几个关键点：${summary}文章结构清晰，逻辑性强，体现了作者对相关主题的深入思考。`
}

const generateThoughtQuestions = (content: string, keywords: string[]): string[] => {
  const questions: string[] = []

  // 基于关键词生成问题
  if (keywords.includes('ai') || keywords.includes('人工智能')) {
    questions.push('如何将人工智能技术应用到实际工作中？')
    questions.push('AI发展的趋势对未来有什么影响？')
  }

  if (keywords.includes('学习') || keywords.includes('技能')) {
    questions.push('如何制定有效的学习计划来提升这项技能？')
    questions.push('学习过程中可能会遇到哪些挑战？')
  }

  if (keywords.includes('管理') || keywords.includes('项目')) {
    questions.push('如何优化项目管理流程以提高效率？')
    questions.push('团队协作中有哪些关键的成功因素？')
  }

  // 通用问题
  questions.push('这个观点在实际应用中需要注意哪些问题？')
  questions.push('如何将这些想法转化为具体的行动计划？')

  // 返回3-4个问题
  return questions.slice(0, 4)
}

const closeInsightModal = () => {
  insightModal.value = false
  insight.value = null
}

// 监听文本选择事件
const handleTextSelection = () => {
  const selection = window.getSelection()
  if (selection && selection.toString().trim()) {
    selectedText.value = selection.toString()
  } else {
    selectedText.value = ''
  }
}

// 添加事件监听
if (typeof document !== 'undefined') {
  document.addEventListener('mouseup', handleTextSelection)
}
</script>

<style scoped>
.note-editor-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.editor-container {
  padding-top: 60px; /* 为顶部导航栏留出空间 */
  max-width: 1200px;
  margin: 0 auto;
  padding-left: 20px;
  padding-right: 20px;
}

.editor-header {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.editor-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.title-input {
  width: 100%;
  font-size: 24px;
  font-weight: bold;
  border: none;
  outline: none;
  padding: 10px 0;
  border-bottom: 2px solid #eee;
}

.title-input:focus {
  border-bottom-color: #007bff;
}

.editor-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 20px;
  min-height: 500px;
}

.content-textarea {
  width: 100%;
  min-height: 460px;
  border: none;
  outline: none;
  font-size: 16px;
  line-height: 1.6;
  resize: vertical;
  font-family: inherit;
}

.ai-functions {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
}

.ai-menu {
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  display: flex;
  gap: 10px;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.global-insight-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 100;
}

.ai-loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  text-align: center;
  z-index: 1500;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  padding: 0;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
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
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.modal-body {
  padding: 20px;
}

.insight-section {
  margin-bottom: 25px;
}

.insight-section h4 {
  color: #333;
  margin-bottom: 10px;
}

.keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.keyword-tag {
  background: #007bff;
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  margin-top: 10px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}

.stat-value {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #007bff;
}

.insight-section ul {
  padding-left: 20px;
}

.insight-section li {
  margin-bottom: 8px;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .editor-container {
    padding-left: 10px;
    padding-right: 10px;
  }

  .ai-menu {
    flex-direction: column;
    gap: 8px;
  }

  .modal-content {
    width: 95%;
    margin: 10px;
  }
}
</style>