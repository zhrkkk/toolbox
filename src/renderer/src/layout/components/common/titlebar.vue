<template>
  <div class="titlebar">
    <div class="controller-left">
      <div class="titlebar-logo">
        <img style="height: 100%" src="@renderer/assets/logo.svg" alt="logo" />
      </div>
      <h4 class="px-2 h-6 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300">{{ systemStore.title }}</h4>
    </div>
    <div class="controller-center">
      <div class="titlebar-btn">
        <i class="lc:arrow-left"></i>
      </div>
      <div class="titlebar-btn">
        <i class="lc:house"></i>
      </div>
      <div class="titlebar-btn">
        <i class="lc:arrow-right"></i>
      </div>
    </div>
    <div class="controller-right">
      <!-- 最小化 -->
      <div class="titlebar-btn" @click="setWindow('minimize')" title="最小化">
        <i class="lc:minus"></i>
      </div>
      <!-- 最大化/恢复 -->
      <div
        class="titlebar-btn"
        @click="setWindow(isMaximized ? 'unmaximize' : 'maximize')"
        :title="isMaximized ? '恢复' : '最大化'"
      >
        <i :class="`lc:${isMaximized ? 'minimize' : 'maximize'}`"></i>
      </div>
      <!-- 关闭 -->
      <div class="titlebar-btn hover:bg-red-500! hover:text-white!" @click="setWindow('quit')" title="关闭">
        <i class="lc:x"></i>
      </div>
    </div>
  </div>
</template>

<script setup>
const { ipcRenderer } = window // 引入 ipcRenderer
import { useSystemStore } from '@renderer/store'
const systemStore = useSystemStore()
import { useRouter, useRoute } from 'vue-router'
const isMaximized = ref() // 初始化状态
const router = useRouter()
const route = useRoute()
const setWindow = (type) => {
  ipcRenderer.send('windowTool', type)
}
const canGoBack = ref(false)
const isHomePage = ref(false)
const goBack = () => {
  router.back()
}
const goHome = () => {
  router.push('/home')
}
onMounted(() => {
  ipcRenderer.invoke('isMaximized').then((res) => {
    isMaximized.value = res // 获取当前窗口状态
  })
  // 监听窗口最大化事件
  ipcRenderer.on('window-maximized', (event, maximized) => {
    isMaximized.value = maximized
  })
  ipcRenderer.on('static-config', (event, config) => {
    systemStore.title = config?.title || ''
  })
})
// 监听路由变化，更新路由历史数组
watch(
  route,
  async (to) => {
    await nextTick()
    canGoBack.value = window.history?.state?.back
    isHomePage.value = to.name === 'home'
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.titlebar-btn {
  @apply w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer;
}
.titlebar {
  user-select: none;
  width: 100%;
  height: 100%;
  background-color: var(--base-titlebar-bg-color);
  color: var(--base-font-color);
  display: grid;
  align-items: center;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: 100%;
  grid-gap: 16px;
  padding: 4px 8px;
}
.titlebar-logo {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.controller-left {
  display: flex;
  align-items: center;
  height: 100%;
  app-region: drag;
  width: 100%;
  justify-content: flex-start;
  gap: 8px;
}
.controller-center {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.controller-right {
  display: flex;
  align-items: center;
  height: 100%;
  width: 100%;
  justify-content: flex-end;
  gap: 8px;
}
</style>
