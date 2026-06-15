<template>
  <q-page class="glamur-page usuarios-empresa-page">
    <section class="glamur-hero q-mb-md">
      <div>
        <div class="glamur-eyebrow">
          <q-icon name="manage_accounts" />
          Seguridad de la empresa
        </div>

        <div class="glamur-title q-mt-sm">
          Usuarios de la empresa
        </div>

        <div class="glamur-subtitle q-mt-xs">
          Crea accesos para administradores y empleados sin salir de AUREA Beauty.
        </div>
      </div>

      <div class="hero-actions">
        <q-btn icon="refresh" label="Actualizar" flat color="white" no-caps :loading="loading" @click="load" />
        <q-btn icon="person_add" label="Nuevo usuario" class="glamur-btn-light" unelevated no-caps @click="abrirDialogo()" />
      </div>
    </section>

    <q-linear-progress v-if="loading" indeterminate color="pink" class="q-mb-md" />

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-lg-3">
        <q-card class="glamur-card glamur-card-hover metric-card">
          <q-card-section>
            <div class="row items-center justify-between no-wrap">
              <div>
                <div class="metric-label">Total usuarios</div>
                <div class="metric-value">{{ resumen.total }}</div>
                <div class="metric-detail">Registrados</div>
              </div>
              <q-avatar class="bg-purple-7" size="58px"><q-icon name="groups" color="white" size="30px" /></q-avatar>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-lg-3">
        <q-card class="glamur-card glamur-card-hover metric-card">
          <q-card-section>
            <div class="row items-center justify-between no-wrap">
              <div>
                <div class="metric-label">Activos</div>
                <div class="metric-value">{{ resumen.activos }}</div>
                <div class="metric-detail">Pueden ingresar</div>
              </div>
              <q-avatar class="bg-green-7" size="58px"><q-icon name="verified_user" color="white" size="30px" /></q-avatar>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-lg-3">
        <q-card class="glamur-card glamur-card-hover metric-card">
          <q-card-section>
            <div class="row items-center justify-between no-wrap">
              <div>
                <div class="metric-label">Administradores</div>
                <div class="metric-value">{{ resumen.administradores }}</div>
                <div class="metric-detail">Gestionan la app</div>
              </div>
              <q-avatar class="bg-blue-7" size="58px"><q-icon name="admin_panel_settings" color="white" size="30px" /></q-avatar>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-lg-3">
        <q-card class="glamur-card glamur-card-hover metric-card">
          <q-card-section>
            <div class="row items-center justify-between no-wrap">
              <div>
                <div class="metric-label">Empleados</div>
                <div class="metric-value">{{ resumen.empleados }}</div>
                <div class="metric-detail">Acceso limitado</div>
              </div>
              <q-avatar class="bg-teal-7" size="58px"><q-icon name="badge" color="white" size="30px" /></q-avatar>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-card class="glamur-card q-mb-md" v-if="esSuperAdmin && empresasOptions.length">
      <q-card-section>
        <div class="row q-col-gutter-md items-end">
          <div class="col-12 col-md-6">
            <q-select
              v-model="empresaSeleccionada"
              :options="empresasOptions"
              label="Filtrar por empresa"
              outlined
              rounded
              dense
              emit-value
              map-options
              clearable
              bg-color="white"
              @update:model-value="load"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card class="glamur-card">
      <q-table
        :rows="usuarios"
        :columns="columns"
        row-key="id"
        flat
        bordered
        class="glamur-table"
        :grid="$q.screen.lt.md"
        :loading="loading"
        :pagination="{ rowsPerPage: 8 }"
        no-data-label="Todavía no hay usuarios para esta empresa."
      >
        <template #body-cell-empresa="props">
          <q-td :props="props">
            {{ props.row.empresa?.nombre || empresaActual?.nombre || 'Sin empresa' }}
          </q-td>
        </template>

        <template #body-cell-rol="props">
          <q-td :props="props">
            <q-badge :color="rolColor(props.row.rol)" rounded>
              {{ rolLabel(props.row.rol) }}
            </q-badge>
          </q-td>
        </template>

        <template #body-cell-activo="props">
          <q-td :props="props">
            <q-badge :color="props.row.activo ? 'green' : 'red'" rounded>
              {{ props.row.activo ? 'Activo' : 'Inactivo' }}
            </q-badge>
          </q-td>
        </template>

        <template #body-cell-acciones="props">
          <q-td :props="props">
            <q-btn flat dense icon="edit" color="pink-7" @click="abrirDialogo(props.row)" />
            <q-btn flat dense icon="delete" color="negative" :disable="props.row.id === usuarioActual?.id" @click="eliminarUsuario(props.row)" />
          </q-td>
        </template>

        <template #item="props">
          <div class="q-pa-xs col-12">
            <q-card class="user-mobile-card">
              <div class="mobile-top">
                <div>
                  <div class="mobile-title">{{ props.row.nombre }}</div>
                  <div class="mobile-subtitle">{{ props.row.usuario }}</div>
                  <div class="mobile-subtitle">{{ props.row.email || 'Sin email' }}</div>
                </div>
                <q-badge :color="rolColor(props.row.rol)" rounded>{{ rolLabel(props.row.rol) }}</q-badge>
              </div>

              <div class="mobile-info">
                <span><b>Empresa:</b> {{ props.row.empresa?.nombre || empresaActual?.nombre || 'Sin empresa' }}</span>
                <span><b>Estado:</b> {{ props.row.activo ? 'Activo' : 'Inactivo' }}</span>
              </div>

              <div class="mobile-actions">
                <q-btn flat dense icon="edit" label="Editar" color="pink-7" no-caps @click="abrirDialogo(props.row)" />
                <q-btn flat dense icon="delete" label="Eliminar" color="negative" no-caps :disable="props.row.id === usuarioActual?.id" @click="eliminarUsuario(props.row)" />
              </div>
            </q-card>
          </div>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="dialogo">
      <q-card class="dialog-card">
        <q-card-section>
          <div class="text-h6">{{ editando ? 'Editar usuario' : 'Nuevo usuario' }}</div>
          <div class="text-caption text-grey-7">
            El empleado tendrá acceso limitado dentro de AUREA Beauty.
          </div>
        </q-card-section>

        <q-card-section>
          <q-input v-model.trim="form.nombre" label="Nombre completo" outlined class="q-mb-md" />
          <q-input v-model.trim="form.usuario" label="Usuario de acceso" outlined class="q-mb-md" />
          <q-input v-model.trim="form.email" label="Email" type="email" outlined class="q-mb-md" />

          <q-input
            v-model="form.password"
            :label="editando ? 'Nueva contraseña (opcional)' : 'Contraseña inicial'"
            type="password"
            outlined
            class="q-mb-md"
          />

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.rol"
                :options="rolesDisponibles"
                label="Rol"
                outlined
                emit-value
                map-options
              />
            </div>

            <div v-if="esSuperAdmin" class="col-12 col-md-6">
              <q-select
                v-model="form.empresa_id"
                :options="empresasOptions"
                label="Empresa"
                outlined
                emit-value
                map-options
              />
            </div>
          </div>

          <q-toggle v-model="form.activo" label="Usuario activo" color="positive" class="q-mt-md" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn label="Guardar" icon="save" color="pink-7" unelevated :loading="guardando" @click="guardarUsuario" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { getAgrUsuario, esSuperAdmin as usuarioEsSuperAdmin } from '@/utils/auth.js'

