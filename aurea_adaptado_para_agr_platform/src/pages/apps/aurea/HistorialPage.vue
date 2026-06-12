<template>
  <q-page class="q-pa-lg historial-page">

    <!-- HERO -->
    <section class="historial-hero q-mb-lg">
      <div>
        <div class="hero-badge">
          Papelera inteligente
        </div>

        <div class="text-h4 text-weight-bold text-white q-mt-sm">
          🕘 Historial AUREA
        </div>

        <div class="text-subtitle2 text-white hero-subtitle">
          Recupera, revisa o elimina definitivamente clientes, citas y pagos
        </div>
      </div>

      <div class="hero-actions">
        <q-btn
          class="btn-white"
          icon="refresh"
          label="Actualizar"
          unelevated
          rounded
          :loading="loading"
          @click="loadAll"
        />

        <q-btn
          class="btn-danger-soft"
          icon="delete_sweep"
          label="Limpiar todo"
          unelevated
          rounded
          :disable="totalOriginal === 0"
          @click="confirmarLimpiarHistorial"
        />
      </div>
    </section>

    <q-linear-progress
      v-if="loading"
      indeterminate
      color="pink"
      class="q-mb-md"
    />

    <!-- RESUMEN -->
    <div class="row q-col-gutter-md q-mb-md">
      <div
        v-for="card in resumenCards"
        :key="card.titulo"
        class="col-12 col-sm-6 col-md-4 col-lg-2"
      >
        <q-card class="summary-card">
          <q-card-section>
            <div class="row items-center justify-between no-wrap">
              <div class="summary-info">
                <div class="summary-title">
                  {{ card.titulo }}
                </div>

                <div class="summary-value">
                  {{ card.valor }}
                </div>

                <div class="summary-detail">
                  {{ card.detalle }}
                </div>
              </div>

              <q-avatar :class="card.clase" size="48px">
                <q-icon :name="card.icono" color="white" size="25px" />
              </q-avatar>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- FILTROS -->
    <q-card class="filters-card q-mb-lg">
      <q-card-section>
        <div class="filters-header q-mb-md">
          <div>
            <div class="filters-title">
              🔎 Buscar y filtrar historial
            </div>

            <div class="filters-subtitle">
              Busca por cliente, teléfono, servicio, fecha, monto o método de pago
            </div>
          </div>

          <q-btn
            flat
            rounded
            icon="cleaning_services"
            label="Limpiar filtros"
            color="pink-7"
            @click="limpiarFiltros"
          />
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-5">
            <q-input
              v-model="busqueda"
              outlined
              rounded
              dense
              clearable
              debounce="250"
              bg-color="white"
              placeholder="Buscar en todo el historial..."
            >
              <template #prepend>
                <q-icon name="search" color="pink" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-select
              v-model="filtroTipo"
              :options="opcionesTipo"
              outlined
              rounded
              dense
              emit-value
              map-options
              bg-color="white"
              label="Tipo"
            >
              <template #prepend>
                <q-icon name="category" color="purple" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-sm-6 col-md-2">
            <q-select
              v-model="filtroRango"
              :options="opcionesRango"
              outlined
              rounded
              dense
              emit-value
              map-options
              bg-color="white"
              label="Eliminado"
            >
              <template #prepend>
                <q-icon name="date_range" color="green" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-2">
            <q-badge class="result-badge" rounded>
              {{ totalFiltrado }} de {{ totalOriginal }}
            </q-badge>
          </div>
        </div>

        <div
          v-if="filtroRango === 'personalizado'"
          class="row q-col-gutter-md q-mt-sm"
        >
          <div class="col-12 col-sm-6">
            <q-input
              v-model="fechaDesde"
              type="date"
              outlined
              rounded
              dense
              bg-color="white"
              label="Desde"
            >
              <template #prepend>
                <q-icon name="event" color="pink" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-sm-6">
            <q-input
              v-model="fechaHasta"
              type="date"
              outlined
              rounded
              dense
              bg-color="white"
              label="Hasta"
            >
              <template #prepend>
                <q-icon name="event_available" color="pink" />
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- CLIENTES ELIMINADOS -->
    <q-card
      v-if="mostrarClientes"
      class="historial-card q-mb-xl"
    >
      <q-card-section class="section-header">
        <div>
          <div class="text-h5 text-weight-bold">
            👥 Clientes eliminados
          </div>

          <div class="text-grey-7">
            Clientes enviados al historial
          </div>
        </div>

        <q-badge class="count-badge" rounded>
          {{ clientesFiltrados.length }} / {{ clientesEliminados.length }}
        </q-badge>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-none">
        <q-table
          class="tabla-glamur"
          :rows="clientesFiltrados"
          :columns="columnsClientes"
          row-key="id"
          :loading="loadingClientes"
          no-data-label="No hay clientes eliminados con esos filtros"
          flat
          bordered
          :rows-per-page-options="[5, 10, 20, 50]"
        >
          <template #body-cell-nombre="props">
            <q-td :props="props">
              <div class="cliente-cell">
                <q-avatar class="avatar-pink" size="38px">
                  <q-icon name="person" color="white" />
                </q-avatar>

                <div>
                  <div class="text-weight-bold text-pink-7">
                    {{ props.row.nombre || 'Sin nombre' }}
                  </div>

                  <div class="text-caption text-grey-7">
                    Cliente eliminado
                  </div>
                </div>
              </div>
            </q-td>
          </template>

          <template #body-cell-telefono="props">
            <q-td :props="props">
              <div class="telefono-box">
                <q-icon name="phone" color="green" size="18px" />
                <span>{{ props.row.telefono || 'Sin teléfono' }}</span>
              </div>
            </q-td>
          </template>

          <template #body-cell-deleted_at="props">
            <q-td :props="props">
              <div class="fecha-box">
                <q-icon name="delete_clock" color="orange" size="18px" />
                <span>{{ formatDate(props.row.deleted_at) }}</span>
              </div>
            </q-td>
          </template>

          <template #body-cell-actions="props">
            <q-td :props="props" class="text-center">
              <div class="acciones">
                <q-btn
                  round
                  unelevated
                  size="sm"
                  color="positive"
                  icon="restore"
                  @click="recuperarCliente(props.row)"
                >
                  <q-tooltip>Recuperar cliente</q-tooltip>
                </q-btn>

                <q-btn
                  round
                  unelevated
                  size="sm"
                  color="negative"
                  icon="delete_forever"
                  @click="eliminarClienteDefinitivo(props.row)"
                >
                  <q-tooltip>Eliminar definitivamente</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- CITAS / SERVICIOS ELIMINADOS -->
    <q-card
      v-if="mostrarCitas"
      class="historial-card q-mb-xl"
    >
      <q-card-section class="section-header">
        <div>
          <div class="text-h5 text-weight-bold">
            📅 Citas / servicios borrados
          </div>

          <div class="text-grey-7">
            Citas eliminadas que pueden recuperarse o eliminarse definitivamente
          </div>
        </div>

        <q-badge class="count-badge purple" rounded>
          {{ citasFiltradas.length }} / {{ citasEliminadas.length }}
        </q-badge>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-none">
        <q-table
          class="tabla-glamur"
          :rows="citasFiltradas"
          :columns="columnsCitas"
          row-key="id"
          :loading="loadingCitas"
          no-data-label="No hay citas eliminadas con esos filtros"
          flat
          bordered
          :rows-per-page-options="[5, 10, 20, 50]"
        >
          <template #body-cell-servicio="props">
            <q-td :props="props">
              <div class="text-weight-bold text-purple-7">
                {{ props.row.servicio || 'Sin servicio' }}
              </div>

              <div class="text-caption text-grey-7">
                Cliente: {{ clienteCita(props.row) }}
              </div>
            </q-td>
          </template>

          <template #body-cell-fecha="props">
            <q-td :props="props">
              <div class="fecha-box">
                <q-icon name="event" color="pink" size="18px" />
                <span>{{ formatFechaSimple(props.row.fecha) }}</span>
              </div>
            </q-td>
          </template>

          <template #body-cell-precio="props">
            <q-td :props="props">
              <div class="text-weight-bold text-green-8">
                Bs {{ money(props.row.precio) }}
              </div>
            </q-td>
          </template>

          <template #body-cell-deleted_at="props">
            <q-td :props="props">
              <div class="fecha-box">
                <q-icon name="delete_clock" color="orange" size="18px" />
                <span>{{ formatDate(props.row.deleted_at) }}</span>
              </div>
            </q-td>
          </template>

          <template #body-cell-actions="props">
            <q-td :props="props" class="text-center">
              <div class="acciones">
                <q-btn
                  round
                  unelevated
                  size="sm"
                  color="positive"
                  icon="restore"
                  @click="recuperarCita(props.row)"
                >
                  <q-tooltip>Recuperar cita</q-tooltip>
                </q-btn>

                <q-btn
                  round
                  unelevated
                  size="sm"
                  color="negative"
                  icon="delete_forever"
                  @click="eliminarCitaDefinitiva(props.row)"
                >
                  <q-tooltip>Eliminar definitivamente</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- PAGOS ELIMINADOS -->
    <q-card
      v-if="mostrarPagos"
      class="historial-card"
    >
      <q-card-section class="section-header">
        <div>
          <div class="text-h5 text-weight-bold">
            💰 Pagos eliminados
          </div>

          <div class="text-grey-7">
            Pagos borrados que pueden recuperarse o eliminarse definitivamente
          </div>
        </div>

        <q-badge class="count-badge green" rounded>
          {{ pagosFiltrados.length }} / {{ pagosEliminados.length }}
        </q-badge>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-none">
        <q-table
          class="tabla-glamur"
          :rows="pagosFiltrados"
          :columns="columnsPagos"
          row-key="id"
          :loading="loadingPagos"
          no-data-label="No hay pagos eliminados con esos filtros"
          flat
          bordered
          :rows-per-page-options="[5, 10, 20, 50]"
        >
          <template #body-cell-cliente="props">
            <q-td :props="props">
              <div class="cliente-cell">
                <q-avatar class="avatar-green" size="38px">
                  <q-icon name="payments" color="white" />
                </q-avatar>

                <div>
                  <div class="text-weight-bold text-pink-7">
                    {{ clientePago(props.row) }}
                  </div>

                  <div class="text-caption text-grey-7">
                    {{ servicioPago(props.row) }}
                  </div>
                </div>
              </div>
            </q-td>
          </template>

          <template #body-cell-monto="props">
            <q-td :props="props">
              <div class="text-weight-bold text-green-8">
                Bs {{ money(montoPago(props.row)) }}
              </div>
            </q-td>
          </template>

          <template #body-cell-metodo="props">
            <q-td :props="props">
              <q-badge
                rounded
                class="status-badge"
                :color="metodoColor(props.row)"
              >
                {{ metodoPago(props.row) }}
              </q-badge>
            </q-td>
          </template>

          <template #body-cell-fecha_pago="props">
            <q-td :props="props">
              <div class="fecha-box">
                <q-icon name="calendar_month" color="pink" size="18px" />
                <span>{{ formatDate(props.row.fecha_pago) }}</span>
              </div>
            </q-td>
          </template>

          <template #body-cell-deleted_at="props">
            <q-td :props="props">
              <div class="fecha-box">
                <q-icon name="delete_clock" color="orange" size="18px" />
                <span>{{ formatDate(props.row.deleted_at) }}</span>
              </div>
            </q-td>
          </template>

          <template #body-cell-actions="props">
            <q-td :props="props" class="text-center">
              <div class="acciones">
                <q-btn
                  round
                  unelevated
                  size="sm"
                  color="positive"
                  icon="restore"
                  @click="recuperarPago(props.row)"
                >
                  <q-tooltip>Recuperar pago</q-tooltip>
                </q-btn>

                <q-btn
                  round
                  unelevated
                  size="sm"
                  color="negative"
                  icon="delete_forever"
                  @click="eliminarPagoDefinitivo(props.row)"
                >
                  <q-tooltip>Eliminar definitivamente</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '@/boot/axios'

