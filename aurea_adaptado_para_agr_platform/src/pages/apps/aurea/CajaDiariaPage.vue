<template>
  <q-page class="glamur-page caja-page">

    <!-- HERO PRINCIPAL -->
    <section class="glamur-hero q-mb-md">
      <div>
        <div class="glamur-eyebrow">
          <q-icon name="point_of_sale" />
          Control diario
        </div>

        <div class="glamur-title q-mt-sm">
          Caja diaria {{ marcaPrincipal }}
        </div>

        <div class="glamur-subtitle q-mt-xs">
          Resumen de pagos, métodos de cobro y citas del día en {{ nombreNegocio }}.
        </div>
      </div>

      <div class="hero-actions">
        <q-btn
          icon="refresh"
          label="Actualizar"
          class="glamur-btn-light"
          unelevated
          :loading="loading"
          @click="load"
        />
      </div>
    </section>

    <q-linear-progress
      v-if="loading"
      indeterminate
      color="pink"
      class="q-mb-md"
    />

    <!-- FILTROS -->
    <q-card class="glamur-card q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md items-end">
          <div class="col-12 col-md-4">
            <q-input
              v-model="fecha"
              type="date"
              label="Fecha de caja"
              outlined
              rounded
              dense
              bg-color="white"
              :disable="loading"
            >
              <template #prepend>
                <q-icon name="event" color="pink" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-8">
            <div class="row q-col-gutter-sm justify-end">
              <div class="col-12 col-sm-auto">
                <q-btn
                  label="Consultar"
                  icon="search"
                  class="glamur-btn full-width"
                  unelevated
                  no-caps
                  :loading="loading"
                  @click="load"
                />
              </div>

              <div class="col-12 col-sm-auto">
                <q-btn
                  label="PDF caja diaria"
                  icon="picture_as_pdf"
                  color="pink-7"
                  class="full-width pdf-btn"
                  unelevated
                  no-caps
                  :loading="downloadingPdf"
                  @click="descargarPdf"
                />
              </div>

              <div class="col-12 col-sm-auto">
                <q-btn
                  label="Hoy"
                  icon="today"
                  flat
                  color="pink-7"
                  class="full-width"
                  no-caps
                  :disable="loading"
                  @click="irHoy"
                />
              </div>
            </div>
          </div>
        </div>

        <div v-if="fechaTexto" class="fecha-texto q-mt-md">
          <q-icon name="calendar_month" />
          {{ fechaTexto }}
        </div>
      </q-card-section>
    </q-card>

    <!-- MÉTRICAS PRINCIPALES -->
    <div class="row q-col-gutter-md">
      <div
        v-for="card in metricCards"
        :key="card.key"
        class="col-12 col-sm-6 col-md-4 col-lg-3"
      >
        <q-card class="glamur-card glamur-card-hover metric-card">
          <q-card-section>
            <div class="row items-center justify-between no-wrap">
              <div class="metric-content">
                <div class="metric-label">
                  {{ card.label }}
                </div>

                <div class="metric-value">
                  {{ card.value }}
                </div>

                <div class="metric-detail">
                  {{ card.detail }}
                </div>
              </div>

              <q-avatar :class="card.avatarClass" size="58px">
                <q-icon :name="card.icon" size="30px" color="white" />
              </q-avatar>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- MÉTODOS DE PAGO -->
    <q-card class="glamur-card q-mt-md">
      <q-card-section class="row items-center justify-between q-gutter-sm">
        <div>
          <div class="glamur-section-title">
            Resumen por método de pago
          </div>

          <div class="glamur-section-subtitle">
            Distribución del dinero cobrado en la fecha seleccionada.
          </div>
        </div>

        <q-badge class="glamur-chip-soft" rounded>
          {{ moneda }}
        </q-badge>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="row q-col-gutter-md">
          <div
            v-for="metodo in metodosLista"
            :key="metodo.key"
            class="col-12 col-sm-6 col-md-4 col-lg"
          >
            <div class="method-box">
              <div class="row items-center justify-between no-wrap">
                <div>
                  <div class="method-label">
                    {{ metodo.label }}
                  </div>

                  <div class="method-total">
                    {{ metodo.total_texto || currency(metodo.total) }}
                  </div>

                  <div class="method-count">
                    {{ metodo.cantidad || 0 }} pago(s)
                  </div>
                </div>

                <q-avatar :class="metodo.avatarClass" size="46px">
                  <q-icon :name="metodo.icon" color="white" size="24px" />
                </q-avatar>
              </div>

              <q-linear-progress
                rounded
                size="8px"
                color="pink"
                class="q-mt-md"
                :value="progressValue(metodo.total, resumen.total_cobrado)"
              />
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- PAGOS DEL DÍA -->
    <q-card class="glamur-card q-mt-md">
      <q-card-section class="row items-center justify-between q-gutter-sm">
        <div>
          <div class="glamur-section-title">
            Pagos recibidos
          </div>

          <div class="glamur-section-subtitle">
            Lista de cobros registrados en caja.
          </div>
        </div>

        <q-input
          v-model.trim="buscarPagos"
          dense
          outlined
          rounded
          clearable
          placeholder="Buscar pago..."
          class="search-input"
          bg-color="white"
        >
          <template #prepend>
            <q-icon name="search" color="pink" />
          </template>
        </q-input>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div v-if="pagosFiltrados.length === 0" class="empty-state">
          <q-icon name="payments" size="56px" color="grey-5" />
          <div>No hay pagos registrados para esta fecha.</div>
        </div>

        <q-table
          v-else
          :rows="pagosFiltrados"
          :columns="pagosColumns"
          row-key="id"
          flat
          bordered
          class="glamur-table"
          :pagination="{ rowsPerPage: 8 }"
        >
          <template #body-cell-cliente="props">
            <q-td :props="props">
              <div class="text-weight-bold text-pink-7">
                {{ props.row.cliente || 'Cliente no registrado' }}
              </div>

              <div class="text-caption text-grey-7">
                {{ props.row.telefono || 'Sin teléfono' }}
              </div>
            </q-td>
          </template>

          <template #body-cell-metodo="props">
            <q-td :props="props">
              <q-badge color="purple" rounded>
                {{ props.row.metodo || 'Sin método' }}
              </q-badge>
            </q-td>
          </template>

          <template #body-cell-monto="props">
            <q-td :props="props">
              <div class="money-text">
                {{ props.row.monto_texto || currency(props.row.monto) }}
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- CITAS DEL DÍA -->
    <q-card class="glamur-card q-mt-md">
      <q-card-section class="row items-center justify-between q-gutter-sm">
        <div>
          <div class="glamur-section-title">
            Citas del día
          </div>

          <div class="glamur-section-subtitle">
            Control de citas pagadas y pendientes.
          </div>
        </div>

        <q-input
          v-model.trim="buscarCitas"
          dense
          outlined
          rounded
          clearable
          placeholder="Buscar cita..."
          class="search-input"
          bg-color="white"
        >
          <template #prepend>
            <q-icon name="search" color="pink" />
          </template>
        </q-input>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div v-if="citasFiltradas.length === 0" class="empty-state">
          <q-icon name="event_busy" size="56px" color="grey-5" />
          <div>No hay citas registradas para esta fecha.</div>
        </div>

        <q-table
          v-else
          :rows="citasFiltradas"
          :columns="citasColumns"
          row-key="id"
          flat
          bordered
          class="glamur-table"
          :pagination="{ rowsPerPage: 8 }"
        >
          <template #body-cell-cliente="props">
            <q-td :props="props">
              <div class="text-weight-bold text-pink-7">
                {{ props.row.cliente || 'Cliente no registrado' }}
              </div>

              <div class="text-caption text-grey-7">
                {{ props.row.telefono || 'Sin teléfono' }}
              </div>
            </q-td>
          </template>

          <template #body-cell-estado="props">
            <q-td :props="props">
              <q-badge :color="estadoColor(props.row.estado)" rounded>
                {{ estadoTexto(props.row.estado) }}
              </q-badge>
            </q-td>
          </template>

          <template #body-cell-estado_pago="props">
            <q-td :props="props">
              <q-badge :color="estadoPagoColor(props.row.estado_pago)" rounded>
                {{ estadoPagoTexto(props.row.estado_pago) }}
              </q-badge>
            </q-td>
          </template>

          <template #body-cell-precio="props">
            <q-td :props="props">
              <div class="money-text">
                {{ props.row.precio_texto || currency(props.row.precio) }}
              </div>
            </q-td>
          </template>

          <template #body-cell-pendiente="props">
            <q-td :props="props">
              <div :class="Number(props.row.pendiente || 0) > 0 ? 'pending-text' : 'money-text'">
                {{ props.row.pendiente_texto || currency(props.row.pendiente) }}
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
import { guardarYAbrirPdf } from 'src/utils/pdfApp'