const $q = useQuasar()
const API_URL = import.meta.env.VITE_API_URL || 'https://agr-platform-backend-2.onrender.com/api'

const usuarioActual = computed(() => getAgrUsuario())
const esSuperAdmin = computed(() => usuarioEsSuperAdmin(usuarioActual.value))

const usuarios = ref([])
const empresas = ref([])
const empresaActual = ref(null)
const empresaSeleccionada = ref(null)
const loading = ref(false)
const guardando = ref(false)
const dialogo = ref(false)
const editando = ref(false)
const usuarioId = ref(null)

const rolesAdmin = [
  { label: 'Empleado', value: 'empleado' }
]

const rolesSuperAdmin = [
  { label: 'Administrador', value: 'administrador' },
  { label: 'Empleado', value: 'empleado' }
]

const rolesDisponibles = computed(() => esSuperAdmin.value ? rolesSuperAdmin : rolesAdmin)

const form = ref(formVacio())

const empresasOptions = computed(() => empresas.value.map((empresa) => ({ label: empresa.nombre, value: empresa.id })))

const resumen = computed(() => ({
  total: usuarios.value.length,
  activos: usuarios.value.filter((item) => item.activo).length,
  administradores: usuarios.value.filter((item) => item.rol === 'administrador').length,
  empleados: usuarios.value.filter((item) => item.rol === 'empleado').length
}))

const columns = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'usuario', label: 'Usuario', field: 'usuario', align: 'left', sortable: true },
  { name: 'email', label: 'Email', field: 'email', align: 'left', sortable: true },
  { name: 'empresa', label: 'Empresa', field: 'empresa', align: 'left', sortable: true },
  { name: 'rol', label: 'Rol', field: 'rol', align: 'center', sortable: true },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center', sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

function formVacio() {
  return {
    nombre: '',
    usuario: '',
    email: '',
    password: '',
    rol: 'empleado',
    empresa_id: null,
    activo: true
  }
}

function token() {
  return localStorage.getItem('agr_token')
}

