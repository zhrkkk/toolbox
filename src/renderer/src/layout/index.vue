<template>
  <component :is="Default"></component>
</template>

<script setup>
import Default from './components/default/index.vue'

defineOptions({
  components: { Default }
})

onMounted(() => {})
onBeforeMount(() => {})
onUnmounted(() => {})
</script>

<style lang="scss" scoped></style>
