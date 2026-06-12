<template>
  <q-page class="glamur-page mis-citas-page">

    <!-- HERO -->
    <section class="glamur-hero q-mb-md">
      <div>
        <div class="glamur-eyebrow">
          <q-icon name="event_available" />
          Panel del empleado
        </div>

        <div class="glamur-title q-mt-sm">
          Mis citas
        </div>

        <div class="glamur-subtitle q-mt-xs">
          Consulta tus citas asignadas, revisa el estado y marca como concluida cuando termines el servicio.
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

    <!-- RESUMEN -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-lg-3">
        <q-card class="glamur-card glamur-card-hover metric-card">
          <q-card-section>
            <div class="row items-center justify-between no-wrap">
              <div>
                <div class="metric-label">Total citas</div>
                <div class="metric-value">{{ resumen.total }}</div>
                <div class="metric-detail">Asignadas a ti</div>
              </div>

              <q-avatar class="bg-purple-7" size="58px">
                <q-icon name="event" color="white" size="30px" />
              </q-avatar>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-lg-3">
        <q-card class="glamur-card glamur-card-hover metric-card">
          <q-card-section>
            <div class="row items-center justify-between no-wrap">
              <div>
                <div class="metric-label">Pendientes</div>
                <div class="metric-value">{{ resumen.pendientes }}</div>
                <div class="metric-detail">Por atender</div>
              </div>

              <q-avatar class="bg-orange-7" size="58px">
                <q-icon name="schedule" color="white" size="30px" />
              </q-avatar>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-lg-3">
        <q-card class="glamur-card glamur-card-hover metric-card">
          <q-card-section>
            <div class="row items-center justify-between no-wrap">
              <div>
                <div class="metric-label">Concluidas</div>
                <div class="metric-value">{{ resumen.concluidas }}</div>
                <div class="metric-detail">Servicios terminados</div>
              </div>

              <q-avatar class="bg-green-7" size="58px">
                <q-icon name="check_circle" color="white" size="30px" />
              </q-avatar>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-lg-3">
        <q-card class="glamur-card glamur-card-hover metric-card">
          <q-card-section>
            <div class="row items-center justify-between no-wrap">
              <div>
                <div class="metric-label">Total generado</div>
                <div class="metric-value">Bs {{ money(resumen.total_generado) }}</div>
                <div class="metric-detail">Por citas concluidas</div>
              </div>

              <q-avatar class="bg-teal-7" size="58px">
                <q-icon name="payments" color="white" size="30px" />
              </q-avatar>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- FILTROS -->
    <q-card class="glamur-card q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md items-end">
          <div class="col-12 col-md-4">
            <q-select
              v-model="filtros.estado"
              :options="estadoOptions"
              label="Estado"
              outlined
              rounded
              dense
              emit-value
              map-options
              bg-color="white"
            >
              <template #prepend>
                <q-icon name="filter_alt" color="pink" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-4">
            <q-input
              v-model="filtros.fecha"
              label="Filtrar por fecha"
              type="date"
              outlined
              rounded
              dense
              clearable
              bg-color="white"
            >
              <template #prepend>
                <q-icon name="event" color="pink" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-4">
            <q-btn
              icon="search"
              label="Buscar"
              class="glamur-btn full-width"
              unelevated
              no-caps
              :loading="loading"
              @click="load"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- LISTA -->
    <q-card class="glamur-card">
      <q-card-section class="row items-center justify-between q-gutter-sm">
        <div>
          <div class="glamur-section-title">
            Citas asignadas
          </div>

          <div class="glamur-section-subtitle">
            Solo se muestran las citas vinculadas a tu cuenta de empleado.
          </div>
        </div>

        <q-btn
          flat
          icon="restart_alt"
          label="Limpiar filtros"
          color="pink-7"
          no-caps
          @click="limpiarFiltros"
        />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div v-if="citas.length === 0 && !loading" class="empty-state">
          <q-icon name="event_busy" size="60px" color="grey-5" />

          <div class="text-weight-bold">
            No tienes citas asignadas
          </div>

          <div class="text-caption text-grey-7">
            Cuando el administrador te asigne una cita, aparecerá aquí.
          </div>
        </div>

        <q-table
          v-else
          :rows="citas"
          :columns="columns"
          row-key="id"
          flat
          bordered
          class="glamur-table"
          :loading="loading"
          :pagination="{ rowsPerPage: 10 }"
        >
          <template #body-cell-cliente="props">
            <q-td :props="props">
              <div class="client-name">
                {{ clienteNombre(props.row) }}
              </div>

              <div class="client-phone">
                <q-icon name="call" size="15px" />
                {{ props.row.cliente?.telefono || 'Sin teléfono' }}
              </div>
            </q-td>
          </template>

          <template #body-cell-servicio="props">
            <q-td :props="props">
              <div class="service-name">
                {{ props.row.servicio || 'Sin servicio' }}
              </div>

              <div class="service-price">
                Bs {{ money(props.row.precio) }}
              </div>
            </q-td>
          </template>

          <template #body-cell-fecha="props">
            <q-td :props="props">
              <div class="date-main">
                {{ formatDate(props.row.fecha) }}
              </div>

              <div class="date-time">
                <q-icon name="schedule" size="15px" />
                {{ formatTime(props.row.hora) }}
              </div>
            </q-td>
          </template>

          <template #body-cell-estado="props">
            <q-td :props="props">
              <q-badge
                :color="estadoInfo(props.row.estado).color"
                rounded
              >
                <q-icon
                  :name="estadoInfo(props.row.estado).icon"
                  size="14px"
                  class="q-mr-xs"
                />
                {{ estadoInfo(props.row.estado).label }}
              </q-badge>
            </q-td>
          </template>

          <template #body-cell-pago="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.estado_pago === 'pagado' ? 'positive' : 'warning'"
                rounded
              >
                {{ props.row.estado_pago === 'pagado' ? 'Pagado' : 'Pendiente' }}
              </q-badge>
            </q-td>
          </template>

          <template #body-cell-acciones="props">
            <q-td :props="props">
              <div class="row justify-end q-gutter-xs no-wrap">
                <q-btn
                  v-if="props.row.estado === 'pendiente'"
                  dense
                  unelevated
                  rounded
                  icon="check_circle"
                  label="Concluir"
                  color="positive"
                  no-caps
                  :loading="finalizandoId === props.row.id"
                  @click="confirmarFinalizar(props.row)"
                />

                <q-btn
                  v-else
                  dense
                  flat
                  rounded
                  icon="visibility"
                  label="Revisado"
                  color="grey-7"
                  no-caps
                  disable
                />
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- VISTA MÓVIL EXTRA -->
    <div class="mobile-list q-mt-md">
      <q-card
        v-for="cita in citas"
        :key="`mobile-${cita.id}`"
        class="mobile-card"
      >
        <q-card-section>
          <div class="row items-start justify-between q-gutter-sm no-wrap">
            <div>
              <div class="mobile-client">
                {{ clienteNombre(cita) }}
              </div>

              <div class="mobile-service">
                {{ cita.servicio || 'Sin servicio' }}
              </div>
            </div>

            <q-badge
              :color="estadoInfo(cita.estado).color"
              rounded
            >
              {{ estadoInfo(cita.estado).label }}
            </q-badge>
          </div>

          <div class="mobile-info q-mt-sm">
            <div>
              <q-icon name="event" />
              {{ formatDate(cita.fecha) }}
            </div>

            <div>
              <q-icon name="schedule" />
              {{ formatTime(cita.hora) }}
            </div>

            <div>
              <q-icon name="payments" />
              Bs {{ money(cita.precio) }}
            </div>
          </div>

          <q-btn
            v-if="cita.estado === 'pendiente'"
            class="q-mt-md full-width"
            color="positive"
            icon="check_circle"
            label="Marcar como concluida"
            unelevated
            rounded
            no-caps
            :loading="finalizandoId === cita.id"
            @click="confirmarFinalizar(cita)"
          />
        </q-card-section>
      </q-card>
    </div>

  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '@/boot/axios'

