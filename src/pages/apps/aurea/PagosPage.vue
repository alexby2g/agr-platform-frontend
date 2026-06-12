<template>
  <q-page class="q-pa-md pagos-page">

    <!-- HERO -->
    <section class="page-hero q-mb-lg">
      <div>
        <div class="hero-badge">
          Control financiero
        </div>

        <div class="text-h4 text-weight-bold text-white q-mt-sm">
          💰 Pagos
        </div>

        <div class="text-subtitle2 text-white hero-subtitle">
          Administra, filtra y revisa los ingresos registrados
        </div>
      </div>

      <q-btn
        class="btn-glamur-white"
        icon="refresh"
        label="Actualizar"
        :loading="loading"
        @click="load"
      />
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
    <q-card class="filters-card q-mb-md">
      <q-card-section>
        <div class="filters-header q-mb-md">
          <div>
            <div class="filters-title">
              🔎 Buscar y filtrar pagos
            </div>

            <div class="filters-subtitle">
              Encuentra pagos por cliente, servicio, método, monto o fecha
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
              placeholder="Buscar por cliente, servicio, método, monto o fecha..."
            >
              <template #prepend>
                <q-icon name="search" color="pink" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-select
              v-model="filtroRango"
              :options="opcionesRango"
              outlined
              rounded
              dense
              emit-value
              map-options
              bg-color="white"
              label="Rango"
            >
              <template #prepend>
                <q-icon name="date_range" color="purple" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-sm-6 col-md-2">
            <q-select
              v-model="filtroMetodo"
              :options="opcionesMetodo"
              outlined
              rounded
              dense
              emit-value
              map-options
              bg-color="white"
              label="Método"
            >
              <template #prepend>
                <q-icon name="payments" color="green" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-2">
            <q-badge class="result-badge" rounded>
              {{ pagosFiltrados.length }} de {{ pagos.length }}
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

    <!-- TABLA -->
    <q-card class="table-card">
      <q-table
        class="tabla-glamur"
        :rows="pagosFiltrados"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :no-data-label="busqueda || filtroMetodo !== 'todos' ? 'No se encontraron pagos con esos filtros' : 'No hay pagos registrados'"
        flat
        bordered
        :rows-per-page-options="[5, 10, 20, 50]"
      >

        <!-- CLIENTE -->
        <template #body-cell-cliente="props">
          <q-td :props="props">
            <div class="cliente-cell">
              <q-avatar class="cliente-avatar" size="38px">
                <q-icon name="person" color="white" />
              </q-avatar>

              <div>
                <div class="text-weight-bold text-pink-7">
                  {{ clientePago(props.row) }}
                </div>

                <div class="text-caption text-grey-7">
                  Cliente AUREA
                </div>
              </div>
            </div>
          </q-td>
        </template>

        <!-- SERVICIO -->
        <template #body-cell-servicio="props">
          <q-td :props="props">
            <div class="text-weight-bold">
              {{ servicioPago(props.row) }}
            </div>

            <div class="text-caption text-grey-7">
              Cita #{{ props.row.cita_id || 'N/A' }}
            </div>
          </q-td>
        </template>

        <!-- MONTO -->
        <template #body-cell-monto="props">
          <q-td :props="props">
            <div class="monto-box">
              Bs {{ money(props.row.monto) }}
            </div>
          </q-td>
        </template>

        <!-- MÉTODO -->
        <template #body-cell-metodo="props">
          <q-td :props="props">
            <q-badge
              rounded
              class="estado-badge"
              :color="metodoColor(props.row.metodo)"
            >
              {{ metodoTexto(props.row.metodo) }}
            </q-badge>
          </q-td>
        </template>

        <!-- ESTADO -->
        <template #body-cell-estado="props">
          <q-td :props="props" class="text-center">
            <q-badge
              rounded
              class="estado-badge"
              :color="estadoPagoColor(props.row.estado)"
            >
              {{ estadoPagoTexto(props.row.estado) }}
            </q-badge>
          </q-td>
        </template>

        <!-- FECHA -->
        <template #body-cell-fecha_pago="props">
          <q-td :props="props">
            <div class="fecha-box">
              <q-icon name="calendar_month" color="pink" size="18px" />
              <span>{{ formatFecha(props.row.fecha_pago) }}</span>
            </div>
          </q-td>
        </template>

        <!-- ACCIONES -->
        <template #body-cell-actions="props">
          <q-td :props="props" class="text-center">
            <div class="acciones">
              <q-btn
                round
                unelevated
                size="sm"
                color="primary"
                icon="visibility"
                @click="verDetalle(props.row)"
              >
                <q-tooltip>Ver detalle</q-tooltip>
              </q-btn>

              <q-btn
                round
                unelevated
                size="sm"
                color="negative"
                icon="delete"
                @click="remove(props.row)"
              >
                <q-tooltip>Eliminar pago</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>

      </q-table>
    </q-card>

    <!-- DIALOG DETALLE -->
    <!-- DIALOG DETALLE -->
