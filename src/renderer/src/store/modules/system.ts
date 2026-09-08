import { defineStore } from 'pinia'
import piniaStore from '@renderer/store/index'

export const useSystemStore = defineStore(
  // 唯一ID
  'system',
  {
    state: () => ({
      title: '小张的工具箱',
      loading: false,
      modalLoading: false,
      progress: 0
    }),
    getters: {},
    actions: {
      refresh() {
        location.reload()
      },
      setLoading(loading: boolean) {
        this.loading = loading
      },
      setProgress(progress: number) {
        this.progress = progress
      }
    }
    // persist: {
    //     key: 'system',
    // },
  }
)

export function useSystemOutsideStore() {
  return useSystemStore(piniaStore)
}