defineOptions({
  name: 'MisCitasPage'
})

const $q = useQuasar()

const loading = ref(false)
const finalizandoId = ref(null)

const citas = ref([])

const resumen = ref({
  total: 0,
  pendientes: 0,
  concluidas: 0,
  canceladas: 0,
  total_generado: 0,
  total_pagado: 0
})

const filtros = ref({
  estado: 'todos',
  fecha: ''
})

const estadoOptions = [
  {
    label: 'Todas',
    value: 'todos'
  },
  {
    label: 'Pendientes',
    value: 'pendiente'
  },
  {
    label: 'Concluidas',
    value: 'concluida'
  },
  {
    label: 'Canceladas',
    value: 'cancelada'
  }
]

const columns = [
  {
    name: 'cliente',
    label: 'Cliente',
    field: 'cliente',
    align: 'left',
    sortable: false
  },
  {
    name: 'servicio',
    label: 'Servicio',
    field: 'servicio',
    align: 'left',
    sortable: true
  },
  {
    name: 'fecha',
    label: 'Fecha / Hora',
    field: 'fecha',
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
    name: 'pago',
    label: 'Pago',
    field: 'estado_pago',
    align: 'center',
    sortable: true
  },
  {
    name: 'acciones',
    label: 'Acciones',
    field: 'acciones',
    align: 'right',
    sortable: false
  }
]

