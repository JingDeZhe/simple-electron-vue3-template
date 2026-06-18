import { BrowserWindow, ipcMain } from 'electron'

/**
 * 注册窗口控制相关的 IPC handlers
 */
export function registerWindowHandlers(mainWindow: BrowserWindow): void {
  ipcMain.handle('window-minimize', () => {
    mainWindow.minimize()
  })

  ipcMain.handle('window-toggle-maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  })

  ipcMain.handle('window-close', () => {
    mainWindow.close()
  })

  // 同步窗口最大化状态到渲染进程，用于更新窗口控制按钮图标
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-maximized')
  })

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-unmaximized')
  })
}
