/**
 * AI 配置相关 IPC 处理器
 */
import { ipcMain } from 'electron'
import { aiConfigDB } from '../db'
import type { CreateAIConfigInput, UpdateAIConfigInput } from '../../shared/type'
import { createAIService } from './index'

/**
 * 注册 AI 配置相关 IPC 处理器
 */
export function registerAIConfigHandlers(): void {
  // 获取所有配置
  ipcMain.handle('ai-config:get-all', async () => {
    try {
      return aiConfigDB.findAll()
    } catch (error: any) {
      throw new Error(`获取配置列表失败: ${error.message}`)
    }
  })

  // 根据 ID 获取配置
  ipcMain.handle('ai-config:get-by-id', async (_, id: string) => {
    try {
      return aiConfigDB.findById(id)
    } catch (error: any) {
      throw new Error(`获取配置失败: ${error.message}`)
    }
  })

  // 获取默认配置
  ipcMain.handle('ai-config:get-default', async () => {
    try {
      return aiConfigDB.findDefault()
    } catch (error: any) {
      throw new Error(`获取默认配置失败: ${error.message}`)
    }
  })

  // 创建配置
  ipcMain.handle('ai-config:create', async (_, input: CreateAIConfigInput) => {
    try {
      return aiConfigDB.create(input)
    } catch (error: any) {
      throw new Error(`创建配置失败: ${error.message}`)
    }
  })

  // 更新配置
  ipcMain.handle('ai-config:update', async (_, input: UpdateAIConfigInput) => {
    try {
      return aiConfigDB.update(input)
    } catch (error: any) {
      throw new Error(`更新配置失败: ${error.message}`)
    }
  })

  // 删除配置
  ipcMain.handle('ai-config:delete', async (_, id: string) => {
    try {
      return aiConfigDB.delete(id)
    } catch (error: any) {
      throw new Error(`删除配置失败: ${error.message}`)
    }
  })

  // 测试配置连接
  ipcMain.handle('ai-config:test-connection', async (_, id: string) => {
    try {
      const config = aiConfigDB.findById(id)
      if (!config) {
        return { success: false, message: '配置不存在' }
      }

      const service = createAIService(config)
      return await service.testConnection()
    } catch (error: any) {
      return { success: false, message: error.message || '测试失败' }
    }
  })
}
