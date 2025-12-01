/**
 * AI 提示词模板管理
 */

/**
 * 提示词模板接口
 */
export interface PromptTemplate {
  id: string
  name: string
  content: string
  description?: string
}

/**
 * 预设提示词模板
 */
export const DEFAULT_PROMPTS: PromptTemplate[] = [
  {
    id: 'general',
    name: '通用助手',
    content: 'You are a helpful assistant.',
    description: '通用 AI 助手模板'
  },
  {
    id: 'code',
    name: '代码助手',
    content: 'You are an expert programmer. Please help with coding tasks and provide clean, well-documented code.',
    description: '专注于编程和代码相关任务'
  },
  {
    id: 'translate',
    name: '翻译助手',
    content: 'You are a professional translator. Translate the text accurately while maintaining the original tone and style.',
    description: '专业的翻译服务'
  },
  {
    id: 'writing',
    name: '写作助手',
    content: 'You are a skilled writer. Help improve writing quality, grammar, and style.',
    description: '协助写作和文本优化'
  }
]

/**
 * 根据 ID 获取提示词模板
 */
export function getPromptById(id: string): PromptTemplate | undefined {
  return DEFAULT_PROMPTS.find(p => p.id === id)
}

/**
 * 获取所有提示词模板
 */
export function getAllPrompts(): PromptTemplate[] {
  return [...DEFAULT_PROMPTS]
}
