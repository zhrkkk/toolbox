import { RouteRecordRaw } from 'vue-router'

/*
 * 静态路由
 */
const staticRoutes: RouteRecordRaw[] = []

/*
 * 基础静态路由
 */
const BaseRoute = {
  path: '/',
  name: '/',
  component: () => import('@renderer/layout/index.vue'),
  redirect: '/home',
  children: [
    {
      path: '/home',
      name: 'home',
      component: () => import('@renderer/views/index.vue')
    }
  ]
}

staticRoutes.push(BaseRoute)
export default staticRoutes
