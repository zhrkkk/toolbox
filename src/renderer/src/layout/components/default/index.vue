<template>
  <slot-loading :loading="systemStore.loading" :progress="systemStore.progress">
    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
  </slot-loading>
</template>

<script setup lang="ts">
import SlotLoading from '@renderer/components/loading.vue'
import { useSystemStore } from '@renderer/store'
const systemStore = useSystemStore()
</script>

<style lang="scss" scoped>
.layout-default {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: 100%;
}
</style>