defineOptions({
  name: 'CajaDiariaPage'
})

const $q = useQuasar()

const loading = ref(false)
const downloadingPdf = ref(false)
const buscarPagos = ref('')
const buscarCitas = ref('')

const fecha = ref(todayInput())

const configuracion = ref({
  nombre_negocio: 'AUREA Beauty Salon',
  nombre_corto: 'AUREA Beauty',
  slogan: 'Sistema inteligente para salones de belleza',
  moneda: 'Bs'
})

const fechaTexto = ref('')

const resumen = ref({
  total_cobrado: 0,
  total_cobrado_texto: 'Bs 0.00',
  cantidad_pagos: 0,
  ticket_promedio: 0,
  ticket_promedio_texto: 'Bs 0.00',
  citas_dia: 0,
  citas_pagadas: 0,
  citas_pendientes_pago: 0,
  citas_pendientes: 0,
  citas_concluidas: 0,
  citas_canceladas: 0
})

const metodos = ref({})
const pagos = ref([])
const citas = ref([])

const nombreNegocio = computed(() => {
  return configuracion.value.nombre_negocio || 'AUREA Beauty Salon'
})

const nombreCorto = computed(() => {
  return configuracion.value.nombre_corto || 'AUREA Beauty'
})

const marcaPrincipal = computed(() => {
  return String(nombreCorto.value || 'AUREA Beauty').split(' ')[0] || 'AUREA'
})

