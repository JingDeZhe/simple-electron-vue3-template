import { contextBridge, ipcRenderer } from 'electron'
import type { AIConfig, CreateAIConfigInput, UpdateAIConfigInput } from '../shared/type'

const electronAPI = {
  minimize: () => ipcRenderer.invoke('window-minimize'),
  toggleMaximize: () => ipcRenderer.invoke('window-toggle-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  onMaximized: (fn: Function) => {
    ipcRenderer.on('window-maximized', () => {
      fn()
    })
  },
  onUnmaximized: (fn: Function) => {
    ipcRenderer.on('window-unmaximized', () => {
      fn()
    })
  },
  testDatabase: () => ipcRenderer.invoke('test-database')
}

export type ElectronAPI = typeof electronAPI

const api = {
  aiConfig: {
    getAll: (): Promise<AIConfig[]> => ipcRenderer.invoke('ai-config:get-all'),
    getById: (id: string): Promise<AIConfig | undefined> =>
      ipcRenderer.invoke('ai-config:get-by-id', id),
    getDefault: (): Promise<AIConfig | undefined> => ipcRenderer.invoke('ai-config:get-default'),
    create: (input: CreateAIConfigInput): Promise<AIConfig> =>
      ipcRenderer.invoke('ai-config:create', input),
    update: (input: UpdateAIConfigInput): Promise<AIConfig | undefined> =>
      ipcRenderer.invoke('ai-config:update', input),
    delete: (id: string): Promise<boolean> => ipcRenderer.invoke('ai-config:delete', id),
    testConnection: (id: string): Promise<{ success: boolean; message: string }> =>
      ipcRenderer.invoke('ai-config:test-connection', id)
  }
}

export type ElectronOtherAPI = typeof api

// 启用上下文隔离时使用 contextBridge 安全暴露 API，否则直接挂载到全局对象
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (类型定义在 dts 文件中)
  window.electron = electronAPI
  // @ts-ignore (类型定义在 dts 文件中)
  window.api = api
}
