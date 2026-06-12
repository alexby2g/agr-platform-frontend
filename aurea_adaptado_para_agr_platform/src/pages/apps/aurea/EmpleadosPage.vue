<template>
  <q-page class="glamur-page empleados-page">

    <!-- HERO -->
    <section class="glamur-hero q-mb-md">
      <div>
        <div class="glamur-eyebrow">
          <q-icon name="groups" />
          Personal del salón
        </div>

        <div class="glamur-title q-mt-sm">
          Empleados
        </div>

        <div class="glamur-subtitle q-mt-xs">
          Administra el personal, especialidades, estado laboral, accesos y comisiones.
        </div>
      </div>

      <div class="hero-actions">
        <q-btn
          icon="add"
          label="Nuevo empleado"
          class="glamur-btn-light"
          unelevated
          no-caps
          @click="abrirDialogo()"
        />
      </div>
    </section>

    <q-linear-progress
      v-if="loading || loadingComisiones"
      indeterminate
      color="pink"
      class="q-mb-md"
    />

    <!-- MÉTRICAS -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-lg-3">
        <q-card class="glamur-card glamur-card-hover metric-card">
          <q-card-section>
            <div class="row items-center justify-between no-wrap">
              <div>
                <div class="metric-label">Total empleados</div>
                <div class="metric-value">{{ resumen.total }}</div>
                <div class="metric-detail">Registrados en el sistema</div>
              </div>

              <q-avatar class="bg-purple-7" size="58px">
                <q-icon name="groups" color="white" size="30px" />
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
                <div class="metric-label">Activos</div>
                <div class="metric-value">{{ resumen.activos }}</div>
                <div class="metric-detail">Disponibles para trabajar</div>
              </div>

              <q-avatar class="bg-green-7" size="58px">
                <q-icon name="verified" color="white" size="30px" />
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
                <div class="metric-label">Con acceso</div>
                <div class="metric-value">{{ resumen.con_acceso }}</div>
                <div class="metric-detail">Pueden iniciar sesión</div>
              </div>

              <q-avatar class="bg-blue-7" size="58px">
                <q-icon name="admin_panel_settings" color="white" size="30px" />
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
                <div class="metric-label">Inactivos</div>
                <div class="metric-value">{{ resumen.inactivos }}</div>
                <div class="metric-detail">No disponibles actualmente</div>
              </div>

              <q-avatar class="bg-orange-7" size="58px">
                <q-icon name="person_off" color="white" size="30px" />
              </q-avatar>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- COMISIONES DEL MES -->
    <q-card class="glamur-card q-mb-md">
      <q-card-section class="row items-center justify-between q-gutter-sm">
        <div>
          <div class="glamur-section-title">
            Comisiones del mes
          </div>
          <div class="glamur-section-subtitle">
            Calcula automáticamente las comisiones según citas concluidas y pagos realizados.
          </div>
        </div>

        <q-btn
          icon="refresh"
          label="Actualizar comisiones"
          flat
          color="pink-7"
          no-caps
          :loading="loadingComisiones"
          @click="loadComisiones"
        />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-sm-6 col-lg-3">
            <div class="commission-box">
              <div class="commission-label">Citas concluidas</div>
              <div class="commission-value">{{ resumenComisiones.total_citas }}</div>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-lg-3">
            <div class="commission-box">
              <div class="commission-label">Total generado</div>
              <div class="commission-value">Bs {{ money(resumenComisiones.total_generado) }}</div>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-lg-3">
            <div class="commission-box">
              <div class="commission-label">Total pagado</div>
              <div class="commission-value">Bs {{ money(resumenComisiones.total_pagado) }}</div>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-lg-3">
            <div class="commission-box commission-box-main">
              <div class="commission-label">Comisiones a pagar</div>
              <div class="commission-value">Bs {{ money(resumenComisiones.total_comisiones) }}</div>
            </div>
          </div>
        </div>

        <q-table
          :rows="comisiones"
          :columns="columnsComisiones"
          row-key="empleado_id"
          flat
          bordered
          class="glamur-table"
          :loading="loadingComisiones"
          :pagination="{ rowsPerPage: 5 }"
          no-data-label="No hay comisiones calculadas este mes."
        >
          <template #body-cell-empleado="props">
            <q-td :props="props">
              <div class="employee-name">{{ props.row.nombre }}</div>
              <div class="employee-subtitle">
                {{ props.row.cargo || 'Sin cargo' }} · {{ props.row.especialidad || 'General' }}
              </div>
            </q-td>
          </template>

          <template #body-cell-comision_porcentaje="props">
            <q-td :props="props">
              <q-badge color="purple" rounded>
                {{ money(props.row.comision_porcentaje) }}%
              </q-badge>
            </q-td>
          </template>

          <template #body-cell-total_generado="props">
            <q-td :props="props">
              Bs {{ money(props.row.total_generado) }}
            </q-td>
          </template>

          <template #body-cell-total_pagado="props">
            <q-td :props="props">
              Bs {{ money(props.row.total_pagado) }}
            </q-td>
          </template>

          <template #body-cell-comision_total="props">
            <q-td :props="props">
              <div class="money-text">
                Bs {{ money(props.row.comision_total) }}
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- FILTROS -->
    <q-card class="glamur-card q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md items-end">
          <div class="col-12 col-md-5">
            <q-input
              v-model.trim="filtros.buscar"
              label="Buscar empleado"
              placeholder="Nombre, teléfono, CI, cargo o especialidad..."
              outlined
              rounded
              dense
              clearable
              bg-color="white"
              @keyup.enter="load"
            >
              <template #prepend>
                <q-icon name="search" color="pink" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-3">
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
                <q-icon name="toggle_on" color="pink" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-2">
            <q-input
              v-model.trim="filtros.especialidad"
              label="Especialidad"
              outlined
              rounded
              dense
              clearable
              bg-color="white"
              @keyup.enter="load"
            >
              <template #prepend>
                <q-icon name="spa" color="pink" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-2">
            <q-btn
              icon="filter_alt"
              label="Filtrar"
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

    <!-- TABLA -->
    <q-card class="glamur-card">
      <q-card-section class="row items-center justify-between q-gutter-sm">
        <div>
          <div class="glamur-section-title">
            Lista de empleados
          </div>

          <div class="glamur-section-subtitle">
            Crea, edita o desactiva el personal registrado y sus accesos.
          </div>
        </div>

        <q-btn
          icon="refresh"
          label="Actualizar"
          flat
          color="pink-7"
          no-caps
          :loading="loading"
          @click="load"
        />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div v-if="empleados.length === 0 && !loading" class="empty-state">
          <q-icon name="groups" size="58px" color="grey-5" />
          <div>No hay empleados registrados todavía.</div>
          <q-btn
            label="Registrar primer empleado"
            icon="add"
            color="pink-7"
            unelevated
            no-caps
            @click="abrirDialogo()"
          />
        </div>

        <q-table
          v-else
          :rows="empleados"
          :columns="columns"
          row-key="id"
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
                {{ props.row.cargo || 'Sin cargo' }}
              </div>
            </q-td>
          </template>

          <template #body-cell-contacto="props">
            <q-td :props="props">
              <div class="contact-line">
                <q-icon name="call" size="16px" />
                {{ props.row.telefono || 'Sin teléfono' }}
              </div>

              <div class="contact-line">
                <q-icon name="badge" size="16px" />
                {{ props.row.ci || 'Sin CI' }}
              </div>

              <div class="contact-line">
                <q-icon name="email" size="16px" />
                {{ props.row.email || 'Sin correo' }}
              </div>
            </q-td>
          </template>

          <template #body-cell-especialidad="props">
            <q-td :props="props">
              <q-badge color="purple" rounded>
                {{ props.row.especialidad || 'General' }}
              </q-badge>
            </q-td>
          </template>

          <template #body-cell-comision_porcentaje="props">
            <q-td :props="props">
              <div class="money-text">
                {{ money(props.row.comision_porcentaje) }}%
              </div>
            </q-td>
          </template>

          <template #body-cell-acceso="props">
            <q-td :props="props">
              <div v-if="props.row.cuenta_sistema" class="access-box">
                <q-badge
                  :color="props.row.cuenta_sistema.activo ? 'positive' : 'warning'"
                  rounded
                >
                  {{ props.row.cuenta_sistema.activo ? 'Acceso activo' : 'Acceso inactivo' }}
                </q-badge>

                <div class="access-email">
                  {{ props.row.cuenta_sistema.usuario }}
                </div>
              </div>

              <q-badge v-else color="grey-7" rounded>
                Sin acceso
              </q-badge>
            </q-td>
          </template>

          <template #body-cell-activo="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.activo ? 'positive' : 'warning'"
                rounded
              >
                {{ props.row.activo ? 'Activo' : 'Inactivo' }}
              </q-badge>
            </q-td>
          </template>

          <template #body-cell-acciones="props">
            <q-td :props="props">
              <div class="row justify-end q-gutter-xs no-wrap">
                <q-btn dense round flat icon="edit" color="primary" @click="abrirDialogo(props.row)">
                  <q-tooltip>Editar</q-tooltip>
                </q-btn>

                <q-btn dense round flat icon="delete" color="negative" @click="confirmarEliminar(props.row)">
                  <q-tooltip>Eliminar</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- DIALOGO CREAR / EDITAR -->
    <q-dialog
      v-model="dialog"
      persistent
      :maximized="$q.screen.lt.sm"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="employee-dialog">
        <q-card-section class="dialog-header">
          <div>
            <div class="dialog-title">
              {{ editando ? 'Editar empleado' : 'Nuevo empleado' }}
            </div>

            <div class="dialog-subtitle">
              Completa los datos del personal y su acceso si corresponde.
            </div>
          </div>

          <q-btn icon="close" flat round dense color="white" @click="cerrarDialogo" />
        </q-card-section>

        <q-form @submit.prevent="guardarEmpleado">
          <q-card-section class="dialog-body">
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <div class="form-section-title">Datos del empleado</div>
              </div>

              <div class="col-12 col-md-6">
                <q-input v-model.trim="form.nombre" label="Nombre completo *" outlined rounded dense bg-color="white" :rules="[val => !!val || 'El nombre es obligatorio']">
                  <template #prepend>
                    <q-icon name="person" color="pink" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-6">
                <q-input v-model.trim="form.telefono" label="Teléfono" outlined rounded dense bg-color="white">
                  <template #prepend>
                    <q-icon name="call" color="pink" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-6">
                <q-input v-model.trim="form.ci" label="CI" outlined rounded dense bg-color="white">
                  <template #prepend>
                    <q-icon name="badge" color="pink" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-6">
                <q-input v-model.trim="form.email" label="Correo electrónico" type="email" outlined rounded dense bg-color="white">
                  <template #prepend>
                    <q-icon name="email" color="pink" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-6">
                <q-input v-model.trim="form.cargo" label="Cargo" placeholder="Ej: Estilista, recepcionista..." outlined rounded dense bg-color="white">
                  <template #prepend>
                    <q-icon name="work" color="pink" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-6">
                <q-input v-model.trim="form.especialidad" label="Especialidad" placeholder="Ej: Uñas, cejas, pestañas..." outlined rounded dense bg-color="white">
                  <template #prepend>
                    <q-icon name="spa" color="pink" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-4">
                <q-input v-model.number="form.comision_porcentaje" label="Comisión %" type="number" min="0" max="100" step="0.01" outlined rounded dense bg-color="white">
                  <template #prepend>
                    <q-icon name="percent" color="pink" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-4">
                <q-input v-model.number="form.salario_base" label="Salario base" type="number" min="0" step="0.01" outlined rounded dense bg-color="white">
                  <template #prepend>
                    <q-icon name="payments" color="pink" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-4">
                <q-input v-model="form.fecha_ingreso" label="Fecha de ingreso" type="date" outlined rounded dense bg-color="white">
                  <template #prepend>
                    <q-icon name="event" color="pink" />
                  </template>
                </q-input>
              </div>

              <div class="col-12">
                <q-input v-model.trim="form.direccion" label="Dirección" outlined rounded dense bg-color="white">
                  <template #prepend>
                    <q-icon name="location_on" color="pink" />
                  </template>
                </q-input>
              </div>

              <div class="col-12">
                <q-input v-model.trim="form.observaciones" label="Observaciones" type="textarea" outlined rounded dense bg-color="white" autogrow>
                  <template #prepend>
                    <q-icon name="notes" color="pink" />
                  </template>
                </q-input>
              </div>

              <div class="col-12">
                <q-toggle v-model="form.activo" color="pink" checked-icon="check" unchecked-icon="close" label="Empleado activo" />
              </div>

              <div class="col-12">
                <q-separator class="q-my-sm" />
              </div>

              <div class="col-12">
                <div class="access-panel">
                  <div class="row items-start justify-between q-gutter-md">
                    <div>
                      <div class="form-section-title">Acceso al sistema</div>
                      <div class="form-section-subtitle">
                        Permite que este empleado inicie sesión con rol limitado.
                      </div>
                    </div>

                    <q-toggle
                      v-model="form.crear_usuario"
                      color="pink"
                      checked-icon="admin_panel_settings"
                      unchecked-icon="lock"
                      :label="form.cuenta_existente ? 'Mantener acceso' : 'Crear acceso'"
                    />
                  </div>

                  <div v-if="form.crear_usuario" class="row q-col-gutter-md q-mt-sm">
                    <div class="col-12 col-md-6">
                      <q-input
                        v-model.trim="form.usuario_login"
                        label="Correo de acceso"
                        type="email"
                        outlined
                        rounded
                        dense
                        bg-color="white"
                        hint="Puede ser el mismo correo del empleado"
                        :rules="[val => !!val || 'El correo de acceso es obligatorio']"
                      >
                        <template #prepend>
                          <q-icon name="alternate_email" color="purple" />
                        </template>
                      </q-input>
                    </div>

                    <div class="col-12 col-md-6">
                      <q-input
                        v-model.trim="form.password_usuario"
                        :label="form.cuenta_existente ? 'Nueva contraseña opcional' : 'Contraseña inicial *'"
                        type="password"
                        outlined
                        rounded
                        dense
                        bg-color="white"
                        hint="Mínimo 6 caracteres"
                        :rules="reglasPassword"
                      >
                        <template #prepend>
                          <q-icon name="key" color="purple" />
                        </template>
                      </q-input>
                    </div>

                    <div class="col-12">
                      <q-toggle
                        v-model="form.activo_usuario"
                        color="positive"
                        checked-icon="check"
                        unchecked-icon="close"
                        label="Acceso activo para iniciar sesión"
                      />
                    </div>
                  </div>

                  <q-banner v-else dense rounded class="access-warning q-mt-sm">
                    <template #avatar>
                      <q-icon name="info" color="orange" />
                    </template>

                    El empleado quedará registrado, pero no podrá iniciar sesión en la app.
                    Si ya tenía cuenta, al guardar se desactivará su acceso.
                  </q-banner>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right" class="q-pa-md">
            <q-btn label="Cancelar" flat color="grey-7" no-caps @click="cerrarDialogo" />

            <q-btn
              :label="editando ? 'Guardar cambios' : 'Registrar empleado'"
              icon="save"
              color="pink-7"
              unelevated
              no-caps
              type="submit"
              :loading="saving"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '@/boot/axios'

