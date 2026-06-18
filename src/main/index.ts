import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import log from 'electron-log'
import icon from '../../resources/icon.png?asset'
import { innerData } from './inner-db'
import { registerAIConfigHandlers } from './ai/ipc'
import { registerWindowHandlers } from './ipc/window'

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

  registerWindowHandlers(mainWindow)
  registerAIConfigHandlers()

  ipcMain.handle('test-database', async () => {
    return innerData.testDatabase()
  })

  // 开发环境使用 HMR 热更新，生产环境加载本地 HTML
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  log.info('App ready')
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
    log.info('All windows closed, quitting')
    app.quit()
  }
})
