<template>
  <q-page class="q-pa-lg clientes-page">

    <!-- HERO -->
    <section class="clientes-hero q-mb-lg">
      <div>
        <div class="hero-badge">
          Gestión de clientes
        </div>

        <div class="text-h4 text-weight-bold text-white q-mt-sm">
          👥 Clientes AUREA
        </div>

        <div class="text-subtitle2 text-white hero-subtitle">
          Administra clientes, revisa su perfil, historial y contacto directo
        </div>
      </div>

      <div class="hero-actions">
        <q-btn
          icon="contacts"
          label="Importar contactos"
          class="btn-white"
          unelevated
          rounded
          @click="abrirImportarContactos"
        />

        <q-btn
          icon="add"
          label="Nuevo Cliente"
          class="btn-white"
          unelevated
          rounded
          @click="openDialog"
        />

        <q-btn
          icon="refresh"
          label="Actualizar"
          class="btn-white"
          unelevated
          rounded
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
      <div
        v-for="card in resumenCards"
        :key="card.titulo"
        class="col-12 col-sm-6 col-md-4 col-lg-3"
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

              <q-avatar :class="card.clase" size="50px">
                <q-icon :name="card.icono" color="white" size="26px" />
              </q-avatar>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- BUSCADOR CLIENTES -->
    <q-card class="filters-card q-mb-md">
      <q-card-section>
        <div class="filters-header q-mb-md">
          <div>
            <div class="filters-title">
              🔎 Buscar clientes
            </div>

            <div class="filters-subtitle">
              Busca por nombre, teléfono o código de cliente
            </div>
          </div>

          <q-btn
            flat
            rounded
            icon="cleaning_services"
            label="Limpiar"
            color="pink-7"
            @click="busquedaCliente = ''"
          />
        </div>

        <div class="buscador-row">
          <q-input
            v-model="busquedaCliente"
            class="buscador-input"
            outlined
            rounded
            dense
            clearable
            bg-color="white"
            debounce="200"
            placeholder="Buscar por nombre, teléfono o código de cliente..."
          >
            <template #prepend>
              <q-icon name="search" color="pink" />
            </template>
          </q-input>

          <q-badge class="result-badge" rounded>
            {{ clientesFiltradosTabla.length }} de {{ clientes.length }}
          </q-badge>
        </div>
      </q-card-section>
    </q-card>

    <!-- TABLA CLIENTES -->
    <q-card class="card-table">
      <q-table
        class="tabla-glamur"
        :rows="clientesFiltradosTabla"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :no-data-label="busquedaCliente ? 'No se encontraron clientes con esa búsqueda' : 'No hay clientes registrados'"
        flat
        bordered
        :rows-per-page-options="[5, 10, 20, 50]"
      >
        <!-- NOMBRE -->
        <template #body-cell-nombre="props">
          <q-td :props="props">
            <div class="cliente-cell">
              <q-avatar class="avatar-pink" size="40px">
                <q-icon name="person" color="white" />
              </q-avatar>

              <div>
                <div class="text-weight-bold text-pink-7">
                  {{ props.row.nombre || 'Sin nombre' }}
                </div>

                <div class="text-caption text-grey-7">
                  Cliente AUREA #{{ props.row.id }}
                </div>
              </div>
            </div>
          </q-td>
        </template>

        <!-- TELÉFONO -->
        <template #body-cell-telefono="props">
          <q-td :props="props">
            <div class="telefono-box">
              <q-icon name="phone" color="green" size="18px" />

              <span>
                {{ props.row.telefono || 'Sin número' }}
              </span>
            </div>
          </q-td>
        </template>

        <!-- ACCIONES -->
        <template #body-cell-actions="props">
          <q-td :props="props" class="text-center">
            <div class="acciones">
              <q-btn
                icon="visibility"
                round
                unelevated
                size="sm"
                color="purple"
                @click="verPerfil(props.row)"
              >
                <q-tooltip>Ver perfil</q-tooltip>
              </q-btn>

              <q-btn
                icon="chat"
                round
                unelevated
                size="sm"
                color="green"
                :disable="!props.row.telefono"
                @click="abrirWhatsApp(props.row)"
              >
                <q-tooltip>WhatsApp</q-tooltip>
              </q-btn>

              <q-btn
                icon="event"
                round
                unelevated
                size="sm"
                color="orange"
                @click="crearCitaCliente(props.row)"
              >
                <q-tooltip>Nueva cita</q-tooltip>
              </q-btn>

              <q-btn
                icon="edit"
                round
                unelevated
                size="sm"
                color="primary"
                @click="edit(props.row)"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>

              <q-btn
                icon="delete"
                round
                unelevated
                size="sm"
                color="negative"
                @click="remove(props.row)"
              >
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- DIALOG CREAR / EDITAR CLIENTE -->
    <q-dialog v-model="dialog" persistent>
      <q-card class="dialog-card">

        <q-card-section class="dialog-header row items-center">
          <div class="text-h6 text-weight-bold">
            {{ form.id ? '✏️ Editar cliente' : '👤 Nuevo cliente' }}
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

        <q-card-section class="dialog-body">
          <div class="q-gutter-md">
            <q-input
              v-model.trim="form.nombre"
              label="Nombre completo *"
              outlined
              rounded
              bg-color="white"
            >
              <template #prepend>
                <q-icon name="person" color="pink" />
              </template>
            </q-input>

            <q-input
              v-model.trim="form.telefono"
              label="Número de teléfono *"
              outlined
              rounded
              bg-color="white"
              type="tel"
            >
              <template #prepend>
                <q-icon name="phone" color="green" />
              </template>
            </q-input>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn
            flat
            label="Cancelar"
            color="grey-7"
            v-close-popup
          />

          <q-btn
            class="btn-glamur"
            label="Guardar"
            :loading="saving"
            @click="save"
          />
        </q-card-actions>

      </q-card>
    </q-dialog>

    <!-- DIALOG PERFIL CLIENTE -->
    <q-dialog
      v-model="dialogPerfil"
      :maximized="$q.screen.lt.sm"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="perfil-card">

        <q-card-section class="perfil-header">
          <div>
            <div class="text-h6 text-weight-bold">
              👤 Perfil del cliente
            </div>

            <div class="text-caption text-white">
              Historial, pagos, citas y contacto directo
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

        <q-linear-progress
          v-if="perfilLoading"
          indeterminate
          color="pink"
        />

        <q-card-section class="perfil-body" v-if="clientePerfil">
          <div class="perfil-main q-mb-md">
            <q-avatar class="perfil-avatar" size="76px">
              <q-icon name="person" color="white" size="42px" />
            </q-avatar>

            <div class="perfil-info">
              <div class="perfil-name">
                {{ clientePerfil.nombre || 'Sin nombre' }}
              </div>

              <div class="perfil-phone">
                <q-icon name="phone" color="green" size="18px" />
                {{ clientePerfil.telefono || 'Sin teléfono' }}
              </div>

              <div class="perfil-id">
                Código cliente: #{{ clientePerfil.id }}
              </div>
            </div>

            <div class="perfil-buttons">
              <q-btn
                class="perfil-action whatsapp"
                icon="chat"
                label="WhatsApp"
                unelevated
                rounded
                :disable="!clientePerfil.telefono"
                @click="abrirWhatsApp(clientePerfil)"
              />

              <q-btn
                class="perfil-action cita"
                icon="event"
                label="Nueva cita"
                unelevated
                rounded
                @click="crearCitaCliente(clientePerfil)"
              />
            </div>
          </div>

          <div class="row q-col-gutter-md q-mb-md">
            <div
              v-for="card in perfilCards"
              :key="card.titulo"
              class="col-12 col-sm-6 col-md-3"
            >
              <q-card class="perfil-mini-card">
                <q-card-section>
                  <q-icon :name="card.icono" :color="card.color" size="28px" />

                  <div class="mini-title">
                    {{ card.titulo }}
                  </div>

                  <div class="mini-value">
                    {{ card.valor }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <q-tabs
            v-model="perfilTab"
            dense
            active-color="pink-7"
            indicator-color="pink-7"
            align="justify"
            class="perfil-tabs"
          >
            <q-tab
              name="citas"
              icon="event"
              :label="`Citas (${perfilCitas.length})`"
            />

            <q-tab
              name="pagos"
              icon="payments"
              :label="`Pagos (${perfilPagos.length})`"
            />
          </q-tabs>

          <q-separator />

          <q-tab-panels
            v-model="perfilTab"
            animated
            class="perfil-panels"
          >
            <q-tab-panel name="citas">
              <div
                v-if="perfilCitas.length === 0"
                class="empty-perfil"
              >
                <q-icon name="event_busy" size="52px" color="grey-5" />
                <div class="text-weight-bold q-mt-sm">
                  Sin citas registradas
                </div>
                <div class="text-caption text-grey-7">
                  Este cliente todavía no tiene historial de citas.
                </div>
              </div>

              <q-list
                v-else
                separator
                class="perfil-list"
              >
                <q-item
                  v-for="cita in perfilCitas"
                  :key="cita.id"
                  class="perfil-list-item"
                >
                  <q-item-section avatar>
                    <q-avatar :color="colorEstado(cita.estado)" text-color="white">
                      <q-icon :name="iconEstado(cita.estado)" />
                    </q-avatar>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-weight-bold text-pink-7">
                      {{ cita.servicio || 'Sin servicio' }}
                    </q-item-label>

                    <q-item-label caption>
                      {{ formatFechaSimple(cita.fecha) }} · {{ horaBonita(cita.hora) }}
                    </q-item-label>

                    <q-item-label caption>
                      Bs {{ money(cita.precio) }}
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <q-badge
                      rounded
                      :color="colorEstado(cita.estado)"
                      class="estado-badge"
                    >
                      {{ textoEstado(cita.estado) }}
                    </q-badge>

                    <q-badge
                      rounded
                      :color="esPagadoCita(cita) ? 'green' : 'orange'"
                      class="estado-badge q-mt-xs"
                    >
                      {{ esPagadoCita(cita) ? 'Pagado' : 'Pendiente' }}
                    </q-badge>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-tab-panel>

            <q-tab-panel name="pagos">
              <div
                v-if="perfilPagos.length === 0"
                class="empty-perfil"
              >
                <q-icon name="payments" size="52px" color="grey-5" />
                <div class="text-weight-bold q-mt-sm">
                  Sin pagos registrados
                </div>
                <div class="text-caption text-grey-7">
                  Los pagos del cliente aparecerán aquí.
                </div>
              </div>

              <q-list
                v-else
                separator
                class="perfil-list"
              >
                <q-item
                  v-for="pago in perfilPagos"
                  :key="pago.id"
                  class="perfil-list-item"
                >
                  <q-item-section avatar>
                    <q-avatar color="green" text-color="white">
                      <q-icon name="payments" />
                    </q-avatar>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-weight-bold text-green-8">
                      Bs {{ money(pago.monto) }}
                    </q-item-label>

                    <q-item-label caption>
                      {{ pago.servicio || 'Servicio no registrado' }}
                    </q-item-label>

                    <q-item-label caption>
                      {{ formatDate(pago.fecha_pago || pago.created_at) }}
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <q-badge
                      rounded
                      :color="metodoColor(pago.metodo)"
                      class="estado-badge"
                    >
                      {{ pago.metodo || 'No definido' }}
                    </q-badge>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>

        <q-card-actions align="right" class="perfil-actions">
          <q-btn
            flat
            label="Cerrar"
            color="grey-7"
            v-close-popup
          />

          <q-btn
            outline
            color="green"
            icon="chat"
            label="WhatsApp"
            :disable="!clientePerfil?.telefono"
            @click="abrirWhatsApp(clientePerfil)"
          />

          <q-btn
            class="btn-glamur"
            icon="event"
            label="Nueva cita"
            @click="crearCitaCliente(clientePerfil)"
          />
        </q-card-actions>

      </q-card>
    </q-dialog>

    <!-- DIALOG IMPORTAR CONTACTOS -->
    <q-dialog
      v-model="dialogContactos"
      persistent
      :maximized="$q.screen.lt.sm"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="dialog-contactos">

        <!-- CABECERA FIJA -->
        <q-card-section class="dialog-header contactos-header row items-center">
          <div>
            <div class="text-h6 text-weight-bold">
              📱 Importar contactos
            </div>

            <div class="text-caption text-white">
              Selecciona contactos del teléfono para guardarlos como clientes
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

        <!-- BUSCADOR Y BOTONES SUPERIORES -->
        <q-card-section class="contactos-toolbar">
          <q-input
            v-model.trim="buscarContacto"
            label="Buscar por nombre o teléfono"
            outlined
            rounded
            dense
            clearable
            bg-color="white"
          >
            <template #prepend>
              <q-icon name="search" color="pink" />
            </template>
          </q-input>

          <div class="contactos-info">
            <q-chip color="pink" text-color="white" icon="contacts">
              {{ contactosFiltrados.length }} contacto(s)
            </q-chip>

            <q-chip color="green" text-color="white" icon="person_add">
              {{ contactosNuevosFiltrados.length }} nuevo(s)
            </q-chip>

            <q-chip color="orange" text-color="white" icon="verified_user">
              {{ contactosExistentesFiltrados.length }} existente(s)
            </q-chip>

            <q-chip color="purple" text-color="white" icon="check_circle">
              {{ contactosSeleccionadosNuevos.length }} seleccionado(s)
            </q-chip>
          </div>

          <div class="contactos-actions row q-col-gutter-sm q-mt-sm">
            <div class="col-12 col-sm-6">
              <q-btn
                class="full-width"
                color="green"
                icon="select_all"
                label="Seleccionar nuevos"
                unelevated
                rounded
                :disable="contactosNuevosFiltrados.length === 0"
                @click="seleccionarContactosNuevos"
              />
            </div>

            <div class="col-12 col-sm-6">
              <q-btn
                class="full-width"
                color="grey-7"
                icon="clear_all"
                label="Limpiar selección"
                unelevated
                rounded
                :disable="contactosSeleccionados.length === 0"
                @click="limpiarSeleccionContactos"
              />
            </div>
          </div>
        </q-card-section>

        <!-- CUERPO CON SCROLL REAL -->
        <q-card-section class="contactos-body">
          <q-table
            class="tabla-contactos"
            :rows="contactosFiltrados"
            :columns="columnsContactos"
            row-key="uid"
            :loading="loadingContactos"
            no-data-label="No se encontraron contactos disponibles"
            flat
            bordered
            selection="multiple"
            v-model:selected="contactosSeleccionados"
            :rows-per-page-options="[5, 10, 20, 50]"
            @update:selected="normalizarSeleccionContactos"
          >
            <template #body-selection="props">
              <q-checkbox
                v-model="props.selected"
                color="pink"
                :disable="clienteYaExiste(props.row.telefono)"
              />
            </template>

            <template #body-cell-nombre="props">
              <q-td :props="props">
                <div class="contacto-nombre">
                  <q-avatar size="36px" class="contacto-avatar">
                    <q-icon name="person" color="white" size="21px" />
                  </q-avatar>

                  <div>
                    <div class="text-weight-bold">
                      {{ props.row.nombre }}
                    </div>

                    <div class="text-caption text-grey-7">
                      Contacto del teléfono
                    </div>
                  </div>
                </div>
              </q-td>
            </template>

            <template #body-cell-telefono="props">
              <q-td :props="props">
                <div class="telefono-box">
                  <q-icon name="phone_android" color="green" size="18px" />
                  <span>{{ props.row.telefono }}</span>
                </div>
              </q-td>
            </template>

            <template #body-cell-estado="props">
              <q-td :props="props" class="text-center">
                <q-badge
                  v-if="clienteYaExiste(props.row.telefono)"
                  color="orange"
                  rounded
                >
                  Ya existe
                </q-badge>

                <q-badge
                  v-else
                  color="green"
                  rounded
                >
                  Nuevo
                </q-badge>
              </q-td>
            </template>
          </q-table>
        </q-card-section>

        <!-- BOTONES FIJOS ABAJO -->
        <q-card-actions align="right" class="dialog-actions contactos-footer">
          <q-btn
            flat
            label="Cancelar"
            color="grey-7"
            v-close-popup
          />

          <q-btn
            color="primary"
            icon="refresh"
            label="Volver a cargar"
            unelevated
            rounded
            :loading="loadingContactos"
            @click="cargarContactosTelefono"
          />

          <q-btn
            class="btn-glamur"
            icon="save"
            label="Guardar seleccionados"
            :disable="contactosSeleccionadosNuevos.length === 0"
            :loading="savingContactos"
            @click="guardarContactosSeleccionados"
          />
        </q-card-actions>

      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from '@/boot/axios'
import { Capacitor } from '@capacitor/core'
import { Contacts } from '@capacitor-community/contacts'

defineOptions({
  name: 'ClientesPage'
})

const router = useRouter()
const $q = useQuasar()

const clientes = ref([])
const busquedaCliente = ref('')
const dialog = ref(false)
const loading = ref(false)
const saving = ref(false)

const dialogPerfil = ref(false)
const perfilLoading = ref(false)
const perfilTab = ref('citas')
const clientePerfil = ref(null)

const dialogContactos = ref(false)
const contactosTelefono = ref([])
const contactosSeleccionados = ref([])
const buscarContacto = ref('')
const loadingContactos = ref(false)
const savingContactos = ref(false)

const form = ref({
  id: null,
  nombre: '',
  telefono: ''
})

const columns = [
  {
    name: 'nombre',
    label: 'Nombre completo',
    field: 'nombre',
    align: 'left',
    sortable: true
  },
  {
    name: 'telefono',
    label: 'Número de teléfono',
    field: 'telefono',
    align: 'left'
  },
  {
    name: 'actions',
    label: 'Acciones',
    field: 'actions',
    align: 'center'
  }
]

const columnsContactos = [
  {
    name: 'nombre',
    label: 'Nombre',
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
    name: 'estado',
    label: 'Estado',
    field: 'estado',
    align: 'center'
  }
]

const clientesFiltradosTabla = computed(() => {
  const texto = normalizarTexto(busquedaCliente.value)

  if (!texto) {
    return clientes.value
  }

  return clientes.value.filter((cliente) => {
    const datos = [
      cliente.id,
      cliente.nombre,
      cliente.telefono
    ]

    return datos.some((dato) => normalizarTexto(dato).includes(texto))
  })
})

const resumenCards = computed(() => [
  {
    titulo: 'Clientes',
    valor: clientes.value.length,
    detalle: 'Clientes activos',
    icono: 'people',
    clase: 'bg-pink-7'
  },
  {
    titulo: 'Visibles',
    valor: clientesFiltradosTabla.value.length,
    detalle: 'Según búsqueda actual',
    icono: 'visibility',
    clase: 'bg-purple-7'
  },
  {
    titulo: 'Con teléfono',
    valor: clientes.value.filter(cliente => !!cliente.telefono).length,
    detalle: 'Pueden usar WhatsApp',
    icono: 'phone',
    clase: 'bg-green-7'
  },
  {
    titulo: 'Sin teléfono',
    valor: clientes.value.filter(cliente => !cliente.telefono).length,
    detalle: 'Falta completar datos',
    icono: 'phone_disabled',
    clase: 'bg-orange-7'
  }
])

const contactosFiltrados = computed(() => {
  const texto = normalizarTexto(buscarContacto.value)

  if (!texto) {
    return contactosTelefono.value
  }

  return contactosTelefono.value.filter((contacto) => {
    const nombre = normalizarTexto(contacto.nombre)
    const telefono = normalizarTexto(contacto.telefono)

    return nombre.includes(texto) || telefono.includes(texto)
  })
})

const contactosNuevosFiltrados = computed(() => {
  return contactosFiltrados.value.filter((contacto) => !clienteYaExiste(contacto.telefono))
})

const contactosExistentesFiltrados = computed(() => {
  return contactosFiltrados.value.filter((contacto) => clienteYaExiste(contacto.telefono))
})

const contactosSeleccionadosNuevos = computed(() => {
  return contactosSeleccionados.value.filter((contacto) => !clienteYaExiste(contacto.telefono))
})

const perfilCitas = computed(() => {
  const lista = Array.isArray(clientePerfil.value?.citas)
    ? clientePerfil.value.citas
    : []

  return [...lista].sort((a, b) => {
    const fechaA = `${a.fecha || ''} ${a.hora || ''}`
    const fechaB = `${b.fecha || ''} ${b.hora || ''}`

    return fechaB.localeCompare(fechaA)
  })
})

const perfilPagos = computed(() => {
  const lista = Array.isArray(clientePerfil.value?.pagos)
    ? clientePerfil.value.pagos
    : []

  return [...lista].sort((a, b) => {
    const fechaA = String(a.fecha_pago || a.created_at || '')
    const fechaB = String(b.fecha_pago || b.created_at || '')

    return fechaB.localeCompare(fechaA)
  })
})

const totalPagadoPerfil = computed(() => {
  const desdeBackend = Number(clientePerfil.value?.total_pagado || 0)

  if (desdeBackend > 0) {
    return desdeBackend
  }

  if (perfilPagos.value.length > 0) {
    return perfilPagos.value.reduce((total, pago) => {
      return total + Number(pago.monto || 0)
    }, 0)
  }

  return perfilCitas.value.reduce((total, cita) => {
    if (!esPagadoCita(cita)) return total

    return total + Number(cita.precio || 0)
  }, 0)
})

const ultimaVisitaPerfil = computed(() => {
  if (perfilCitas.value.length === 0) {
    return 'Sin visitas'
  }

  const cita = perfilCitas.value[0]

  return `${formatFechaSimple(cita.fecha)} ${horaBonita(cita.hora)}`
})

const perfilCards = computed(() => [
  {
    titulo: 'Total citas',
    valor: clientePerfil.value?.total_citas ?? perfilCitas.value.length,
    icono: 'event',
    color: 'pink'
  },
  {
    titulo: 'Pendientes',
    valor: perfilCitas.value.filter(cita => esPendiente(cita.estado)).length,
    icono: 'schedule',
    color: 'orange'
  },
  {
    titulo: 'Total pagado',
    valor: `Bs ${money(totalPagadoPerfil.value)}`,
    icono: 'payments',
    color: 'green'
  },
  {
    titulo: 'Última visita',
    valor: ultimaVisitaPerfil.value,
    icono: 'history',
    color: 'purple'
  }
])

function getErrorMessage(error) {
  const data = error?.response?.data

  if (data?.errors) {
    return Object.values(data.errors).flat().join(' ')
  }

  return data?.message || data?.error || error?.message || 'Ocurrió un error'
}

function normalizarTexto(valor) {
  return String(valor || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function limpiarTelefono(valor) {
  return String(valor || '')
    .replace(/[^\d+]/g, '')
    .trim()
}

function telefonoComparable(valor) {
  return String(valor || '')
    .replace(/\D/g, '')
    .trim()
}

function telefonoWhatsApp(valor) {
  let numero = telefonoComparable(valor)

  if (!numero) return ''

  if (numero.startsWith('00')) {
    numero = numero.slice(2)
  }

  if (numero.startsWith('591')) {
    return numero
  }

  if (numero.length === 8) {
    return `591${numero}`
  }

  return numero
}

function clienteYaExiste(telefono) {
  const telefonoLimpio = telefonoComparable(telefono)

  if (!telefonoLimpio) {
    return false
  }

  return clientes.value.some((cliente) => {
    return telefonoComparable(cliente.telefono) === telefonoLimpio
  })
}

function permisoContactosConcedido(respuesta) {
  if (!respuesta) {
    return false
  }

  if (respuesta.contacts === 'granted') {
    return true
  }

  return Object.values(respuesta).includes('granted')
}

async function load() {
  loading.value = true

  try {
    const { data } = await api.get('/apps/aurea/clientes')

    clientes.value = Array.isArray(data)
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

function openDialog() {
  form.value = {
    id: null,
    nombre: '',
    telefono: ''
  }

  dialog.value = true
}

function edit(row) {
  form.value = {
    id: row.id,
    nombre: row.nombre || '',
    telefono: row.telefono || ''
  }

  dialog.value = true
}

async function save() {
  if (!form.value.nombre.trim()) {
    $q.notify({
      type: 'warning',
      message: 'El nombre completo es obligatorio'
    })

    return
  }

  if (!form.value.telefono.trim()) {
    $q.notify({
      type: 'warning',
      message: 'El número de teléfono es obligatorio'
    })

    return
  }

  saving.value = true

  try {
    const payload = {
      nombre: form.value.nombre.trim(),
      telefono: limpiarTelefono(form.value.telefono),
      email: null
    }

    if (form.value.id) {
      await api.put(`/clientes/${form.value.id}`, payload)

      $q.notify({
        type: 'positive',
        message: 'Cliente actualizado correctamente'
      })
    } else {
      await api.post('/apps/aurea/clientes', payload)

      $q.notify({
        type: 'positive',
        message: 'Cliente registrado correctamente'
      })
    }

    dialog.value = false

    await load()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(error)
    })
  } finally {
    saving.value = false
  }
}

function remove(row) {
  $q.dialog({
    title: 'Eliminar cliente',
    message: `¿Deseas eliminar a "${row.nombre}"? Se enviará al historial y podrás recuperarlo después.`,
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
      await api.delete(`/clientes/${row.id}`)

      $q.notify({
        type: 'positive',
        message: 'Cliente enviado al historial correctamente'
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

async function verPerfil(row) {
  clientePerfil.value = {
    ...row,
    citas: [],
    pagos: [],
    total_citas: 0,
    total_pagado: 0
  }

  perfilTab.value = 'citas'
  dialogPerfil.value = true
  perfilLoading.value = true

  try {
    const buscar = row.telefono || row.nombre

    const { data } = await api.get('/clientes/historial/buscar', {
      params: {
        buscar
      }
    })

    const lista = Array.isArray(data?.clientes)
      ? data.clientes
      : []

    const encontrado = lista.find((cliente) => Number(cliente.id) === Number(row.id)) || lista[0]

    if (encontrado) {
      clientePerfil.value = {
        ...row,
        ...encontrado,
        citas: Array.isArray(encontrado.citas) ? encontrado.citas : [],
        pagos: Array.isArray(encontrado.pagos) ? encontrado.pagos : []
      }
    }
  } catch {
    $q.notify({
      type: 'warning',
      message: 'Se abrió el perfil básico, pero no se pudo cargar el historial completo.'
    })
  } finally {
    perfilLoading.value = false
  }
}

function abrirWhatsApp(cliente) {
  if (!cliente?.telefono) {
    $q.notify({
      type: 'warning',
      message: 'Este cliente no tiene número de teléfono.'
    })

    return
  }

  const numero = telefonoWhatsApp(cliente.telefono)

  if (!numero) {
    $q.notify({
      type: 'warning',
      message: 'El número del cliente no es válido.'
    })

    return
  }

  const mensaje = encodeURIComponent(
    `Hola ${cliente.nombre || ''}, le escribimos de AUREA Beauty Salon para coordinar su cita.`
  )

  window.open(`https://wa.me/${numero}?text=${mensaje}`, '_blank')
}

function crearCitaCliente(cliente) {
  if (!cliente) return

  dialogPerfil.value = false

  router.push({
    path: '/apps/aurea/citas',
    query: {
      cliente_id: cliente.id,
      cliente: cliente.nombre || '',
      telefono: cliente.telefono || ''
    }
  })
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

function esCancelada(estado) {
  const valor = estadoNormalizado(estado)

  return (
    valor.includes('cancel') ||
    valor.includes('anulad')
  )
}

function esPendiente(estado) {
  return !esConcluida(estado) && !esCancelada(estado)
}

function esPagadoCita(cita) {
  const pago = normalizarTexto(cita?.estado_pago || cita?.pago_estado || '')

  return pago.includes('pag')
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

function metodoColor(metodo) {
  const valor = normalizarTexto(metodo)

  if (valor.includes('qr')) return 'purple'
  if (valor.includes('efect')) return 'green'
  if (valor.includes('trans')) return 'blue'
  if (valor.includes('tarj')) return 'orange'

  return 'grey'
}

function money(value) {
  return Number(value || 0).toFixed(2)
}

function horaBonita(hora) {
  if (!hora) return '--:--'

  return String(hora).slice(0, 5)
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

async function abrirImportarContactos() {
  if (!Capacitor.isNativePlatform()) {
    $q.notify({
      type: 'warning',
      message: 'La importación de contactos solo funciona en la APK instalada en el celular.'
    })

    return
  }

  dialogContactos.value = true

  if (contactosTelefono.value.length === 0) {
    await cargarContactosTelefono()
  }
}

async function cargarContactosTelefono() {
  loadingContactos.value = true
  contactosSeleccionados.value = []

  try {
    const permisoActual = await Contacts.checkPermissions()

    let permisoFinal = permisoActual

    if (!permisoContactosConcedido(permisoActual)) {
      permisoFinal = await Contacts.requestPermissions()
    }

    if (!permisoContactosConcedido(permisoFinal)) {
      $q.notify({
        type: 'warning',
        message: 'Permiso de contactos denegado. Actívalo desde los permisos de la aplicación.'
      })

      return
    }

    const resultado = await Contacts.getContacts({
      projection: {
        name: true,
        phones: true
      }
    })

    const lista = Array.isArray(resultado?.contacts)
      ? resultado.contacts
      : []

    const contactosProcesados = lista
      .map((contacto, index) => {
        const nombre =
          contacto?.name?.display ||
          [contacto?.name?.given, contacto?.name?.family].filter(Boolean).join(' ') ||
          contacto?.displayName ||
          'Sin nombre'

        const telefono =
          contacto?.phones?.[0]?.number ||
          contacto?.phoneNumbers?.[0]?.number ||
          ''

        return {
          uid: `${index}-${telefonoComparable(telefono)}-${normalizarTexto(nombre)}`,
          nombre: String(nombre).trim(),
          telefono: limpiarTelefono(telefono)
        }
      })
      .filter((contacto) => contacto.nombre && contacto.telefono)

    const sinRepetidos = []
    const usados = new Set()

    contactosProcesados.forEach((contacto) => {
      const clave = telefonoComparable(contacto.telefono)

      if (!clave || usados.has(clave)) {
        return
      }

      usados.add(clave)
      sinRepetidos.push(contacto)
    })

    contactosTelefono.value = sinRepetidos

    $q.notify({
      type: 'positive',
      message: `Se cargaron ${sinRepetidos.length} contacto(s) del teléfono`
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error?.message || 'No se pudieron cargar los contactos del teléfono'
    })
  } finally {
    loadingContactos.value = false
  }
}

function normalizarSeleccionContactos(lista) {
  contactosSeleccionados.value = (lista || []).filter((contacto) => {
    return !clienteYaExiste(contacto.telefono)
  })
}

function seleccionarContactosNuevos() {
  contactosSeleccionados.value = [...contactosNuevosFiltrados.value]

  if (contactosSeleccionados.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'No hay contactos nuevos para seleccionar'
    })
  }
}

function limpiarSeleccionContactos() {
  contactosSeleccionados.value = []
}

async function guardarContactosSeleccionados() {
  if (contactosSeleccionadosNuevos.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'Selecciona al menos un contacto nuevo'
    })

    return
  }

  const contactosNuevos = [...contactosSeleccionadosNuevos.value]

  savingContactos.value = true

  let guardados = 0
  let fallidos = 0

  try {
    for (const contacto of contactosNuevos) {
      try {
        await api.post('/apps/aurea/clientes', {
          nombre: contacto.nombre,
          telefono: contacto.telefono,
          email: null
        })

        guardados++
      } catch {
        fallidos++
      }
    }

    if (guardados > 0) {
      $q.notify({
        type: 'positive',
        message: `${guardados} contacto(s) importado(s) correctamente`
      })
    }

    if (fallidos > 0) {
      $q.notify({
        type: 'warning',
        message: `${fallidos} contacto(s) no se pudieron importar`
      })
    }

    dialogContactos.value = false
    contactosSeleccionados.value = []

    await load()
  } finally {
    savingContactos.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.clientes-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(233, 30, 99, 0.10), transparent 32%),
    linear-gradient(180deg, #fff7fb 0%, #f7f7fb 100%);
}

/* HERO */

.clientes-hero {
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

.clientes-hero::after {
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
  padding: 10px 18px;
  box-shadow: 0 12px 28px rgba(233, 30, 99, 0.26);
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

.buscador-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.buscador-input {
  flex: 1;
}

.result-badge {
  min-height: 40px;
  justify-content: center;
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
  font-weight: 900;
  padding: 9px 14px;
  white-space: nowrap;
}

/* TABLA */

.card-table {
  border-radius: 24px;
  overflow: hidden;
  background: white;
  box-shadow: 0 14px 35px rgba(156, 39, 176, 0.12);
  border: 1px solid rgba(233, 30, 99, 0.08);
}

.tabla-glamur :deep(.q-table__middle) {
  overflow-x: auto;
}

.tabla-glamur :deep(.q-table thead tr),
.tabla-contactos :deep(.q-table thead tr) {
  background: linear-gradient(135deg, #fce4ec, #f3e5f5);
  color: #880e4f;
}

.tabla-glamur :deep(.q-table th),
.tabla-contactos :deep(.q-table th) {
  font-weight: 900;
  font-size: 13px;
}

.tabla-glamur :deep(.q-table tbody tr:hover),
.tabla-contactos :deep(.q-table tbody tr:hover) {
  background: #fff0f6;
}

.cliente-cell,
.contacto-nombre {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 210px;
}

.avatar-pink,
.contacto-avatar {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  flex: 0 0 auto;
}

.telefono-box,
.perfil-phone {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: #2e7d32;
  white-space: nowrap;
}

.acciones {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* DIALOG CREAR */

.dialog-card {
  width: 460px;
  max-width: 95vw;
  border-radius: 24px;
  overflow: hidden;
}

.dialog-header {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
}

.dialog-body {
  background: white;
  padding: 24px;
}

.dialog-actions {
  padding: 16px 22px;
  background: white;
  border-top: 1px solid #eeeeee;
  gap: 10px;
}

/* PERFIL */

.perfil-card {
  width: 920px;
  max-width: 96vw;
  max-height: 90dvh;
  border-radius: 26px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: white;
}

.perfil-header {
  flex: 0 0 auto;
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
  display: flex;
  align-items: center;
  padding: 20px 22px;
}

.perfil-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  background: #fff7fb;
  padding: 20px;
}

.perfil-main {
  background: white;
  border-radius: 24px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 10px 25px rgba(156, 39, 176, 0.10);
}

.perfil-avatar {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  flex: 0 0 auto;
}

.perfil-info {
  flex: 1;
  min-width: 0;
}

.perfil-name {
  font-size: 24px;
  font-weight: 900;
  color: #c2185b;
  word-break: break-word;
}

.perfil-id {
  color: #777;
  font-size: 13px;
  font-weight: 700;
  margin-top: 2px;
}

.perfil-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.perfil-action {
  color: white;
  font-weight: 900;
  border-radius: 16px;
}

.perfil-action.whatsapp {
  background: #16a34a;
}

.perfil-action.cita {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
}

.perfil-mini-card {
  border-radius: 20px;
  background: white;
  border: 1px solid rgba(233, 30, 99, 0.08);
  box-shadow: 0 8px 22px rgba(156, 39, 176, 0.08);
}

.mini-title {
  color: #777;
  font-size: 12px;
  font-weight: 800;
  margin-top: 8px;
}

.mini-value {
  color: #222;
  font-size: 18px;
  font-weight: 900;
  margin-top: 3px;
  word-break: break-word;
}

.perfil-tabs {
  background: white;
  border-radius: 18px 18px 0 0;
  overflow: hidden;
}

.perfil-panels {
  background: white;
  border-radius: 0 0 18px 18px;
}

.perfil-list {
  border-radius: 18px;
  overflow: hidden;
}

.perfil-list-item {
  background: #fff7fb;
  border-radius: 16px;
  margin-bottom: 8px;
  border: 1px solid rgba(233, 30, 99, 0.08);
}

.estado-badge {
  text-transform: capitalize;
  font-weight: 800;
  padding: 5px 9px;
}

.empty-perfil {
  text-align: center;
  padding: 34px 14px;
  border: 1px dashed #e9b5ce;
  border-radius: 20px;
  background: #fff7fb;
}

.perfil-actions {
  flex: 0 0 auto;
  padding: 14px 18px;
  background: white;
  border-top: 1px solid #eeeeee;
  box-shadow: 0 -8px 22px rgba(0, 0, 0, 0.08);
  gap: 10px;
}

/* CONTACTOS */

.dialog-contactos {
  width: 900px;
  max-width: 96vw;
  height: min(92dvh, 760px);
  max-height: 92dvh;
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: white;
}

.contactos-header {
  flex: 0 0 auto;
  min-height: 96px;
}

.contactos-toolbar {
  flex: 0 0 auto;
  background: #fff7fb;
  padding: 18px;
  border-bottom: 1px solid #f1d7e5;
}

.contactos-info {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.contactos-actions {
  width: 100%;
}

.contactos-body {
  flex: 1 1 auto;
  min-height: 0;
  padding: 16px;
  overflow-y: auto;
  overflow-x: hidden;
  background: white;
}

.tabla-contactos {
  border-radius: 18px;
  overflow: hidden;
  background: white;
}

.tabla-contactos :deep(.q-table__container) {
  max-width: 100%;
}

.tabla-contactos :deep(.q-table__middle) {
  overflow-x: auto;
}

.contactos-footer {
  flex: 0 0 auto;
  position: sticky;
  bottom: 0;
  z-index: 5;
  box-shadow: 0 -8px 22px rgba(0, 0, 0, 0.08);
}

/* MÓVIL */

@media (max-width: 700px) {
  .clientes-page {
    padding: 12px;
  }

  .clientes-hero {
    padding: 22px;
    border-radius: 22px;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .clientes-hero .text-h4 {
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

  .buscador-row {
    flex-direction: column;
    align-items: stretch;
  }

  .result-badge {
    width: 100%;
    justify-content: center;
    text-align: center;
  }

  .dialog-card {
    width: 100%;
    max-width: 100%;
    border-radius: 20px;
  }

  .perfil-card {
    width: 100vw;
    max-width: 100vw;
    height: 100dvh;
    max-height: 100dvh;
    border-radius: 0;
  }

  .perfil-header {
    padding: 18px;
  }

  .perfil-body {
    padding: 14px;
  }

  .perfil-main {
    flex-direction: column;
    align-items: flex-start;
  }

  .perfil-name {
    font-size: 22px;
  }

  .perfil-buttons {
    width: 100%;
  }

  .perfil-buttons .q-btn {
    width: 100%;
  }

  .perfil-actions {
    padding: 12px 14px calc(14px + env(safe-area-inset-bottom));
    flex-wrap: wrap;
  }

  .perfil-actions .q-btn {
    width: 100%;
    min-height: 44px;
  }

  .dialog-contactos {
    width: 100vw;
    max-width: 100vw;
    height: 100dvh;
    max-height: 100dvh;
    border-radius: 0;
  }

  .contactos-header {
    min-height: 110px;
    padding: 18px 18px;
  }

  .contactos-header .text-h6 {
    font-size: 24px;
    line-height: 1.2;
  }

  .contactos-header .text-caption {
    font-size: 15px;
    line-height: 1.45;
    margin-top: 6px;
  }

  .contactos-toolbar {
    padding: 14px 14px 12px;
    max-height: 38dvh;
    overflow-y: auto;
  }

  .contactos-info {
    gap: 7px;
  }

  .contactos-info .q-chip {
    max-width: 100%;
    font-size: 13px;
  }

  .contactos-actions .q-btn {
    min-height: 42px;
  }

  .contactos-body {
    padding: 10px;
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .tabla-contactos {
    border-radius: 14px;
  }

  .tabla-contactos :deep(.q-table th),
  .tabla-contactos :deep(.q-table td),
  .tabla-glamur :deep(.q-table th),
  .tabla-glamur :deep(.q-table td) {
    padding: 8px 10px;
    font-size: 13px;
  }

  .contacto-nombre,
  .cliente-cell {
    min-width: 190px;
  }

  .dialog-actions {
    flex-wrap: wrap;
    padding: 10px 12px calc(12px + env(safe-area-inset-bottom));
  }

  .dialog-actions .q-btn {
    width: 100%;
    min-height: 46px;
  }

  .contactos-footer {
    background: white;
  }
}
</style>