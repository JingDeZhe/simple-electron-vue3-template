import { ElectronAPI, ElectronOtherAPI } from '../preload/index'

declare global {
  interface Window {
    electron: ElectronAPI
    api: ElectronOtherAPI
  }
}
