<template>
  <q-page class="agr-page">
    <div v-if="!token" class="login-shell">
      <section class="login-hero">
        <div class="brand-mark">AGR</div>
        <div class="hero-kicker">AGR Studio Platform</div>
        <h1>Un solo acceso para todas tus aplicaciones empresariales.</h1>
        <p>
          Controla empresas, usuarios, permisos y módulos desde una plataforma moderna,
          segura y lista para web y móvil.
        </p>

        <div class="feature-grid">
          <div class="feature-item">
            <q-icon name="verified_user" />
            <span>Roles seguros</span>
          </div>
          <div class="feature-item">
            <q-icon name="apps" />
            <span>Multiapp</span>
          </div>
          <div class="feature-item">
            <q-icon name="phone_iphone" />
            <span>Responsive</span>
          </div>
        </div>
      </section>

      <q-card class="login-card">
        <div class="login-title">
          <div>
            <h2>Bienvenido</h2>
            <p>Ingresa con tu usuario de AGR Platform</p>
          </div>
          <q-icon name="lock_open" />
        </div>

        <q-input
          v-model.trim="form.usuario"
          label="Usuario"
          dark
          outlined
          color="purple-4"
          class="q-mb-md"
          autocomplete="username"
        >
          <template #prepend>
            <q-icon name="person" />
          </template>
        </q-input>

        <q-input
          v-model="form.password"
          label="Contraseña"
          :type="mostrarPassword ? 'text' : 'password'"
          dark
          outlined
          color="purple-4"
          class="q-mb-lg"
          autocomplete="current-password"
          @keyup.enter="login"
        >
          <template #prepend>
            <q-icon name="lock" />
          </template>

          <template #append>
            <q-icon
              :name="mostrarPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="mostrarPassword = !mostrarPassword"
            />
          </template>
        </q-input>

        <q-btn
          label="Ingresar a la plataforma"
          icon="login"
          class="full-width btn-login"
          :loading="loading"
          no-caps
          @click="login"
        />

        <div class="demo">
          Demo local: <b>alex</b> · <b>123456</b>
        </div>
      </q-card>
    </div>

    <div v-else class="launcher">
      <section class="topbar">
        <div class="topbar-content">
          <div class="brand-mini">AGR</div>
          <div>
            <h1>AGR Studio Platform</h1>
            <p>
              Bienvenido, <b>{{ usuario?.nombre }}</b>
              <span> · {{ usuario?.rol_nombre || usuario?.rol }}</span>
              <span v-if="usuario?.empresa?.nombre"> · {{ usuario.empresa.nombre }}</span>
            </p>
          </div>
        </div>

        <div class="topbar-actions">
          <q-chip class="session-chip" icon="shield">
            {{ usuario?.rol_nombre || usuario?.rol || 'Usuario' }}
          </q-chip>

          <q-btn
            flat
            color="white"
            icon="logout"
            label="Salir"
            class="logout-btn"
            no-caps
            @click="logout"
          />
        </div>
      </section>

      <section v-if="usuario?.rol === 'super_admin'" class="saas-dashboard">
        <div class="section-title">
          <div>
            <h2>Dashboard SaaS</h2>
            <p>Resumen general de clientes, usuarios y módulos activos.</p>
          </div>

          <q-btn
            flat
            color="white"
            icon="refresh"
            label="Actualizar"
            class="refresh-btn"
            :loading="dashboardLoading"
            no-caps
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
            <q-icon name="admin_panel_settings" class="stat-icon green" />
            <div>
              <div class="stat-label">Administración</div>
              <div class="stat-value">{{ totalAdministradores }}</div>
              <div class="stat-help">Administradores de empresa</div>
            </div>
          </q-card>
        </div>

        <div class="dashboard-grid">
          <q-card class="mini-panel">
            <div class="mini-header">
              <q-icon name="manage_accounts" />
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
            <p>Módulos habilitados para tu usuario y tu empresa.</p>
          </div>
        </div>

        <div v-if="modulos.length" class="apps-grid">
          <q-card
            v-for="modulo in modulos"
            :key="modulo.id"
            class="app-card"
            @click="abrirModulo(modulo)"
          >
            <div class="app-top">
              <q-icon :name="modulo.icono || 'apps'" class="app-icon" />
              <q-badge v-if="modulo.activo" rounded class="app-badge">Activo</q-badge>
            </div>

            <div class="app-title">{{ modulo.nombre }}</div>
            <div class="app-subtitle">{{ rutaInternaModulo(modulo) }}</div>

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

      <section v-if="usuario?.rol === 'super_admin'" class="admin-stack">
        <EmpresasPanel />
        <UsuariosPanel />
        <ModulosPanel />
        <PermisosPanel />
      </section>
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
import { limpiarSesionAgr, normalizarRol } from '@/utils/auth.js'

