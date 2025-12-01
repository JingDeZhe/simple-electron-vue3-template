import { contextBridge, ipcRenderer } from 'electron'
import type { AIConfig, CreateAIConfigInput, UpdateAIConfigInput } from '../shared/type'

// Custom APIs for renderer
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
  // AI 配置管理
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

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
