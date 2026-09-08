import { defineStore } from 'pinia'

export const useAxiosStore = defineStore(
  // 唯一ID
  'axios',
  {
    state: () => ({
      // pendingRequestMap: new Map()
      pendingRequestMap: new Map<
        string,
        { resolve: (value: any) => void; reject: (reason?: any) => void; cleanup: () => void }
      >(),
      pendingCancelFuncs: new Map<string, (message?: string) => void>()
    }),
    getters: {},
    actions: {}
  }
)
