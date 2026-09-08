<template>
  <div>
    <h2>HelloWorld</h2>
    <button @click="handleReadFile">readFile</button>
    <button @click="handleWriteFile">writeFile</button>
    <input
      type="number"
      min="0"
      max="1"
      step="0.01"
      @input="setProgressBar($event.target.value || 0)"
    />
    <button @click="test">test</button>
    <Versions />
    <pre>{{ logValue }}</pre>
  </div>
</template>

<script setup>
import Versions from '@/components/Versions.vue'

const readFile = (...arg) => window.ipcRenderer.invoke('readFile', ...arg)
const writeFile = (...arg) => window.ipcRenderer.invoke('writeFile', ...arg)

const logValue = ref([])
const handleReadFile = async () => {
  logValue.value.push(await readFile('D:\\SystemData\\Downloads\\encrypted.bin'))
}
const handleWriteFile = async () => {
  logValue.value.push(await writeFile('./test.txt', 'HelloWorld'))
}
const test = async () => {
  logValue.value.push(await window.ipcRenderer.invoke('getAppPath'))
  logValue.value.push(await window.ipcRenderer.invoke('getPath', 'userData'))
  logValue.value.push(await window.ipcRenderer.invoke('getPath', 'appData'))
  logValue.value.push(await window.ipcRenderer.invoke('getPath', 'temp'))
  logValue.value.push(await window.ipcRenderer.invoke('getPath', 'exe'))
  logValue.value.push(await window.ipcRenderer.invoke('getPath', 'desktop'))
  logValue.value.push(await window.ipcRenderer.invoke('getPath', 'documents'))
  logValue.value.push(await window.ipcRenderer.invoke('getPath', 'downloads'))
  logValue.value.push(await window.ipcRenderer.invoke('getPath', 'music'))
  logValue.value.push(await window.ipcRenderer.invoke('getPath', 'pictures'))
  console.log(logValue.value)
}
const setProgressBar = (val) => {
  console.log(val)

  window.ipcRenderer.send('setProgressBar', Number(val))
}
const setWindow = (type) => {
  window.ipcRenderer.send('windowTool', type)
}
</script>

<style lang="scss" scoped></style>