defineOptions({
  name: 'EmpleadosPage'
})

const $q = useQuasar()

const loading = ref(false)
const saving = ref(false)
const loadingComisiones = ref(false)

const dialog = ref(false)
const editando = ref(false)
const empleadoEditandoId = ref(null)

const empleados = ref([])
const comisiones = ref([])

const resumen = ref({
  total: 0,
  activos: 0,
  inactivos: 0,
  con_acceso: 0
})

const resumenComisiones = ref({
  total_empleados: 0,
  total_citas: 0,
  total_generado: 0,
  total_pagado: 0,
  total_comisiones: 0
})

const filtros = ref({
  buscar: '',
  estado: 'todos',
  especialidad: ''
})

const form = ref(formBase())

const estadoOptions = [
  { label: 'Todos', value: 'todos' },
  { label: 'Activos', value: 'activo' },
  { label: 'Inactivos', value: 'inactivo' }
]

const columns = [
  { name: 'nombre', label: 'Empleado', field: 'nombre', align: 'left', sortable: true },
  { name: 'contacto', label: 'Contacto', field: 'telefono', align: 'left', sortable: false },
  { name: 'especialidad', label: 'Especialidad', field: 'especialidad', align: 'center', sortable: true },
  { name: 'comision_porcentaje', label: 'Comisión', field: 'comision_porcentaje', align: 'right', sortable: true },
  { name: 'acceso', label: 'Acceso', field: 'acceso', align: 'center', sortable: false },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center', sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'right', sortable: false }
]

