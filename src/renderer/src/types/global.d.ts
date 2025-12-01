import { MessageApi, DialogApi, NotificationApi, LoadingBarApi } from 'naive-ui'
import type { ElectronAPI, ElectronOtherAPI } from '../../../preload'

declare global {
  interface Window {
    $message: MessageApi
    $dialog: DialogApi
    $notification: NotificationApi
    $loadingBar: LoadingBarApi
    electron: ElectronAPI
    api: ElectronOtherAPI
  }
}
