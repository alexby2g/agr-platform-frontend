const EMPLEADO_AUREA_PERMISOS = [
  'aurea.dashboard.ver',
  'aurea.clientes.ver',
  'aurea.clientes.crear',
  'aurea.clientes.editar',
  'aurea.clientes.historial',
  'aurea.citas.ver',
  'aurea.citas.crear',
  'aurea.citas.editar',
  'aurea.citas.finalizar',
  'aurea.pagos.ver',
  'aurea.pagos.crear',
  'aurea.pagos.factura',
  'aurea.servicios.ver',
  'aurea.empleados.activos',
  'aurea.notificaciones.ver',
  'aurea.notificaciones.editar'
]

const AUREA_ROUTE_PERMISSIONS = [
  { startsWith: '/apps/aurea/configuracion', permiso: 'aurea.configuracion.ver' },
  { startsWith: '/apps/aurea/empleados', permiso: 'aurea.empleados.ver' },
  { startsWith: '/apps/aurea/caja-diaria', permiso: 'aurea.caja.ver' },
  { startsWith: '/apps/aurea/historial-clientes', permiso: 'aurea.clientes.historial' },
  { startsWith: '/apps/aurea/historial', permiso: 'aurea.historial.ver' },
  { startsWith: '/apps/aurea/reporte-empleados', permiso: 'aurea.reportes.ver' },
  { startsWith: '/apps/aurea/clientes', permiso: 'aurea.clientes.ver' },
  { startsWith: '/apps/aurea/citas', permiso: 'aurea.citas.ver' },
  { startsWith: '/apps/aurea/pagos', permiso: 'aurea.pagos.ver' },
  { startsWith: '/apps/aurea/servicios', permiso: 'aurea.servicios.ver' },
  { startsWith: '/apps/aurea/calendario', permiso: 'aurea.citas.ver' },
  { startsWith: '/apps/aurea/mis-citas', permiso: 'aurea.citas.ver' },
  { startsWith: '/apps/aurea/dashboard', permiso: 'aurea.dashboard.ver' },
  { startsWith: '/apps/aurea', permiso: 'aurea.dashboard.ver' }
]

export function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value || '')
  } catch {
    return fallback
  }
}

export function normalizarRol(rol) {
  if (rol === 'admin_empresa') return 'administrador'
  if (rol === 'usuario') return 'empleado'
  return rol || 'empleado'
}

export function getAgrToken() {
  return localStorage.getItem('agr_token')
}

export function getAgrUsuario() {
  return safeJsonParse(localStorage.getItem('agr_usuario'), null)
}

export function getAgrModulos() {
  const modulos = safeJsonParse(localStorage.getItem('agr_modulos'), [])
  return Array.isArray(modulos) ? modulos : []
}

export function getAgrPermisos() {
  const usuario = getAgrUsuario()
  const permisos = safeJsonParse(localStorage.getItem('agr_permisos'), [])

  if (Array.isArray(permisos) && permisos.length > 0) {
    return permisos
  }

  if (Array.isArray(usuario?.permisos) && usuario.permisos.length > 0) {
    return usuario.permisos
  }

  if (normalizarRol(usuario?.rol) === 'empleado') {
    return EMPLEADO_AUREA_PERMISOS
  }

  return []
}

export function esSuperAdmin(usuario = getAgrUsuario()) {
  return normalizarRol(usuario?.rol) === 'super_admin'
}

export function esAdministrador(usuario = getAgrUsuario()) {
  return normalizarRol(usuario?.rol) === 'administrador'
}

export function esEmpleado(usuario = getAgrUsuario()) {
  return normalizarRol(usuario?.rol) === 'empleado'
}

export function tieneModulo(slug) {
  if (esSuperAdmin()) return true

  return getAgrModulos().some((modulo) => modulo?.slug === slug)
}

export function puedeAurea(permiso) {
  const usuario = getAgrUsuario()

  if (esSuperAdmin(usuario) || esAdministrador(usuario)) {
    return true
  }

  return getAgrPermisos().includes(permiso)
}

export function permisoRutaAurea(path) {
  const item = AUREA_ROUTE_PERMISSIONS.find((route) => path.startsWith(route.startsWith))
  return item?.permiso || 'aurea.dashboard.ver'
}

export function puedeEntrarRutaAurea(path) {
  if (!tieneModulo('aurea')) {
    return false
  }

  return puedeAurea(permisoRutaAurea(path))
}

export function limpiarSesionAgr() {
  localStorage.removeItem('agr_token')
  localStorage.removeItem('agr_usuario')
  localStorage.removeItem('agr_modulos')
  localStorage.removeItem('agr_permisos')
}
