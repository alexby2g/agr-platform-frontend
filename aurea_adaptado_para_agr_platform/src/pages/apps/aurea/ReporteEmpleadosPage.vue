<template>
  <q-page class="glamur-page reporte-empleados-page">

    <!-- HERO -->
    <section class="glamur-hero q-mb-md">
      <div>
        <div class="glamur-eyebrow">
          <q-icon name="analytics" />
          Reporte estratégico
        </div>

        <div class="glamur-title q-mt-sm">
          Reporte por empleados
        </div>

        <div class="glamur-subtitle q-mt-xs">
          Revisa citas atendidas, ingresos generados y comisiones del personal.
        </div>
      </div>

      <div class="hero-actions">
        <q-btn
          icon="refresh"
          label="Actualizar"
          class="glamur-btn-light"
          unelevated
          no-caps
          :loading="loading"
          @click="loadReporte"
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
          <div class="col-12 col-md-3">
            <q-input
              v-model="filtros.desde"
              type="date"
              label="Desde"
              outlined
              rounded
              dense
              bg-color="white"
            >
              <template #prepend>
                <q-icon name="event" color="pink" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-3">
            <q-input
              v-model="filtros.hasta"
              type="date"
              label="Hasta"
              outlined
              rounded
              dense
              bg-color="white"
            >
              <template #prepend>
                <q-icon name="event_available" color="pink" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-4">
            <q-select
              v-model="filtros.empleado_id"
              :options="empleadoOptions"
              label="Empleado"
              outlined
              rounded
              dense
              emit-value
              map-options
              clearable
              bg-color="white"
            >
              <template #prepend>
                <q-icon name="groups" color="purple" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-2">
            <q-btn
              icon="filter_alt"
              label="Filtrar"
              class="glamur-btn full-width"
              unelevated
              no-caps
              :loading="loading"
              @click="loadReporte"
            />
          </div>
        </div>

        <div class="row q-col-gutter-sm q-mt-sm">
          <div class="col-12 col-md-auto">
            <q-btn
              icon="restart_alt"
              label="Limpiar filtros"
              flat
              color="grey-7"
              no-caps
              @click="limpiarFiltros"
            />
          </div>

          <div class="col-12 col-md-auto">
            <q-badge class="glamur-chip-soft" rounded>
              {{ periodoTexto }}
            </q-badge>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- MÉTRICAS -->
    <div class="row q-col-gutter-md q-mb-md">
      <div
        v-for="card in metricCards"
        :key="card.key"
        class="col-12 col-sm-6 col-lg-3"
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
                <q-icon :name="card.icon" color="white" size="30px" />
              </q-avatar>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- TABLA REPORTE -->
    <q-card class="glamur-card">
      <q-card-section class="row items-center justify-between q-gutter-sm">
        <div>
          <div class="glamur-section-title">
            Rendimiento del personal
          </div>

          <div class="glamur-section-subtitle">
            Comparación de citas, pagos y comisiones por empleado.
          </div>
        </div>

        <q-btn
          icon="groups"
          label="Ver empleados"
          to="/apps/aurea/empleados"
          flat
          color="pink-7"
          no-caps
        />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div v-if="empleadosReporte.length === 0 && !loading" class="empty-state">
          <q-icon name="analytics" size="58px" color="grey-5" />
          <div>No hay datos para el periodo seleccionado.</div>
          <q-btn
            label="Actualizar reporte"
            icon="refresh"
            color="pink-7"
            unelevated
            no-caps
            @click="loadReporte"
          />
        </div>

        <q-table
          v-else
          :rows="empleadosReporte"
          :columns="columns"
          row-key="nombre"
          flat
          bordered
          class="glamur-table"
          :loading="loading"
          :pagination="{ rowsPerPage: 10 }"
        >
          <template #body-cell-nombre="props">
            <q-td :props="props">
              <div class="employee-name">
                {{ props.row.nombre }}
              </div>

              <div class="employee-subtitle">
                {{ detalleEmpleadoTexto(props.row) }}
              </div>

              <div class="q-mt-xs">
                <q-badge
                  v-if="props.row.eliminado"
                  color="grey-7"
                  rounded
                >
                  Eliminado
                </q-badge>

                <q-badge
                  v-else
                  :color="props.row.activo ? 'positive' : 'warning'"
                  rounded
                >
                  {{ props.row.activo ? 'Activo' : 'Inactivo' }}
                </q-badge>
              </div>
            </q-td>
          </template>

          <template #body-cell-total_citas="props">
            <q-td :props="props">
              <div class="text-weight-bold text-purple-7">
                {{ props.row.total_citas }}
              </div>

              <div class="text-caption text-grey-7">
                {{ props.row.citas_concluidas }} concluidas
              </div>
            </q-td>
          </template>

          <template #body-cell-estados="props">
            <q-td :props="props">
              <div class="estado-mini">
                <q-badge color="orange" rounded>
                  P {{ props.row.citas_pendientes }}
                </q-badge>

                <q-badge color="green" rounded>
                  C {{ props.row.citas_concluidas }}
                </q-badge>

                <q-badge color="red" rounded>
                  X {{ props.row.citas_canceladas }}
                </q-badge>
              </div>
            </q-td>
          </template>

          <template #body-cell-total_pagado="props">
            <q-td :props="props">
              <div class="money-text">
                {{ props.row.total_pagado_texto || moneyText(props.row.total_pagado) }}
              </div>

              <div class="text-caption text-grey-7">
                Estimado: {{ props.row.total_estimado_texto || moneyText(props.row.total_estimado) }}
              </div>
            </q-td>
          </template>

          <template #body-cell-total_pendiente="props">
            <q-td :props="props">
              <div
                class="text-weight-bold"
                :class="Number(props.row.total_pendiente || 0) > 0 ? 'text-negative' : 'text-positive'"
              >
                {{ props.row.total_pendiente_texto || moneyText(props.row.total_pendiente) }}
              </div>
            </q-td>
          </template>

          <template #body-cell-comision="props">
            <q-td :props="props">
              <div class="money-text">
                {{ props.row.comision_calculada_texto || moneyText(props.row.comision_calculada) }}
              </div>

              <div class="text-caption text-grey-7">
                {{ money(props.row.comision_porcentaje) }}%
              </div>
            </q-td>
          </template>

          <template #body-cell-acciones="props">
            <q-td :props="props">
              <q-btn
                dense
                round
                flat
                icon="visibility"
                color="primary"
                @click="abrirDetalle(props.row)"
              >
                <q-tooltip>Ver detalle</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- DETALLE -->
    <q-dialog
      v-model="detalleDialog"
      :maximized="$q.screen.lt.sm"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="detalle-dialog">
        <q-card-section class="detalle-header">
          <div>
            <div class="detalle-title">
              {{ empleadoDetalle?.nombre || 'Detalle del empleado' }}
            </div>

            <div class="detalle-subtitle">
              Citas asignadas y movimiento económico del periodo.
            </div>
          </div>

          <q-btn icon="close" flat round dense color="white" v-close-popup />
        </q-card-section>

        <q-card-section class="detalle-body">
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-sm-3">
              <div class="detalle-box">
                <div class="detalle-box-label">Total citas</div>
                <div class="detalle-box-value">{{ empleadoDetalle?.total_citas || 0 }}</div>
              </div>
            </div>

            <div class="col-12 col-sm-3">
              <div class="detalle-box">
                <div class="detalle-box-label">Pagado</div>
                <div class="detalle-box-value green">
                  {{ empleadoDetalle?.total_pagado_texto || moneyText(empleadoDetalle?.total_pagado) }}
                </div>
              </div>
            </div>

            <div class="col-12 col-sm-3">
              <div class="detalle-box">
                <div class="detalle-box-label">Pendiente</div>
                <div class="detalle-box-value red">
                  {{ empleadoDetalle?.total_pendiente_texto || moneyText(empleadoDetalle?.total_pendiente) }}
                </div>
              </div>
            </div>

            <div class="col-12 col-sm-3">
              <div class="detalle-box">
                <div class="detalle-box-label">Comisión</div>
                <div class="detalle-box-value purple">
                  {{ empleadoDetalle?.comision_calculada_texto || moneyText(empleadoDetalle?.comision_calculada) }}
                </div>
              </div>
            </div>
          </div>

          <q-table
            :rows="empleadoDetalle?.citas || []"
            :columns="detalleColumns"
            row-key="id"
            flat
            bordered
            dense
            class="glamur-table"
            no-data-label="Este empleado no tiene citas en el periodo seleccionado"
            :pagination="{ rowsPerPage: 10 }"
          >
            <template #body-cell-cliente="props">
              <q-td :props="props">
                <div class="text-weight-bold text-pink-7">
                  {{ props.row.cliente }}
                </div>

                <div class="text-caption text-grey-7">
                  {{ props.row.telefono || 'Sin teléfono' }}
                </div>
              </q-td>
            </template>

            <template #body-cell-servicio="props">
              <q-td :props="props">
                <div class="text-weight-bold">
                  {{ props.row.servicio }}
                </div>

                <div class="text-caption text-grey-7">
                  {{ props.row.fecha_texto }} · {{ props.row.hora }}
                </div>
              </q-td>
            </template>

            <template #body-cell-estado="props">
              <q-td :props="props">
                <q-badge :color="colorEstado(props.row.estado)" rounded>
                  {{ estadoTexto(props.row.estado) }}
                </q-badge>
              </q-td>
            </template>

            <template #body-cell-total_pagado="props">
              <q-td :props="props">
                <div class="money-text">
                  {{ props.row.total_pagado_texto || moneyText(props.row.total_pagado) }}
                </div>
              </q-td>
            </template>
          </q-table>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cerrar" color="grey-7" no-caps v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '@/boot/axios'

