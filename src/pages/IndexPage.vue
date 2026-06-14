<template>
  <q-page class="agr-page">
    <div class="login-card" v-if="!token">
      <div class="brand">
        <div class="logo">AGR</div>
        <h1>AGR Studio Platform</h1>
        <p>Acceso centralizado a tus aplicaciones empresariales</p>
      </div>

      <q-input
        v-model="form.usuario"
        label="Usuario"
        dark
        outlined
        color="purple-4"
        class="q-mb-md"
      />

      <q-input
        v-model="form.password"
        label="Contraseña"
        type="password"
        dark
        outlined
        color="purple-4"
        class="q-mb-lg"
        @keyup.enter="login"
      />

      <q-btn
        label="Ingresar"
        icon="login"
        class="full-width btn-login"
        :loading="loading"
        @click="login"
      />

      <div class="demo">
        Usuario: <b>alex</b> | Contraseña: <b>123456</b>
      </div>
    </div>

    <div class="launcher" v-else>
      <div class="topbar">
        <div>
          <h1>AGR Studio</h1>
          <p>
            Bienvenido, {{ usuario?.nombre }} · {{ usuario?.rol_nombre || usuario?.rol }}
            <span v-if="usuario?.empresa?.nombre"> · {{ usuario.empresa.nombre }}</span>
          </p>
        </div>

        <q-btn
          flat
          color="white"
          icon="logout"
          label="Salir"
          @click="logout"
        />
      </div>

      <section v-if="usuario?.rol === 'super_admin'" class="saas-dashboard">
        <div class="section-title">
          <div>
            <h2>Dashboard SaaS</h2>
            <p>Resumen general de AGR Studio Platform</p>
          </div>

          <q-btn
            flat
            color="white"
            icon="refresh"
            label="Actualizar"
            :loading="dashboardLoading"
            @click="cargarSaasDashboard"
          />
        </div>

        <div class="stats-grid">
          <q-card class="stat-card">
            <q-icon name="business" class="stat-icon purple" />
            <div>
              <div class="stat-label">Empresas</div>
              <div class="stat-value">{{ totalEmpresas }}</div>
              <div class="stat-help">Clientes registrados</div>
            </div>
          </q-card>

          <q-card class="stat-card">
            <q-icon name="groups" class="stat-icon blue" />
            <div>
              <div class="stat-label">Usuarios</div>
              <div class="stat-value">{{ totalUsuarios }}</div>
              <div class="stat-help">{{ usuariosActivos }} activos</div>
            </div>
          </q-card>

          <q-card class="stat-card">
            <q-icon name="extension" class="stat-icon cyan" />
            <div>
              <div class="stat-label">Módulos</div>
              <div class="stat-value">{{ totalModulos }}</div>
              <div class="stat-help">{{ modulosActivos }} activos</div>
            </div>
          </q-card>

          <q-card class="stat-card">
            <q-icon name="verified_user" class="stat-icon green" />
            <div>
              <div class="stat-label">Estado</div>
              <div class="stat-value">{{ usuariosActivos }}</div>
              <div class="stat-help">Usuarios disponibles</div>
            </div>
          </q-card>
        </div>

        <div class="dashboard-grid">
          <q-card class="mini-panel">
            <div class="mini-header">
              <q-icon name="admin_panel_settings" />
              <h3>Usuarios por rol</h3>
            </div>

            <div class="role-row">
              <span>Super administradores</span>
              <q-chip color="deep-purple" text-color="white" dense>
                {{ totalSuperAdmins }}
              </q-chip>
            </div>

            <div class="role-row">
              <span>Administradores</span>
              <q-chip color="primary" text-color="white" dense>
                {{ totalAdministradores }}
              </q-chip>
            </div>

            <div class="role-row">
              <span>Empleados</span>
              <q-chip color="teal" text-color="white" dense>
                {{ totalEmpleados }}
              </q-chip>
            </div>
          </q-card>

          <q-card class="mini-panel">
            <div class="mini-header">
              <q-icon name="history" />
              <h3>Últimos accesos</h3>
            </div>

            <div v-if="ultimosAccesos.length">
              <div
                v-for="item in ultimosAccesos"
                :key="item.id"
                class="access-row"
              >
                <div>
                  <strong>{{ item.nombre }}</strong>
                  <small>{{ item.empresa?.nombre || 'AGR Studio' }} · {{ item.rol_nombre || item.rol }}</small>
                </div>
                <span>{{ formatearFecha(item.ultimo_acceso) }}</span>
              </div>
            </div>

            <div v-else class="empty-dashboard">
              Todavía no hay accesos registrados.
            </div>
          </q-card>
        </div>
      </section>

      <section class="apps-section">
        <div class="section-title">
          <div>
            <h2>Aplicaciones disponibles</h2>
            <p>Módulos habilitados para tu usuario</p>
          </div>
        </div>

        <div v-if="modulos.length" class="apps-grid">
          <q-card
            v-for="modulo in modulos"
            :key="modulo.id"
            class="app-card"
            @click="abrirModulo(modulo)"
          >
            <q-icon :name="modulo.icono" size="52px" class="app-icon" />
            <div class="app-title">{{ modulo.nombre }}</div>
            <div class="app-subtitle">{{ modulo.ruta_frontend }}</div>

            <q-btn
              label="Abrir"
              icon="open_in_new"
              class="q-mt-md btn-open"
              no-caps
              @click.stop="abrirModulo(modulo)"
            />
          </q-card>
        </div>

        <q-card v-else class="empty-modulos">
          <q-icon name="lock" size="52px" />
          <h3>Sin módulos asignados</h3>
          <p>
            Tu usuario no tiene módulos habilitados todavía. Contacta al administrador
            para solicitar acceso.
          </p>
        </q-card>
      </section>

      <EmpresasPanel v-if="usuario?.rol === 'super_admin'" />

      <UsuariosPanel v-if="usuario?.rol === 'super_admin'" />

      <ModulosPanel v-if="usuario?.rol === 'super_admin'" />

      <PermisosPanel v-if="usuario?.rol === 'super_admin'" />
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { Notify } from 'quasar'
import { useRouter } from 'vue-router'

