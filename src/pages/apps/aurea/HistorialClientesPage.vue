<template>
  <q-page class="q-pa-md historial-clientes-page">

    <!-- HERO -->
    <div class="page-hero q-mb-lg">
      <div>
        <div class="hero-badge">
          Historial inteligente
        </div>

        <div class="text-h4 text-weight-bold text-white q-mt-sm">
          📜 Historial de Clientes
        </div>

        <div class="text-subtitle2 text-white">
          Busca por nombre o teléfono y revisa citas, pagos y actividad del cliente.
        </div>
      </div>
    </div>

    <!-- BUSCADOR -->
    <q-card class="search-card q-mb-lg">
      <div class="row q-col-gutter-md items-center">

        <div class="col-12 col-md">
          <q-select
            v-model="buscar"
            :options="opcionesClientes"
            option-label="nombre"
            option-value="nombre"
            emit-value
            map-options
            use-input
            fill-input
            hide-selected
            clearable
            input-debounce="0"
            label="Buscar por nombre o teléfono..."
            outlined
            rounded
            bg-color="white"
            @filter="filtrarClientes"
            @input-value="actualizarTextoBusqueda"
            @update:model-value="seleccionarCliente"
            @keyup.enter="buscarHistorial"
          >
            <template #prepend>
              <q-icon name="search" color="pink" />
            </template>

            <template #option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-avatar color="pink" text-color="white" icon="person" />
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-weight-bold">
                    {{ scope.opt.nombre }}
                  </q-item-label>

                  <q-item-label caption>
                    {{ scope.opt.telefono || 'Sin teléfono' }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>

            <template #no-option>
              <q-item>
                <q-item-section class="text-grey">
                  No se encontraron clientes con esa inicial o nombre
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <div class="col-12 col-md-auto">
          <q-btn
            class="btn-glamur full-width"
            icon="search"
            label="Buscar"
            :loading="loading"
            @click="buscarHistorial"
          />
        </div>

      </div>
    </q-card>

    <q-linear-progress
      v-if="loading"
      indeterminate
      color="pink"
      class="q-mb-md"
    />

    <!-- ESTADO VACÍO -->
    <div
      v-if="!loading && resultados.length === 0"
      class="empty-state"
    >
      <q-icon
        :name="busquedaRealizada ? 'person_search' : 'manage_search'"
        size="86px"
        color="pink-4"
      />

      <div class="text-h5 text-weight-bold text-pink-7 q-mt-md">
        {{ busquedaRealizada ? 'No se encontró el cliente' : 'Busca un cliente' }}
      </div>

      <div class="text-grey-7">
        {{ busquedaRealizada
          ? 'Intenta escribir otra inicial, nombre completo o teléfono.'
          : 'Escribe una inicial, nombre o teléfono para ver su historial completo.'
        }}
      </div>
    </div>

    <!-- RESULTADOS -->
    <div
      v-for="cliente in resultados"
      :key="cliente.id"
      class="cliente-card q-mb-lg"
    >

      <!-- CABECERA CLIENTE -->
      <div class="cliente-header">

        <div class="row items-center q-col-gutter-md">

          <div class="col-12 col-md">
            <div class="row items-center no-wrap">
              <q-avatar
                size="64px"
                class="cliente-avatar"
              >
                <q-icon name="person" size="36px" color="white" />
              </q-avatar>

              <div class="q-ml-md">
                <div class="cliente-nombre">
                  {{ cliente.nombre }}
                </div>

                <div class="cliente-info">
                  📞 {{ cliente.telefono || 'Sin teléfono' }}
                </div>
              </div>
            </div>
          </div>

          <div class="col-6 col-md-2">
            <div class="stat-box pink-box">
              <div class="stat-number">
                {{ cliente.total_citas || 0 }}
              </div>
              <div class="stat-label">
                Citas
              </div>
            </div>
          </div>

          <div class="col-6 col-md-2">
            <div class="stat-box orange-box">
              <div class="stat-number">
                {{ cliente.citas_pendientes || 0 }}
              </div>
              <div class="stat-label">
                Pendientes
              </div>
            </div>
          </div>

          <div class="col-6 col-md-2">
            <div class="stat-box green-box">
              <div class="stat-number">
                {{ cliente.citas_concluidas || 0 }}
              </div>
              <div class="stat-label">
                Concluidas
              </div>
            </div>
          </div>

          <div class="col-6 col-md-2">
            <div class="stat-box money-box">
              <div class="stat-number">
                Bs {{ money(cliente.total_pagado) }}
              </div>
              <div class="stat-label">
                Pagado
              </div>
            </div>
          </div>

        </div>

      </div>

      <!-- TABS -->
      <q-tabs
        v-model="tabs[cliente.id]"
        dense
        active-color="pink"
        indicator-color="pink"
        align="left"
        class="cliente-tabs"
      >
        <q-tab
          name="citas"
          icon="event"
          label="Citas"
        />

        <q-tab
          name="pagos"
          icon="payments"
          label="Pagos"
        />
      </q-tabs>

      <q-separator />

      <q-tab-panels
        v-model="tabs[cliente.id]"
        animated
        class="tab-panels"
      >

        <!-- CITAS -->
        <q-tab-panel name="citas">
          <q-table
            class="tabla-glamur"
            :rows="cliente.citas || []"
            :columns="columnsCitas"
            row-key="id"
            flat
            bordered
            dense
            no-data-label="Este cliente no tiene citas registradas"
            :rows-per-page-options="[5, 10, 20]"
          >
            <template #body-cell-precio="props">
              <q-td :props="props">
                <b class="text-green-8">
                  Bs {{ money(props.row.precio) }}
                </b>
              </q-td>
            </template>

            <template #body-cell-estado="props">
              <q-td :props="props">
                <q-badge
                  rounded
                  :color="colorEstado(props.row.estado)"
                  class="estado-badge"
                >
                  {{ props.row.estado || 'pendiente' }}
                </q-badge>
              </q-td>
            </template>

            <template #body-cell-estado_pago="props">
              <q-td :props="props">
                <q-badge
                  rounded
                  :color="props.row.estado_pago === 'pagado' ? 'green' : 'red'"
                  class="estado-badge"
                >
                  {{ props.row.estado_pago || 'pendiente' }}
                </q-badge>
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>

        <!-- PAGOS -->
        <q-tab-panel name="pagos">
          <q-table
            class="tabla-glamur"
            :rows="cliente.pagos || []"
            :columns="columnsPagos"
            row-key="id"
            flat
            bordered
            dense
            no-data-label="Este cliente no tiene pagos registrados"
            :rows-per-page-options="[5, 10, 20]"
          >
            <template #body-cell-monto="props">
              <q-td :props="props">
                <b class="text-green-8">
                  Bs {{ money(props.row.monto) }}
                </b>
              </q-td>
            </template>

            <template #body-cell-metodo="props">
              <q-td :props="props">
                <q-badge
                  rounded
                  color="blue"
                  class="estado-badge"
                >
                  {{ mostrarMetodo(props.row.metodo) }}
                </q-badge>
              </q-td>
            </template>

            <template #body-cell-estado="props">
              <q-td :props="props">
                <q-badge
                  rounded
                  color="green"
                  class="estado-badge"
                >
                  {{ props.row.estado || 'pagado' }}
                </q-badge>
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>

      </q-tab-panels>

    </div>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '@/boot/axios'

defineOptions({
  name: 'HistorialClientesPage'
})

const $q = useQuasar()

const buscar = ref('')
const textoBusqueda = ref('')
const loading = ref(false)
const busquedaRealizada = ref(false)

const clientesBase = ref([])
const opcionesClientes = ref([])
const resultados = ref([])
const tabs = ref({})

const columnsCitas = [
  {
    name: 'fecha',
    label: 'Fecha',
    field: row => formatDate(row.fecha),
    align: 'left',
    sortable: true
  },
  {
    name: 'hora',
    label: 'Hora',
    field: row => formatTime(row.hora),
    align: 'left'
  },
  {
    name: 'servicio',
    label: 'Servicio',
    field: row => row.servicio || 'Sin servicio',
    align: 'left'
  },
  {
    name: 'precio',
    label: 'Precio',
    field: 'precio',
    align: 'left'
  },
  {
    name: 'estado',
    label: 'Estado',
    field: 'estado',
    align: 'center'
  },
  {
    name: 'estado_pago',
    label: 'Pago',
    field: 'estado_pago',
    align: 'center'
  }
]

const columnsPagos = [
  {
    name: 'fecha_pago',
    label: 'Fecha',
    field: row => formatDateTime(row.fecha_pago),
    align: 'left',
    sortable: true
  },
  {
    name: 'servicio',
    label: 'Servicio',
    field: row => row.servicio || row.cita?.servicio || 'Sin servicio',
    align: 'left'
  },
  {
    name: 'monto',
    label: 'Monto',
    field: 'monto',
    align: 'left'
  },
  {
    name: 'metodo',
    label: 'Método',
    field: 'metodo',
    align: 'center'
  },
  {
    name: 'estado',
    label: 'Estado',
    field: 'estado',
    align: 'center'
  }
]

function normalizar(texto) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function money(value) {
  return Number(value || 0).toFixed(2)
}

function formatDate(value) {
  if (!value) return 'Sin fecha'

  const date = String(value).slice(0, 10)
  const [year, month, day] = date.split('-')

  if (!year || !month || !day) return value

  return `${day}/${month}/${year}`
}

function formatTime(value) {
  if (!value) return 'Sin hora'

  return String(value).slice(0, 5)
}

function formatDateTime(value) {
  if (!value) return 'Sin fecha'

  const text = String(value)
  const fecha = formatDate(text.slice(0, 10))
  const hora = text.length > 10 ? text.slice(11, 16) : ''

  return hora ? `${fecha} ${hora}` : fecha
}

function colorEstado(estado) {
  if (estado === 'concluida') return 'green'
  if (estado === 'cancelada') return 'red'
  return 'orange'
}

function mostrarMetodo(metodo) {
  if (metodo === 'qr') return 'QR'
  if (metodo === 'efectivo') return 'Efectivo'
  if (metodo === 'transferencia') return 'Transferencia'

  return metodo || 'No definido'
}

function getErrorMessage(error) {
  const data = error?.response?.data

  if (data?.errors) {
    return Object.values(data.errors).flat().join(' ')
  }

  return data?.message || data?.error || 'Ocurrió un error'
}

async function cargarClientes() {
  try {
    const { data } = await api.get('/apps/aurea/clientes')

    clientesBase.value = Array.isArray(data)
      ? data
      : (data?.data || [])

    clientesBase.value = clientesBase.value
      .map(cliente => ({
        ...cliente,
        nombre: cliente.nombre || 'Sin nombre',
        telefono: cliente.telefono || ''
      }))
      .sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), 'es', {
        sensitivity: 'base'
      }))

    opcionesClientes.value = clientesBase.value.slice(0, 20)
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(error)
    })
  }
}