defineOptions({
  name: 'ReporteEmpleadosPage'
})

const $q = useQuasar()

const loading = ref(false)
const detalleDialog = ref(false)
const empleadoDetalle = ref(null)

const empleados = ref([])
const reporte = ref({
  filtros: {},
  resumen: {},
  empleados: []
})

const filtros = ref({
  desde: inicioMes(),
  hasta: fechaLocal(),
  empleado_id: null
})

const columns = [
  {
    name: 'nombre',
    label: 'Empleado',
    field: 'nombre',
    align: 'left',
    sortable: true
  },
  {
    name: 'total_citas',
    label: 'Citas',
    field: 'total_citas',
    align: 'center',
    sortable: true
  },
  {
    name: 'estados',
    label: 'Estados',
    field: 'estados',
    align: 'center'
  },
  {
    name: 'total_pagado',
    label: 'Pagado',
    field: 'total_pagado',
    align: 'right',
    sortable: true
  },
  {
    name: 'total_pendiente',
    label: 'Pendiente',
    field: 'total_pendiente',
    align: 'right',
    sortable: true
  },
  {
    name: 'comision',
    label: 'Comisión',
    field: 'comision_calculada',
    align: 'right',
    sortable: true
  },
  {
    name: 'acciones',
    label: 'Detalle',
    field: 'acciones',
    align: 'center'
  }
]

