// 支持 OpenAI 兼容的 AI 配置类型定义
export interface AIConfig {
  id: string // 唯一标识
  name: string // 配置名称
  baseURL: string // API 端点 (例如: https://api.openai.com/v1)
  apiKey: string // API 密钥
  model?: string // 默认模型名称 (例如: gpt-4, gpt-3.5-turbo)
  temperature?: number // 温度参数 (0-2)
  maxTokens?: number // 最大 token 数
  topP?: number // Top P 采样参数 (0-1)
  frequencyPenalty?: number // 频率惩罚 (-2.0 to 2.0)
  presencePenalty?: number // 存在惩罚 (-2.0 to 2.0)
  isDefault: boolean // 是否为默认配置
  createdAt: number // 创建时间戳
  updatedAt: number // 更新时间戳
}

export interface CreateAIConfigInput {
  name: string
  baseURL: string
  apiKey: string
  model?: string
  temperature?: number
  maxTokens?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
  isDefault?: boolean
}

export interface UpdateAIConfigInput {
  id: string
  name?: string
  baseURL?: string
  apiKey?: string
  model?: string
  temperature?: number
  maxTokens?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: boolean
}
