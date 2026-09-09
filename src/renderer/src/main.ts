import './style/main.css'
import './assets/icons/lc/css/all.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import piniaStore from './store'

function start(): void {
  const app = createApp(App)
  app.use(piniaStore)
  app.use(router)
  app.mount('#app')

  // .$nextTick(() => {
  //   // Use contextBridge
  //   window.ipcRenderer.on('main-process-message', (_event, message) => {
  //     console.log(message)
  //   })
  // });
}
start()
