import { createRouter, createWebHashHistory } from 'vue-router'
import staticRoutes from './static' //导入静态路由
//导入生成的路由数据
const router = createRouter({
  history: createWebHashHistory(),
  routes: staticRoutes
})

router.beforeEach(async (_to, _from) => {
  // console.log('beforeEach',to)
})

router.afterEach((_to) => {
  console.log('afterEach', _to)
})

export default router