defineOptions({
  name: 'HistorialPage'
})

const $q = useQuasar()

const clientesEliminados = ref([])
const citasEliminadas = ref([])
const pagosEliminados = ref([])

const loadingClientes = ref(false)
const loadingCitas = ref(false)
const loadingPagos = ref(false)

const busqueda = ref('')
const filtroTipo = ref('todos')
const filtroRango = ref('todo')
const fechaDesde = ref('')
const fechaHasta = ref('')

const loading = computed(() => {
  return loadingClientes.value || loadingCitas.value || loadingPagos.value
})

const opcionesTipo = [
  { label: 'Todo', value: 'todos' },
  { label: 'Clientes', value: 'clientes' },
  { label: 'Citas / servicios', value: 'citas' },
  { label: 'Pagos', value: 'pagos' }
]

const opcionesRango = [
  { label: 'Todo', value: 'todo' },
  { label: 'Hoy', value: 'hoy' },
  { label: 'Esta semana', value: 'semana' },
  { label: 'Este mes', value: 'mes' },
  { label: 'Este año', value: 'anio' },
  { label: 'Personalizado', value: 'personalizado' }
]

const columnsClientes = [
  {
    name: 'nombre',
    label: 'Cliente',
    field: 'nombre',
    align: 'left',
    sortable: true
  },
  {
    name: 'telefono',
    label: 'Teléfono',
    field: 'telefono',
    align: 'left'
  },
  {
    name: 'deleted_at',
    label: 'Eliminado',
    field: 'deleted_at',
    align: 'left',
    sortable: true
  },
  {
    name: 'actions',
    label: 'Acciones',
    field: 'actions',
    align: 'center'
  }
]

