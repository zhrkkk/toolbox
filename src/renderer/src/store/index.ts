import { createPinia } from 'pinia'
import { useSystemStore } from './modules/system'
import { useAxiosStore } from './modules/axios'

import piniaPlugin from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPlugin)

export { useSystemStore, useAxiosStore }

export default pinia