const columnsComisiones = [
  { name: 'empleado', label: 'Empleado', field: 'nombre', align: 'left', sortable: true },
  { name: 'cantidad_citas', label: 'Citas', field: 'cantidad_citas', align: 'center', sortable: true },
  { name: 'comision_porcentaje', label: '% Comisión', field: 'comision_porcentaje', align: 'center', sortable: true },
  { name: 'total_generado', label: 'Generado', field: 'total_generado', align: 'right', sortable: true },
  { name: 'total_pagado', label: 'Pagado', field: 'total_pagado', align: 'right', sortable: true },
  { name: 'comision_total', label: 'Comisión a pagar', field: 'comision_total', align: 'right', sortable: true }
]

const empleadosActivos = computed(() => {
  return empleados.value.filter((empleado) => empleado.activo)
})

const reglasPassword = computed(() => {
  if (!form.value.crear_usuario) {
    return []
  }

  if (form.value.cuenta_existente) {
    return [
      val => !val || String(val).length >= 6 || 'La contraseña debe tener mínimo 6 caracteres'
    ]
  }

  return [
    val => !!val || 'La contraseña inicial es obligatoria',
    val => String(val || '').length >= 6 || 'La contraseña debe tener mínimo 6 caracteres'
  ]
})

watch(
  () => form.value.email,
  (email) => {
    if (!form.value.usuario_login && email) {
      form.value.usuario_login = email
    }
  }
)

