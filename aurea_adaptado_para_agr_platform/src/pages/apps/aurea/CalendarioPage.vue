<template>
  <q-page class="q-pa-md calendario-page">

    <!-- HERO -->
    <section class="calendar-hero q-mb-lg">
      <div>
        <div class="hero-badge">
          Agenda inteligente
        </div>

        <div class="text-h4 text-weight-bold text-white q-mt-sm">
          📅 Calendario AUREA
        </div>

        <div class="text-subtitle2 text-white hero-subtitle">
          Control mensual de citas, estados, pagos y extractos
        </div>
      </div>

      <div class="hero-actions">
        <q-btn
          class="btn-white"
          icon="today"
          label="Hoy"
          unelevated
          rounded
          @click="irHoy"
        />

        <q-btn
          class="btn-white"
          icon="point_of_sale"
          label="Caja hoy"
          unelevated
          rounded
          @click="irCajaHoy"
        />

        <q-btn
          class="btn-white"
          icon="picture_as_pdf"
          label="Extracto PDF"
          :loading="descargandoPdf"
          unelevated
          rounded
          @click="descargarExtractoPDF"
        />

        <q-btn
          class="btn-white"
          icon="refresh"
          label="Actualizar"
          :loading="loading"
          unelevated
          rounded
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

    <!-- RESUMEN DINÁMICO -->
    <div class="row q-col-gutter-md q-mb-md">
      <div
        v-for="card in resumenCards"
        :key="card.titulo"
        class="col-12 col-sm-6 col-md-4 col-lg-2"
      >
        <q-card
          class="summary-card summary-clickable"
          role="button"
          tabindex="0"
          @click="accionResumen(card)"
          @keyup.enter="accionResumen(card)"
          @keyup.space.prevent="accionResumen(card)"
        >
          <q-tooltip>
            {{ card.tooltip }}
          </q-tooltip>

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

                <div class="summary-action">
                  <q-icon name="touch_app" size="14px" />
                  {{ card.accionTexto }}
                </div>
              </div>

              <q-avatar :class="[card.clase, 'summary-avatar']" size="48px">
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
              🔎 Buscar y filtrar calendario
            </div>

            <div class="filters-subtitle">
              Filtra por cliente, servicio, estado de cita o estado de pago
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
              placeholder="Buscar cliente, servicio, fecha, hora o monto..."
            >
              <template #prepend>
                <q-icon name="search" color="pink" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-select
              v-model="filtroEstado"
              :options="opcionesEstado"
              outlined
              rounded
              dense
              emit-value
              map-options
              bg-color="white"
              label="Estado cita"
            >
              <template #prepend>
                <q-icon name="event_available" color="purple" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-sm-6 col-md-2">
            <q-select
              v-model="filtroPago"
              :options="opcionesPago"
              outlined
              rounded
              dense
              emit-value
              map-options
              bg-color="white"
              label="Pago"
            >
              <template #prepend>
                <q-icon name="payments" color="green" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-2">
            <q-badge class="result-badge" rounded>
              {{ citasMesFiltradas.length }} de {{ citasMes.length }}
            </q-badge>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- CALENDARIO -->
    <q-card class="calendar-card">

      <q-card-section class="calendar-toolbar">
        <q-btn
          round
          unelevated
          icon="chevron_left"
          class="nav-btn"
          @click="mesAnterior"
        />

        <div class="month-title">
          {{ nombreMes }} {{ anio }}
        </div>

        <q-btn
          round
          unelevated
          icon="chevron_right"
          class="nav-btn"
          @click="mesSiguiente"
        />
      </q-card-section>

      <q-separator />

      <q-card-section class="calendar-content">
        <div class="legend q-mb-md">
          <div class="legend-item">
            <span class="dot dot-green"></span>
            Concluidas
          </div>

          <div class="legend-item">
            <span class="dot dot-yellow"></span>
            Pendientes
          </div>

          <div class="legend-item">
            <span class="dot dot-red"></span>
            Canceladas
          </div>

          <div class="legend-item">
            <span class="dot dot-blue"></span>
            Hoy
          </div>
        </div>

        <div class="calendar-scroll">
          <div class="week-grid q-mb-sm">
            <div
              v-for="dia in diasSemana"
              :key="dia"
              class="week-day"
            >
              {{ dia }}
            </div>
          </div>

          <div class="calendar-grid">

            <div
              v-for="n in espaciosInicio"
              :key="`empty-${n}`"
              class="day-box empty-day"
            ></div>

            <div
              v-for="dia in diasDelMes"
              :key="dia.fecha"
              class="day-box dynamic-day"
              :class="[claseDia(dia), { 'today-day': dia.fecha === hoy }]"
              role="button"
              tabindex="0"
              @click="seleccionarDia(dia.fecha)"
              @keyup.enter="seleccionarDia(dia.fecha)"
              @keyup.space.prevent="seleccionarDia(dia.fecha)"
            >
              <q-tooltip>
                {{ tooltipDia(dia) }}
              </q-tooltip>

              <div class="day-header">
                <div class="day-number">
                  {{ dia.dia }}
                </div>

                <q-icon
                  v-if="dia.fecha === hoy"
                  name="today"
                  color="blue"
                  size="18px"
                />
              </div>

              <div
                v-if="dia.citas.length > 0"
                class="day-summary"
              >
                <q-badge
                  rounded
                  class="summary-badge"
                  :color="colorPrincipalDia(dia)"
                >
                  {{ dia.citas.length }} cita(s)
                </q-badge>

                <div class="mini-states">
                  <span
                    v-if="resumenLista(dia.citas).concluidas > 0"
                    class="mini mini-green"
                    title="Concluidas"
                  >
                    {{ resumenLista(dia.citas).concluidas }}
                  </span>

                  <span
                    v-if="resumenLista(dia.citas).pendientes > 0"
                    class="mini mini-yellow"
                    title="Pendientes"
                  >
                    {{ resumenLista(dia.citas).pendientes }}
                  </span>

                  <span
                    v-if="resumenLista(dia.citas).canceladas > 0"
                    class="mini mini-red"
                    title="Canceladas"
                  >
                    {{ resumenLista(dia.citas).canceladas }}
                  </span>
                </div>

                <div class="day-total">
                  Bs {{ money(totalLista(dia.citas)) }}
                </div>

                <div class="day-paid">
                  Pagado: Bs {{ money(totalPagadoLista(dia.citas)) }}
                </div>

                <div class="day-cue">
                  <q-icon name="touch_app" size="13px" />
                  Ver detalle
                </div>
              </div>

              <div
                v-else
                class="free-day"
              >
                Libre
                <div class="day-cue">
                  <q-icon name="add_circle" size="13px" />
                  Nueva cita
                </div>
              </div>
            </div>

          </div>
        </div>
      </q-card-section>

    </q-card>

    <!-- DIALOG DÍA -->
    <q-dialog
      v-model="dialog"
      :maximized="$q.screen.lt.sm"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="dialog-card">

        <q-card-section class="dialog-header">
          <div>
            <div class="text-h6 text-weight-bold">
              📅 {{ fechaBonita(diaSeleccionado) }}
            </div>

            <div class="text-caption">
              {{ citasDia.length }} cita(s) visibles según filtros
            </div>
          </div>

          <q-space />

          <q-btn
            flat
            round
            dense
            icon="close"
            color="white"
            v-close-popup
          />
        </q-card-section>

        <q-card-section class="dialog-body">

          <div class="day-panel q-mb-md">
            <div
              class="day-panel-item panel-clickable"
              role="button"
              tabindex="0"
              @click="verCitasDelDia"
              @keyup.enter="verCitasDelDia"
              @keyup.space.prevent="verCitasDelDia"
            >
              <q-tooltip>Ver citas de este día</q-tooltip>
              <div class="panel-label">Citas</div>
              <div class="panel-value">{{ citasDia.length }}</div>
            </div>

            <div
              class="day-panel-item panel-clickable"
              role="button"
              tabindex="0"
              @click="irCajaDia"
              @keyup.enter="irCajaDia"
              @keyup.space.prevent="irCajaDia"
            >
              <q-tooltip>Ver caja diaria de este día</q-tooltip>
              <div class="panel-label">Total</div>
              <div class="panel-value green">Bs {{ money(totalLista(citasDia)) }}</div>
            </div>

            <div
              class="day-panel-item panel-clickable"
              role="button"
              tabindex="0"
              @click="verPagos"
              @keyup.enter="verPagos"
              @keyup.space.prevent="verPagos"
            >
              <q-tooltip>Ver pagos registrados</q-tooltip>
              <div class="panel-label">Pagado</div>
              <div class="panel-value green">Bs {{ money(totalPagadoLista(citasDia)) }}</div>
            </div>
          </div>

          <div class="quick-day-actions q-mb-md">
            <q-btn
              outline
              color="pink-7"
              icon="event"
              label="Ver citas"
              no-caps
              @click="verCitasDelDia"
            />

            <q-btn
              outline
              color="green-7"
              icon="point_of_sale"
              label="Caja del día"
              no-caps
              @click="irCajaDia"
            />

            <q-btn
              outline
              color="purple-7"
              icon="payments"
              label="Pagos"
              no-caps
              @click="verPagos"
            />
          </div>

          <div
            v-if="citasDia.length === 0"
            class="empty-box"
          >
            <q-icon name="event_available" size="52px" color="pink-6" />

            <div class="text-weight-bold q-mt-sm">
              No hay citas visibles este día
            </div>

            <div class="text-caption text-grey-7">
              Puedes registrar una nueva cita o limpiar los filtros.
            </div>
          </div>

          <q-list
            v-else
            separator
            class="citas-list"
          >
            <q-item
              v-for="cita in citasDia"
              :key="cita.id"
              class="cita-item dynamic-cita"
              clickable
              @click="verCita(cita)"
            >
              <q-tooltip>
                Abrir módulo de citas con esta fecha
              </q-tooltip>

              <q-item-section avatar>
                <q-avatar :color="colorEstado(cita.estado)" text-color="white">
                  <q-icon :name="iconEstado(cita.estado)" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-bold cita-title">
                  {{ horaBonita(cita.hora) }} - {{ clienteCita(cita) }}
                </q-item-label>

                <q-item-label caption>
                  {{ servicioCita(cita) }}
                </q-item-label>

                <q-item-label caption>
                  Bs {{ money(cita.precio) }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="badge-column">
                  <q-badge
                    rounded
                    :color="colorEstado(cita.estado)"
                    class="estado-badge"
                  >
                    {{ textoEstado(cita.estado) }}
                  </q-badge>

                  <q-badge
                    rounded
                    class="estado-badge"
                    :color="colorPago(cita)"
                  >
                    {{ textoPago(cita) }}
                  </q-badge>
                </div>
              </q-item-section>
            </q-item>
          </q-list>

        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn
            flat
            label="Cerrar"
            color="grey-7"
            v-close-popup
          />

          <q-btn
            outline
            color="pink-7"
            icon="event"
            label="Ver citas"
            @click="verCitasDelDia"
          />

          <q-btn
            outline
            color="green-7"
            icon="point_of_sale"
            label="Caja"
            @click="irCajaDia"
          />

          <q-btn
            class="btn-glamur"
            label="Nueva Cita"
            icon="add"
            @click="nuevaCita"
          />
        </q-card-actions>

      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from '@/boot/axios'
import { guardarYAbrirPdf } from 'src/utils/pdfApp'

defineOptions({
  name: 'CalendarioPage'
})

const router = useRouter()
const $q = useQuasar()

const citas = ref([])
const loading = ref(false)
const descargandoPdf = ref(false)

const dialog = ref(false)
const diaSeleccionado = ref('')

const fecha = ref(new Date())

const busqueda = ref('')
const filtroEstado = ref('todos')
const filtroPago = ref('todos')

const meses = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
]