const router = useRouter()

const API_URL = import.meta.env.VITE_API_URL || 'https://agr-platform-backend-2.onrender.com/api'

const form = ref({
  usuario: 'alex',
  password: '123456'
})

const mostrarPassword = ref(false)
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

const usuariosActivos = computed(() => usuariosDashboard.value.filter((item) => Boolean(item.activo)).length)
const modulosActivos = computed(() => modulosDashboard.value.filter((item) => Boolean(item.activo)).length)

const totalSuperAdmins = computed(() => usuariosDashboard.value.filter((item) => normalizarRol(item.rol) === 'super_admin').length)
const totalAdministradores = computed(() => usuariosDashboard.value.filter((item) => normalizarRol(item.rol) === 'administrador').length)
const totalEmpleados = computed(() => usuariosDashboard.value.filter((item) => normalizarRol(item.rol) === 'empleado').length)

const ultimosAccesos = computed(() => {
  return [...usuariosDashboard.value]
    .filter((item) => item.ultimo_acceso)
    .sort((a, b) => new Date(b.ultimo_acceso) - new Date(a.ultimo_acceso))
    .slice(0, 5)
})

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

function guardarSesion(data) {
  usuario.value = data.usuario || null
  modulos.value = Array.isArray(data.modulos) ? data.modulos : []

  localStorage.setItem('agr_usuario', JSON.stringify(usuario.value || {}))
  localStorage.setItem('agr_modulos', JSON.stringify(modulos.value))
  localStorage.setItem('agr_permisos', JSON.stringify(usuario.value?.permisos || []))
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
  if (!form.value.usuario || !form.value.password) {
    Notify.create({
      type: 'warning',
      message: 'Ingresa usuario y contraseña'
    })
    return
  }

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

    guardarSesion(data)

    if (usuario.value?.rol === 'super_admin') {
      await cargarSaasDashboard()
    }
  } catch (error) {
    limpiarSesionAgr()
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

  limpiarSesionAgr()
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
  color: white;
  padding: clamp(16px, 3vw, 32px);
  background:
    radial-gradient(circle at top left, rgba(124, 58, 237, 0.42), transparent 34%),
    radial-gradient(circle at 80% 0%, rgba(14, 165, 233, 0.28), transparent 30%),
    radial-gradient(circle at bottom right, rgba(236, 72, 153, 0.18), transparent 36%),
    #070b18;
}

.login-shell {
  width: min(1120px, 100%);
  min-height: calc(100vh - 64px);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(360px, 0.85fr);
  align-items: center;
  gap: clamp(24px, 5vw, 56px);
}

.login-hero {
  position: relative;
}

.brand-mark,
.brand-mini {
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  box-shadow: 0 20px 60px rgba(37, 99, 235, 0.28);
  font-weight: 950;
  letter-spacing: 2px;
}

.brand-mark {
  width: 96px;
  height: 96px;
  border-radius: 30px;
  font-size: 32px;
  margin-bottom: 22px;
}