function actualizarTextoBusqueda(value) {
  textoBusqueda.value = value || ''
}

function filtrarClientes(value, update) {
  textoBusqueda.value = value || ''

  update(() => {
    const needle = normalizar(value)

    if (!needle) {
      opcionesClientes.value = clientesBase.value.slice(0, 20)
      return
    }

    opcionesClientes.value = clientesBase.value
      .filter(cliente => {
        const textoCliente = normalizar(`${cliente.nombre} ${cliente.telefono}`)
        return textoCliente.includes(needle)
      })
      .slice(0, 20)
  })
}

function seleccionarCliente(value) {
  if (!value) return

  buscar.value = value
  textoBusqueda.value = value
  buscarHistorial()
}

async function buscarHistorial() {
  const texto = String(textoBusqueda.value || buscar.value || '').trim()

  if (!texto) {
    $q.notify({
      type: 'warning',
      message: 'Escribe una inicial, nombre o teléfono para buscar'
    })

    return
  }

  loading.value = true
  busquedaRealizada.value = true

  try {
    const { data } = await api.get('/clientes/historial/buscar', {
      params: {
        buscar: texto
      }
    })

    resultados.value = Array.isArray(data?.clientes)
      ? data.clientes
      : []

    tabs.value = {}

    resultados.value.forEach(cliente => {
      tabs.value[cliente.id] = 'citas'
    })

    if (resultados.value.length === 0) {
      $q.notify({
        type: 'warning',
        message: 'No se encontraron clientes'
      })
    }
  } catch (error) {
    resultados.value = []

    if (error?.response?.status === 404) {
      $q.notify({
        type: 'warning',
        message: 'No se encontraron clientes con esa búsqueda'
      })
    } else {
      $q.notify({
        type: 'negative',
        message: getErrorMessage(error)
      })
    }
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await cargarClientes()
})
</script>