watch(
  () => form.value.crear_usuario,
  (activo) => {
    if (activo && !form.value.usuario_login && form.value.email) {
      form.value.usuario_login = form.value.email
    }

    if (!activo) {
      form.value.activo_usuario = false
      form.value.password_usuario = ''
    } else if (!form.value.cuenta_existente) {
      form.value.activo_usuario = true
    }
  }
)

function formBase() {
  return {
    nombre: '',
    telefono: '',
    ci: '',
    email: '',
    cargo: '',
    especialidad: '',
    comision_porcentaje: 0,
    salario_base: 0,
    direccion: '',
    fecha_ingreso: '',
    activo: true,
    observaciones: '',
    crear_usuario: false,
    cuenta_existente: false,
    usuario_login: '',
    password_usuario: '',
    activo_usuario: true
  }
}

function normalizarEmpleado(empleado = {}) {
  return {
    ...empleado,
    activo: Boolean(empleado.activo),
    cuenta_sistema: empleado.cuenta_sistema || null,
    comision_porcentaje: Number(empleado.comision_porcentaje || 0),
    salario_base: Number(empleado.salario_base || 0),
    fecha_ingreso: empleado.fecha_ingreso ? String(empleado.fecha_ingreso).slice(0, 10) : ''
  }
}

function normalizarComision(item = {}) {
  return {
    ...item,
    empleado_id: Number(item.empleado_id || 0),
    activo: Boolean(item.activo),
    comision_porcentaje: Number(item.comision_porcentaje || 0),
    cantidad_citas: Number(item.cantidad_citas || 0),
    total_generado: Number(item.total_generado || 0),
    total_pagado: Number(item.total_pagado || 0),
    comision_total: Number(item.comision_total || 0)
  }
}

