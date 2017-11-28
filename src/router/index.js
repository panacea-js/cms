import Vue from 'vue'
import Router from 'vue-router'
import Root from '@/pages/index'
import EntitiesIndex from '@/pages/entities/index'
import PageNotFound from '@/pages/error/404'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: '/cms',
  routes: [
    {
      path: '/',
      name: 'Root',
      component: Root
    },
    {
      path: '/entities',
      name: 'EntitiesIndex',
      component: EntitiesIndex
    },
    {
      path: '*',
      name: 'PageNotFound',
      component: PageNotFound
    }
  ]
})
