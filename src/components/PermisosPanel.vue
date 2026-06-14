<template>
  <div class="permisos-panel">
    <div class="panel-header">
      <div>
        <h2>Permisos</h2>
        <p>Controla qué módulos tiene cada empresa y qué módulos puede usar cada empleado</p>
      </div>
    </div>

    <q-tabs
      v-model="tab"
      dense
      align="left"
      active-color="white"
      indicator-color="purple-4"
      class="tabs-permisos"
    >
      <q-tab name="empresa" icon="business" label="Empresa → Módulos" />
      <q-tab name="usuario" icon="person" label="Usuario → Módulos" />
    </q-tabs>

    <q-tab-panels v-model="tab" animated class="tab-panels">
      <!-- EMPRESA MODULOS -->
      <q-tab-panel name="empresa">
        <q-card class="panel-card">
          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-5">
                <q-select
                  v-model="empresaSeleccionada"
                  :options="empresasOptions"
                  label="Seleccionar empresa"
                  dark
                  outlined
                  emit-value
                  map-options
                  @update:model-value="cargarPermisosEmpresa"
                />
              </div>

              <div class="col-12 col-md-7 flex items-center">
                <q-btn
                  label="Guardar módulos de empresa"
                  icon="save"
                  class="btn-primary"
                  :loading="guardandoEmpresa"
                  :disable="!empresaSeleccionada"
                  @click="guardarPermisosEmpresa"
                />
              </div>
            </div>
          </q-card-section>

          <q-separator dark />

          <q-card-section v-if="empresaSeleccionada">
            <div class="modulos-grid">
              <q-card
                v-for="modulo in modulos"
                :key="modulo.id"
                class="modulo-card"
                :class="{ activo: modulosEmpresaSeleccionados.includes(modulo.id) }"
                @click="toggleModuloEmpresa(modulo.id)"
              >
                <div class="row items-center no-wrap">
                  <q-checkbox
                    :model-value="modulosEmpresaSeleccionados.includes(modulo.id)"
                    color="purple"
                    dark
                    @click.stop
                    @update:model-value="toggleModuloEmpresa(modulo.id)"
                  />

                  <q-icon :name="modulo.icono" size="32px" class="q-mx-md" />

                  <div>
                    <div class="modulo-nombre">{{ modulo.nombre }}</div>
                    <div class="modulo-ruta">{{ modulo.ruta_frontend }}</div>
                  </div>
                </div>
              </q-card>
            </div>
          </q-card-section>

          <q-card-section v-else>
            <div class="empty">
              Selecciona una empresa para asignar sus módulos.
            </div>
          </q-card-section>
        </q-card>
      </q-tab-panel>

      <!-- USUARIO MODULOS -->
      <q-tab-panel name="usuario">
        <q-card class="panel-card">
          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-5">
                <q-select
                  v-model="usuarioSeleccionado"
                  :options="usuariosOptions"
                  label="Seleccionar usuario"
                  dark
                  outlined
                  emit-value
                  map-options
                  @update:model-value="cargarPermisosUsuario"
                />
              </div>

              <div class="col-12 col-md-7 flex items-center">
                <q-btn
                  label="Guardar módulos del usuario"
                  icon="save"
                  class="btn-primary"
                  :loading="guardandoUsuario"
                  :disable="!usuarioSeleccionado"
                  @click="guardarPermisosUsuario"
                />
              </div>
            </div>
          </q-card-section>

          <q-separator dark />

          <q-card-section v-if="usuarioSeleccionado">
            <div v-if="usuarioActual" class="usuario-info q-mb-md">
              <q-icon name="person" />
              <span>{{ usuarioActual.nombre }}</span>
              <q-badge color="purple" rounded>{{ usuarioActual.rol }}</q-badge>
              <q-badge color="blue" rounded>{{ usuarioActual.empresa?.nombre || 'Sin empresa' }}</q-badge>
            </div>

            <div v-if="usuarioActual?.rol === 'super_admin'" class="empty">
              El super administrador siempre tiene acceso a todos los módulos.
            </div>

            <div v-else-if="usuarioActual?.rol === 'administrador'" class="empty">
              El administrador ve todos los módulos asignados a su empresa. Para limitar módulos, usa la pestaña Empresa → Módulos.
            </div>

            <div v-else class="modulos-grid">
              <q-card
                v-for="modulo in modulosUsuarioDisponibles"
                :key="modulo.id"
                class="modulo-card"
                :class="{ activo: modulosUsuarioSeleccionados.includes(modulo.id) }"
                @click="toggleModuloUsuario(modulo.id)"
              >
                <div class="row items-center no-wrap">
                  <q-checkbox
                    :model-value="modulosUsuarioSeleccionados.includes(modulo.id)"
                    color="purple"
                    dark
                    @click.stop
                    @update:model-value="toggleModuloUsuario(modulo.id)"
                  />

                  <q-icon :name="modulo.icono" size="32px" class="q-mx-md" />

                  <div>
                    <div class="modulo-nombre">{{ modulo.nombre }}</div>
                    <div class="modulo-ruta">{{ modulo.ruta_frontend }}</div>
                  </div>
                </div>
              </q-card>
            </div>
          </q-card-section>

          <q-card-section v-else>
            <div class="empty">
              Selecciona un usuario empleado para asignarle módulos.
            </div>
          </q-card-section>
        </q-card>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const API_URL = import.meta.env.VITE_API_URL || 'https://agr-platform-backend-2.onrender.com/api'

