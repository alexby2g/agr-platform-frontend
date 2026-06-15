import { defineRouter } from '#q-app'
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory
} from 'vue-router'

import routes from './routes.js'
import { getAgrModulos, getAgrToken, puedeEntrarRutaAurea } from '@/utils/auth.js'

export default defineRouter(() => {
  const createHistory = import.meta.env.QUASAR_SERVER
    ? createMemoryHistory
    : import.meta.env.QUASAR_VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE)
  })

  Router.beforeEach((to, from, next) => {
    const modulos = getAgrModulos()

    if (to.path.startsWith('/apps/') && (!getAgrToken() || modulos.length === 0)) {
      return next('/')
    }

    if (to.path.startsWith('/apps/aurea')) {
      if (!puedeEntrarRutaAurea(to.path)) {
        return next('/acceso-denegado')
      }
    }

    if (to.path.startsWith('/apps/carlafit')) {
      const permitido = modulos.some((m) => m.slug === 'carlafit')

      if (!permitido) {
        return next('/acceso-denegado')
      }
    }

    if (to.path.startsWith('/apps/electrofrio')) {
      const permitido = modulos.some((m) => m.slug === 'electrofrio')

      if (!permitido) {
        return next('/acceso-denegado')
      }
    }

    next()
  })

  return Router
})
