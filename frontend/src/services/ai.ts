/**
 * AI服务 - 集成OpenAI API
 * 支持文本润色、续写、智能洞察和聊天对话功能
 */

// AI服务配置
export const AI_CONFIG = {
  // 在实际部署时，这个API Key应该存储在后端环境变量中
  // 前端不应该直接暴露API Key
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '', // 从环境变量读取
  OPENAI_BASE_URL: 'https://api.openai.com/v1',
  DEFAULT_MODEL: 'gpt-3.5-turbo',
  MAX_TOKENS: 2000,
  TEMPERATURE: 0.7
}

// AI响应类型定义
export interface PolishResponse {
  polishedText: string
  originalText: string
}

export interface ContinueResponse {
  continuedText: string
  originalText: string
}

export interface InsightResponse {
  summary: string
  keywords: string[]
  questions: string[]
  stats: {
    wordCount: number
    sentenceCount: number
    avgSentenceLength: number
  }
}

export interface ChatResponse {
  reply: string
  isComplete: boolean
}

/**
 * AI服务类
 */
class AIService {
  private apiKey: string
  private baseUrl: string

  constructor() {
    // 优先从环境变量读取，其次从本地存储读取
    this.apiKey = AI_CONFIG.OPENAI_API_KEY || this.loadApiKeyFromStorage()
    this.baseUrl = AI_CONFIG.OPENAI_BASE_URL
  }

  /**
   * 从本地存储加载API Key
   */
  private loadApiKeyFromStorage(): string {
    try {
      return localStorage.getItem('hello-kitty-openai-api-key') || ''
    } catch (error) {
      console.error('加载本地API Key失败:', error)
      return ''
    }
  }

  /**
   * 检查API Key是否配置
   */
  private checkApiKey(): void {
    if (!this.apiKey) {
      throw new Error('请先配置OpenAI API Key。请在.env.local文件中添加VITE_OPENAI_API_KEY=your_api_key')
    }
  }

