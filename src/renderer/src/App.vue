<template>
  <div class="app-container">
    <titleBar></titleBar>
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import titleBar from '@renderer/layout/components/common/titlebar.vue'
</script>

<style scoped lang="scss">
.app-container {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: 32px calc(100vh - 32px);
}
</style>