<style scoped>
.historial-clientes-page {
  min-height: 100vh;
  background: #faf7fb;
}

.page-hero {
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.18), transparent 28%),
    linear-gradient(135deg, #15111f, #e91e63 70%, #9c27b0);

  border-radius: 28px;
  padding: 32px;

  box-shadow:
    0 18px 45px rgba(233, 30, 99, 0.28);
}

.hero-badge {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 999px;
  color: white;
  font-weight: 900;
  background: rgba(255, 255, 255, 0.16);
}

.search-card {
  border-radius: 26px;
  padding: 18px;
  background: white;

  box-shadow:
    0 14px 35px rgba(156, 39, 176, 0.13);
}

.btn-glamur {
  min-height: 48px;
  padding: 0 28px;
  border-radius: 18px;
  color: white;
  font-weight: 900;

  background:
    linear-gradient(135deg, #e91e63, #9c27b0);

  box-shadow:
    0 14px 28px rgba(233, 30, 99, 0.28);
}

.empty-state {
  min-height: 320px;
  display: grid;
  place-items: center;
  text-align: center;
  align-content: center;
}

.cliente-card {
  border-radius: 28px;
  overflow: hidden;
  background: white;

  box-shadow:
    0 14px 35px rgba(156, 39, 176, 0.13);
}

.cliente-header {
  padding: 24px;
}

.cliente-avatar {
  background:
    linear-gradient(135deg, #e91e63, #9c27b0);

  box-shadow:
    0 12px 28px rgba(233, 30, 99, 0.32);
}

.cliente-nombre {
  font-size: 24px;
  font-weight: 900;
  color: #171122;
}

.cliente-info {
  margin-top: 4px;
  font-size: 13px;
  color: #6b6472;
}

.stat-box {
  min-height: 80px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  text-align: center;
  padding: 10px;
}

.stat-number {
  font-size: 22px;
  font-weight: 900;
}

.stat-label {
  font-size: 12px;
  font-weight: 800;
}

.pink-box {
  background: #fce4ec;
  color: #c2185b;
}

.orange-box {
  background: #fff3e0;
  color: #ef6c00;
}

.green-box {
  background: #e8f5e9;
  color: #2e7d32;
}

.money-box {
  background: #e0f2f1;
  color: #00796b;
}

.cliente-tabs {
  padding: 0 18px;
}

.tab-panels {
  background: white;
}

.tabla-glamur {
  border-radius: 18px;
  overflow: hidden;
}

.tabla-glamur :deep(.q-table thead tr) {
  background:
    linear-gradient(135deg, #fce4ec, #f3e5f5);

  color: #880e4f;
}

.tabla-glamur :deep(.q-table th) {
  font-weight: 900;
}

.estado-badge {
  padding: 6px 10px;
  font-weight: 800;
  text-transform: capitalize;
}

@media (max-width: 600px) {
  .historial-clientes-page {
    padding: 10px;
  }

  .page-hero {
    padding: 22px;
    border-radius: 22px;
  }

  .page-hero .text-h4 {
    font-size: 26px;
  }

  .search-card {
    padding: 14px;
    border-radius: 22px;
  }

  .cliente-header {
    padding: 18px;
  }

  .cliente-nombre {
    font-size: 20px;
  }

  .stat-box {
    min-height: 74px;
  }
}
</style>