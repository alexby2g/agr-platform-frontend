<template>
  <q-page class="glamur-page dashboard-page">

    <!-- HERO PRINCIPAL -->
    <section class="glamur-hero q-mb-md">
      <div>
        <div class="glamur-eyebrow">
          <q-icon name="auto_graph" />
          Panel administrativo
        </div>

        <div class="glamur-title q-mt-sm">
          Panel principal {{ marcaPrincipal }}
        </div>

        <div class="glamur-subtitle q-mt-xs">
          Vista estratégica de citas, clientes, pagos y servicios de {{ nombreNegocio }}.
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

    <!-- MÉTRICAS PRINCIPALES DINÁMICAS -->
    <div class="row q-col-gutter-md">
      <div
        v-for="card in metricCards"
        :key="card.key"
        class="col-12 col-sm-6 col-md-4 col-lg-3"
      >
        <q-card
          class="glamur-card glamur-card-hover metric-card metric-clickable"
          role="button"
          tabindex="0"
          :aria-label="card.tooltip || card.label"
          @click="accionMetricCard(card)"
          @keyup.enter="accionMetricCard(card)"
          @keyup.space.prevent="accionMetricCard(card)"
        >
          <q-tooltip>
            {{ card.tooltip }}
          </q-tooltip>

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

                <div class="metric-cue">
                  <q-icon name="touch_app" size="15px" />
                  {{ card.cta }}
                </div>
              </div>

              <q-avatar :class="[card.avatarClass, 'metric-avatar']" size="58px">
                <q-icon :name="card.icon" size="30px" color="white" />
              </q-avatar>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- ACCIONES RÁPIDAS + ESTADOS -->
    <div class="row q-col-gutter-md q-mt-md">
      <div class="col-12 col-lg-8">
        <q-card class="glamur-card">
          <q-card-section class="row items-start justify-between q-gutter-md">
            <div>
              <div class="glamur-section-title">
                Estado general de citas
              </div>

              <div class="glamur-section-subtitle">
                Resumen simple para decidir qué atender primero.
              </div>
            </div>

            <q-btn
              icon="history"
              label="Ver historial"
              class="glamur-btn"
              unelevated
              no-caps
              @click="abrirHistorial('todas')"
            />
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="row q-col-gutter-md">
              <div
                v-for="item in statusItems"
                :key="item.key"
                class="col-12 col-md-4"
              >
                <div
                  class="status-box"
                  role="button"
                  tabindex="0"
                  @click="abrirHistorial(item.key)"
                  @keyup.enter="abrirHistorial(item.key)"
                  @keyup.space.prevent="abrirHistorial(item.key)"
                >
                  <q-tooltip>
                    Ver citas {{ item.label.toLowerCase() }}
                  </q-tooltip>

                  <div class="row items-center justify-between q-mb-sm">
                    <div class="status-title">
                      <q-icon :name="item.icon" :color="item.color" size="22px" />
                      {{ item.label }}
                    </div>

                    <div class="status-number">
                      {{ item.value }}
                    </div>
                  </div>

                  <q-linear-progress
                    rounded
                    size="14px"
                    :color="item.color"
                    :value="item.percent"
                  />

                  <div class="status-help">
                    {{ Math.round(item.percent * 100) }}% del total registrado
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-4">
        <q-card class="glamur-card">
          <q-card-section>
            <div class="glamur-section-title">
              Acciones rápidas
            </div>

            <div class="glamur-section-subtitle">
              Entradas principales de {{ nombreCorto }}.
            </div>
          </q-card-section>

          <q-card-section class="quick-grid q-pt-none">
            <q-btn
              v-for="action in quickActions"
              :key="action.to"
              :to="action.to"
              :icon="action.icon"
              :label="action.label"
              class="quick-action"
              unelevated
              no-caps
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- GRÁFICOS PRINCIPALES -->
    <div class="row q-col-gutter-md q-mt-md">
      <div class="col-12 col-lg-7">
        <q-card class="glamur-card chart-card">
          <q-card-section>
            <div class="row items-center justify-between q-gutter-sm">
              <div>
                <div class="glamur-section-title">
                  Ingresos por día
                </div>

                <div class="glamur-section-subtitle">
                  Movimiento diario del mes actual.
                </div>
              </div>

              <q-badge class="glamur-chip-soft" rounded>
                Mes actual
              </q-badge>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div v-if="diasChart.length === 0" class="empty-state">
              <q-icon name="bar_chart" size="52px" color="grey-5" />
              <div>No hay ingresos diarios para mostrar.</div>
            </div>

            <div v-else class="bar-list">
              <div
                v-for="item in diasChart"
                :key="item.fecha || item.label"
                class="bar-row bar-row-clickable"
                role="button"
                tabindex="0"
                @click="goToCajaDiaria(item.fecha)"
                @keyup.enter="goToCajaDiaria(item.fecha)"
                @keyup.space.prevent="goToCajaDiaria(item.fecha)"
              >
                <q-tooltip>
                  Ver caja diaria de este día
                </q-tooltip>

                <div class="bar-label">
                  {{ item.label }}
                </div>

                <div class="bar-track">
                  <div
                    class="bar-fill pink"
                    :style="{ width: chartWidth(item.ingresos, maxIngresosDias) + '%' }"
                  />
                </div>

                <div class="bar-value">
                  {{ currency(item.ingresos) }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-5">
        <q-card class="glamur-card chart-card">
          <q-card-section>
            <div class="glamur-section-title">
              Servicios más vendidos
            </div>

            <div class="glamur-section-subtitle">
              Ranking por cantidad de citas.
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div v-if="serviciosChart.length === 0" class="empty-state">
              <q-icon name="spa" size="52px" color="grey-5" />
              <div>No hay servicios registrados todavía.</div>
            </div>

            <div v-else class="service-list">
              <div
                v-for="servicio in serviciosChart"
                :key="servicio.servicio"
                class="service-card service-card-clickable"
                role="button"
                tabindex="0"
                @click="goTo('/apps/aurea/servicios')"
                @keyup.enter="goTo('/apps/aurea/servicios')"
                @keyup.space.prevent="goTo('/apps/aurea/servicios')"
              >
                <q-tooltip>
                  Ver servicios registrados
                </q-tooltip>

                <div class="row items-center justify-between q-mb-xs no-wrap">
                  <div class="service-name ellipsis">
                    {{ servicio.servicio }}
                  </div>

                  <q-badge color="pink-7" rounded>
                    {{ servicio.cantidad }}
                  </q-badge>
                </div>

                <q-linear-progress
                  rounded
                  size="10px"
                  color="purple"
                  :value="progressValue(servicio.cantidad, maxServicios)"
                />

                <div class="service-income">
                  {{ currency(servicio.ingresos) }} en ingresos
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- INGRESOS MENSUALES + ÚLTIMAS CITAS -->
    <div class="row q-col-gutter-md q-mt-md">
      <div class="col-12 col-lg-7">
        <q-card class="glamur-card chart-card">
          <q-card-section>
            <div class="glamur-section-title">
              Ingresos por mes
            </div>

            <div class="glamur-section-subtitle">
              Comparación mensual del año actual.
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="month-grid">
              <div
                v-for="mes in mesesChart"
                :key="mes.label"
                class="month-card month-card-clickable"
                role="button"
                tabindex="0"
                @click="goTo('/apps/aurea/pagos')"
                @keyup.enter="goTo('/apps/aurea/pagos')"
                @keyup.space.prevent="goTo('/apps/aurea/pagos')"
              >
                <q-tooltip>
                  Ver pagos registrados
                </q-tooltip>

                <div class="month-label">
                  {{ mes.label }}
                </div>

                <div class="month-value">
                  {{ currency(mes.ingresos) }}
                </div>

                <q-linear-progress
                  rounded
                  size="8px"
                  color="pink"
                  :value="progressValue(mes.ingresos, maxIngresosMeses)"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-5">
        <q-card class="glamur-card chart-card">
          <q-card-section class="row items-center justify-between q-gutter-sm">
            <div>
              <div class="glamur-section-title">
                Últimas citas
              </div>

              <div class="glamur-section-subtitle">
                Actividad reciente del sistema.
              </div>
            </div>

            <q-btn
              dense
              unelevated
              no-caps
              icon="event"
              label="Ver citas"
              to="/apps/aurea/citas"
              class="glamur-chip-soft"
            />
          </q-card-section>

          <q-separator />

          <q-list separator>
            <q-item v-if="ultimasCitas.length === 0">
              <q-item-section class="text-center text-grey-7 q-pa-lg">
                No hay citas recientes.
              </q-item-section>
            </q-item>

            <q-item
              v-for="cita in ultimasCitas"
              :key="cita.id"
              class="latest-item latest-item-clickable"
              clickable
              @click="goTo('/apps/aurea/citas')"
            >
              <q-tooltip>
                Ver módulo de citas
              </q-tooltip>

              <q-item-section avatar>
                <q-avatar :color="statusOf(cita).color" text-color="white">
                  <q-icon :name="statusOf(cita).icon" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-bold">
                  {{ clienteName(cita) }}
                </q-item-label>

                <q-item-label caption lines="2">
                  {{ cita.servicio || 'Sin servicio' }} · {{ formatDate(cita.fecha) }} {{ formatTime(cita.hora) }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="latest-price">
                  {{ currency(cita.precio) }}
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>

    <!-- HISTORIAL ESTRATÉGICO -->
    <q-dialog
      v-model="historialDialog"
      :maximized="$q.screen.lt.sm"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="history-dialog">
        <q-card-section class="history-header">
          <div>
            <div class="history-title">
              Historial de citas
            </div>

            <div class="history-subtitle">
              Consulta rápida por estado sin salir del dashboard.
            </div>
          </div>

          <q-btn icon="close" flat round dense color="white" v-close-popup />
        </q-card-section>

        <q-tabs
          v-model="filtroHistorial"
          dense
          align="justify"
          active-color="pink-7"
          indicator-color="pink-7"
        >
          <q-tab name="todas" :label="`Todas (${citas.length})`" />
          <q-tab name="pendiente" :label="`Pendientes (${countByEstado('pendiente')})`" />
          <q-tab name="concluida" :label="`Concluidas (${countByEstado('concluida')})`" />
          <q-tab name="cancelada" :label="`Canceladas (${countByEstado('cancelada')})`" />
        </q-tabs>

        <q-separator />

        <q-card-section class="history-body">
          <div v-if="historialFiltrado.length === 0" class="empty-state">
            <q-icon name="event_busy" size="58px" color="grey-5" />
            <div>No hay citas para este filtro.</div>
          </div>

          <q-list v-else separator>
            <q-item
              v-for="cita in historialFiltrado"
              :key="cita.id"
              class="history-item"
            >
              <q-item-section avatar>
                <q-avatar :color="statusOf(cita).color" text-color="white">
                  <q-icon :name="statusOf(cita).icon" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-bold text-pink-7">
                  {{ clienteName(cita) }}
                </q-item-label>

                <q-item-label caption>
                  {{ cita.servicio || 'Sin servicio' }}
                </q-item-label>

                <q-item-label caption>
                  {{ formatDate(cita.fecha) }} · {{ formatTime(cita.hora) }} · {{ currency(cita.precio) }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-badge :color="statusOf(cita).color" rounded>
                  {{ statusOf(cita).label }}
                </q-badge>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cerrar" color="grey-7" v-close-popup />
          <q-btn unelevated label="Nueva cita" icon="add" color="pink-7" to="/apps/aurea/citas" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { api } from '@/boot/axios'
import {
  barPercent,
  estadoCita,
  formatDate,
  formatTime,
  getErrorMessage,
  maxBy,
  money,
  percent,
  toArray
} from '@/utils/glamurUtils'

defineOptions({
  name: 'DashboardPage'
})

const $q = useQuasar()
const router = useRouter()

const loading = ref(false)
const historialDialog = ref(false)
const filtroHistorial = ref('todas')
const citas = ref([])

const valoresBaseConfiguracion = {
  nombre_negocio: 'AUREA Beauty Salon',
  nombre_corto: 'AUREA Beauty',
  slogan: 'Sistema inteligente para salones de belleza',
  telefono: '',
  whatsapp: '',
  direccion: '',
  mensaje_whatsapp: 'Hola, quiero información sobre los servicios de AUREA Beauty Salon.',
  logo_url: '',
  moneda: 'Bs',
  activo: true
}

const configuracion = ref({
  ...valoresBaseConfiguracion
})

const data = ref({
  total: 0,
  citas_hoy: 0,
  citas_mes: 0,
  citas_anio: 0,
  pendientes: 0,
  concluidas: 0,
  canceladas: 0,
  clientes_total: 0,
  ingreso_dia: 0,
  ingreso_mes: 0,
  ingreso_anio: 0,
  estadisticas_dias: [],
  estadisticas_meses: [],
  servicios_top: [],
  ultimas_citas: []
})

const nombreNegocio = computed(() => {
  return configuracion.value.nombre_negocio || valoresBaseConfiguracion.nombre_negocio
})

const nombreCorto = computed(() => {
  return configuracion.value.nombre_corto || valoresBaseConfiguracion.nombre_corto
})

const monedaNegocio = computed(() => {
  return configuracion.value.moneda || valoresBaseConfiguracion.moneda
})

const marcaPrincipal = computed(() => {
  const partes = String(nombreCorto.value || 'AUREA Beauty').trim().split(' ')
  return partes[0] || 'AUREA'
})

const quickActions = [
  { label: 'Nueva cita', icon: 'add_circle', to: '/apps/aurea/citas' },
  { label: 'Clientes', icon: 'people', to: '/apps/aurea/clientes' },
  { label: 'Servicios', icon: 'spa', to: '/apps/aurea/servicios' },
  { label: 'Calendario', icon: 'calendar_month', to: '/apps/aurea/calendario' },
  { label: 'Pagos', icon: 'payments', to: '/apps/aurea/pagos' },
  { label: 'Historial', icon: 'history', to: '/apps/aurea/historial' }
]

const metricCards = computed(() => [
  card(
    'citas_hoy',
    'Citas hoy',
    data.value.citas_hoy,
    'Programadas para hoy',
    'today',
    'bg-pink-7',
    {
      to: '/apps/aurea/calendario',
      tooltip: 'Abrir calendario para revisar las citas del día',
      cta: 'Ver calendario'
    }
  ),

  card(
    'total',
    'Total citas',
    data.value.total,
    'Citas activas registradas',
    'event',
    'bg-purple-7',
    {
      to: '/apps/aurea/citas',
      tooltip: 'Abrir módulo de citas',
      cta: 'Ver citas'
    }
  ),

  card(
    'clientes',
    'Clientes',
    data.value.clientes_total,
    'Clientes activos',
    'people',
    'bg-blue-7',
    {
      to: '/apps/aurea/clientes',
      tooltip: 'Abrir módulo de clientes',
      cta: 'Ver clientes'
    }
  ),

  card(
    'ingreso_dia',
    'Ingresos hoy',
    currency(data.value.ingreso_dia),
    'Pagos del día',
    'payments',
    'bg-teal-7',
    {
      to: '/apps/aurea/caja-diaria',
      tooltip: 'Abrir caja diaria',
      cta: 'Ver caja'
    }
  ),

  card(
    'ingreso_mes',
    'Ingresos mes',
    currency(data.value.ingreso_mes),
    'Mes actual',
    'calendar_month',
    'bg-indigo-7',
    {
      to: '/apps/aurea/pagos',
      tooltip: 'Abrir pagos registrados',
      cta: 'Ver pagos'
    }
  ),

  card(
    'ingreso_anio',
    'Ingresos año',
    currency(data.value.ingreso_anio),
    'Año actual',
    'trending_up',
    'bg-deep-purple-7',
    {
      to: '/apps/aurea/pagos',
      tooltip: 'Abrir resumen de pagos',
      cta: 'Ver ingresos'
    }
  ),

  card(
    'pendientes',
    'Pendientes',
    data.value.pendientes,
    'Por atender',
    'schedule',
    'bg-orange-7',
    {
      action: 'historial',
      filter: 'pendiente',
      tooltip: 'Ver citas pendientes en el historial rápido',
      cta: 'Ver pendientes'
    }
  ),

  card(
    'concluidas',
    'Concluidas',
    data.value.concluidas,
    'Finalizadas',
    'check_circle',
    'bg-green-7',
    {
      action: 'historial',
      filter: 'concluida',
      tooltip: 'Ver citas concluidas en el historial rápido',
      cta: 'Ver concluidas'
    }
  )
])

const statusItems = computed(() => {
  const total = Number(data.value.total || 0)

  return [
    status('pendiente', 'Pendientes', data.value.pendientes, total, 'schedule', 'warning'),
    status('concluida', 'Concluidas', data.value.concluidas, total, 'check_circle', 'positive'),
    status('cancelada', 'Canceladas', data.value.canceladas, total, 'cancel', 'negative')
  ]
})

const diasChart = computed(() => toArray(data.value.estadisticas_dias))
const mesesChart = computed(() => toArray(data.value.estadisticas_meses))
const serviciosChart = computed(() => toArray(data.value.servicios_top))
const ultimasCitas = computed(() => toArray(data.value.ultimas_citas))

const maxIngresosDias = computed(() => maxBy(diasChart.value, 'ingresos'))
const maxIngresosMeses = computed(() => maxBy(mesesChart.value, 'ingresos'))
const maxServicios = computed(() => maxBy(serviciosChart.value, 'cantidad'))

const historialFiltrado = computed(() => {
  const lista = [...citas.value]

  return lista
    .filter((cita) => filtroHistorial.value === 'todas' || statusOf(cita).key === filtroHistorial.value)
    .sort((a, b) => `${b.fecha || ''} ${b.hora || ''}`.localeCompare(`${a.fecha || ''} ${a.hora || ''}`))
})

function card(key, label, value, detail, icon, avatarClass, options = {}) {
  return {
    key,
    label,
    value,
    detail,
    icon,
    avatarClass,
    tooltip: options.tooltip || `Abrir ${label}`,
    cta: options.cta || 'Ver detalle',
    to: options.to || null,
    action: options.action || null,
    filter: options.filter || null
  }
}

function status(key, label, value, total, icon, color) {
  return {
    key,
    label,
    value: Number(value || 0),
    percent: percent(value, total),
    icon,
    color
  }
}

function normalizarConfiguracion(config = {}) {
  return {
    ...valoresBaseConfiguracion,
    ...config,
    activo: config?.activo === undefined ? true : Boolean(config.activo)
  }
}

function aplicarConfiguracion(config = {}) {
  configuracion.value = normalizarConfiguracion(config)
}

function guardarConfiguracionLocal(config = {}) {
  localStorage.setItem('aurea_configuracion', JSON.stringify(normalizarConfiguracion(config)))
}

function cargarConfiguracionLocal() {
  try {
    const guardado = localStorage.getItem('aurea_configuracion')
    return guardado ? JSON.parse(guardado) : null
  } catch {
    return null
  }
}

async function cargarConfiguracionNegocio() {
  const local = cargarConfiguracionLocal()

  if (local) {
    aplicarConfiguracion(local)
  }

  try {
    const { data: configData } = await api.get('/configuracion')
    const config = configData?.configuracion || configData || valoresBaseConfiguracion

    aplicarConfiguracion(config)
    guardarConfiguracionLocal(config)
  } catch {
    if (!local) {
      aplicarConfiguracion(valoresBaseConfiguracion)
    }
  }
}

function statusOf(cita) {
  return estadoCita(cita)
}

function countByEstado(key) {
  return citas.value.filter((cita) => statusOf(cita).key === key).length
}

function chartWidth(value, max) {
  return barPercent(value, max)
}

function progressValue(value, max) {
  return Math.min(Number(value || 0) / Number(max || 1), 1)
}

function currency(value) {
  return `${monedaNegocio.value} ${money(value)}`
}

function clienteName(cita) {
  return cita?.cliente?.nombre || cita?.cliente_nombre || cita?.nombre_cliente || 'Cliente no registrado'
}

function abrirHistorial(filtro = 'todas') {
  filtroHistorial.value = filtro
  historialDialog.value = true
}

function accionMetricCard(cardItem) {
  if (!cardItem) {
    return
  }

  if (cardItem.action === 'historial') {
    abrirHistorial(cardItem.filter || 'todas')
    return
  }

  if (cardItem.to) {
    goTo(cardItem.to)
  }
}

function goTo(to) {
  if (!to) {
    return
  }

  router.push(to)
}

function goToCajaDiaria(fecha = null) {
  if (fecha) {
    router.push({
      path: '/apps/aurea/caja-diaria',
      query: {
        fecha
      }
    })

    return
  }

  router.push('/apps/aurea/caja-diaria')
}

function normalizeDashboard(payload) {
  return {
    total: Number(payload?.total || 0),
    citas_hoy: Number(payload?.citas_hoy || 0),
    citas_mes: Number(payload?.citas_mes || 0),
    citas_anio: Number(payload?.citas_anio || 0),
    pendientes: Number(payload?.pendientes || 0),
    concluidas: Number(payload?.concluidas || 0),
    canceladas: Number(payload?.canceladas || 0),
    clientes_total: Number(payload?.clientes_total || 0),
    ingreso_dia: Number(payload?.ingreso_dia || 0),
    ingreso_mes: Number(payload?.ingreso_mes || 0),
    ingreso_anio: Number(payload?.ingreso_anio || 0),
    estadisticas_dias: toArray(payload?.estadisticas_dias),
    estadisticas_meses: toArray(payload?.estadisticas_meses),
    servicios_top: toArray(payload?.servicios_top),
    ultimas_citas: toArray(payload?.ultimas_citas)
  }
}

async function load() {
  loading.value = true

  try {
    await cargarConfiguracionNegocio()

    const [dashboardResult, citasResult] = await Promise.allSettled([
      api.get('/dashboard'),
      api.get('/apps/aurea/citas')
    ])

    if (dashboardResult.status !== 'fulfilled') {
      throw dashboardResult.reason
    }

    data.value = normalizeDashboard(dashboardResult.value.data || {})

    if (citasResult.status === 'fulfilled') {
      citas.value = toArray(citasResult.value.data, ['citas'])
    } else {
      citas.value = []
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(error, 'No se pudo cargar el dashboard')
    })
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.dashboard-page {
  padding-bottom: 36px;
}

.hero-actions {
  min-width: 170px;
}

.metric-card {
  min-height: 138px;
  outline: none;
}

.metric-clickable {
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.metric-clickable::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(233, 30, 99, 0.08), rgba(156, 39, 176, 0.07));
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.metric-clickable:hover::after {
  opacity: 1;
}

.metric-clickable:focus-visible {
  box-shadow: 0 0 0 3px rgba(233, 30, 99, 0.28);
}

.metric-clickable:hover .metric-avatar {
  transform: scale(1.08) rotate(-4deg);
  box-shadow: 0 14px 28px rgba(156, 39, 176, 0.24);
}

.metric-avatar {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
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

.metric-cue {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #c2185b;
  font-size: 11px;
  font-weight: 900;
  margin-top: 8px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(233, 30, 99, 0.08);
}

.status-box {
  cursor: pointer;
  padding: 16px;
  border-radius: 20px;
  background: #fff7fb;
  border: 1px solid rgba(233, 30, 99, 0.10);
  transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
  outline: none;
}

.status-box:hover {
  transform: translateY(-2px);
  background: #fff0f6;
  box-shadow: 0 12px 24px rgba(233, 30, 99, 0.12);
}

.status-box:focus-visible {
  box-shadow: 0 0 0 3px rgba(233, 30, 99, 0.28);
}

.status-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 900;
  color: #241329;
}

.status-number {
  color: #c2185b;
  font-size: 22px;
  font-weight: 950;
}

.status-help {
  color: #7a6f80;
  font-size: 12px;
  margin-top: 8px;
}

.quick-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.quick-action {
  min-height: 48px;
  border-radius: 16px;
  justify-content: flex-start;
  color: #c2185b;
  font-weight: 900;
  background: rgba(233, 30, 99, 0.09);
}

.chart-card {
  height: 100%;
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

.bar-list {
  max-height: 430px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 4px;
}

.bar-row {
  display: grid;
  grid-template-columns: 52px 1fr 98px;
  align-items: center;
  gap: 10px;
  outline: none;
}

.bar-row-clickable {
  cursor: pointer;
  border-radius: 14px;
  padding: 4px 6px;
  transition: background 0.2s ease, transform 0.2s ease;
}

.bar-row-clickable:hover {
  background: #fff0f6;
  transform: translateX(2px);
}

.bar-row-clickable:focus-visible {
  box-shadow: 0 0 0 3px rgba(233, 30, 99, 0.22);
}

.bar-label {
  color: #7a6f80;
  font-size: 12px;
  font-weight: 900;
}

.bar-track {
  height: 18px;
  border-radius: 999px;
  overflow: hidden;
  background: #f3e5f5;
}

.bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.25s ease;
}

.bar-fill.pink {
  background: linear-gradient(135deg, #e91e63, #ff80ab);
}

.bar-value {
  color: #2e7d32;
  font-size: 12px;
  font-weight: 950;
  text-align: right;
}

.service-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.service-card,
.month-card {
  border-radius: 18px;
  background: #fff7fb;
  border: 1px solid rgba(233, 30, 99, 0.10);
  padding: 12px;
  outline: none;
}

.service-card-clickable,
.month-card-clickable,
.latest-item-clickable {
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}

.service-card-clickable:hover,
.month-card-clickable:hover,
.latest-item-clickable:hover {
  transform: translateY(-2px);
  background: #fff0f6;
  box-shadow: 0 12px 24px rgba(233, 30, 99, 0.12);
}

.service-card-clickable:focus-visible,
.month-card-clickable:focus-visible {
  box-shadow: 0 0 0 3px rgba(233, 30, 99, 0.22);
}

.service-name,
.month-label {
  color: #c2185b;
  font-weight: 950;
}

.service-income,
.month-value {
  color: #2e7d32;
  font-size: 12px;
  font-weight: 900;
  margin-top: 6px;
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.latest-item {
  background: #fff7fb;
}

.latest-price {
  color: #2e7d32;
  font-weight: 950;
}

.history-dialog {
  width: 900px;
  max-width: 96vw;
  border-radius: 26px;
  overflow: hidden;
}

.history-header {
  color: white;
  background: linear-gradient(135deg, #15111f, #e91e63);
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 22px;
}

.history-title {
  font-size: 24px;
  font-weight: 950;
}

.history-subtitle {
  color: rgba(255, 255, 255, 0.80);
  font-size: 13px;
}

.history-body {
  max-height: 58vh;
  overflow-y: auto;
  background: #ffffff;
}

.history-item {
  border-radius: 16px;
  margin-bottom: 8px;
  background: #fff7fb;
}

@media (max-width: 900px) {
  .month-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 700px) {
  .hero-actions {
    min-width: 100%;
  }

  .quick-grid {
    grid-template-columns: 1fr;
  }

  .bar-row {
    grid-template-columns: 46px 1fr 82px;
    gap: 7px;
  }

  .bar-value {
    font-size: 11px;
  }

  .month-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .history-dialog {
    width: 100%;
    max-width: 100%;
    border-radius: 0;
  }
}

@media (max-width: 420px) {
  .month-grid {
    grid-template-columns: 1fr;
  }
}
</style>