function normalizarPayload() {
  const payload = {
    nombre: form.value.nombre,
    telefono: form.value.telefono,
    ci: form.value.ci,
    email: form.value.email,
    cargo: form.value.cargo,
    especialidad: form.value.especialidad,
    comision_porcentaje: Number(form.value.comision_porcentaje || 0),
    salario_base: Number(form.value.salario_base || 0),
    direccion: form.value.direccion,
    fecha_ingreso: form.value.fecha_ingreso || null,
    activo: Boolean(form.value.activo),
    observaciones: form.value.observaciones,
    crear_usuario: Boolean(form.value.crear_usuario),
    activo_usuario: Boolean(form.value.crear_usuario && form.value.activo_usuario)
  }

  if (form.value.crear_usuario) {
    payload.usuario_login = form.value.usuario_login || form.value.email || null

    if (form.value.password_usuario) {
      payload.password_usuario = form.value.password_usuario
    }
  }

  if (!form.value.crear_usuario && form.value.cuenta_existente) {
    payload.activo_usuario = false
  }

  return payload
}

function money(value) {
  return Number(value || 0).toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

function getErrorMessage(error, fallback = 'Ocurrió un error') {
  const data = error?.response?.data

  if (data?.errors) {
    return Object.values(data.errors).flat().join(' ')
  }

  return data?.message || data?.error || fallback
}

async function load() {
  loading.value = true

  try {
    const { data } = await api.get('/empleados', {
      params: {
        buscar: filtros.value.buscar || '',
        estado: filtros.value.estado || 'todos',
        especialidad: filtros.value.especialidad || ''
      }
    })

    empleados.value = Array.isArray(data?.empleados)
      ? data.empleados.map(normalizarEmpleado)
      : []

    resumen.value = {
      total: Number(data?.resumen?.total ?? empleados.value.length),
      activos: Number(data?.resumen?.activos ?? empleadosActivos.value.length),
      inactivos: Number(data?.resumen?.inactivos ?? 0),
      con_acceso: Number(data?.resumen?.con_acceso ?? empleados.value.filter(e => e.cuenta_sistema).length)
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(error, 'No se pudieron cargar los empleados')
    })
  } finally {
    loading.value = false
  }
}