const moneda = computed(() => {
  return configuracion.value.moneda || 'Bs'
})

const metricCards = computed(() => [
  card(
    'total_cobrado',
    'Total cobrado',
    resumen.value.total_cobrado_texto || currency(resumen.value.total_cobrado),
    'Dinero recibido en el día',
    'payments',
    'bg-green-7'
  ),
  card(
    'cantidad_pagos',
    'Pagos realizados',
    resumen.value.cantidad_pagos,
    'Cantidad de cobros',
    'receipt_long',
    'bg-pink-7'
  ),
  card(
    'ticket_promedio',
    'Ticket promedio',
    resumen.value.ticket_promedio_texto || currency(resumen.value.ticket_promedio),
    'Promedio por pago',
    'trending_up',
    'bg-purple-7'
  ),
  card(
    'citas_dia',
    'Citas del día',
    resumen.value.citas_dia,
    'Agendadas en la fecha',
    'event',
    'bg-blue-7'
  ),
  card(
    'citas_pagadas',
    'Citas pagadas',
    resumen.value.citas_pagadas,
    'Pagos completos',
    'check_circle',
    'bg-teal-7'
  ),
  card(
    'pendientes_pago',
    'Pendientes pago',
    resumen.value.citas_pendientes_pago,
    'Por cobrar',
    'pending_actions',
    'bg-orange-7'
  ),
  card(
    'concluidas',
    'Concluidas',
    resumen.value.citas_concluidas,
    'Atenciones finalizadas',
    'verified',
    'bg-indigo-7'
  ),
  card(
    'canceladas',
    'Canceladas',
    resumen.value.citas_canceladas,
    'Citas canceladas',
    'cancel',
    'bg-red-7'
  )
])

