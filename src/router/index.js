import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'table',
      component: () => import('../views/data.vue'),
    },
    {
      path: '/chart1',
      name: 'chart1',
      component: () => import('../views/chart1.vue'),
    },
    {
      path: '/chart2',
      name: 'chart2',
      component: () => import('../views/chart2.vue'),
    },
  ],
})

export default router