const columnsCitas = [
  {
    name: 'servicio',
    label: 'Servicio',
    field: 'servicio',
    align: 'left',
    sortable: true
  },
  {
    name: 'fecha',
    label: 'Fecha cita',
    field: 'fecha',
    align: 'left',
    sortable: true
  },
  {
    name: 'precio',
    label: 'Precio',
    field: 'precio',
    align: 'left',
    sortable: true
  },
  {
    name: 'deleted_at',
    label: 'Eliminado',
    field: 'deleted_at',
    align: 'left',
    sortable: true
  },
  {
    name: 'actions',
    label: 'Acciones',
    field: 'actions',
    align: 'center'
  }
]

const columnsPagos = [
  {
    name: 'cliente',
    label: 'Cliente / servicio',
    field: row => clientePago(row),
    align: 'left',
    sortable: true
  },
  {
    name: 'monto',
    label: 'Monto',
    field: row => Number(montoPago(row) || 0),
    align: 'left',
    sortable: true
  },
  {
    name: 'metodo',
    label: 'Método',
    field: row => metodoPago(row),
    align: 'left',
    sortable: true
  },
  {
    name: 'fecha_pago',
    label: 'Fecha pago',
    field: 'fecha_pago',
    align: 'left',
    sortable: true
  },
  {
    name: 'deleted_at',
    label: 'Eliminado',
    field: 'deleted_at',
    align: 'left',
    sortable: true
  },
  {
    name: 'actions',
    label: 'Acciones',
    field: 'actions',
    align: 'center'
  }
]

