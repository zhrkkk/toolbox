import { app, BrowserWindow, Tray, Menu } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { join, dirname } from 'node:path'
import fs from 'node:fs'
import { promisify } from 'node:util'
import setupIpc from './ipc'

const readFileAsync = promisify(fs.readFile)

// 应用根路径：开发环境取项目根目录，生产环境取 exe 所在目录
const appPath = is.dev ? app.getAppPath() : dirname(app.getPath('exe'))
// 资源目录：开发环境与 appPath 相同，生产环境指向 resources 目录
const resourcesPath = is.dev ? appPath : join(appPath, 'resources')

let win: BrowserWindow | null = null
let splashWin: BrowserWindow | null = null
let tray: Tray | null = null
let isQuitting = false // 标识是否是真正的退出操作

// 尝试获取单实例锁
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  // 未获取到锁，说明已有实例运行，退出当前实例
  app.quit()
} else {
  // 当第二个实例启动时触发
  app.on('second-instance', () => {
    if (win) {
      if (win.isMinimized()) win.restore()
      if (!win.isVisible()) win.show()
      win.focus()
    }
  })

  /**
   * 创建原生 Splash 启动窗口
   */
  function createSplashWindow(): void {
    splashWin = new BrowserWindow({
      icon: join(resourcesPath, 'resources', 'icon.png'),
      width: 400,
      height: 300,
      frame: false, // 无边框
      transparent: true, // 背景透明
      alwaysOnTop: true, // 保持最前
      resizable: false,
      center: true,
      show: true,
      skipTaskbar: true, // 隐藏任务栏
      hasShadow: true, // 显示阴影
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    })
    // 加载一个极简的本地 splash.html 文件
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      splashWin.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/splash.html`)
    } else {
      splashWin.loadFile(join(__dirname, '../renderer/splash.html'))
    }
  }

  /**
   * 创建系统托盘
   */
  function createTray(title: string): void {
    const iconPath = join(resourcesPath, 'resources', 'icon.png')
    tray = new Tray(iconPath)

    const contextMenu = Menu.buildFromTemplate([
      {
        label: '显示主界面',
        click: () => {
          if (win) {
            win.show()
            win.focus()
          }
        }
      },
      { type: 'separator' },
      {
        label: '退出',
        click: () => {
          isQuitting = true
          app.quit()
        }
      }
    ])

    tray.setToolTip(title || 'toolbox')
    tray.setContextMenu(contextMenu)

    // 点击托盘图标切换窗口显示/隐藏
    tray.on('click', () => {
      if (win) {
        if (win.isVisible()) {
          win.hide()
        } else {
          win.show()
          win.focus()
        }
      }
    })
  }

  /**
   * 创建应用主窗口
   */
  async function createWindow(): Promise<void> {
    // 动态读取 JSON 配置文件
    let config: any = {}
    try {
      const jsonPath = join(resourcesPath, 'resources', 'config.json')
      const data = await readFileAsync(jsonPath, 'utf8')
      config = JSON.parse(data)
    } catch (error) {
      console.error('读取配置文件时出错:', error)
    }

    // 创建浏览器窗口实例（初始不显示 show: false）
    win = new BrowserWindow({
      icon: join(resourcesPath, 'resources', 'icon.png'),
      width: 1080,
      height: 720,
      minWidth: 1080,
      minHeight: 720,
      show: false, // 隐藏主窗口，等待 ready-to-show 后再显示
      resizable: true,
      frame: false,
      titleBarStyle: 'hidden',
      hasShadow: true,
      fullscreen: false,
      fullscreenable: false,
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        webviewTag: true,
        plugins: true
      }
    })

    // 创建托盘
    createTray(config?.title)

    // 添加 ipcMain 监听
    setupIpc(win)

    // 监听窗口内容加载完成事件，向渲染进程发送消息
    win.webContents.on('did-finish-load', () => {
      win?.webContents.send('main-process-message', new Date().toLocaleString())
    })

    // 加载页面逻辑
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      win.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      win.loadFile(join(__dirname, '../renderer/index.html'))
    }

    // 当窗口准备好显示时触发：关闭 Splash 并显示主窗口
    win.once('ready-to-show', () => {
      if (win) {
        win.webContents.send('static-config', config)
      }
      win?.setTitle(config?.title || '')

      // 销毁 Splash 窗口
      if (splashWin && !splashWin.isDestroyed()) {
        splashWin.destroy()
        splashWin = null
      }

      // 显示并聚焦主窗口
      win?.show()
      win?.focus()
    })

    // 关闭逻辑：默认隐藏到托盘；只有触发真正的退出时才销毁窗口
    win.on('close', (e) => {
      if (!isQuitting) {
        e.preventDefault()
        win?.hide()
      }
    })

    win.on('closed', () => {
      win = null
    })

    // 监听窗口最大化与还原事件
    win.on('maximize', () => {
      win?.webContents.send('window-maximized', true)
    })
    win.on('unmaximize', () => {
      win?.webContents.send('window-maximized', false)
    })
  }

  // 监听窗口全部关闭事件
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  // 监听应用激活事件（macOS 专用）
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })

  // 当 Electron 完成初始化时
  app.whenReady().then(async () => {
    electronApp.setAppUserModelId('com.electron')
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    // 1. 先展示 Splash 启动窗口
    createSplashWindow()

    // 2. 静默创建主窗口
    createWindow()

    // 明确在应用退出前更新状态与销毁托盘
    app.on('before-quit', () => {
      isQuitting = true
    })

    app.on('will-quit', async () => {
      if (splashWin && !splashWin.isDestroyed()) {
        splashWin.destroy()
      }
      if (tray) {
        tray.destroy()
        tray = null
      }
      if (win) {
        win.destroy()
      }
    })
  })
}