const detalleColumns = [
  {
    name: 'cliente',
    label: 'Cliente',
    field: 'cliente',
    align: 'left'
  },
  {
    name: 'servicio',
    label: 'Servicio',
    field: 'servicio',
    align: 'left'
  },
  {
    name: 'estado',
    label: 'Estado',
    field: 'estado',
    align: 'center'
  },
  {
    name: 'total_pagado',
    label: 'Pagado',
    field: 'total_pagado',
    align: 'right'
  }
]

const empleadoOptions = computed(() => {
  const opciones = empleados.value.map((empleado) => ({
    label: `${empleado.nombre}${empleado.especialidad ? ' · ' + empleado.especialidad : ''}`,
    value: empleado.id
  }))

  return [
    {
      label: 'Todos los empleados',
      value: null
    },
    ...opciones
  ]
})

const empleadosReporte = computed(() => {
  return Array.isArray(reporte.value?.empleados)
    ? reporte.value.empleados
    : []
})

const resumen = computed(() => {
  return reporte.value?.resumen || {}
})

const periodoTexto = computed(() => {
  const desde = reporte.value?.filtros?.desde_texto || filtros.value.desde
  const hasta = reporte.value?.filtros?.hasta_texto || filtros.value.hasta

  return `Periodo: ${desde} al ${hasta}`
})

const metricCards = computed(() => [
  card(
    'empleados',
    'Empleados',
    resumen.value.cantidad_empleados || 0,
    'Con actividad en el reporte',
    'groups',
    'bg-purple-7'
  ),
  card(
    'citas',
    'Total citas',
    resumen.value.total_citas || 0,
    'Citas del periodo',
    'event',
    'bg-pink-7'
  ),
  card(
    'pagado',
    'Total pagado',
    resumen.value.total_pagado_texto || moneyText(resumen.value.total_pagado),
    'Ingresos recibidos',
    'payments',
    'bg-green-7'
  ),
  card(
    'comision',
    'Comisiones',
    resumen.value.total_comision_texto || moneyText(resumen.value.total_comision),
    'Monto para empleados',
    'percent',
    'bg-indigo-7'
  )
])

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