const rutas = {
  historialEliminados: '/historial/eliminados',

  recuperarCliente: id => `/historial/clientes/${id}/restaurar`,
  recuperarCita: id => `/historial/citas/${id}/restaurar`,
  recuperarPago: id => `/historial/pagos/${id}/restaurar`,

  eliminarClienteDefinitivo: id => `/historial/clientes/${id}/eliminar`,
  eliminarCitaDefinitiva: id => `/historial/citas/${id}/eliminar`,
  eliminarPagoDefinitivo: id => `/historial/pagos/${id}/eliminar`,

  limpiarHistorial: '/historial/limpiar'
}

const mostrarClientes = computed(() => {
  return filtroTipo.value === 'todos' || filtroTipo.value === 'clientes'
})

const mostrarCitas = computed(() => {
  return filtroTipo.value === 'todos' || filtroTipo.value === 'citas'
})

const mostrarPagos = computed(() => {
  return filtroTipo.value === 'todos' || filtroTipo.value === 'pagos'
})

const clientesFiltrados = computed(() => {
  return clientesEliminados.value.filter((cliente) => {
    return pasaFiltroFecha(cliente) && pasaBusquedaCliente(cliente)
  })
})

const citasFiltradas = computed(() => {
  return citasEliminadas.value.filter((cita) => {
    return pasaFiltroFecha(cita) && pasaBusquedaCita(cita)
  })
})

const pagosFiltrados = computed(() => {
  return pagosEliminados.value.filter((pago) => {
    return pasaFiltroFecha(pago) && pasaBusquedaPago(pago)
  })
})

const totalOriginal = computed(() => {
  return clientesEliminados.value.length + citasEliminadas.value.length + pagosEliminados.value.length
})

const totalFiltrado = computed(() => {
  let total = 0

  if (mostrarClientes.value) total += clientesFiltrados.value.length
  if (mostrarCitas.value) total += citasFiltradas.value.length
  if (mostrarPagos.value) total += pagosFiltrados.value.length

  return total
})

const totalPagosFiltrados = computed(() => {
  return pagosFiltrados.value.reduce((total, pago) => {
    return total + Number(montoPago(pago) || 0)
  }, 0)
})