async function loadComisiones() {
  loadingComisiones.value = true

  try {
    const { data } = await api.get('/empleados/comisiones')

    comisiones.value = Array.isArray(data?.comisiones)
      ? data.comisiones.map(normalizarComision)
      : []

    resumenComisiones.value = {
      total_empleados: Number(data?.resumen?.total_empleados || 0),
      total_citas: Number(data?.resumen?.total_citas || 0),
      total_generado: Number(data?.resumen?.total_generado || 0),
      total_pagado: Number(data?.resumen?.total_pagado || 0),
      total_comisiones: Number(data?.resumen?.total_comisiones || 0)
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(error, 'No se pudieron cargar las comisiones')
    })
  } finally {
    loadingComisiones.value = false
  }
}

function abrirDialogo(empleado = null) {
  if (empleado) {
    const normalizado = normalizarEmpleado(empleado)
    const cuenta = normalizado.cuenta_sistema

    editando.value = true
    empleadoEditandoId.value = normalizado.id

    form.value = {
      ...formBase(),
      ...normalizado,
      crear_usuario: Boolean(cuenta),
      cuenta_existente: Boolean(cuenta),
      usuario_login: cuenta?.usuario || normalizado.email || '',
      password_usuario: '',
      activo_usuario: cuenta ? Boolean(cuenta.activo) : true
    }
  } else {
    editando.value = false
    empleadoEditandoId.value = null
    form.value = formBase()
  }

  dialog.value = true
}