import EmpresasPanel from '@/components/EmpresasPanel.vue'
import UsuariosPanel from '@/components/UsuariosPanel.vue'
import ModulosPanel from '@/components/ModulosPanel.vue'
import PermisosPanel from '@/components/PermisosPanel.vue'

const router = useRouter()

const API_URL = import.meta.env.VITE_API_URL || 'https://agr-platform-backend-2.onrender.com/api'

const form = ref({
  usuario: 'alex',
  password: '123456'
})

const loading = ref(false)
const dashboardLoading = ref(false)
const token = ref(localStorage.getItem('agr_token'))
const usuario = ref(null)
const modulos = ref([])

const empresasDashboard = ref([])
const usuariosDashboard = ref([])
const modulosDashboard = ref([])

const totalEmpresas = computed(() => empresasDashboard.value.length)
const totalUsuarios = computed(() => usuariosDashboard.value.length)
const totalModulos = computed(() => modulosDashboard.value.length)

const usuariosActivos = computed(() => {
  return usuariosDashboard.value.filter((item) => Boolean(item.activo)).length
})

const modulosActivos = computed(() => {
  return modulosDashboard.value.filter((item) => Boolean(item.activo)).length
})

const totalSuperAdmins = computed(() => {
  return usuariosDashboard.value.filter((item) => normalizarRol(item.rol) === 'super_admin').length
})

const totalAdministradores = computed(() => {
  return usuariosDashboard.value.filter((item) => normalizarRol(item.rol) === 'administrador').length
})

const totalEmpleados = computed(() => {
  return usuariosDashboard.value.filter((item) => normalizarRol(item.rol) === 'empleado').length
})

const ultimosAccesos = computed(() => {
  return [...usuariosDashboard.value]
    .filter((item) => item.ultimo_acceso)
    .sort((a, b) => new Date(b.ultimo_acceso) - new Date(a.ultimo_acceso))
    .slice(0, 5)
})

function normalizarRol(rol) {
  if (rol === 'admin_empresa') return 'administrador'
  if (rol === 'usuario') return 'empleado'

  return rol || 'empleado'
}

