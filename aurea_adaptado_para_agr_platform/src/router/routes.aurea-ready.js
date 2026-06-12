const routes = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('@/pages/IndexPage.vue') },
      { path: 'second', component: () => import('@/pages/SecondPage.vue') },
      { path: 'apps/carlafit', component: () => import('@/pages/apps/CarlaFitPage.vue') },
      { path: 'apps/electrofrio', component: () => import('@/pages/apps/ElectroFrioPage.vue') }
    ]
  },
  {
    path: '/apps/aurea',
    component: () => import('@/layouts/AureaLayout.vue'),
    children: [
      { path: '', component: () => import('@/pages/apps/AureaPage.vue') },
      { path: 'dashboard', component: () => import('@/pages/apps/aurea/DashboardPage.vue') },
      { path: 'clientes', component: () => import('@/pages/apps/aurea/ClientesPage.vue') },
      { path: 'citas', component: () => import('@/pages/apps/aurea/CitasPage.vue') },
      { path: 'pagos', component: () => import('@/pages/apps/aurea/PagosPage.vue') },
      { path: 'servicios', component: () => import('@/pages/apps/aurea/ServiciosPage.vue') },
      { path: 'calendario', component: () => import('@/pages/apps/aurea/CalendarioPage.vue') },
      { path: 'empleados', component: () => import('@/pages/apps/aurea/EmpleadosPage.vue') },
      { path: 'reporte-empleados', component: () => import('@/pages/apps/aurea/ReporteEmpleadosPage.vue') },
      { path: 'caja-diaria', component: () => import('@/pages/apps/aurea/CajaDiariaPage.vue') },
      { path: 'historial', component: () => import('@/pages/apps/aurea/HistorialPage.vue') },
      { path: 'historial-clientes', component: () => import('@/pages/apps/aurea/HistorialClientesPage.vue') },
      { path: 'mis-citas', component: () => import('@/pages/apps/aurea/MisCitasPage.vue') },
      { path: 'configuracion', component: () => import('@/pages/apps/aurea/ConfiguracionPage.vue') }
    ]
  },
  { path: '/:catchAll(.*)*', component: () => import('@/pages/ErrorNotFound.vue') }
]

export default routes