const diasSemana = [
  'Dom',
  'Lun',
  'Mar',
  'Mié',
  'Jue',
  'Vie',
  'Sáb'
]

const opcionesEstado = [
  { label: 'Todas', value: 'todos' },
  { label: 'Pendientes', value: 'pendiente' },
  { label: 'Concluidas', value: 'concluida' },
  { label: 'Canceladas', value: 'cancelada' }
]

const opcionesPago = [
  { label: 'Todos', value: 'todos' },
  { label: 'Pagados', value: 'pagado' },
  { label: 'Pendientes', value: 'pendiente' }
]

const hoy = computed(() => hoyISO())
const nombreMes = computed(() => meses[fecha.value.getMonth()])
const anio = computed(() => fecha.value.getFullYear())
const mesNumero = computed(() => fecha.value.getMonth() + 1)

const mesClave = computed(() => {
  return `${anio.value}-${String(mesNumero.value).padStart(2, '0')}`
})

const espaciosInicio = computed(() => {
  return new Date(anio.value, fecha.value.getMonth(), 1).getDay()
})

const citasFiltradas = computed(() => {
  const texto = normalizarTexto(busqueda.value)

  return citas.value.filter((cita) => {
    const cumpleTexto = !texto || [
      cita.id,
      cita.fecha,
      cita.hora,
      cita.precio,
      cita.estado,
      cita.estado_pago,
      clienteCita(cita),
      servicioCita(cita)
    ].some(item => normalizarTexto(item).includes(texto))

    const cumpleEstado = estadoCumpleFiltro(cita)
    const cumplePago = pagoCumpleFiltro(cita)

    return cumpleTexto && cumpleEstado && cumplePago
  })
})

