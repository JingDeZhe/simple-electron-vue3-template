import { ipcMain } from 'electron'
import log from 'electron-log'
import { aiConfigDB } from '../db'
import type { CreateAIConfigInput, UpdateAIConfigInput } from '../../shared/type'
import { createAIService } from './index'

export function registerAIConfigHandlers(): void {
  ipcMain.handle('ai-config:get-all', async () => {
    try {
      return aiConfigDB.findAll()
    } catch (error: any) {
      log.error('获取配置列表失败:', error)
      throw new Error(`获取配置列表失败: ${error.message}`)
    }
  })

  ipcMain.handle('ai-config:get-by-id', async (_, id: string) => {
    try {
      return aiConfigDB.findById(id)
    } catch (error: any) {
      log.error('获取配置失败:', error)
      throw new Error(`获取配置失败: ${error.message}`)
    }
  })

  ipcMain.handle('ai-config:get-default', async () => {
    try {
      return aiConfigDB.findDefault()
    } catch (error: any) {
      log.error('获取默认配置失败:', error)
      throw new Error(`获取默认配置失败: ${error.message}`)
    }
  })

  ipcMain.handle('ai-config:create', async (_, input: CreateAIConfigInput) => {
    try {
      return aiConfigDB.create(input)
    } catch (error: any) {
      log.error('创建配置失败:', error)
      throw new Error(`创建配置失败: ${error.message}`)
    }
  })

  ipcMain.handle('ai-config:update', async (_, input: UpdateAIConfigInput) => {
    try {
      return aiConfigDB.update(input)
    } catch (error: any) {
      log.error('更新配置失败:', error)
      throw new Error(`更新配置失败: ${error.message}`)
    }
  })

  ipcMain.handle('ai-config:delete', async (_, id: string) => {
    try {
      return aiConfigDB.delete(id)
    } catch (error: any) {
      log.error('删除配置失败:', error)
      throw new Error(`删除配置失败: ${error.message}`)
    }
  })

  ipcMain.handle('ai-config:test-connection', async (_, id: string) => {
    try {
      const config = aiConfigDB.findById(id)
      if (!config) {
        return { success: false, message: '配置不存在' }
      }

      const service = createAIService(config)
      return await service.testConnection()
    } catch (error: any) {
      log.error('测试连接失败:', error)
      return { success: false, message: error.message || '测试失败' }
    }
  })
}