const metodosLista = computed(() => {
  const base = [
    method('efectivo', 'Efectivo', 'payments', 'bg-green-7'),
    method('qr', 'QR', 'qr_code_2', 'bg-pink-7'),
    method('transferencia', 'Transferencia', 'account_balance', 'bg-blue-7'),
    method('tarjeta', 'Tarjeta', 'credit_card', 'bg-purple-7'),
    method('otros', 'Otros', 'more_horiz', 'bg-grey-7')
  ]

  return base.map((item) => ({
    ...item,
    ...(metodos.value[item.key] || {})
  }))
})

const pagosFiltrados = computed(() => {
  const term = normalizar(buscarPagos.value)

  if (!term) return pagos.value

  return pagos.value.filter((pago) => {
    return [
      pago.cliente,
      pago.telefono,
      pago.servicio,
      pago.metodo,
      pago.monto_texto,
      pago.hora_pago
    ].some((value) => normalizar(value).includes(term))
  })
})

const citasFiltradas = computed(() => {
  const term = normalizar(buscarCitas.value)

  if (!term) return citas.value

  return citas.value.filter((cita) => {
    return [
      cita.cliente,
      cita.telefono,
      cita.servicio,
      cita.estado,
      cita.estado_pago,
      cita.precio_texto,
      cita.pendiente_texto,
      cita.hora
    ].some((value) => normalizar(value).includes(term))
  })
})

const pagosColumns = [
  {
    name: 'hora_pago',
    label: 'Hora',
    field: 'hora_pago',
    align: 'left',
    sortable: true
  },
  {
    name: 'cliente',
    label: 'Cliente',
    field: 'cliente',
    align: 'left',
    sortable: true
  },
  {
    name: 'servicio',
    label: 'Servicio',
    field: 'servicio',
    align: 'left',
    sortable: true
  },
  {
    name: 'metodo',
    label: 'Método',
    field: 'metodo',
    align: 'center',
    sortable: true
  },
  {
    name: 'monto',
    label: 'Monto',
    field: 'monto',
    align: 'right',
    sortable: true
  }
]

const citasColumns = [
  {
    name: 'hora',
    label: 'Hora',
    field: (row) => formatTime(row.hora),
    align: 'left',
    sortable: true
  },
  {
    name: 'cliente',
    label: 'Cliente',
    field: 'cliente',
    align: 'left',
    sortable: true
  },
  {
    name: 'servicio',
    label: 'Servicio',
    field: 'servicio',
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
    name: 'estado_pago',
    label: 'Pago',
    field: 'estado_pago',
    align: 'center',
    sortable: true
  },
  {
    name: 'precio',
    label: 'Precio',
    field: 'precio',
    align: 'right',
    sortable: true
  },
  {
    name: 'pendiente',
    label: 'Pendiente',
    field: 'pendiente',
    align: 'right',
    sortable: true
  }
]

function card(key, label, value, detail, icon, avatarClass) {
  return {
    key,
    label,
    value,
    detail,
    icon,
    avatarClass
  }
}

function method(key, label, icon, avatarClass) {
  return {
    key,
    label,
    icon,
    avatarClass,
    cantidad: 0,
    total: 0,
    total_texto: currency(0)
  }
}

