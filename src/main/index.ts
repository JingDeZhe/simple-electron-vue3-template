import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { innerData } from './inner-db'
import { registerAIConfigHandlers } from './ai/ipc'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 同步窗口最大化状态到渲染进程，用于更新窗口控制按钮图标
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-maximized')
  })

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-unmaximized')
  })

  ipcMain.handle('window-minimize', () => {
    const activeWindow = mainWindow
    activeWindow.minimize()
  })

  ipcMain.handle('window-toggle-maximize', () => {
    const activeWindow = mainWindow
    if (activeWindow.isMaximized()) {
      activeWindow.unmaximize()
    } else {
      activeWindow.maximize()
    }
  })

  ipcMain.handle('window-close', () => {
    const activeWindow = mainWindow
    activeWindow.close()
  })

  ipcMain.handle('test-database', async () => {
    return innerData.testDatabase()
  })

  registerAIConfigHandlers()

  // 开发环境使用 HMR 热更新，生产环境加载本地 HTML
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.unknow.code')

  // 开发环境监听 F12 开关 DevTools，生产环境忽略 Ctrl+R 刷新
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  // macOS 特性：点击 Dock 图标时重新创建窗口
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// macOS 特性：关闭所有窗口时不退出应用，保持菜单栏激活
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