<q-dialog
  v-model="dialogDetalle"
  :maximized="$q.screen.lt.sm"
  transition-show="slide-up"
  transition-hide="slide-down"
>
  <q-card class="detalle-card">

    <!-- CABECERA FIJA -->
    <q-card-section class="detalle-header">
      <div>
        <div class="text-h6 text-weight-bold">
          🧾 Detalle del pago
        </div>

        <div class="text-caption text-white">
          Información completa del ingreso registrado
        </div>
      </div>

      <q-space />

      <q-btn
        icon="close"
        flat
        round
        dense
        color="white"
        v-close-popup
      />
    </q-card-section>

    <!-- CUERPO CON SCROLL -->
    <q-card-section v-if="pagoSeleccionado" class="detalle-body">
      <div class="detalle-total">
        <div class="detalle-total-label">
          Monto pagado
        </div>

        <div class="detalle-total-value">
          Bs {{ money(pagoSeleccionado.monto) }}
        </div>
      </div>

      <q-list bordered separator class="detalle-list">
        <q-item>
          <q-item-section avatar>
            <q-icon name="person" color="pink" />
          </q-item-section>

          <q-item-section>
            <q-item-label caption>Cliente</q-item-label>
            <q-item-label class="text-weight-bold">
              {{ clientePago(pagoSeleccionado) }}
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section avatar>
            <q-icon name="spa" color="purple" />
          </q-item-section>

          <q-item-section>
            <q-item-label caption>Servicio</q-item-label>
            <q-item-label class="text-weight-bold">
              {{ servicioPago(pagoSeleccionado) }}
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section avatar>
            <q-icon name="payments" color="green" />
          </q-item-section>

          <q-item-section>
            <q-item-label caption>Método de pago</q-item-label>
            <q-item-label class="text-weight-bold">
              {{ metodoTexto(pagoSeleccionado.metodo) }}
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section avatar>
            <q-icon name="verified" color="blue" />
          </q-item-section>

          <q-item-section>
            <q-item-label caption>Estado</q-item-label>
            <q-item-label class="text-weight-bold">
              {{ estadoPagoTexto(pagoSeleccionado.estado) }}
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section avatar>
            <q-icon name="event" color="orange" />
          </q-item-section>

          <q-item-section>
            <q-item-label caption>Fecha de pago</q-item-label>
            <q-item-label class="text-weight-bold">
              {{ formatFecha(pagoSeleccionado.fecha_pago) }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>

    <!-- BOTONES FIJOS ABAJO -->
    <q-card-actions align="right" class="detalle-actions">
      <q-btn
        flat
        label="Cerrar"
        color="grey-7"
        v-close-popup
      />

      <q-btn
        class="btn-glamur"
        icon="print"
        label="Imprimir"
        @click="imprimirDetalle"
      />
    </q-card-actions>

      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '@/boot/axios'

defineOptions({
  name: 'PagosPage'
})

const $q = useQuasar()

const pagos = ref([])
const loading = ref(false)

const busqueda = ref('')
const filtroRango = ref('mes')
const filtroMetodo = ref('todos')
const fechaDesde = ref('')
const fechaHasta = ref('')

const dialogDetalle = ref(false)
const pagoSeleccionado = ref(null)

const opcionesRango = [
  { label: 'Hoy', value: 'hoy' },
  { label: 'Esta semana', value: 'semana' },
  { label: 'Este mes', value: 'mes' },
  { label: 'Este año', value: 'anio' },
  { label: 'Todo', value: 'todo' },
  { label: 'Personalizado', value: 'personalizado' }
]

const opcionesMetodo = [
  { label: 'Todos', value: 'todos' },
  { label: 'Efectivo', value: 'efectivo' },
  { label: 'QR', value: 'qr' },
  { label: 'Transferencia', value: 'transferencia' },
  { label: 'Tarjeta', value: 'tarjeta' },
  { label: 'Otro', value: 'otro' }
]

const columns = [
  {
    name: 'cliente',
    label: 'Cliente',
    field: row => clientePago(row),
    align: 'left',
    sortable: true
  },
  {
    name: 'servicio',
    label: 'Servicio',
    field: row => servicioPago(row),
    align: 'left',
    sortable: true
  },
  {
    name: 'monto',
    label: 'Monto',
    field: row => Number(row.monto || 0),
    align: 'left',
    sortable: true
  },
  {
    name: 'metodo',
    label: 'Método',
    field: 'metodo',
    align: 'left',
    sortable: true
  },
  {
    name: 'estado',
    label: 'Estado',
    field: 'estado',
    align: 'center',
    sortable: true
  },
  {
    name: 'fecha_pago',
    label: 'Fecha',
    field: 'fecha_pago',
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

const pagosFiltrados = computed(() => {
  const texto = normalizarTexto(busqueda.value)

  return pagos.value.filter((pago) => {
    const cumpleTexto = !texto || [
      pago.id,
      pago.monto,
      pago.estado,
      pago.metodo,
      pago.fecha_pago,
      clientePago(pago),
      servicioPago(pago)
    ].some((item) => normalizarTexto(item).includes(texto))

    const cumpleMetodo = metodoCumpleFiltro(pago)
    const cumpleFecha = fechaCumpleFiltro(pago)

    return cumpleTexto && cumpleMetodo && cumpleFecha
  })
})

const totalFiltrado = computed(() => {
  return pagosFiltrados.value.reduce((total, pago) => {
    return total + Number(pago.monto || 0)
  }, 0)
})

const pagosEfectivo = computed(() => {
  return totalPorMetodo('efectivo')
})

const pagosQr = computed(() => {
  return totalPorMetodo('qr')
})

const pagosTransferencia = computed(() => {
  return totalPorMetodo('transferencia')
})

const promedioPago = computed(() => {
  if (pagosFiltrados.value.length === 0) return 0

  return totalFiltrado.value / pagosFiltrados.value.length
})

const resumenCards = computed(() => [
  {
    titulo: 'Total filtrado',
    valor: `Bs ${money(totalFiltrado.value)}`,
    detalle: 'Suma de pagos visibles',
    icono: 'account_balance_wallet',
    clase: 'bg-green-7'
  },
  {
    titulo: 'Pagos',
    valor: pagosFiltrados.value.length,
    detalle: 'Cantidad encontrada',
    icono: 'receipt_long',
    clase: 'bg-pink-7'
  },
  {
    titulo: 'Efectivo',
    valor: `Bs ${money(pagosEfectivo.value)}`,
    detalle: 'Pagos en efectivo',
    icono: 'payments',
    clase: 'bg-teal-7'
  },
  {
    titulo: 'QR',
    valor: `Bs ${money(pagosQr.value)}`,
    detalle: 'Pagos por QR',
    icono: 'qr_code_2',
    clase: 'bg-purple-7'
  },
  {
    titulo: 'Transferencia',
    valor: `Bs ${money(pagosTransferencia.value)}`,
    detalle: 'Pagos bancarios',
    icono: 'account_balance',
    clase: 'bg-indigo-7'
  },
  {
    titulo: 'Promedio',
    valor: `Bs ${money(promedioPago.value)}`,
    detalle: 'Promedio por pago',
    icono: 'trending_up',
    clase: 'bg-orange-7'
  }
])

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

function hoyISO() {
  const date = new Date()
  return date.toISOString().slice(0, 10)
}

function inicioSemanaISO() {
  const date = new Date()
  const day = date.getDay() || 7
  date.setDate(date.getDate() - day + 1)
  return date.toISOString().slice(0, 10)
}

function inicioMesISO() {
  const date = new Date()
  date.setDate(1)
  return date.toISOString().slice(0, 10)
}

function inicioAnioISO() {
  const date = new Date()
  date.setMonth(0)
  date.setDate(1)
  return date.toISOString().slice(0, 10)
}

function fechaCumpleFiltro(pago) {
  if (filtroRango.value === 'todo') {
    return true
  }

  const fecha = fechaISO(pago.fecha_pago)

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

function metodoNormalizado(metodo) {
  const texto = normalizarTexto(metodo)

  if (!texto) return 'otro'
  if (texto.includes('qr')) return 'qr'
  if (texto.includes('efect')) return 'efectivo'
  if (texto.includes('trans')) return 'transferencia'
  if (texto.includes('tarj')) return 'tarjeta'

  return texto
}

function metodoCumpleFiltro(pago) {
  if (filtroMetodo.value === 'todos') {
    return true
  }

  if (filtroMetodo.value === 'otro') {
    return !['efectivo', 'qr', 'transferencia', 'tarjeta'].includes(metodoNormalizado(pago.metodo))
  }

  return metodoNormalizado(pago.metodo) === filtroMetodo.value
}

function totalPorMetodo(metodo) {
  return pagosFiltrados.value
    .filter((pago) => metodoNormalizado(pago.metodo) === metodo)
    .reduce((total, pago) => total + Number(pago.monto || 0), 0)
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
    'Sin servicio'
  )
}

function metodoTexto(metodo) {
  const normalizado = metodoNormalizado(metodo)

  if (normalizado === 'qr') return 'QR'
  if (normalizado === 'efectivo') return 'Efectivo'
  if (normalizado === 'transferencia') return 'Transferencia'
  if (normalizado === 'tarjeta') return 'Tarjeta'

  return metodo || 'No definido'
}

function metodoColor(metodo) {
  const normalizado = metodoNormalizado(metodo)

  if (normalizado === 'efectivo') return 'green'
  if (normalizado === 'qr') return 'purple'
  if (normalizado === 'transferencia') return 'blue'
  if (normalizado === 'tarjeta') return 'orange'

  return 'grey'
}

function estadoPagoTexto(estado) {
  const texto = normalizarTexto(estado || 'pagado')

  if (texto.includes('pag')) return 'Pagado'
  if (texto.includes('pend')) return 'Pendiente'

  return estado || 'Pagado'
}

function estadoPagoColor(estado) {
  const texto = normalizarTexto(estado || 'pagado')

  if (texto.includes('pag')) return 'green'
  if (texto.includes('pend')) return 'orange'

  return 'grey'
}

function formatFecha(fecha) {
  if (!fecha) return 'Sin fecha'

  const date = new Date(fecha)

  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleString('es-BO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return String(fecha).replace('T', ' ').slice(0, 19)
}

function getErrorMessage(error) {
  const data = error?.response?.data

  if (data?.errors) {
    return Object.values(data.errors).flat().join(' ')
  }

  return data?.message || data?.error || error?.message || 'Ocurrió un error'
}

function limpiarFiltros() {
  busqueda.value = ''
  filtroRango.value = 'mes'
  filtroMetodo.value = 'todos'
  fechaDesde.value = ''
  fechaHasta.value = ''
}

async function load() {
  loading.value = true

  try {
    const { data } = await api.get('/apps/aurea/pagos')

    pagos.value = Array.isArray(data)
      ? data
      : (data?.data || [])
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(error)
    })
  } finally {
    loading.value = false
  }
}

function verDetalle(row) {
  pagoSeleccionado.value = row
  dialogDetalle.value = true
}

function imprimirDetalle() {
  window.print()
}

function remove(row) {
  $q.dialog({
    title: 'Eliminar pago',
    message: `¿Seguro que deseas eliminar el pago de Bs ${money(row.monto)} de ${clientePago(row)}? Se enviará al historial y podrás recuperarlo después.`,
    persistent: true,
    ok: {
      label: 'Eliminar',
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
      await api.delete(`/pagos/${row.id}`)

      $q.notify({
        type: 'positive',
        message: 'Pago enviado al historial correctamente'
      })

      await load()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: getErrorMessage(error)
      })
    }
  })
}