function todayInput() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function normalizar(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function money(value) {
  return Number(value || 0).toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

function currency(value) {
  return `${moneda.value} ${money(value)}`
}

function progressValue(value, total) {
  const base = Number(total || 0)

  if (base <= 0) return 0

  return Math.min(Number(value || 0) / base, 1)
}

function formatTime(value) {
  if (!value) return '-'

  return String(value).slice(0, 5)
}

function estadoTexto(estado) {
  if (estado === 'concluida') return 'Concluida'
  if (estado === 'cancelada') return 'Cancelada'

  return 'Pendiente'
}

function estadoColor(estado) {
  if (estado === 'concluida') return 'positive'
  if (estado === 'cancelada') return 'negative'

  return 'warning'
}

function estadoPagoTexto(estado) {
  return estado === 'pagado' ? 'Pagado' : 'Pendiente'
}

function estadoPagoColor(estado) {
  return estado === 'pagado' ? 'positive' : 'warning'
}

function getErrorMessage(error, fallback = 'Ocurrió un error') {
  const data = error?.response?.data

  if (data?.errors) {
    return Object.values(data.errors).flat().join(' ')
  }

  return data?.message || data?.error || fallback
}

function normalizeResponse(data = {}) {
  configuracion.value = {
    ...configuracion.value,
    ...(data.configuracion || {})
  }

  fechaTexto.value = data.fecha_texto || ''

  resumen.value = {
    ...resumen.value,
    ...(data.resumen || {})
  }

  metodos.value = data.metodos || {}
  pagos.value = Array.isArray(data.pagos) ? data.pagos : []
  citas.value = Array.isArray(data.citas) ? data.citas : []
}

async function load() {
  loading.value = true

  try {
    const { data } = await api.get('/caja/diaria', {
      params: {
        fecha: fecha.value
      }
    })

    normalizeResponse(data)
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(error, 'No se pudo cargar la caja diaria')
    })
  } finally {
    loading.value = false
  }
}

async function descargarPdf() {
  downloadingPdf.value = true

  try {
    const response = await api.get('/reportes/caja-diaria', {
      params: {
        fecha: fecha.value
      },
      responseType: 'blob'
    })

    const blob = new Blob([response.data], {
      type: 'application/pdf'
    })

    const nombreArchivo = `caja_diaria_aurea_${fecha.value}.pdf`

    await guardarYAbrirPdf(blob, nombreArchivo)

    $q.notify({
      type: 'positive',
      message: 'PDF de caja diaria generado y abierto correctamente'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(error, 'No se pudo generar el PDF')
    })
  } finally {
    downloadingPdf.value = false
  }
}

function irHoy() {
  fecha.value = todayInput()
  load()
}

onMounted(load)
</script>

<style scoped>
.caja-page {
  padding-bottom: 36px;
}

.hero-actions {
  min-width: 170px;
}

.fecha-texto {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #c2185b;
  font-weight: 900;
  padding: 9px 13px;
  border-radius: 999px;
  background: #fff0f6;
  border: 1px solid rgba(233, 30, 99, 0.18);
}

.pdf-btn {
  border-radius: 16px;
  min-height: 42px;
  font-weight: 900;
}

.metric-card {
  min-height: 138px;
}

.metric-content {
  min-width: 0;
}

.metric-label {
  color: #7a6f80;
  font-size: 13px;
  font-weight: 850;
}

.metric-value {
  color: #241329;
  font-size: 23px;
  font-weight: 950;
  line-height: 1.2;
  margin-top: 5px;
  word-break: break-word;
}

.metric-detail {
  color: #8a7f91;
  font-size: 12px;
  margin-top: 4px;
}

.method-box {
  height: 100%;
  padding: 16px;
  border-radius: 20px;
  background: #fff7fb;
  border: 1px solid rgba(233, 30, 99, 0.12);
}

.method-label {
  color: #7a6f80;
  font-size: 12px;
  font-weight: 900;
}

.method-total {
  color: #241329;
  font-size: 18px;
  font-weight: 950;
  margin-top: 4px;
}

.method-count {
  color: #8a7f91;
  font-size: 12px;
  font-weight: 800;
  margin-top: 2px;
}

.search-input {
  width: 260px;
  max-width: 100%;
}

.empty-state {
  min-height: 160px;
  display: grid;
  place-items: center;
  gap: 8px;
  text-align: center;
  color: #7a6f80;
  font-weight: 800;
}

.glamur-table {
  border-radius: 18px;
  overflow: hidden;
}

.money-text {
  color: #2e7d32;
  font-weight: 950;
}

.pending-text {
  color: #ef6c00;
  font-weight: 950;
}

@media (max-width: 700px) {
  .hero-actions {
    min-width: 100%;
  }

  .search-input {
    width: 100%;
  }

  .metric-value {
    font-size: 21px;
  }
}
</style>