function cerrarDialogo() {
  dialog.value = false
  editando.value = false
  empleadoEditandoId.value = null
  form.value = formBase()
}

async function guardarEmpleado() {
  saving.value = true

  try {
    const payload = normalizarPayload()

    if (editando.value && empleadoEditandoId.value) {
      await api.put(`/empleados/${empleadoEditandoId.value}`, payload)

      $q.notify({
        type: 'positive',
        message: 'Empleado actualizado correctamente'
      })
    } else {
      await api.post('/empleados', payload)

      $q.notify({
        type: 'positive',
        message: payload.crear_usuario
          ? 'Empleado registrado con acceso al sistema'
          : 'Empleado registrado correctamente'
      })
    }

    cerrarDialogo()
    await load()
    await loadComisiones()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(error, 'No se pudo guardar el empleado')
    })
  } finally {
    saving.value = false
  }
}

function confirmarEliminar(empleado) {
  $q.dialog({
    title: 'Eliminar empleado',
    message: `¿Deseas eliminar a ${empleado.nombre}? Su acceso al sistema será desactivado.`,
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
      await api.delete(`/empleados/${empleado.id}`)

      $q.notify({
        type: 'positive',
        message: 'Empleado eliminado correctamente'
      })

      await load()
      await loadComisiones()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: getErrorMessage(error, 'No se pudo eliminar el empleado')
      })
    }
  })
}

onMounted(async () => {
  await Promise.all([
    load(),
    loadComisiones()
  ])
})
</script>

<style scoped>
.empleados-page {
  padding-bottom: 36px;
}

.hero-actions {
  min-width: 180px;
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
  font-size: 26px;
  font-weight: 950;
  line-height: 1.2;
  margin-top: 5px;
}

.metric-detail {
  color: #8a7f91;
  font-size: 12px;
  margin-top: 4px;
}

.commission-box {
  padding: 16px;
  border-radius: 18px;
  background: #fff7fb;
  border: 1px solid rgba(233, 30, 99, 0.16);
  min-height: 92px;
}

.commission-box-main {
  background: linear-gradient(135deg, #fff7fb, #ffe0ef);
}

.commission-label {
  color: #7a6f80;
  font-size: 12px;
  font-weight: 850;
}

.commission-value {
  color: #241329;
  font-size: 22px;
  font-weight: 950;
  margin-top: 8px;
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

.contact-line {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #6a536d;
  font-size: 12px;
  line-height: 1.5;
}

.money-text {
  color: #2e7d32;
  font-weight: 950;
}

.access-box {
  display: grid;
  gap: 4px;
  justify-items: center;
}

.access-email {
  max-width: 170px;
  color: #6a536d;
  font-size: 11px;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.employee-dialog {
  width: 940px;
  max-width: 96vw;
  border-radius: 26px;
  overflow: hidden;
}

.dialog-header {
  color: white;
  background: linear-gradient(135deg, #15111f, #e91e63);
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 22px;
}

.dialog-title {
  font-size: 24px;
  font-weight: 950;
}

.dialog-subtitle {
  color: rgba(255, 255, 255, 0.80);
  font-size: 13px;
}

.dialog-body {
  background: #fff7fb;
  max-height: 68vh;
  overflow-y: auto;
}

.form-section-title {
  color: #241329;
  font-size: 15px;
  font-weight: 950;
}

.form-section-subtitle {
  color: #7a6f80;
  font-size: 12px;
  margin-top: 2px;
}

.access-panel {
  padding: 16px;
  border-radius: 22px;
  background: white;
  border: 1px solid rgba(233, 30, 99, 0.12);
  box-shadow: 0 10px 26px rgba(20, 10, 30, 0.06);
}

.access-warning {
  background: #fff8e1;
  color: #6d4c00;
  font-weight: 700;
}

@media (max-width: 700px) {
  .hero-actions {
    min-width: 100%;
  }

  .employee-dialog {
    width: 100%;
    max-width: 100%;
    border-radius: 0;
  }

  .dialog-title {
    font-size: 21px;
  }
}
</style>