onMounted(load)
</script>

<style scoped>
.pagos-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(233, 30, 99, 0.10), transparent 34%),
    linear-gradient(180deg, #fff7fb 0%, #f7f7fb 100%);
}

/* HERO */

.page-hero {
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

.page-hero::after {
  content: "";
  position: absolute;
  width: 210px;
  height: 210px;
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

.btn-glamur-white {
  background: white;
  color: #c2185b;
  font-weight: 900;
  border-radius: 16px;
  padding: 10px 18px;
  z-index: 1;
}

.btn-glamur {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
  font-weight: 900;
  border-radius: 14px;
  padding: 9px 16px;
}

/* RESUMEN */

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

/* TABLE */

.table-card {
  border-radius: 26px;
  overflow: hidden;
  background: white;
  box-shadow: 0 14px 35px rgba(156, 39, 176, 0.12);
  border: 1px solid rgba(233, 30, 99, 0.08);
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
  min-width: 200px;
}

.cliente-avatar {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
}

.monto-box {
  color: #2e7d32;
  font-size: 15px;
  font-weight: 900;
  white-space: nowrap;
}

.fecha-box {
  display: flex;
  align-items: center;
  gap: 7px;
  white-space: nowrap;
}

.estado-badge {
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

/* DIALOG DETALLE PAGO */

.detalle-card {
  width: 560px;
  max-width: 95vw;
  max-height: 88vh;
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: white;
}

.detalle-header {
  flex: 0 0 auto;
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
  display: flex;
  align-items: center;
  padding: 20px 22px;
}

.detalle-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  background: #fff7fb;
  padding: 22px;
}

.detalle-total {
  background: white;
  border-radius: 22px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(156, 39, 176, 0.10);
  margin-bottom: 18px;
}

.detalle-total-label {
  color: #777;
  font-weight: 800;
}

.detalle-total-value {
  color: #2e7d32;
  font-size: 32px;
  font-weight: 900;
}

.detalle-list {
  border-radius: 18px;
  overflow: hidden;
  background: white;
}

.detalle-actions {
  flex: 0 0 auto;
  position: sticky;
  bottom: 0;
  z-index: 5;
  padding: 14px 18px;
  background: white;
  border-top: 1px solid #eeeeee;
  box-shadow: 0 -8px 22px rgba(0, 0, 0, 0.08);
  gap: 10px;
}

/* MOBILE */
@media (max-width: 700px) {
  .detalle-card {
    width: 100vw;
    max-width: 100vw;
    height: 100dvh;
    max-height: 100dvh;
    border-radius: 0;
  }

  .detalle-header {
    padding: 18px;
  }

  .detalle-body {
    padding: 16px;
    padding-bottom: 24px;
  }

  .detalle-total-value {
    font-size: 28px;
  }

  .detalle-actions {
    padding: 12px 14px calc(14px + env(safe-area-inset-bottom));
    flex-wrap: wrap;
  }

  .detalle-actions .q-btn {
    width: 100%;
    min-height: 44px;
  }
}
</style>