const resumenCards = computed(() => [
  {
    titulo: 'Visibles',
    valor: totalFiltrado.value,
    detalle: `De ${totalOriginal.value} registros`,
    icono: 'visibility',
    clase: 'bg-pink-7'
  },
  {
    titulo: 'Clientes',
    valor: clientesFiltrados.value.length,
    detalle: 'Clientes eliminados',
    icono: 'people',
    clase: 'bg-purple-7'
  },
  {
    titulo: 'Citas',
    valor: citasFiltradas.value.length,
    detalle: 'Citas borradas',
    icono: 'event_busy',
    clase: 'bg-orange-7'
  },
  {
    titulo: 'Pagos',
    valor: pagosFiltrados.value.length,
    detalle: 'Pagos eliminados',
    icono: 'payments',
    clase: 'bg-green-7'
  },
  {
    titulo: 'Monto pagos',
    valor: `Bs ${money(totalPagosFiltrados.value)}`,
    detalle: 'Suma de pagos visibles',
    icono: 'account_balance_wallet',
    clase: 'bg-teal-7'
  },
  {
    titulo: 'Filtro',
    valor: tipoActualTexto.value,
    detalle: rangoActualTexto.value,
    icono: 'filter_alt',
    clase: 'bg-indigo-7'
  }
])

const tipoActualTexto = computed(() => {
  const option = opcionesTipo.find(item => item.value === filtroTipo.value)
  return option?.label || 'Todo'
})

const rangoActualTexto = computed(() => {
  const option = opcionesRango.find(item => item.value === filtroRango.value)
  return option?.label || 'Todo'
})

function responseToArray(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.clientes_eliminados)) return data.clientes_eliminados
  if (Array.isArray(data?.citas_eliminadas)) return data.citas_eliminadas
  if (Array.isArray(data?.pagos_eliminados)) return data.pagos_eliminados
  return []
}

function getErrorMessage(error) {
  const data = error?.response?.data

  if (data?.errors) {
    return Object.values(data.errors).flat().join(' ')
  }

  return data?.message || data?.error || error?.message || 'Ocurrió un error'
}

function money(value) {
  return Number(value || 0).toFixed(2)
}

