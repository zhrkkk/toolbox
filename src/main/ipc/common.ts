import { ipcMain, app, BrowserWindow } from 'electron'

export default function setupIpcCommon(win: BrowserWindow) {
  // 设置进度条
  ipcMain.on('setProgressBar', (_, progress) => {
    win.setProgressBar(progress)
  })

  ipcMain.on('windowTool', (_, type) => {
    if (type === 'minimize') {
      win.minimize()
    }
    if (type === 'maximize') {
      win.maximize()
    }
    if (type === 'unmaximize') {
      win.unmaximize()
    }
    if (type === 'close') {
      win.close()
    }
    if (type === 'hide') {
      win.hide()
    }
    if (type === 'quit') {
      app.quit()
    }
  })

  ipcMain.handle('isMaximized', () => {
    return win.isMaximized()
  })
}