function authHeaders(json = false) {
  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${token.value}`
  }

  if (json) {
    headers['Content-Type'] = 'application/json'
  }

  return headers
}

function normalizarLista(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data

  return []
}

function formatearFecha(fecha) {
  if (!fecha) return 'Sin registro'

  try {
    return new Intl.DateTimeFormat('es-BO', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(fecha))
  } catch {
    return 'Sin registro'
  }
}

async function login() {
  loading.value = true

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(form.value)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'No se pudo iniciar sesión')
    }

    localStorage.setItem('agr_token', data.token)
    token.value = data.token

    Notify.create({
      type: 'positive',
      message: 'Bienvenido a AGR Studio'
    })

    await cargarLauncher()
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error.message
    })
  } finally {
    loading.value = false
  }
}

async function cargarLauncher() {
  try {
    const response = await fetch(`${API_URL}/launcher`, {
      headers: authHeaders()
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Sesión expirada')
    }

    usuario.value = data.usuario
    modulos.value = Array.isArray(data.modulos) ? data.modulos : []

    localStorage.setItem(
      'agr_modulos',
      JSON.stringify(modulos.value)
    )

    if (usuario.value?.rol === 'super_admin') {
      await cargarSaasDashboard()
    }
  } catch (error) {
    localStorage.removeItem('agr_token')
    localStorage.removeItem('agr_modulos')
    token.value = null
    usuario.value = null
    modulos.value = []

    Notify.create({
      type: 'warning',
      message: error.message
    })
  }
}

async function cargarSaasDashboard() {
  if (!token.value) return

  dashboardLoading.value = true

  try {
    const [empresasResponse, usuariosResponse, modulosResponse] = await Promise.all([
      fetch(`${API_URL}/empresas`, { headers: authHeaders() }),
      fetch(`${API_URL}/usuarios-sistema`, { headers: authHeaders() }),
      fetch(`${API_URL}/modulos`, { headers: authHeaders() })
    ])

    const [empresasData, usuariosData, modulosData] = await Promise.all([
      empresasResponse.json(),
      usuariosResponse.json(),
      modulosResponse.json()
    ])

    if (!empresasResponse.ok) {
      throw new Error(empresasData.message || 'No se pudieron cargar las empresas')
    }

    if (!usuariosResponse.ok) {
      throw new Error(usuariosData.message || 'No se pudieron cargar los usuarios')
    }

    if (!modulosResponse.ok) {
      throw new Error(modulosData.message || 'No se pudieron cargar los módulos')
    }

    empresasDashboard.value = normalizarLista(empresasData)
    usuariosDashboard.value = normalizarLista(usuariosData).map((item) => ({
      ...item,
      rol: normalizarRol(item.rol)
    }))
    modulosDashboard.value = normalizarLista(modulosData)
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error.message
    })
  } finally {
    dashboardLoading.value = false
  }
}

function rutaInternaModulo(modulo) {
  const ruta = String(modulo?.ruta_frontend || '').trim()
  const slug = String(modulo?.slug || '').trim().toLowerCase()

  if (slug === 'aurea' && (ruta === '/apps/aurea' || ruta === '')) {
    return '/apps/aurea/dashboard'
  }

  if (slug === 'carlafit' && (ruta === '/apps/carlafit' || ruta === '')) {
    return '/apps/carlafit'
  }

  if (slug === 'electrofrio' && (ruta === '/apps/electrofrio' || ruta === '')) {
    return '/apps/electrofrio'
  }

  return ruta
}

function abrirModulo(modulo) {
  const ruta = rutaInternaModulo(modulo)

  if (!ruta) {
    Notify.create({
      type: 'warning',
      message: 'Este módulo no tiene una ruta asignada'
    })
    return
  }

  if (ruta.startsWith('http://') || ruta.startsWith('https://')) {
    window.open(ruta, '_blank', 'noopener,noreferrer')
    return
  }

  router.push(ruta)
}
async function logout() {
  try {
    await fetch(`${API_URL}/logout`, {
      method: 'POST',
      headers: authHeaders()
    })
  } catch (error) {
    console.log(error)
  }

  localStorage.removeItem('agr_token')
  localStorage.removeItem('agr_modulos')
  token.value = null
  usuario.value = null
  modulos.value = []
  empresasDashboard.value = []
  usuariosDashboard.value = []
  modulosDashboard.value = []

  router.push('/')
}

onMounted(() => {
  if (token.value) {
    cargarLauncher()
  }
})
</script>

<style scoped>
.agr-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(124, 58, 237, 0.35), transparent 35%),
    radial-gradient(circle at bottom right, rgba(14, 165, 233, 0.25), transparent 35%),
    #070b18;
  color: white;
  padding: 28px;
}

.login-card {
  width: 100%;
  max-width: 430px;
  margin: 6vh auto;
  padding: 34px;
  border-radius: 28px;
  background: rgba(15, 23, 42, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.45);
}

.brand {
  text-align: center;
  margin-bottom: 28px;
}

.logo {
  width: 82px;
  height: 82px;
  margin: 0 auto 18px;
  display: grid;
  place-items: center;
  border-radius: 24px;
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  font-size: 28px;
  font-weight: 900;
  letter-spacing: 2px;
}

.brand h1,
.launcher h1 {
  margin: 0;
  font-weight: 900;
}

.brand p,
.launcher p {
  opacity: 0.75;
}

.btn-login,
.btn-open {
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  color: white;
  border-radius: 14px;
  height: 48px;
  font-weight: 700;
}

.demo {
  text-align: center;
  margin-top: 18px;
  opacity: 0.7;
  font-size: 13px;
}

.launcher {
  max-width: 1180px;
  margin: 0 auto;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  gap: 20px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 18px 0 18px;
  gap: 18px;
}

.section-title h2 {
  margin: 0;
  font-size: 30px;
  font-weight: 900;
}

.section-title p {
  margin: 4px 0 0;
  opacity: 0.7;
}

.saas-dashboard {
  margin-bottom: 34px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 18px;
  margin-bottom: 18px;
}

.stat-card {
  min-height: 132px;
  padding: 22px;
  display: flex;
  align-items: center;
  gap: 18px;
  border-radius: 24px;
  color: white;
  background: rgba(15, 23, 42, 0.86);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.stat-icon {
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  font-size: 32px;
}

.stat-icon.purple {
  background: rgba(124, 58, 237, 0.22);
  color: #c4b5fd;
}

.stat-icon.blue {
  background: rgba(37, 99, 235, 0.22);
  color: #93c5fd;
}

.stat-icon.cyan {
  background: rgba(6, 182, 212, 0.22);
  color: #67e8f9;
}

.stat-icon.green {
  background: rgba(34, 197, 94, 0.22);
  color: #86efac;
}

.stat-label {
  opacity: 0.72;
  font-weight: 700;
}

.stat-value {
  font-size: 36px;
  line-height: 1;
  font-weight: 900;
  margin: 6px 0;
}

.stat-help {
  opacity: 0.55;
  font-size: 12px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(260px, 0.8fr) minmax(300px, 1.2fr);
  gap: 18px;
}

.mini-panel {
  padding: 22px;
  border-radius: 24px;
  color: white;
  background: rgba(15, 23, 42, 0.86);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.mini-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
}

.mini-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 900;
}

.role-row,
.access-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.access-row strong,
.access-row small {
  display: block;
}

.access-row small {
  margin-top: 3px;
  opacity: 0.58;
}

.access-row span {
  opacity: 0.7;
  font-size: 12px;
  white-space: nowrap;
}

.empty-dashboard,
.empty-modulos {
  opacity: 0.75;
}

.apps-section {
  margin-top: 30px;
}

.apps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 22px;
}

.app-card {
  cursor: pointer;
  padding: 28px;
  min-height: 230px;
  border-radius: 26px;
  color: white;
  background: rgba(15, 23, 42, 0.86);
  border: 1px solid rgba(255, 255, 255, 0.12);
  transition: 0.25s ease;
}

.app-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 26px 70px rgba(0, 0, 0, 0.35);
}

.app-icon {
  color: #a78bfa;
  margin-bottom: 22px;
}

.app-title {
  font-size: 22px;
  font-weight: 900;
}

.app-subtitle {
  margin-top: 6px;
  opacity: 0.6;
}

.empty-modulos {
  padding: 34px;
  text-align: center;
  border-radius: 26px;
  color: white;
  background: rgba(15, 23, 42, 0.86);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.empty-modulos h3 {
  font-size: 24px;
  font-weight: 900;
  margin: 14px 0 6px;
}

.empty-modulos p {
  max-width: 520px;
  margin: 0 auto;
  opacity: 0.7;
}

@media (max-width: 800px) {
  .agr-page {
    padding: 18px;
  }

  .topbar,
  .section-title {
    align-items: flex-start;
    flex-direction: column;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>