  /**
   * 调用OpenAI API的通用方法
   */
  private async callOpenAI(messages: Array<{ role: string; content: string }>): Promise<string> {
    this.checkApiKey()

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: AI_CONFIG.DEFAULT_MODEL,
          messages,
          max_tokens: AI_CONFIG.MAX_TOKENS,
          temperature: AI_CONFIG.TEMPERATURE,
          stream: false
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`OpenAI API错误: ${errorData.error?.message || response.statusText}`)
      }

      const data = await response.json()
      return data.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('OpenAI API调用失败:', error)
      throw error
    }
  }

  /**
   * 文本润色
   */
  async polishText(text: string): Promise<PolishResponse> {
    if (!text.trim()) {
      throw new Error('请提供需要润色的文本')
    }

    const prompt = `作为一名专业的文本编辑师，请帮我润色下面的文本。要求：
1. 保持原意不变，但让表达更清晰、流畅
2. 修正语法错误和用词不当
3. 优化句子结构，增强可读性
4. 如果是中文，注意语序和表达的优雅性
5. 如果是英文，注意语法和表达的准确性

请直接返回润色后的文本，不要添加解释：

原文：${text}

润色后：`

    try {
      const polishedText = await this.callOpenAI([
        {
          role: 'system',
          content: '你是一名专业的文本编辑师，擅长润色和优化各种类型的文本。你的任务是在保持原意的基础上，让文本变得更加清晰、流畅和专业。'
        },
        {
          role: 'user',
          content: prompt
        }
      ])

      return {
        polishedText: polishedText.trim(),
        originalText: text
      }
    } catch (error) {
      console.error('文本润色失败:', error)
      throw new Error('文本润色失败，请稍后重试')
    }
  }

  /**
   * 文本续写
   */
  async continueText(text: string): Promise<ContinueResponse> {
    if (!text.trim()) {
      throw new Error('请提供需要续写的文本')
    }

    const prompt = `请帮我续写下面的文本。要求：
1. 保持原文的风格和语调
2. 逻辑连贯，内容合理
3. 长度控制在100-200字之间
4. 如果是笔记内容，保持信息的实用性
5. 如果是创意写作，保持想象的连贯性

原文：${text}

续写：`

    try {
      const continuedText = await this.callOpenAI([
        {
          role: 'system',
          content: '你是一位优秀的写作助手，擅长根据已有内容进行合理的续写。你的续写内容应该保持原文的风格，并且逻辑清晰、内容连贯。'
        },
        {
          role: 'user',
          content: prompt
        }
      ])

      return {
        continuedText: continuedText.trim(),
        originalText: text
      }
    } catch (error) {
      console.error('文本续写失败:', error)
      throw new Error('文本续写失败，请稍后重试')
    }
  }

  /**
   * 生成智能洞察
   */
  async generateInsight(content: string): Promise<InsightResponse> {
    if (!content.trim()) {
      throw new Error('请提供需要分析的内容')
    }

    const prompt = `请帮我分析下面的笔记内容，生成详细的洞察报告。要求：
1. 提供一个简洁的内容摘要（50-100字）
2. 提取5-8个关键词
3. 生成3-4个思考问题或启发
4. 保持分析的客观性和建设性

请以JSON格式返回结果，格式如下：
{
  "summary": "内容摘要",
  "keywords": ["关键词1", "关键词2", "关键词3"],
  "questions": ["思考问题1", "思考问题2", "思考问题3"]
}

内容：${content}`

    try {
      const response = await this.callOpenAI([
        {
          role: 'system',
          content: '你是一位内容分析专家，擅长深度分析文本内容，提取关键信息，并提供有价值的洞察和思考方向。你的分析结果应该客观、准确、有建设性。'
        },
        {
          role: 'user',
          content: prompt
        }
      ])

      // 尝试解析JSON响应
      let parsedResponse
      try {
        parsedResponse = JSON.parse(response)
      } catch (e) {
        // 如果JSON解析失败，提供默认结构
        const sentences = content.split(/[。！？]/).filter(s => s.trim())
        parsedResponse = {
          summary: `这篇笔记主要讨论了${sentences[0]?.substring(0, 20)}相关的内容。`,
          keywords: ['笔记', '思考', '分析', '总结'],
          questions: ['这个观点有哪些可以深入探讨的地方？', '如何将这些想法付诸实践？']
        }
      }

      const wordCount = content.length
      const sentences = content.split(/[。！？]/).filter(s => s.trim())
      const sentenceCount = sentences.length

      return {
        summary: parsedResponse.summary || '内容分析中...',
        keywords: parsedResponse.keywords || [],
        questions: parsedResponse.questions || [],
        stats: {
          wordCount,
          sentenceCount,
          avgSentenceLength: Math.round(wordCount / sentenceCount)
        }
      }
    } catch (error) {
      console.error('智能洞察生成失败:', error)
      throw new Error('智能洞察生成失败，请稍后重试')
    }
  }

  /**
   * AI聊天对话
   */
  async chat(message: string, conversationHistory: Array<{ role: string; content: string }> = []): Promise<ChatResponse> {
    if (!message.trim()) {
      throw new Error('请输入聊天消息')
    }

    try {
      const messages = [
        {
          role: 'system',
          content: '你是Hello Kitty助手，一个友好、温暖、聪明的AI助手。你的特点是：1. 使用可爱但不失专业的语气 2. 以樱花作为你的象征 3. 总是积极向上，鼓励用户 4. 回答问题时既专业又亲切 5. 会适当使用emoji表情增加亲和力'
        },
        ...conversationHistory.slice(-10), // 保留最近10条对话记录
        {
          role: 'user',
          content: message
        }
      ]

      const reply = await this.callOpenAI(messages)

      return {
        reply: reply.trim(),
        isComplete: true
      }
    } catch (error) {
      console.error('AI聊天失败:', error)
      throw new Error('AI聊天失败，请稍后重试')
    }
  }

  /**
   * 设置API Key
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey
  }

  /**
   * 检查API配置状态
   */
  checkConfiguration(): { isConfigured: boolean; missingKey: boolean } {
    return {
      isConfigured: !!this.apiKey,
      missingKey: !this.apiKey
    }
  }
}

// 创建AI服务单例
export const aiService = new AIService()

// 导出便捷方法
export const {
  polishText,
  continueText,
  generateInsight,
  chat
} = aiService

/**
 * 错误处理工具函数
 */
export const handleAIError = (error: unknown): string => {
  if (error instanceof Error) {
    if (error.message.includes('API Key')) {
      return '请先配置OpenAI API Key'
    } else if (error.message.includes('quota')) {
      return 'API配额不足，请检查您的OpenAI账户'
    } else if (error.message.includes('rate limit')) {
      return '请求过于频繁，请稍后再试'
    } else if (error.message.includes('network')) {
      return '网络连接异常，请检查网络后重试'
    }
    return error.message
  }
  return 'AI服务异常，请稍后重试'
}