const citasMes = computed(() => {
  return citas.value.filter((cita) => fechaISO(cita.fecha).startsWith(mesClave.value))
})

const citasMesFiltradas = computed(() => {
  return citasFiltradas.value.filter((cita) => fechaISO(cita.fecha).startsWith(mesClave.value))
})

const diasDelMes = computed(() => {
  const year = anio.value
  const month = fecha.value.getMonth()
  const lastDay = new Date(year, month + 1, 0).getDate()

  const dias = []

  for (let i = 1; i <= lastDay; i++) {
    const fechaStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`

    const citasDelDia = citasMesFiltradas.value
      .filter((cita) => fechaISO(cita.fecha) === fechaStr)
      .sort((a, b) => String(a.hora || '').localeCompare(String(b.hora || '')))

    dias.push({
      dia: i,
      fecha: fechaStr,
      citas: citasDelDia
    })
  }

  return dias
})

const citasDia = computed(() => {
  if (!diaSeleccionado.value) return []

  return citasFiltradas.value
    .filter((cita) => fechaISO(cita.fecha) === diaSeleccionado.value)
    .sort((a, b) => String(a.hora || '').localeCompare(String(b.hora || '')))
})

const pendientesMes = computed(() => {
  return citasMes.value.filter(cita => esPendiente(cita.estado)).length
})

const concluidasMes = computed(() => {
  return citasMes.value.filter(cita => esConcluida(cita.estado)).length
})

const canceladasMes = computed(() => {
  return citasMes.value.filter(cita => esCancelada(cita.estado)).length
})

const pagadasMes = computed(() => {
  return citasMes.value.filter(cita => esPagado(cita)).length
})

const totalMes = computed(() => {
  return totalLista(citasMes.value)
})

const totalPagadoMes = computed(() => {
  return totalPagadoLista(citasMes.value)
})

const resumenCards = computed(() => [
  {
    titulo: 'Citas mes',
    valor: citasMes.value.length,
    detalle: `${citasMesFiltradas.value.length} visibles`,
    icono: 'calendar_month',
    clase: 'bg-pink-7',
    tipo: 'ruta',
    ruta: '/apps/aurea/citas',
    accionTexto: 'Ver citas',
    tooltip: 'Ir al módulo de citas'
  },
  {
    titulo: 'Pendientes',
    valor: pendientesMes.value,
    detalle: 'Citas por atender',
    icono: 'schedule',
    clase: 'bg-orange-7',
    tipo: 'estado',
    estado: 'pendiente',
    accionTexto: 'Filtrar',
    tooltip: 'Filtrar calendario por citas pendientes'
  },
  {
    titulo: 'Concluidas',
    valor: concluidasMes.value,
    detalle: 'Citas finalizadas',
    icono: 'check_circle',
    clase: 'bg-green-7',
    tipo: 'estado',
    estado: 'concluida',
    accionTexto: 'Filtrar',
    tooltip: 'Filtrar calendario por citas concluidas'
  },
  {
    titulo: 'Canceladas',
    valor: canceladasMes.value,
    detalle: 'Citas canceladas',
    icono: 'cancel',
    clase: 'bg-red-7',
    tipo: 'estado',
    estado: 'cancelada',
    accionTexto: 'Filtrar',
    tooltip: 'Filtrar calendario por citas canceladas'
  },
  {
    titulo: 'Pagadas',
    valor: pagadasMes.value,
    detalle: `Bs ${money(totalPagadoMes.value)}`,
    icono: 'payments',
    clase: 'bg-teal-7',
    tipo: 'pago',
    pago: 'pagado',
    accionTexto: 'Filtrar pagos',
    tooltip: 'Mostrar solo citas pagadas'
  },
  {
    titulo: 'Total mes',
    valor: `Bs ${money(totalMes.value)}`,
    detalle: 'Monto programado',
    icono: 'account_balance_wallet',
    clase: 'bg-purple-7',
    tipo: 'ruta',
    ruta: '/apps/aurea/caja-diaria',
    accionTexto: 'Ver caja',
    tooltip: 'Ir a caja diaria'
  }
])

function getErrorMessage(error) {
  const data = error?.response?.data

  if (data?.errors) {
    return Object.values(data.errors).flat().join(' ')
  }

  return data?.message || data?.error || 'Ocurrió un error'
}

async function getBlobErrorMessage(error, fallback = 'No se pudo generar el extracto PDF') {
  const blob = error?.response?.data

  if (blob instanceof Blob) {
    const texto = await blob.text()

    if (!texto) {
      return fallback
    }

    try {
      const json = JSON.parse(texto)
      return json?.message || json?.error || fallback
    } catch {
      return texto || fallback
    }
  }

  return getErrorMessage(error) || fallback
}

async function load() {
  loading.value = true

  try {
    const { data } = await api.get('/citas')

    citas.value = Array.isArray(data)
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

function accionResumen(card) {
  if (!card) return

  if (card.tipo === 'estado') {
    filtroEstado.value = card.estado || 'todos'
    filtroPago.value = 'todos'

    $q.notify({
      type: 'positive',
      message: `Filtro aplicado: ${card.titulo}`
    })

    return
  }

  if (card.tipo === 'pago') {
    filtroPago.value = card.pago || 'todos'
    filtroEstado.value = 'todos'

    $q.notify({
      type: 'positive',
      message: `Filtro aplicado: ${card.titulo}`
    })

    return
  }

  if (card.tipo === 'ruta') {
    if (card.ruta === '/caja-diaria') {
      router.push({
        path: '/apps/aurea/caja-diaria',
        query: {
          fecha: hoy.value
        }
      })

      return
    }

    router.push(card.ruta)
  }
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

function estadoNormalizado(estado) {
  return normalizarTexto(estado || 'pendiente')
}

function esConcluida(estado) {
  const valor = estadoNormalizado(estado)

  return (
    valor.includes('conclu') ||
    valor.includes('final') ||
    valor.includes('realiz') ||
    valor.includes('complet')
  )
}

function esPendiente(estado) {
  const valor = estadoNormalizado(estado)

  return (
    valor.includes('pend') ||
    (!esConcluida(estado) && !esCancelada(estado))
  )
}

function esCancelada(estado) {
  const valor = estadoNormalizado(estado)

  return (
    valor.includes('cancel') ||
    valor.includes('anulad')
  )
}

function esPagado(cita) {
  const pago = normalizarTexto(cita?.estado_pago || cita?.pago_estado || '')

  return pago.includes('pag')
}

function estadoCumpleFiltro(cita) {
  if (filtroEstado.value === 'todos') return true
  if (filtroEstado.value === 'pendiente') return esPendiente(cita.estado)
  if (filtroEstado.value === 'concluida') return esConcluida(cita.estado)
  if (filtroEstado.value === 'cancelada') return esCancelada(cita.estado)

  return true
}

function pagoCumpleFiltro(cita) {
  if (filtroPago.value === 'todos') return true
  if (filtroPago.value === 'pagado') return esPagado(cita)
  if (filtroPago.value === 'pendiente') return !esPagado(cita)

  return true
}

function resumenLista(lista) {
  const pendientes = lista.filter((cita) => esPendiente(cita.estado)).length
  const concluidas = lista.filter((cita) => esConcluida(cita.estado)).length
  const canceladas = lista.filter((cita) => esCancelada(cita.estado)).length

  return {
    pendientes,
    concluidas,
    canceladas
  }
}

function totalLista(listaCitas) {
  return listaCitas.reduce((total, cita) => {
    return total + Number(cita.precio || 0)
  }, 0)
}

function totalPagadoLista(listaCitas) {
  return listaCitas.reduce((total, cita) => {
    if (!esPagado(cita)) return total

    return total + Number(cita.precio || 0)
  }, 0)
}

function claseDia(dia) {
  if (dia.citas.length === 0) return ''

  const resumen = resumenLista(dia.citas)

  return {
    'has-citas': true,
    'day-green': resumen.concluidas > 0 && resumen.pendientes === 0 && resumen.canceladas === 0,
    'day-yellow': resumen.pendientes > 0 && resumen.canceladas === 0,
    'day-red': resumen.canceladas > 0
  }
}

function colorPrincipalDia(dia) {
  const resumen = resumenLista(dia.citas)

  if (resumen.canceladas > 0) return 'red'
  if (resumen.pendientes > 0) return 'orange'
  if (resumen.concluidas > 0) return 'green'

  return 'grey'
}

function colorEstado(estado) {
  if (esConcluida(estado)) return 'green'
  if (esCancelada(estado)) return 'red'

  return 'orange'
}

function iconEstado(estado) {
  if (esConcluida(estado)) return 'check_circle'
  if (esCancelada(estado)) return 'cancel'

  return 'schedule'
}

function textoEstado(estado) {
  if (esConcluida(estado)) return 'Concluida'
  if (esCancelada(estado)) return 'Cancelada'

  return 'Pendiente'
}

function textoPago(cita) {
  return esPagado(cita) ? 'Pagado' : 'Pago pendiente'
}

function colorPago(cita) {
  return esPagado(cita) ? 'green' : 'orange'
}

function tooltipDia(dia) {
  if (dia.citas.length === 0) {
    return 'Día libre. Clic para crear o revisar este día.'
  }

  return `Ver detalle de ${dia.citas.length} cita(s)`
}

function seleccionarDia(fechaSel) {
  diaSeleccionado.value = fechaSel
  dialog.value = true
}

function mesAnterior() {
  fecha.value = new Date(anio.value, fecha.value.getMonth() - 1, 1)
}

function mesSiguiente() {
  fecha.value = new Date(anio.value, fecha.value.getMonth() + 1, 1)
}

function irHoy() {
  fecha.value = new Date()
  diaSeleccionado.value = hoy.value
  dialog.value = true
}

function irCajaHoy() {
  router.push({
    path: '/apps/aurea/caja-diaria',
    query: {
      fecha: hoy.value
    }
  })
}

function irCajaDia() {
  dialog.value = false

  router.push({
    path: '/apps/aurea/caja-diaria',
    query: {
      fecha: diaSeleccionado.value || hoy.value
    }
  })
}

function nuevaCita() {
  dialog.value = false

  router.push({
    path: '/apps/aurea/citas',
    query: {
      fecha: diaSeleccionado.value || hoy.value
    }
  })
}

function verCitasDelDia() {
  dialog.value = false

  router.push({
    path: '/apps/aurea/citas',
    query: {
      fecha: diaSeleccionado.value || hoy.value
    }
  })
}

function verCita(cita) {
  dialog.value = false

  router.push({
    path: '/apps/aurea/citas',
    query: {
      fecha: fechaISO(cita?.fecha) || diaSeleccionado.value || hoy.value,
      cita_id: cita?.id || ''
    }
  })
}

function verPagos() {
  dialog.value = false

  router.push({
    path: '/apps/aurea/pagos',
    query: {
      fecha: diaSeleccionado.value || hoy.value
    }
  })
}

function limpiarFiltros() {
  busqueda.value = ''
  filtroEstado.value = 'todos'
  filtroPago.value = 'todos'
}

function money(value) {
  return Number(value || 0).toFixed(2)
}

function horaBonita(hora) {
  if (!hora) return '--:--'

  return String(hora).slice(0, 5)
}

function clienteCita(cita) {
  return (
    cita?.cliente?.nombre ||
    cita?.cliente_nombre ||
    cita?.nombre_cliente ||
    'Sin cliente'
  )
}

function servicioCita(cita) {
  return (
    cita?.servicio ||
    cita?.nombre_servicio ||
    cita?.servicio_nombre ||
    'Sin servicio'
  )
}

function fechaBonita(valor) {
  if (!valor) return ''

  const [year, month, day] = valor.split('-')

  return `${day}/${month}/${year}`
}

async function descargarExtractoPDF() {
  descargandoPdf.value = true

  try {
    const response = await api.get('/reportes/extracto-mensual', {
      params: {
        anio: anio.value,
        mes: mesNumero.value
      },
      responseType: 'blob',
      headers: {
        Accept: 'application/pdf'
      }
    })

    const contentType = String(response.headers?.['content-type'] || '').toLowerCase()

    const blob = response.data instanceof Blob
      ? response.data
      : new Blob([response.data], {
        type: contentType || 'application/pdf'
      })

    if (contentType && !contentType.includes('application/pdf') && !contentType.includes('application/octet-stream')) {
      const texto = await blob.text()

      let mensaje = 'No se pudo generar el extracto PDF.'

      try {
        const json = JSON.parse(texto)
        mensaje = json?.message || json?.error || mensaje
      } catch {
        mensaje = texto || mensaje
      }

      throw new Error(mensaje)
    }

    const nombreArchivo = `extracto_aurea_${anio.value}_${String(mesNumero.value).padStart(2, '0')}.pdf`

    await guardarYAbrirPdf(blob, nombreArchivo)

    $q.notify({
      type: 'positive',
      message: 'Extracto PDF generado y abierto correctamente'
    })
  } catch (error) {
    const mensaje = error?.message || await getBlobErrorMessage(error, 'No se pudo generar el extracto PDF')

    $q.notify({
      type: 'negative',
      message: mensaje
    })
  } finally {
    descargandoPdf.value = false
  }
}

onMounted(() => {
  load()
})
</script>

<style scoped>
.calendario-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(233, 30, 99, 0.10), transparent 32%),
    linear-gradient(180deg, #fff7fb 0%, #f7f7fb 100%);
}

/* HERO */

.calendar-hero {
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

.calendar-hero::after {
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
  gap: 10px;
  flex-wrap: wrap;
  z-index: 1;
}

.btn-white {
  background: white;
  color: #c2185b;
  font-weight: 900;
  border-radius: 16px;
  padding: 10px 16px;
}

.btn-glamur {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
  font-weight: 900;
  border-radius: 16px;
}

/* SUMMARY */

.summary-card {
  min-height: 132px;
  border-radius: 24px;
  background: white;
  box-shadow: 0 14px 35px rgba(156, 39, 176, 0.12);
  border: 1px solid rgba(233, 30, 99, 0.08);
  transition: all 0.25s ease;
  outline: none;
}

.summary-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 42px rgba(233, 30, 99, 0.18);
}

.summary-clickable {
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.summary-clickable::after {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0;
  background: linear-gradient(135deg, rgba(233, 30, 99, 0.08), rgba(156, 39, 176, 0.08));
  transition: opacity 0.22s ease;
  pointer-events: none;
}

.summary-clickable:hover::after {
  opacity: 1;
}

.summary-clickable:focus-visible {
  box-shadow: 0 0 0 3px rgba(233, 30, 99, 0.28);
}

.summary-clickable:hover .summary-avatar {
  transform: scale(1.08) rotate(-4deg);
  box-shadow: 0 12px 25px rgba(156, 39, 176, 0.24);
}

.summary-avatar {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
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

.summary-action {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 8px;
  padding: 4px 8px;
  border-radius: 999px;
  color: #c2185b;
  background: rgba(233, 30, 99, 0.08);
  font-size: 11px;
  font-weight: 900;
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

/* CALENDARIO */

.calendar-card {
  border-radius: 28px;
  overflow: hidden;
  background: white;
  box-shadow: 0 16px 38px rgba(156, 39, 176, 0.12);
  border: 1px solid rgba(233, 30, 99, 0.08);
}

.calendar-toolbar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: white;
  padding: 18px;
}

.nav-btn {
  background: #fce4ec;
  color: #c2185b;
}

.month-title {
  min-width: 240px;
  text-align: center;
  font-size: 24px;
  font-weight: 900;
  color: #880e4f;
  text-transform: capitalize;
}

.calendar-content {
  background: white;
}

.legend {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #555;
  font-weight: 800;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.dot-green {
  background: #2e7d32;
}

.dot-yellow {
  background: #f9a825;
}

.dot-red {
  background: #c62828;
}

.dot-blue {
  background: #1976d2;
}

.calendar-scroll {
  width: 100%;
  overflow-x: auto;
}

.week-grid,
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(112px, 1fr));
  gap: 10px;
  min-width: 780px;
}

.week-day {
  text-align: center;
  font-weight: 900;
  color: #880e4f;
  padding: 9px;
  background: #fce4ec;
  border-radius: 14px;
}

.day-box {
  min-height: 145px;
  border: 1px solid #ead7e2;
  padding: 12px;
  cursor: pointer;
  border-radius: 20px;
  background: white;
  transition: all 0.22s ease;
  box-shadow: 0 8px 20px rgba(156, 39, 176, 0.06);
  outline: none;
}

.day-box:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 28px rgba(233, 30, 99, 0.16);
}

.dynamic-day:focus-visible {
  box-shadow: 0 0 0 3px rgba(233, 30, 99, 0.28);
}

.empty-day {
  background: transparent;
  box-shadow: none;
  border: none;
  cursor: default;
}

.empty-day:hover {
  transform: none;
  box-shadow: none;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.day-number {
  font-size: 20px;
  font-weight: 900;
  color: #2b1730;
}

.today-day {
  outline: 2px solid #1976d2;
  outline-offset: -2px;
}

.has-citas {
  border-width: 2px;
}

.day-green {
  border-color: #43a047;
  background: #f1fff4;
}

.day-yellow {
  border-color: #f9a825;
  background: #fffaf0;
}

.day-red {
  border-color: #e53935;
  background: #fff5f5;
}

.day-summary {
  margin-top: 10px;
}

.summary-badge {
  font-weight: 900;
}

.mini-states {
  display: flex;
  gap: 5px;
  margin-top: 8px;
}

.mini {
  min-width: 24px;
  height: 22px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  color: white;
  font-size: 12px;
  font-weight: 900;
}

.mini-green {
  background: #2e7d32;
}

.mini-yellow {
  background: #f9a825;
}

.mini-red {
  background: #c62828;
}

.day-total {
  margin-top: 8px;
  font-size: 12px;
  font-weight: 900;
  color: #1b5e20;
  background: rgba(76, 175, 80, 0.12);
  border-radius: 10px;
  padding: 5px 7px;
  display: inline-block;
}

.day-paid {
  margin-top: 6px;
  font-size: 11px;
  font-weight: 900;
  color: #00695c;
}

.day-cue {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  color: #c2185b;
  font-size: 11px;
  font-weight: 900;
}

.free-day {
  margin-top: 12px;
  color: #999;
  font-size: 12px;
  font-weight: 700;
}

/* DIALOG */

.dialog-card {
  width: 720px;
  max-width: 96vw;
  max-height: 88vh;
  border-radius: 26px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: white;
}

.dialog-header {
  flex: 0 0 auto;
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
  display: flex;
  align-items: center;
  padding: 20px 22px;
}

.dialog-body {
  flex: 1 1 auto;
  min-height: 0;
  background: white;
  padding: 20px;
  overflow-y: auto;
}

.day-panel {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.day-panel-item {
  background: #fff7fb;
  border: 1px solid rgba(233, 30, 99, 0.10);
  border-radius: 18px;
  padding: 14px;
  outline: none;
}

.panel-clickable {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.panel-clickable:hover {
  transform: translateY(-2px);
  background: #fff0f6;
  box-shadow: 0 12px 24px rgba(233, 30, 99, 0.12);
}

.panel-clickable:focus-visible {
  box-shadow: 0 0 0 3px rgba(233, 30, 99, 0.24);
}

.panel-label {
  color: #777;
  font-size: 12px;
  font-weight: 800;
}

.panel-value {
  color: #c2185b;
  font-size: 20px;
  font-weight: 900;
}

.panel-value.green {
  color: #2e7d32;
}

.quick-day-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.empty-box {
  text-align: center;
  padding: 32px 14px;
  border: 1px dashed #e9b5ce;
  border-radius: 20px;
  background: #fff7fb;
}

.citas-list {
  border-radius: 18px;
  overflow: hidden;
}

.cita-item {
  border-radius: 16px;
  margin-bottom: 8px;
  background: #fff7fb;
  border: 1px solid rgba(233, 30, 99, 0.08);
}

.dynamic-cita {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.dynamic-cita:hover {
  transform: translateX(3px);
  box-shadow: 0 12px 24px rgba(233, 30, 99, 0.10);
}

.cita-title {
  color: #c2185b;
}

.badge-column {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.estado-badge {
  text-transform: capitalize;
  font-weight: 800;
  padding: 5px 9px;
}

.dialog-actions {
  flex: 0 0 auto;
  padding: 14px 18px;
  background: white;
  border-top: 1px solid #eeeeee;
  box-shadow: 0 -8px 22px rgba(0, 0, 0, 0.08);
  gap: 10px;
}

/* MOBILE */

@media (max-width: 700px) {
  .calendario-page {
    padding: 10px;
  }

  .calendar-hero {
    padding: 22px;
    border-radius: 22px;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .calendar-hero .text-h4 {
    font-size: 28px;
  }

  .hero-actions,
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

  .calendar-toolbar {
    gap: 10px;
    padding: 14px 10px;
  }

  .month-title {
    min-width: auto;
    font-size: 19px;
  }

  .week-grid,
  .calendar-grid {
    grid-template-columns: repeat(7, 96px);
    min-width: 710px;
  }

  .day-box {
    min-height: 132px;
    padding: 10px;
  }

  .day-total {
    font-size: 11px;
    padding: 4px 6px;
  }

  .dialog-card {
    width: 100vw;
    max-width: 100vw;
    height: 100dvh;
    max-height: 100dvh;
    border-radius: 0;
  }

  .dialog-header {
    padding: 18px;
  }

  .dialog-body {
    padding: 14px;
  }

  .day-panel {
    grid-template-columns: 1fr;
  }

  .quick-day-actions .q-btn {
    width: 100%;
  }

  .cita-item {
    padding: 10px;
  }

  .badge-column {
    align-items: flex-start;
    margin-top: 8px;
  }

  .dialog-actions {
    padding: 12px 14px calc(14px + env(safe-area-inset-bottom));
    flex-wrap: wrap;
  }

  .dialog-actions .q-btn {
    width: 100%;
    min-height: 44px;
  }
}
</style>