function normalizarTexto(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function fechaISO(value) {
  if (!value) return ''

  return String(value).slice(0, 10)
}

function dateToISO(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

function hoyISO() {
  return dateToISO(new Date())
}

function inicioSemanaISO() {
  const date = new Date()
  const day = date.getDay() || 7
  date.setDate(date.getDate() - day + 1)
  return dateToISO(date)
}

function inicioMesISO() {
  const date = new Date()
  date.setDate(1)
  return dateToISO(date)
}

function inicioAnioISO() {
  const date = new Date()
  date.setMonth(0)
  date.setDate(1)
  return dateToISO(date)
}

function pasaFiltroFecha(row) {
  if (filtroRango.value === 'todo') {
    return true
  }

  const fecha = fechaISO(row.deleted_at)

  if (!fecha) {
    return false
  }

  const hoy = hoyISO()

  if (filtroRango.value === 'hoy') {
    return fecha === hoy
  }

  if (filtroRango.value === 'semana') {
    return fecha >= inicioSemanaISO() && fecha <= hoy
  }

  if (filtroRango.value === 'mes') {
    return fecha >= inicioMesISO() && fecha <= hoy
  }

  if (filtroRango.value === 'anio') {
    return fecha >= inicioAnioISO() && fecha <= hoy
  }

  if (filtroRango.value === 'personalizado') {
    const desde = fechaDesde.value || '0000-01-01'
    const hasta = fechaHasta.value || '9999-12-31'

    return fecha >= desde && fecha <= hasta
  }

  return true
}

function pasaBusquedaCliente(cliente) {
  const texto = normalizarTexto(busqueda.value)

  if (!texto) return true

  return [
    cliente.id,
    cliente.nombre,
    cliente.telefono,
    cliente.deleted_at,
    formatDate(cliente.deleted_at)
  ].some(item => normalizarTexto(item).includes(texto))
}

function pasaBusquedaCita(cita) {
  const texto = normalizarTexto(busqueda.value)

  if (!texto) return true

  return [
    cita.id,
    cita.servicio,
    clienteCita(cita),
    cita.fecha,
    cita.hora,
    cita.precio,
    cita.estado,
    cita.estado_pago,
    cita.deleted_at,
    formatDate(cita.deleted_at)
  ].some(item => normalizarTexto(item).includes(texto))
}

function pasaBusquedaPago(pago) {
  const texto = normalizarTexto(busqueda.value)

  if (!texto) return true

  return [
    pago.id,
    pago.cita_id,
    clientePago(pago),
    servicioPago(pago),
    montoPago(pago),
    metodoPago(pago),
    estadoPago(pago),
    pago.fecha_pago,
    pago.deleted_at,
    formatDate(pago.deleted_at)
  ].some(item => normalizarTexto(item).includes(texto))
}

function clienteCita(cita) {
  return (
    cita?.cliente?.nombre ||
    cita?.cliente_nombre ||
    cita?.nombre_cliente ||
    'Sin cliente'
  )
}

function clientePago(pago) {
  return (
    pago?.cita?.cliente?.nombre ||
    pago?.cliente?.nombre ||
    pago?.cliente_nombre ||
    'Sin cliente'
  )
}

function servicioPago(pago) {
  return (
    pago?.cita?.servicio ||
    pago?.servicio ||
    pago?.servicio_nombre ||
    'Sin servicio'
  )
}

function montoPago(pago) {
  return (
    pago?.monto ||
    pago?.total ||
    pago?.importe ||
    0
  )
}

function metodoPago(pago) {
  return (
    pago?.metodo ||
    pago?.metodo_pago ||
    'No definido'
  )
}

function estadoPago(pago) {
  return (
    pago?.estado ||
    pago?.estado_pago ||
    'Pagado'
  )
}

function metodoColor(pago) {
  const metodo = normalizarTexto(metodoPago(pago))

  if (metodo.includes('efect')) return 'green'
  if (metodo.includes('qr')) return 'purple'
  if (metodo.includes('trans')) return 'blue'
  if (metodo.includes('tarj')) return 'orange'

  return 'grey'
}

function formatFechaSimple(value) {
  if (!value) return 'Sin fecha'

  const partes = String(value).slice(0, 10).split('-')

  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }

  return value
}

function formatDate(value) {
  if (!value) return 'Sin fecha'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return String(value).replace('T', ' ').slice(0, 19)
  }

  return date.toLocaleString('es-BO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function limpiarFiltros() {
  busqueda.value = ''
  filtroTipo.value = 'todos'
  filtroRango.value = 'todo'
  fechaDesde.value = ''
  fechaHasta.value = ''
}

async function loadAll() {
  loadingClientes.value = true
  loadingCitas.value = true
  loadingPagos.value = true

  try {
    const { data } = await api.get(rutas.historialEliminados)

    clientesEliminados.value = responseToArray(data?.clientes_eliminados)
    citasEliminadas.value = responseToArray(data?.citas_eliminadas)
    pagosEliminados.value = responseToArray(data?.pagos_eliminados)
  } catch (error) {
    clientesEliminados.value = []
    citasEliminadas.value = []
    pagosEliminados.value = []

    $q.notify({
      type: 'negative',
      message: getErrorMessage(error)
    })
  } finally {
    loadingClientes.value = false
    loadingCitas.value = false
    loadingPagos.value = false
  }
}

function recuperarCliente(row) {
  $q.dialog({
    title: 'Recuperar cliente',
    message: `¿Deseas recuperar a "${row.nombre || 'este cliente'}"?`,
    persistent: true,
    ok: {
      label: 'Recuperar',
      color: 'positive',
      unelevated: true
    },
    cancel: {
      label: 'Cancelar',
      color: 'grey-7',
      flat: true
    }
  }).onOk(async () => {
    try {
      await api.put(rutas.recuperarCliente(row.id))

      $q.notify({
        type: 'positive',
        message: 'Cliente recuperado correctamente'
      })

      await loadAll()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: getErrorMessage(error)
      })
    }
  })
}

function eliminarClienteDefinitivo(row) {
  $q.dialog({
    title: 'Eliminar definitivamente',
    message: `Esta acción no se podrá deshacer. ¿Deseas eliminar definitivamente a "${row.nombre || 'este cliente'}"?`,
    persistent: true,
    ok: {
      label: 'Sí, eliminar',
      color: 'negative',
      unelevated: true
    },
    cancel: {
      label: 'Cancelar',
      color: 'grey-7',
      flat: true
    }
  }).onOk(async () => {
    try {
      await api.delete(rutas.eliminarClienteDefinitivo(row.id))

      $q.notify({
        type: 'positive',
        message: 'Cliente eliminado definitivamente'
      })

      await loadAll()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: getErrorMessage(error)
      })
    }
  })
}

