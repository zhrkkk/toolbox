import { ipcRenderer, contextBridge } from 'electron'

// 初始化存储 port 的变量
let staticPort: null | number = null
let staticConfig: null | object = null
let staticPath: null | string = null
// 监听来自主进程的 static-port 消息
ipcRenderer.on('static-port', (_, port) => {
  staticPort = port
  console.log(`Received static port: ${port}`)
})
// 监听来自主进程的 static-port 消息
ipcRenderer.on('static-path', (_, path) => {
  staticPath = path
  console.log(`Received static path: ${path}`)
})
// 监听来自主进程的 static-config 消息
ipcRenderer.on('static-config', (_, config) => {
  staticConfig = config
  console.log(`Received static config: ${config}`)
})

// --------------------------- 向渲染进程暴露部分API ---------------------------
// 使用contextBridge安全地将ipcRenderer的部分方法暴露到渲染进程的window对象中
// 注意：直接在渲染进程中使用ipcRenderer可能存在安全风险，通过contextBridge可控制暴露的API
contextBridge.exposeInMainWorld('ipcRenderer', {
  // 监听主进程事件（支持参数透传）
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args // 解构出事件通道和监听函数
    // 注册事件监听时保持参数格式一致（包含event对象和实际参数）
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },

  // 移除事件监听（支持参数透传）
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args // 解构出事件通道和可选的监听函数
    return ipcRenderer.off(channel, ...omit) // 调用原生移除方法
  },

  // 向主进程发送事件（支持参数透传）
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args // 解构出事件通道和发送参数
    return ipcRenderer.send(channel, ...omit) // 调用原生发送方法
  },

  // 向主进程发送可等待回复的事件（支持参数透传）
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args // 解构出事件通道和调用参数
    return ipcRenderer.invoke(channel, ...omit) // 调用原生invoke方法（返回Promise）
  },

  // 可在此处暴露其他需要的API（遵循最小必要暴露原则）
  // 示例：
  // customApi: {
  //   getVersion: () => '1.0.0'
  // }

  api: {
    getStaticPort: () => staticPort,
    getStaticPath: () => staticPath,
    getStaticConfig: () => staticConfig
  }
})
