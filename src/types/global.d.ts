import { ElectronAPI, ElectronOtherAPI } from '../preload/index'

declare global {
  interface Window {
    electron: ElectronAPI
    api: ElectronOtherAPI
  }
}

// 声明 SQL 文件作为原始字符串导入
declare module '*.sql?raw' {
  const content: string
  export default content
}