function recuperarCita(row) {
  $q.dialog({
    title: 'Recuperar cita',
    message: `¿Deseas recuperar "${row.servicio || 'esta cita'}"?`,
    persistent: true,
    ok: {
      label: 'Recuperar',
      color: 'positive',
      unelevated: true
    },
    cancel: {
      label: 'Cancelar',
      color: 'grey-7',
      flat: true
    }
  }).onOk(async () => {
    try {
      await api.put(rutas.recuperarCita(row.id))

      $q.notify({
        type: 'positive',
        message: 'Cita recuperada correctamente'
      })

      await loadAll()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: getErrorMessage(error)
      })
    }
  })
}

function eliminarCitaDefinitiva(row) {
  $q.dialog({
    title: 'Eliminar definitivamente',
    message: `Esta acción no se podrá deshacer. ¿Deseas eliminar definitivamente "${row.servicio || 'esta cita'}"?`,
    persistent: true,
    ok: {
      label: 'Sí, eliminar',
      color: 'negative',
      unelevated: true
    },
    cancel: {
      label: 'Cancelar',
      color: 'grey-7',
      flat: true
    }
  }).onOk(async () => {
    try {
      await api.delete(rutas.eliminarCitaDefinitiva(row.id))

      $q.notify({
        type: 'positive',
        message: 'Cita eliminada definitivamente'
      })

      await loadAll()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: getErrorMessage(error)
      })
    }
  })
}

function recuperarPago(row) {
  $q.dialog({
    title: 'Recuperar pago',
    message: `¿Deseas recuperar el pago de Bs ${money(montoPago(row))} de ${clientePago(row)}?`,
    persistent: true,
    ok: {
      label: 'Recuperar',
      color: 'positive',
      unelevated: true
    },
    cancel: {
      label: 'Cancelar',
      color: 'grey-7',
      flat: true
    }
  }).onOk(async () => {
    try {
      await api.put(rutas.recuperarPago(row.id))

      $q.notify({
        type: 'positive',
        message: 'Pago recuperado correctamente'
      })

      await loadAll()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: getErrorMessage(error)
      })
    }
  })
}

function eliminarPagoDefinitivo(row) {
  $q.dialog({
    title: 'Eliminar definitivamente',
    message: `Esta acción no se podrá deshacer. ¿Deseas eliminar definitivamente el pago de Bs ${money(montoPago(row))}?`,
    persistent: true,
    ok: {
      label: 'Sí, eliminar',
      color: 'negative',
      unelevated: true
    },
    cancel: {
      label: 'Cancelar',
      color: 'grey-7',
      flat: true
    }
  }).onOk(async () => {
    try {
      await api.delete(rutas.eliminarPagoDefinitivo(row.id))

      $q.notify({
        type: 'positive',
        message: 'Pago eliminado definitivamente'
      })

      await loadAll()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: getErrorMessage(error)
      })
    }
  })
}

function confirmarLimpiarHistorial() {
  $q.dialog({
    title: 'Limpiar historial',
    message: 'Esto eliminará definitivamente todos los clientes, citas y pagos que están en el historial. ¿Deseas continuar?',
    persistent: true,
    ok: {
      label: 'Continuar',
      color: 'negative',
      unelevated: true
    },
    cancel: {
      label: 'Cancelar',
      color: 'grey-7',
      flat: true
    }
  }).onOk(() => {
    $q.dialog({
      title: 'Confirmación final',
      message: 'Esta acción no se podrá deshacer. Presiona eliminar solo si estás completamente seguro.',
      persistent: true,
      ok: {
        label: 'Sí, eliminar todo',
        color: 'negative',
        unelevated: true
      },
      cancel: {
        label: 'Cancelar',
        color: 'grey-7',
        flat: true
      }
    }).onOk(async () => {
      try {
        await api.delete(rutas.limpiarHistorial)

        $q.notify({
          type: 'positive',
          message: 'Historial limpiado correctamente'
        })

        await loadAll()
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: getErrorMessage(error)
        })
      }
    })
  })
}

onMounted(loadAll)
</script>

<style scoped>
.historial-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(233, 30, 99, 0.10), transparent 32%),
    linear-gradient(180deg, #fff7fb 0%, #f7f7fb 100%);
}

/* HERO */

.historial-hero {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  border-radius: 30px;
  padding: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 18px 45px rgba(156, 39, 176, 0.28);
  position: relative;
  overflow: hidden;
}

