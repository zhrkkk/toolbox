import { app, BrowserWindow, dialog } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { join, dirname } from 'node:path'
import fs from 'node:fs'
import { promisify } from 'node:util'
import { Server } from 'node:http'
import { v4 as uuidv4 } from 'uuid'
import express from 'express'
import setupIpc from './ipc'

const readFileAsync = promisify(fs.readFile)
const rmAsync = promisify(fs.rm)

// 应用根路径：开发环境取项目根目录，生产环境取 exe 所在目录
const appPath = is.dev ? app.getAppPath() : dirname(app.getPath('exe'))
// 资源目录：开发环境与 appPath 相同，生产环境指向 resources 目录
const resourcesPath = is.dev ? appPath : join(appPath, 'resources')

let win: BrowserWindow | null
let server: null | Server

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
      win.focus()
    }
  })

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

    // 创建浏览器窗口实例
    win = new BrowserWindow({
      icon: join(resourcesPath, 'resources', 'icon.png'),
      width: 1080,
      height: 720,
      minWidth: 1080,
      minHeight: 720,
      show: true,
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

    // 添加 ipcMain 监听
    setupIpc(win)

    // 监听窗口内容加载完成事件，向渲染进程发送消息
    win.webContents.on('did-finish-load', () => {
      win?.webContents.send('main-process-message', new Date().toLocaleString())
    })

    // 加载页面逻辑：开发环境下加载开发服务器 URL（支持热更新 HMR），生产环境下加载本地打包后的 HTML 文件
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      win.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      win.loadFile(join(__dirname, '../renderer/index.html'))
    }

    // 当窗口准备好显示时触发
    win.on('ready-to-show', () => {
      // 发送 config 到渲染进程
      if (win) {
        win.webContents.send('static-config', config)
      }
      // 启动静态资源服务器
      const appExpress = express()
      const staticPath = uuidv4()
      appExpress.use(`/${staticPath}`, express.static(appPath))
      console.log(join(appPath, 'static'))

      server = appExpress.listen(0, '127.0.0.1', () => {
        const address = server?.address()
        const staticPort =
          typeof address === 'object' && address !== null ? address.port : undefined
        console.log(`Server is running on http://127.0.0.1:${staticPort}/${staticPath}`)
        // 发送 port、path 到渲染进程
        if (win) {
          win.webContents.send('static-path', staticPath)
          win.webContents.send('static-port', staticPort)
        }
      })
      win?.setTitle(config?.title || '')
      win?.show()
    })

    // 关闭窗口前弹出确认对话框
    win.on('close', (e) => {
      e.preventDefault()
      dialog
        .showMessageBox(win!, {
          type: 'question',
          title: '确认退出',
          message: '你确定要退出应用程序吗？',
          buttons: ['取消', '确定']
        })
        .then((result) => {
          if (result.response === 1) {
            win?.destroy()
            app.quit()
          }
        })
        .catch((err) => {
          console.log(err)
        })
    })

    win.on('closed', () => {
      win = null
    })

    // 监听窗口最大化事件
    win.on('maximize', () => {
      win?.webContents.send('window-maximized', true)
    })
    // 监听窗口最大化还原事件
    win.on('unmaximize', () => {
      win?.webContents.send('window-maximized', false)
    })
  }

  // 监听窗口全部关闭事件（非 macOS 系统时退出应用）
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
      win = null
    }
  })

  // 监听应用激活事件（macOS 专用）
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })

  // 当 Electron 完成初始化并准备好创建浏览器窗口时
  app.whenReady().then(async () => {
    // 清理临时目录
    const tempDir = join(appPath, 'static', 'tmp')
    console.log(tempDir)
    if (fs.existsSync(tempDir)) {
      try {
        await rmAsync(tempDir, { recursive: true, force: true })
        console.log('临时目录删除成功')
      } catch (err) {
        console.error('删除临时目录时出错:', err)
      }
    }

    electronApp.setAppUserModelId('com.electron')
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    createWindow()

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    // 应用退出时清理资源
    app.on('will-quit', async () => {
      if (server) server.close()
      const tempDir = join(appPath, 'static', 'tmp')
      console.log(tempDir)
      if (fs.existsSync(tempDir)) {
        try {
          await rmAsync(tempDir, { recursive: true, force: true })
          console.log('临时目录删除成功')
        } catch (err) {
          console.error('删除临时目录时出错:', err)
        }
      }
    })
  })
}