.hero-kicker {
  color: #c4b5fd;
  font-weight: 900;
  letter-spacing: 0.9px;
  text-transform: uppercase;
  font-size: 12px;
}

.login-hero h1 {
  max-width: 670px;
  margin: 10px 0 16px;
  font-size: clamp(38px, 5vw, 68px);
  line-height: 0.98;
  letter-spacing: -2.2px;
  font-weight: 950;
}

.login-hero p {
  max-width: 560px;
  margin: 0;
  color: rgba(255, 255, 255, 0.74);
  font-size: 17px;
  line-height: 1.7;
}

.feature-grid {
  margin-top: 28px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.feature-item {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 12px 14px;
  border-radius: 999px;
  color: white;
  background: rgba(255, 255, 255, 0.09);
  border: 1px solid rgba(255, 255, 255, 0.14);
  font-weight: 850;
}

.feature-item .q-icon {
  color: #a78bfa;
  font-size: 20px;
}

.login-card {
  width: 100%;
  padding: clamp(24px, 4vw, 36px);
  border-radius: 32px;
  color: white;
  background: rgba(15, 23, 42, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.13);
  box-shadow: 0 34px 100px rgba(0, 0, 0, 0.46);
  backdrop-filter: blur(18px);
}

.login-title {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 18px;
}

.login-title h2,
.brand h1,
.launcher h1 {
  margin: 0;
  font-weight: 950;
}

.login-title h2 {
  font-size: 32px;
}

.login-title p,
.launcher p {
  margin: 5px 0 0;
  color: rgba(255, 255, 255, 0.72);
}

.login-title .q-icon {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  color: #d8b4fe;
  background: rgba(124, 58, 237, 0.17);
  font-size: 30px;
}

.btn-login,
.btn-open {
  min-height: 48px;
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  color: white;
  border-radius: 16px;
  font-weight: 900;
  box-shadow: 0 14px 34px rgba(37, 99, 235, 0.22);
}

.demo {
  text-align: center;
  margin-top: 18px;
  color: rgba(255, 255, 255, 0.58);
  font-size: 13px;
}

.launcher {
  width: min(1240px, 100%);
  margin: 0 auto;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  gap: 20px;
  padding: clamp(18px, 3vw, 26px);
  border-radius: 30px;
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(16px);
}

.topbar-content {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.brand-mini {
  flex: 0 0 auto;
  width: 58px;
  height: 58px;
  border-radius: 20px;
  font-size: 18px;
}

.topbar h1 {
  font-size: clamp(24px, 3vw, 38px);
  line-height: 1.05;
}

.topbar p {
  font-size: 14px;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.session-chip {
  color: white;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.14);
  font-weight: 850;
}

.logout-btn,
.refresh-btn {
  border-radius: 14px;
  font-weight: 850;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 22px 0 18px;
  gap: 18px;
}

.section-title h2 {
  margin: 0;
  font-size: clamp(25px, 3vw, 34px);
  font-weight: 950;
  letter-spacing: -0.7px;
}

.section-title p {
  margin-top: 5px;
  color: rgba(255, 255, 255, 0.68);
}

.saas-dashboard {
  margin-bottom: 34px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 18px;
}

.stat-card,
.mini-panel,
.app-card,
.empty-modulos {
  color: white;
  background: rgba(15, 23, 42, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(14px);
}

.stat-card {
  min-height: 134px;
  padding: 22px;
  display: flex;
  align-items: center;
  gap: 18px;
  border-radius: 26px;
}

.stat-icon {
  flex: 0 0 auto;
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  border-radius: 19px;
  font-size: 32px;
}

.stat-icon.purple { background: rgba(124, 58, 237, 0.22); color: #c4b5fd; }
.stat-icon.blue { background: rgba(37, 99, 235, 0.22); color: #93c5fd; }
.stat-icon.cyan { background: rgba(6, 182, 212, 0.22); color: #67e8f9; }
.stat-icon.green { background: rgba(34, 197, 94, 0.22); color: #86efac; }

.stat-label {
  color: rgba(255, 255, 255, 0.72);
  font-weight: 800;
}

.stat-value {
  font-size: 36px;
  line-height: 1;
  font-weight: 950;
  margin: 6px 0;
}

.stat-help {
  color: rgba(255, 255, 255, 0.52);
  font-size: 12px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(260px, 0.8fr) minmax(300px, 1.2fr);
  gap: 18px;
}

.mini-panel {
  padding: 22px;
  border-radius: 26px;
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
  font-weight: 950;
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
  color: rgba(255, 255, 255, 0.58);
}

.access-row span {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  white-space: nowrap;
}

.empty-dashboard,
.empty-modulos {
  color: rgba(255, 255, 255, 0.75);
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
  padding: 26px;
  min-height: 232px;
  border-radius: 28px;
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}

.app-card:hover {
  transform: translateY(-6px);
  border-color: rgba(167, 139, 250, 0.45);
  box-shadow: 0 28px 76px rgba(0, 0, 0, 0.35);
}

.app-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.app-icon {
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  border-radius: 20px;
  color: #c4b5fd;
  background: rgba(124, 58, 237, 0.18);
  font-size: 34px;
  margin-bottom: 22px;
}

.app-badge {
  color: white;
  background: rgba(34, 197, 94, 0.22);
  border: 1px solid rgba(134, 239, 172, 0.25);
  font-weight: 850;
}

.app-title {
  font-size: 22px;
  font-weight: 950;
}

.app-subtitle {
  margin-top: 7px;
  color: rgba(255, 255, 255, 0.58);
  min-height: 39px;
  word-break: break-word;
  line-height: 1.4;
}

.empty-modulos {
  padding: 34px;
  text-align: center;
  border-radius: 28px;
}

.empty-modulos h3 {
  font-size: 24px;
  font-weight: 950;
  margin: 14px 0 6px;
}

.empty-modulos p {
  max-width: 520px;
  margin: 0 auto;
  color: rgba(255, 255, 255, 0.68);
}

.admin-stack {
  display: grid;
  gap: 20px;
  margin-top: 32px;
}

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .login-shell {
    grid-template-columns: 1fr;
    align-content: center;
  }

  .login-hero {
    text-align: center;
  }

  .brand-mark {
    margin-left: auto;
    margin-right: auto;
  }

  .login-hero p,
  .login-hero h1 {
    margin-left: auto;
    margin-right: auto;
  }

  .feature-grid {
    justify-content: center;
  }

  .login-card {
    max-width: 520px;
    margin: 0 auto;
  }
}

@media (max-width: 760px) {
  .agr-page {
    padding: 14px;
  }

  .login-shell {
    min-height: calc(100vh - 28px);
    gap: 22px;
  }

  .login-hero h1 {
    font-size: 34px;
    letter-spacing: -1.3px;
  }

  .login-hero p {
    font-size: 15px;
  }

  .brand-mark {
    width: 76px;
    height: 76px;
    border-radius: 24px;
    font-size: 24px;
  }

  .feature-grid {
    display: none;
  }

  .login-card {
    padding: 22px;
    border-radius: 26px;
  }

  .topbar,
  .section-title {
    align-items: flex-start;
    flex-direction: column;
  }

  .topbar-actions {
    width: 100%;
    justify-content: space-between;
  }

  .logout-btn {
    margin-left: auto;
  }

  .stats-grid,
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    min-height: 112px;
  }

  .apps-grid {
    grid-template-columns: 1fr;
  }

  .app-card {
    min-height: unset;
  }
}

@media (max-width: 420px) {
  .topbar-content {
    align-items: flex-start;
  }

  .brand-mini {
    width: 48px;
    height: 48px;
    border-radius: 16px;
    font-size: 15px;
  }

  .topbar h1 {
    font-size: 22px;
  }

  .role-row,
  .access-row {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