function money(value) {
  return Number(value || 0).toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

function formatDate(fecha) {
  if (!fecha) return 'Sin fecha'

  const [year, month, day] = String(fecha).split('-')

  if (!year || !month || !day) {
    return fecha
  }

  return `${day}/${month}/${year}`
}

function formatTime(hora) {
  if (!hora) return 'Sin hora'

  return String(hora).slice(0, 5)
}

function clienteNombre(cita) {
  return cita?.cliente?.nombre || cita?.cliente_nombre || 'Cliente no registrado'
}

function estadoInfo(estado) {
  const estadoLimpio = String(estado || 'pendiente').toLowerCase()

  if (estadoLimpio === 'concluida') {
    return {
      label: 'Concluida',
      color: 'positive',
      icon: 'check_circle'
    }
  }

  if (estadoLimpio === 'cancelada') {
    return {
      label: 'Cancelada',
      color: 'negative',
      icon: 'cancel'
    }
  }

  return {
    label: 'Pendiente',
    color: 'warning',
    icon: 'schedule'
  }
}

function getErrorMessage(error, fallback = 'Ocurrió un error') {
  const data = error?.response?.data

  if (data?.errors) {
    return Object.values(data.errors).flat().join(' ')
  }

  return data?.message || data?.error || fallback
}

function normalizarCita(cita = {}) {
  return {
    ...cita,
    precio: Number(cita.precio || 0),
    estado: cita.estado || 'pendiente',
    estado_pago: cita.estado_pago || 'pendiente',
    cliente: cita.cliente || null,
    empleado: cita.empleado || null
  }
}

function normalizarResumen(data = {}) {
  return {
    total: Number(data.total || 0),
    pendientes: Number(data.pendientes || 0),
    concluidas: Number(data.concluidas || 0),
    canceladas: Number(data.canceladas || 0),
    total_generado: Number(data.total_generado || 0),
    total_pagado: Number(data.total_pagado || 0)
  }
}

async function load() {
  loading.value = true

  try {
    const { data } = await api.get('/empleado/mis-citas', {
      params: {
        estado: filtros.value.estado || 'todos',
        fecha: filtros.value.fecha || ''
      }
    })

    citas.value = Array.isArray(data?.citas)
      ? data.citas.map(normalizarCita)
      : []

    resumen.value = normalizarResumen(data?.resumen || {})
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(error, 'No se pudieron cargar tus citas')
    })
  } finally {
    loading.value = false
  }
}

function limpiarFiltros() {
  filtros.value = {
    estado: 'todos',
    fecha: ''
  }

  load()
}

function confirmarFinalizar(cita) {
  $q.dialog({
    title: 'Concluir cita',
    message: `¿Deseas marcar como concluida la cita de ${clienteNombre(cita)}?`,
    persistent: true,
    ok: {
      label: 'Sí, concluir',
      color: 'positive',
      unelevated: true
    },
    cancel: {
      label: 'Cancelar',
      color: 'grey-7',
      flat: true
    }
  }).onOk(() => {
    finalizarCita(cita)
  })
}

async function finalizarCita(cita) {
  finalizandoId.value = cita.id

  try {
    await api.put(`/empleado/mis-citas/${cita.id}/finalizar`)

    $q.notify({
      type: 'positive',
      message: 'Cita marcada como concluida'
    })

    await load()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(error, 'No se pudo finalizar la cita')
    })
  } finally {
    finalizandoId.value = null
  }
}

onMounted(load)
</script>

<style scoped>
.mis-citas-page {
  padding-bottom: 36px;
}

.hero-actions {
  min-width: 170px;
}

.metric-card {
  min-height: 138px;
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
}

.metric-detail {
  color: #8a7f91;
  font-size: 12px;
  margin-top: 4px;
}

.empty-state {
  min-height: 230px;
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

.client-name {
  color: #c2185b;
  font-weight: 950;
}

.client-phone {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #7a6f80;
  font-size: 12px;
  margin-top: 3px;
}

.service-name {
  color: #241329;
  font-weight: 900;
}

.service-price {
  color: #2e7d32;
  font-size: 12px;
  font-weight: 950;
  margin-top: 3px;
}

.date-main {
  color: #241329;
  font-weight: 900;
}

.date-time {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #7a6f80;
  font-size: 12px;
  margin-top: 3px;
}

.mobile-list {
  display: none;
}

.mobile-card {
  border-radius: 22px;
  margin-bottom: 12px;
  border: 1px solid rgba(233, 30, 99, 0.12);
  box-shadow: 0 10px 28px rgba(20, 10, 30, 0.07);
}

.mobile-client {
  color: #c2185b;
  font-size: 17px;
  font-weight: 950;
}

.mobile-service {
  color: #7a6f80;
  font-size: 13px;
  font-weight: 800;
  margin-top: 2px;
}

.mobile-info {
  display: grid;
  gap: 6px;
  color: #5f5366;
  font-size: 13px;
  font-weight: 800;
}

.mobile-info div {
  display: flex;
  align-items: center;
  gap: 7px;
}

@media (max-width: 700px) {
  .hero-actions {
    min-width: 100%;
  }

  .glamur-table {
    display: none;
  }

  .mobile-list {
    display: block;
  }
}
</style>