function headers() {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token()}`
  }
}

function getErrorMessage(data, fallback = 'Ocurrió un error') {
  if (data?.errors) return Object.values(data.errors).flat().join(' ')
  return data?.message || fallback
}

function normalizarRol(rol) {
  if (rol === 'admin_empresa') return 'administrador'
  if (rol === 'usuario') return 'empleado'
  return rol || 'empleado'
}

function rolLabel(rol) {
  const value = normalizarRol(rol)
  if (value === 'administrador') return 'Administrador'
  return 'Empleado'
}

function rolColor(rol) {
  return normalizarRol(rol) === 'administrador' ? 'blue' : 'teal'
}

async function load() {
  loading.value = true

  try {
    const params = new URLSearchParams()
    if (empresaSeleccionada.value) params.set('empresa_id', empresaSeleccionada.value)

    const query = params.toString() ? `?${params.toString()}` : ''
    const response = await fetch(`${API_URL}/mi-empresa/usuarios${query}`, {
      headers: headers()
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(getErrorMessage(data, 'No se pudieron cargar los usuarios'))
    }

    empresaActual.value = data.empresa || usuarioActual.value?.empresa || null
    empresas.value = Array.isArray(data.empresas) ? data.empresas : []
    usuarios.value = Array.isArray(data.usuarios)
      ? data.usuarios.map((usuario) => ({ ...usuario, rol: normalizarRol(usuario.rol) }))
      : []
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message })
  } finally {
    loading.value = false
  }
}

function abrirDialogo(usuario = null) {
  if (usuario) {
    editando.value = true
    usuarioId.value = usuario.id
    form.value = {
      nombre: usuario.nombre || '',
      usuario: usuario.usuario || '',
      email: usuario.email || '',
      password: '',
      rol: normalizarRol(usuario.rol),
      empresa_id: usuario.empresa_id || empresaSeleccionada.value || usuarioActual.value?.empresa_id || null,
      activo: Boolean(usuario.activo)
    }
  } else {
    editando.value = false
    usuarioId.value = null
    form.value = formVacio()
    form.value.empresa_id = empresaSeleccionada.value || usuarioActual.value?.empresa_id || null
  }

  if (!esSuperAdmin.value) {
    form.value.rol = 'empleado'
  }

  dialogo.value = true
}

async function guardarUsuario() {
  if (!form.value.nombre || !form.value.usuario) {
    $q.notify({ type: 'warning', message: 'Nombre y usuario son obligatorios' })
    return
  }

  if (!editando.value && !form.value.password) {
    $q.notify({ type: 'warning', message: 'La contraseña inicial es obligatoria' })
    return
  }

  if (esSuperAdmin.value && !form.value.empresa_id) {
    $q.notify({ type: 'warning', message: 'Selecciona una empresa' })
    return
  }

  guardando.value = true

  try {
    const payload = {
      ...form.value,
      rol: normalizarRol(form.value.rol)
    }

    if (editando.value && !payload.password) delete payload.password

    const url = editando.value
      ? `${API_URL}/mi-empresa/usuarios/${usuarioId.value}`
      : `${API_URL}/mi-empresa/usuarios`

    const method = editando.value ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method,
      headers: headers(),
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(getErrorMessage(data, 'No se pudo guardar el usuario'))
    }

    $q.notify({ type: 'positive', message: data.message || 'Usuario guardado correctamente' })
    dialogo.value = false
    await load()
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message })
  } finally {
    guardando.value = false
  }
}

async function eliminarUsuario(usuario) {
  const confirmar = window.confirm(`¿Eliminar a ${usuario.nombre}?`)
  if (!confirmar) return

  try {
    const response = await fetch(`${API_URL}/mi-empresa/usuarios/${usuario.id}`, {
      method: 'DELETE',
      headers: headers()
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(getErrorMessage(data, 'No se pudo eliminar el usuario'))
    }

    $q.notify({ type: 'positive', message: data.message || 'Usuario eliminado correctamente' })
    await load()
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message })
  }
}

onMounted(load)
</script>

<style scoped>
.usuarios-empresa-page {
  min-height: 100vh;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.dialog-card {
  width: 680px;
  max-width: 95vw;
  border-radius: 22px;
}

.user-mobile-card {
  padding: 16px;
  border-radius: 20px;
  background: white;
  border: 1px solid rgba(148, 163, 184, 0.24);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
}

.mobile-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.mobile-title {
  font-weight: 900;
  color: #111827;
}

.mobile-subtitle {
  color: #64748b;
  font-size: 12px;
  margin-top: 3px;
}

.mobile-info {
  display: grid;
  gap: 6px;
  margin-top: 12px;
  color: #475569;
}

.mobile-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

@media (max-width: 700px) {
  .hero-actions {
    width: 100%;
    justify-content: stretch;
  }

  .hero-actions :deep(.q-btn) {
    flex: 1;
  }
}
</style>
