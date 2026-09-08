<template>
  <div
    class="slot-loading-box"
    :style="{ '--loading-bg-color': bgColor, '--loading-z-index': zIndex }"
  >
    <div class="block-loading" v-if="loading">
      <slot name="effect">
        <div class="loading">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
          <div class="shape shape-4"></div>
        </div>
        <div
          class="progress"
          v-if="progress"
          :style="{ '--progress-width': `${progress * 100}%` }"
        ></div>
      </slot>
    </div>
    <div class="slot-loading-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  loading?: boolean
  bgColor?: string
  zIndex?: number
  progress?: number
}
const props = withDefaults(defineProps<Props>(), {
  bgColor: '#ffffffe0',
  loading: true,
  zIndex: 999990,
  progress: 0.65
})
</script>

<style scoped lang="scss">
$duration: 2.65s;
$ease: cubic-bezier(0.4, 0, 0.2, 1);
.slot-loading-box {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.slot-loading-content {
  width: 100%;
  height: 100%;
  opacity: 1;
  transition: opacity $duration $ease;
  pointer-events: all;
  &[data-loading='true'] {
    user-select: none;
    -webkit-user-select: none;
    pointer-events: none;
    opacity: 0.5;
  }
}
.block-loading {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: var(--loading-z-index, 999990) !important;
  background-color: var(--loading-bg-color);
}

.loading {
  width: 30px;
  height: 30px;
  position: relative;
  top: calc(50% - 15px);
  left: calc(50% - 15px);
}
.shape {
  width: 13px;
  height: 13px;
  position: absolute;
  border-radius: 2px;
}

.shape-1 {
  background-color: var(--color-primary, #3699ff);
  left: 0;
  animation: animationShape1 $duration $ease infinite;
}

.shape-2 {
  background-color: var(--color-error, #f64e60);
  right: 0;
  animation: animationShape2 $duration $ease infinite;
}

.shape-3 {
  background-color: var(--color-success, #1bc5bd);
  bottom: 0;
  animation: animationShape3 $duration $ease infinite;
}

.shape-4 {
  background-color: var(--color-warn, #e6a23c);
  right: 0;
  bottom: 0;
  animation: animationShape4 $duration $ease infinite;
}

@keyframes animationShape1 {
  0% {
    transform: translate(0);
  }

  25% {
    transform: translateX(17px);
  }

  50% {
    transform: translate(17px, 17px);
  }

  75% {
    transform: translate(0, 17px);
  }

  100% {
    transform: translateX(0);
  }
}

@keyframes animationShape2 {
  0% {
    transform: translate(0);
  }

  25% {
    transform: translateY(17px);
  }

  50% {
    transform: translate(-17px, 17px);
  }

  75% {
    transform: translate(-17px, 0);
  }

  100% {
    transform: translate(0);
  }
}

@keyframes animationShape3 {
  0% {
    transform: translate(0);
  }

  25% {
    transform: translateY(-17px);
  }

  50% {
    transform: translate(17px, -17px);
  }

  75% {
    transform: translate(17px, 0);
  }

  100% {
    transform: translate(0);
  }
}

@keyframes animationShape4 {
  0% {
    transform: translate(0);
  }

  25% {
    transform: translateX(-17px);
  }

  50% {
    transform: translate(-17px, -17px);
  }

  75% {
    transform: translate(0, -17px);
  }

  100% {
    transform: translate(0);
  }
}
.progress {
  position: relative;
  top: calc(50% + 15px);
  left: calc((100% - 25%) / 2);
  width: 25%;
  min-width: 260px;
  max-width: 60%;
  height: 8px;
  background-color: #f3f3f3;
  border-radius: 8px;
  transition: width $duration $ease;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: var(--progress-width, 0%);
    max-width: 100%;
    height: 100%;
    background-color: var(--color-primary, #3699ff);
    border-radius: 12px;
    transition: width $duration $ease;
  }
  &::after {
    content: '';
    overflow: hidden;
    width: var(--progress-width, 0%);
    height: 100%;
    border-radius: 12px;
    background-image: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.3) 0%,
      rgba(255, 255, 255, 0.5) 100%
    );
    animation: animationProgress $duration $ease infinite;
  }
}
@keyframes animationProgress {
  0% {
    position: absolute;
    top: 0;
    right: 100%;
    opacity: 1;
  }

  100% {
    position: absolute;
    top: 0;
    right: 0;
    opacity: 0;
  }
}
</style>
