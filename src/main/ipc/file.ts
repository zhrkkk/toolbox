import { ipcMain, app, BaseWindow } from 'electron'
import fs from 'node:fs'
import { promisify } from 'node:util'
import path from 'node:path'
import os from 'node:os'
const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)
const rmAsync = promisify(fs.rm)
const appPath =
  process.env.NODE_ENV === 'development' ? app.getAppPath() : path.dirname(app.getPath('exe'))
export default function setupIpcFile(_win: BaseWindow) {
  // 处理读取文件的 IPC 消息
  ipcMain.handle('readFile', async (_, filePath, options = 'utf8') => {
    try {
      const absolutePath = path.resolve(filePath)
      const data = await readFileAsync(absolutePath, options)
      return {
        code: 1,
        msg: '文件读取成功',
        data,
        absolutePath,
        timeStamp: new Date().getTime()
      }
    } catch (error) {
      console.error('读取文件时出错:', error)
      return {
        code: 0,
        msg: '文件读取失败',
        data: error,
        timeStamp: new Date().getTime()
      }
    }
  })

  // 处理写入文件的 IPC 消息
  ipcMain.handle('writeFile', async (_, filePath, content, options = 'utf8') => {
    try {
      const absolutePath = path.resolve(filePath)
      await writeFileAsync(absolutePath, content, options)
      return {
        code: 1,
        msg: '文件写入成功',
        data: true,
        absolutePath,
        timeStamp: new Date().getTime()
      }
    } catch (error) {
      console.error('写入文件时出错:', error)
      return {
        code: 0,
        msg: '文件写入失败',
        data: error,
        timeStamp: new Date().getTime()
      }
    }
  })
  // 处理获取应用路径的 IPC 消息
  ipcMain.handle('getAppPath', () => {
    const resourcesPath =
      process.env.NODE_ENV === 'development' ? app.getAppPath() : process.resourcesPath
    return resourcesPath
  })

  // 处理获取路径的 IPC 消息
  ipcMain.handle('getPath', (_, path) => {
    return app.getPath(path)
  })

  // 处理获取临时路径的 IPC 消息
  ipcMain.handle('getTempPath', (_, fileName) => {
    const tempFilePath = path.join(os.tmpdir(), fileName) // 获取临时文件路径
    return `file:\\${tempFilePath}`
  })

  // 删除临时文件
  ipcMain.handle('deleteTempFile', async (_, fileName) => {
    const tempDir = path.join(appPath, 'static', 'tmp')
    // 检查临时目录是否存在，不存在则创建
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }
    const tempFilePath = path.join(tempDir, fileName)
    try {
      await rmAsync(tempFilePath, { recursive: true, force: true })
      return {
        code: 1,
        msg: '文件删除成功',
        data: true,
        timeStamp: new Date().getTime()
      }
    } catch (error) {
      console.error('删除临时文件时出错:', error)
      return {
        code: 0,
        msg: '删除文件失败',
        data: error,
        timeStamp: new Date().getTime()
      }
    }
  })
}