.historial-hero::after {
  content: "";
  position: absolute;
  width: 220px;
  height: 220px;
  right: -65px;
  top: -70px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
}

.hero-badge {
  display: inline-block;
  padding: 7px 14px;
  border-radius: 999px;
  color: white;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(8px);
}

.hero-subtitle {
  opacity: 0.92;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 1;
  flex-wrap: wrap;
}

.btn-white {
  background: white;
  color: #c2185b;
  font-weight: 900;
  border-radius: 16px;
  padding: 10px 18px;
}

.btn-danger-soft {
  background: rgba(255, 255, 255, 0.18);
  color: white;
  font-weight: 900;
  border-radius: 16px;
  padding: 10px 18px;
  border: 1px solid rgba(255, 255, 255, 0.28);
}

/* SUMMARY */

.summary-card {
  min-height: 132px;
  border-radius: 24px;
  background: white;
  box-shadow: 0 14px 35px rgba(156, 39, 176, 0.12);
  border: 1px solid rgba(233, 30, 99, 0.08);
  transition: all 0.25s ease;
}

.summary-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 42px rgba(233, 30, 99, 0.18);
}

.summary-info {
  min-width: 0;
}

.summary-title {
  color: #777;
  font-size: 12px;
  font-weight: 800;
}

.summary-value {
  color: #222;
  font-size: 20px;
  font-weight: 900;
  margin-top: 4px;
  word-break: break-word;
}

.summary-detail {
  color: #888;
  font-size: 11px;
  margin-top: 2px;
}

/* FILTROS */

.filters-card {
  border-radius: 26px;
  background: white;
  box-shadow: 0 14px 35px rgba(156, 39, 176, 0.12);
  border: 1px solid rgba(233, 30, 99, 0.08);
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.filters-title {
  color: #c2185b;
  font-size: 18px;
  font-weight: 900;
}

.filters-subtitle {
  color: #777;
  font-size: 13px;
}

.result-badge {
  width: 100%;
  min-height: 40px;
  justify-content: center;
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
  font-weight: 900;
  padding: 9px 12px;
}

/* CARDS Y TABLAS */

.historial-card {
  border-radius: 28px;
  overflow: hidden;
  background: white;
  box-shadow: 0 16px 38px rgba(156, 39, 176, 0.12);
  border: 1px solid rgba(233, 30, 99, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 24px;
}

.count-badge {
  background: #e91e63;
  color: white;
  font-size: 14px;
  font-weight: 900;
  padding: 8px 12px;
}

.count-badge.purple {
  background: #9c27b0;
}

.count-badge.green {
  background: #2e7d32;
}

.tabla-glamur {
  background: white;
}

.tabla-glamur :deep(.q-table__middle) {
  overflow-x: auto;
}

.tabla-glamur :deep(.q-table thead tr) {
  background: linear-gradient(135deg, #fce4ec, #f3e5f5);
  color: #880e4f;
}

.tabla-glamur :deep(.q-table th) {
  font-weight: 900;
  font-size: 13px;
}

.tabla-glamur :deep(.q-table tbody tr:hover) {
  background: #fff0f6;
}

.cliente-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 210px;
}

.avatar-pink {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
}

.avatar-green {
  background: linear-gradient(135deg, #2e7d32, #00a884);
}

.telefono-box,
.fecha-box {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.telefono-box {
  font-weight: 700;
  color: #2e7d32;
}

.status-badge {
  padding: 6px 10px;
  font-weight: 800;
  text-transform: capitalize;
}

.acciones {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.acciones .q-btn {
  margin: 2px;
}

/* MOBILE */

@media (max-width: 700px) {
  .historial-page {
    padding: 12px;
  }

  .historial-hero {
    padding: 22px;
    border-radius: 22px;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .historial-hero .text-h4 {
    font-size: 28px;
  }

  .hero-actions {
    width: 100%;
  }

  .hero-actions .q-btn {
    width: 100%;
  }

  .summary-card {
    min-height: auto;
  }

  .filters-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .filters-header .q-btn {
    width: 100%;
  }

  .section-header {
    align-items: flex-start;
    flex-direction: column;
    padding: 20px;
  }

  .historial-card {
    border-radius: 22px;
  }

  .tabla-glamur :deep(.q-table th),
  .tabla-glamur :deep(.q-table td) {
    padding: 8px 10px;
    font-size: 13px;
  }

  .acciones {
    gap: 6px;
  }
}
</style>