function fechaLocal(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function inicioMes() {
  const date = new Date()
  date.setDate(1)

  return fechaLocal(date)
}

function money(value) {
  return Number(value || 0).toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

function moneyText(value) {
  return `Bs ${money(value)}`
}

function responseToArray(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.empleados)) return data.empleados

  return []
}

function getErrorMessage(error, fallback = 'Ocurrió un error') {
  const data = error?.response?.data

  if (data?.errors) {
    return Object.values(data.errors).flat().join(' ')
  }

  return data?.message || data?.error || fallback
}

function detalleEmpleadoTexto(empleado) {
  const partes = [
    empleado.cargo,
    empleado.especialidad,
    empleado.telefono
  ].filter(Boolean)

  return partes.length ? partes.join(' · ') : 'Sin detalle adicional'
}

function colorEstado(estado) {
  if (estado === 'concluida') return 'positive'
  if (estado === 'cancelada') return 'negative'
  return 'warning'
}

function estadoTexto(estado) {
  if (estado === 'concluida') return 'Concluida'
  if (estado === 'cancelada') return 'Cancelada'
  return 'Pendiente'
}

async function loadEmpleados() {
  try {
    const { data } = await api.get('/empleados')

    empleados.value = responseToArray(data)
  } catch {
    empleados.value = []
  }
}

async function loadReporte() {
  loading.value = true

  try {
    const { data } = await api.get('/reportes/empleados', {
      params: {
        desde: filtros.value.desde,
        hasta: filtros.value.hasta,
        empleado_id: filtros.value.empleado_id || undefined
      }
    })

    reporte.value = {
      filtros: data?.filtros || {},
      resumen: data?.resumen || {},
      empleados: Array.isArray(data?.empleados) ? data.empleados : []
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(error, 'No se pudo cargar el reporte de empleados')
    })
  } finally {
    loading.value = false
  }
}

async function limpiarFiltros() {
  filtros.value = {
    desde: inicioMes(),
    hasta: fechaLocal(),
    empleado_id: null
  }

  await loadReporte()
}

function abrirDetalle(empleado) {
  empleadoDetalle.value = empleado
  detalleDialog.value = true
}

onMounted(async () => {
  await loadEmpleados()
  await loadReporte()
})
</script>

<style scoped>
.reporte-empleados-page {
  padding-bottom: 36px;
}

.hero-actions {
  min-width: 170px;
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
  font-size: 24px;
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

.empty-state {
  min-height: 240px;
  display: grid;
  place-items: center;
  gap: 10px;
  text-align: center;
  color: #7a6f80;
  font-weight: 800;
}

.glamur-table {
  border-radius: 18px;
  overflow: hidden;
}

.employee-name {
  color: #c2185b;
  font-weight: 950;
}

.employee-subtitle {
  color: #7a6f80;
  font-size: 12px;
  margin-top: 2px;
}

.estado-mini {
  display: flex;
  justify-content: center;
  gap: 5px;
  flex-wrap: wrap;
}

.money-text {
  color: #2e7d32;
  font-weight: 950;
}

.detalle-dialog {
  width: 980px;
  max-width: 96vw;
  border-radius: 26px;
  overflow: hidden;
}

.detalle-header {
  color: white;
  background: linear-gradient(135deg, #15111f, #e91e63);
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 22px;
}

.detalle-title {
  font-size: 24px;
  font-weight: 950;
}

.detalle-subtitle {
  color: rgba(255, 255, 255, 0.80);
  font-size: 13px;
}

.detalle-body {
  background: #fff7fb;
  max-height: 70vh;
  overflow-y: auto;
}

.detalle-box {
  padding: 14px;
  border-radius: 18px;
  background: white;
  border: 1px solid rgba(233, 30, 99, 0.12);
}

.detalle-box-label {
  color: #7a6f80;
  font-size: 12px;
  font-weight: 850;
}

.detalle-box-value {
  color: #241329;
  font-size: 20px;
  font-weight: 950;
  margin-top: 4px;
}

.detalle-box-value.green {
  color: #2e7d32;
}

.detalle-box-value.red {
  color: #c62828;
}

.detalle-box-value.purple {
  color: #6a1b9a;
}

@media (max-width: 700px) {
  .hero-actions {
    min-width: 100%;
  }

  .detalle-dialog {
    width: 100%;
    max-width: 100%;
    border-radius: 0;
  }

  .detalle-title {
    font-size: 21px;
  }
}
</style>