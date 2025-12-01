import OpenAI from 'openai'
import type { AIConfig } from '@shared/type'
import type {
  ChatCompletion,
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionMessageParam
} from 'openai/resources/chat/completions'

// 导出兼容 OpenAI 格式的消息类型
export type { ChatCompletionMessageParam as ChatMessage }

export interface ChatCompletionRequest {
  model?: string
  messages: ChatCompletionMessageParam[]
  temperature?: number
  max_tokens?: number
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
  stream?: boolean
}

// 直接使用 OpenAI 原生类型，避免重复定义
export type { ChatCompletion as ChatCompletionResponse }

export class AIService {
  private config: AIConfig
  private client: OpenAI

  constructor(config: AIConfig) {
    this.config = config
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      timeout: 30000,
      maxRetries: 2
    })
  }

  async chat(request: ChatCompletionRequest): Promise<ChatCompletion> {
    const params: ChatCompletionCreateParamsNonStreaming = {
      model: request.model || this.config.model || 'deepseek-chat',
      messages: request.messages,
      temperature: request.temperature ?? this.config.temperature ?? 0.7,
      max_tokens: request.max_tokens ?? this.config.maxTokens,
      top_p: request.top_p ?? this.config.topP,
      frequency_penalty: request.frequency_penalty ?? this.config.frequencyPenalty,
      presence_penalty: request.presence_penalty ?? this.config.presencePenalty,
      stream: false
    }

    try {
      const response = await this.client.chat.completions.create(params)
      return response
    } catch (error: any) {
      throw new Error(`AI API 请求失败: ${error.message || error}`)
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.chat({
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      })

      if (response.choices && response.choices.length > 0) {
        return { success: true, message: '连接成功' }
      } else {
        return { success: false, message: '响应格式异常' }
      }
    } catch (error: any) {
      return { success: false, message: error.message || '连接失败' }
    }
  }

  // 暴露底层客户端以支持流式响应等高级特性
  getClient(): OpenAI {
    return this.client
  }
}

export function createAIService(config: AIConfig): AIService {
  return new AIService(config)
}