const tab = ref('empresa')

const empresas = ref([])
const usuarios = ref([])
const modulos = ref([])

const empresasOptions = ref([])
const usuariosOptions = ref([])

const empresaSeleccionada = ref(null)
const usuarioSeleccionado = ref(null)

const modulosEmpresaSeleccionados = ref([])
const modulosUsuarioSeleccionados = ref([])
const modulosUsuarioDisponibles = ref([])

const guardandoEmpresa = ref(false)
const guardandoUsuario = ref(false)

const usuarioActual = computed(() => {
  return usuarios.value.find((usuario) => Number(usuario.id) === Number(usuarioSeleccionado.value)) || null
})

function token() {
  return localStorage.getItem('agr_token')
}

function headers(json = false) {
  const base = {
    Accept: 'application/json',
    Authorization: `Bearer ${token()}`
  }

  if (json) {
    base['Content-Type'] = 'application/json'
  }

  return base
}

function getErrorMessage(data, fallback) {
  if (data?.errors) {
    return Object.values(data.errors).flat().join(' ')
  }

  return data?.message || fallback
}

async function cargarEmpresas() {
  const response = await fetch(`${API_URL}/empresas`, {
    headers: headers()
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(getErrorMessage(data, 'No se pudieron cargar las empresas'))
  }

  empresas.value = Array.isArray(data) ? data : data.data || []

  empresasOptions.value = empresas.value.map((empresa) => ({
    label: empresa.nombre,
    value: empresa.id
  }))
}

async function cargarUsuarios() {
  const response = await fetch(`${API_URL}/usuarios-sistema`, {
    headers: headers()
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(getErrorMessage(data, 'No se pudieron cargar los usuarios'))
  }

  usuarios.value = Array.isArray(data) ? data : data.data || []

  usuariosOptions.value = usuarios.value.map((usuario) => ({
    label: `${usuario.nombre} · ${usuario.rol} · ${usuario.empresa?.nombre || 'Sin empresa'}`,
    value: usuario.id
  }))
}

async function cargarModulos() {
  const response = await fetch(`${API_URL}/modulos`, {
    headers: headers()
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(getErrorMessage(data, 'No se pudieron cargar los módulos'))
  }

  modulos.value = Array.isArray(data) ? data : data.data || []
}

async function cargarPermisosEmpresa() {
  if (!empresaSeleccionada.value) return

  const response = await fetch(
    `${API_URL}/empresas/${empresaSeleccionada.value}/modulos`,
    {
      headers: headers()
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(getErrorMessage(data, 'No se pudieron cargar los permisos de empresa'))
  }

  modulosEmpresaSeleccionados.value = (Array.isArray(data) ? data : data.modulos || [])
    .map((modulo) => Number(modulo.id))
}

function toggleModuloEmpresa(id) {
  const moduloId = Number(id)

  if (modulosEmpresaSeleccionados.value.includes(moduloId)) {
    modulosEmpresaSeleccionados.value = modulosEmpresaSeleccionados.value.filter(
      (item) => item !== moduloId
    )
  } else {
    modulosEmpresaSeleccionados.value.push(moduloId)
  }
}

async function guardarPermisosEmpresa() {
  if (!empresaSeleccionada.value) {
    $q.notify({
      type: 'warning',
      message: 'Selecciona una empresa'
    })
    return
  }

  guardandoEmpresa.value = true

  try {
    const response = await fetch(
      `${API_URL}/empresas/${empresaSeleccionada.value}/modulos`,
      {
        method: 'POST',
        headers: headers(true),
        body: JSON.stringify({
          modulos: modulosEmpresaSeleccionados.value
        })
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(getErrorMessage(data, 'No se pudieron guardar los módulos de la empresa'))
    }

    $q.notify({
      type: 'positive',
      message: data.message || 'Módulos de empresa actualizados correctamente'
    })

    if (usuarioSeleccionado.value) {
      await cargarPermisosUsuario()
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message
    })
  } finally {
    guardandoEmpresa.value = false
  }
}

async function cargarPermisosUsuario() {
  if (!usuarioSeleccionado.value) return

  const response = await fetch(
    `${API_URL}/usuarios-sistema/${usuarioSeleccionado.value}/modulos`,
    {
      headers: headers()
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(getErrorMessage(data, 'No se pudieron cargar los permisos del usuario'))
  }

  modulosUsuarioSeleccionados.value = (data.modulos_asignados || []).map((id) => Number(id))
  modulosUsuarioDisponibles.value = Array.isArray(data.modulos_empresa)
    ? data.modulos_empresa
    : []
}

function toggleModuloUsuario(id) {
  if (usuarioActual.value?.rol !== 'empleado') {
    return
  }

  const moduloId = Number(id)

  if (modulosUsuarioSeleccionados.value.includes(moduloId)) {
    modulosUsuarioSeleccionados.value = modulosUsuarioSeleccionados.value.filter(
      (item) => item !== moduloId
    )
  } else {
    modulosUsuarioSeleccionados.value.push(moduloId)
  }
}

async function guardarPermisosUsuario() {
  if (!usuarioSeleccionado.value) {
    $q.notify({
      type: 'warning',
      message: 'Selecciona un usuario'
    })
    return
  }

  if (usuarioActual.value?.rol !== 'empleado') {
    $q.notify({
      type: 'warning',
      message: 'Solo los empleados necesitan permisos individuales por módulo'
    })
    return
  }

  guardandoUsuario.value = true

  try {
    const response = await fetch(
      `${API_URL}/usuarios-sistema/${usuarioSeleccionado.value}/modulos`,
      {
        method: 'POST',
        headers: headers(true),
        body: JSON.stringify({
          modulos: modulosUsuarioSeleccionados.value
        })
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(getErrorMessage(data, 'No se pudieron guardar los módulos del usuario'))
    }

    $q.notify({
      type: 'positive',
      message: data.message || 'Permisos del usuario actualizados correctamente'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message
    })
  } finally {
    guardandoUsuario.value = false
  }
}

onMounted(async () => {
  try {
    await Promise.all([
      cargarEmpresas(),
      cargarUsuarios(),
      cargarModulos()
    ])
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message
    })
  }
})
</script>

<style scoped>
.permisos-panel {
  margin-top: 42px;
  margin-bottom: 80px;
}

.panel-header {
  margin-bottom: 18px;
}

.panel-header h2 {
  margin: 0;
  font-size: 32px;
  font-weight: 900;
}

.panel-header p {
  margin: 4px 0 0;
  opacity: 0.65;
}

.tabs-permisos {
  color: white;
  margin-bottom: 14px;
  background: rgba(15, 23, 42, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  overflow: hidden;
}

.tab-panels {
  background: transparent;
}

.panel-card {
  background: rgba(15, 23, 42, 0.92);
  color: white;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.btn-primary {
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  color: white;
  border-radius: 12px;
  font-weight: 700;
}

.modulos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 18px;
}

.modulo-card {
  cursor: pointer;
  padding: 18px;
  border-radius: 18px;
  color: white;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.12);
  transition: 0.2s ease;
}

.modulo-card.activo {
  border-color: #8b5cf6;
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.35);
}

.modulo-card:hover {
  transform: translateY(-3px);
  background: rgba(51, 65, 85, 0.85);
}

.modulo-nombre {
  font-weight: 900;
  font-size: 16px;
}

.modulo-ruta {
  opacity: 0.6;
  font-size: 12px;
}

.usuario-info {
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  background: rgba(30, 41, 59, 0.85);
  border-radius: 16px;
  padding: 12px 14px;
}

.usuario-info span {
  font-weight: 900;
}

.empty {
  opacity: 0.7;
  background: rgba(30, 41, 59, 0.75);
  border-radius: 16px;
  padding: 18px;
  color: white;
}
</style>