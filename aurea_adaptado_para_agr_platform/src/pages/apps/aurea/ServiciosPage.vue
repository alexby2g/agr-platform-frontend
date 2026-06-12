<template>
  <q-page class="q-pa-md servicios-page">
    <!-- HERO -->
    <div class="page-hero q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold text-white">
          💅 Servicios y Combos
        </div>

        <div class="text-subtitle2 text-white">
          Administra los servicios predeterminados de AUREA Beauty Salon
        </div>
      </div>

      <div v-if="isAdmin" class="hero-actions">
        <q-btn
          class="btn-glamur-white"
          icon="playlist_add"
          label="Cargar combos base"
          :loading="loadingBase"
          @click="confirmarCargarBase"
        />

        <q-btn
          class="btn-glamur-white"
          icon="add"
          label="Nuevo servicio"
          @click="openDialog()"
        />
      </div>
    </div>

    <!-- AVISO MODO EMPLEADO -->
    <q-banner
      v-if="!isAdmin"
      rounded
      class="employee-mode q-mb-md"
    >
      <template #avatar>
        <q-icon name="visibility" color="pink-7" size="28px" />
      </template>

      <div class="text-weight-bold">
        Modo empleado: solo consulta
      </div>

      <div class="text-caption">
        Puedes revisar los servicios disponibles, pero no puedes agregar, editar ni eliminar combos.
      </div>
    </q-banner>

    <!-- BOTONES DE CATEGORÍAS -->
    <div class="categorias-grid q-mb-lg">
      <div
        v-for="cat in categoriasUI"
        :key="cat.value"
        class="categoria-card"
        :class="{ active: selectedCategoria === cat.value }"
        @click="selectedCategoria = cat.value"
      >
        <div class="categoria-icon">
          <q-icon :name="cat.icon" />
        </div>

        <div class="categoria-info">
          <div class="categoria-title">
            {{ cat.label }}
          </div>

          <div class="categoria-subtitle">
            {{ cat.descripcion }}
          </div>

          <div class="categoria-extra">
            <q-badge rounded :color="selectedCategoria === cat.value ? 'white' : 'pink'">
              <span :class="selectedCategoria === cat.value ? 'text-pink-7' : 'text-white'">
                {{ resumenCategoria(cat.value).count }} combo(s)
              </span>
            </q-badge>

            <q-badge
              v-if="resumenCategoria(cat.value).count > 0"
              rounded
              :color="selectedCategoria === cat.value ? 'white' : 'green'"
            >
              <span :class="selectedCategoria === cat.value ? 'text-green-8' : 'text-white'">
                Desde Bs {{ money(resumenCategoria(cat.value).minPrecio) }}
              </span>
            </q-badge>
          </div>
        </div>

        <q-icon
          class="categoria-arrow"
          :name="selectedCategoria === cat.value ? 'check_circle' : 'chevron_right'"
        />
      </div>
    </div>

    <!-- ENCABEZADO DE CATEGORÍA SELECCIONADA -->
    <q-card class="categoria-panel q-mb-md">
      <div class="categoria-panel-content">
        <div class="row items-center no-wrap">
          <q-avatar class="categoria-panel-icon" size="52px">
            <q-icon :name="categoriaActual.icon" />
          </q-avatar>

          <div class="q-ml-md">
            <div class="text-h6 text-weight-bold text-pink-8">
              {{ categoriaActual.label }}
            </div>

            <div class="text-caption text-grey-7">
              {{ categoriaActual.descripcion }}
            </div>
          </div>
        </div>

        <q-btn
          v-if="isAdmin"
          class="btn-glamur"
          icon="add"
          label="Agregar combo"
          @click="openDialog(selectedCategoria)"
        />
      </div>
    </q-card>

    <!-- BUSCADOR -->
    <q-card class="search-card q-mb-md">
      <q-input
        v-model="search"
        outlined
        rounded
        dense
        clearable
        placeholder="Buscar por servicio, combo o detalle..."
      >
        <template #prepend>
          <q-icon name="search" color="pink" />
        </template>
      </q-input>
    </q-card>

    <!-- TABLA -->
    <q-card class="table-card">
      <q-table
        :rows="filteredServicios"
        :columns="columns"
        row-key="id"
        flat
        bordered
        :loading="loading"
        :rows-per-page-options="[5, 10, 20, 50]"
        no-data-label="No hay combos registrados en esta categoría"
      >
        <!-- SERVICIO -->
        <template #body-cell-servicio="props">
          <q-td :props="props">
            <div class="text-weight-bold text-pink-7">
              {{ props.row.servicio }}
            </div>

            <div class="text-caption text-grey-7">
              Servicio principal
            </div>
          </q-td>
        </template>

        <!-- COMBO -->
        <template #body-cell-combo="props">
          <q-td :props="props">
            <div class="text-weight-bold text-dark">
              {{ props.row.combo }}
            </div>

            <div class="text-caption text-grey-7 combo-detalle">
              {{ props.row.detalle || 'Sin detalle registrado' }}
            </div>
          </q-td>
        </template>

        <!-- PRECIO -->
        <template #body-cell-precio="props">
          <q-td :props="props">
            <q-badge color="green" rounded class="precio-badge">
              Bs {{ money(props.row.precio) }}
            </q-badge>
          </q-td>
        </template>

        <!-- ESTADO -->
        <template #body-cell-activo="props">
          <q-td :props="props" class="text-center">
            <q-badge
              rounded
              :color="props.row.activo ? 'green' : 'grey'"
              class="estado-badge"
            >
              {{ props.row.activo ? 'Activo' : 'Inactivo' }}
            </q-badge>
          </q-td>
        </template>

        <!-- ACCIONES SOLO ADMIN -->
        <template #body-cell-actions="props">
          <q-td :props="props" class="text-center">
            <div v-if="isAdmin" class="acciones">
              <q-btn
                round
                unelevated
                size="sm"
                color="primary"
                icon="edit"
                @click="edit(props.row)"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>

              <q-btn
                round
                unelevated
                size="sm"
                color="negative"
                icon="delete"
                @click="remove(props.row)"
              >
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </div>

            <q-badge
              v-else
              rounded
              color="grey-4"
              text-color="grey-8"
              class="estado-badge"
            >
              Solo lectura
            </q-badge>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- MODAL NUEVO / EDITAR SOLO ADMIN -->
    <q-dialog
      v-if="isAdmin"
      v-model="dialog"
      persistent
      :maximized="$q.screen.lt.sm"
    >
      <q-card class="dialog-card dialog-card-main">
        <q-card-section class="dialog-header row items-center">
          <div class="text-h6 text-weight-bold">
            {{ form.id ? '✏️ Editar servicio' : '➕ Nuevo servicio' }}
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
            <q-select
              v-model="form.servicio"
              :options="categoriasFormulario"
              label="Servicio *"
              outlined
              dense
              rounded
              bg-color="white"
            >
              <template #prepend>
                <q-icon name="spa" color="pink" />
              </template>
            </q-select>

            <q-input
              v-model.trim="form.combo"
              label="Nombre del combo *"
              outlined
              dense
              rounded
              bg-color="white"
            >
              <template #prepend>
                <q-icon name="local_offer" color="pink" />
              </template>
            </q-input>

            <q-input
              v-model.trim="form.detalle"
              label="Detalle del combo *"
              type="textarea"
              autogrow
              outlined
              dense
              rounded
              bg-color="white"
            >
              <template #prepend>
                <q-icon name="description" color="pink" />
              </template>
            </q-input>

            <q-input
              v-model.number="form.precio"
              type="number"
              label="Precio Bs. *"
              outlined
              dense
              rounded
              min="0"
              bg-color="white"
            >
              <template #prepend>
                <q-icon name="payments" color="green" />
              </template>
            </q-input>

            <q-toggle
              v-model="form.activo"
              color="green"
              label="Servicio activo"
              checked-icon="check"
              unchecked-icon="close"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn
            class="btn-cancelar"
            label="Cancelar"
            icon="close"
            unelevated
            v-close-popup
          />

          <q-btn
            class="btn-glamur"
            :label="form.id ? 'Guardar cambios' : 'Registrar servicio'"
            icon="save"
            :loading="saving"
            @click="save"
          />
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
  name: 'ServiciosPage'
})

const $q = useQuasar()

const servicios = ref([])
const search = ref('')
const dialog = ref(false)
const loading = ref(false)
const saving = ref(false)
const loadingBase = ref(false)

const selectedCategoria = ref('CEJAS Y PESTAÑAS')

const categoriasUI = [
  {
    label: 'Cejas y Pestañas',
    value: 'CEJAS Y PESTAÑAS',
    icon: 'visibility',
    descripcion: 'Laminado, henna, depilación, lifting y retoques'
  },
  {
    label: 'Maquillaje y Cabello',
    value: 'MAQUILLAJE Y CABELLO',
    icon: 'face_retouching_natural',
    descripcion: 'Maquillaje, peinado, planchado y servicios VIP'
  },
  {
    label: 'Uñas',
    value: 'UÑAS',
    icon: 'brush',
    descripcion: 'Manicure, uñas, esmaltado y diseños'
  },
  {
    label: 'Otros',
    value: 'OTROS SERVICIOS',
    icon: 'more_horiz',
    descripcion: 'Servicios adicionales agregados manualmente'
  }
]

const aliasCategorias = {
  'CEJAS Y PESTAÑAS': [
    'CEJAS Y PESTAÑAS',
    'CEJAS',
    'PESTAÑAS',
    'CEJAS PERFECTAS'
  ],
  'MAQUILLAJE Y CABELLO': [
    'MAQUILLAJE Y CABELLO',
    'MAQUILLAJE',
    'CABELLO',
    'MAQUILLAJE Y PEINADO',
    'PEINADO'
  ],
  UÑAS: [
    'UÑAS',
    'UNAS',
    'MANICURE',
    'PEDICURE',
    'ESMALTADO'
  ]
}

const categoriasPrincipales = [
  'CEJAS Y PESTAÑAS',
  'MAQUILLAJE Y CABELLO',
  'UÑAS'
]

const combosBase = [
  {
    servicio: 'CEJAS Y PESTAÑAS',
    combo: 'CLEAN BROWS',
    detalle: 'Depilación + Visagismo',
    precio: 25,
    activo: true
  },
  {
    servicio: 'CEJAS Y PESTAÑAS',
    combo: 'BROWS PRO',
    detalle: 'Henna + Depilación y Visagismo',
    precio: 80,
    activo: true
  },
  {
    servicio: 'CEJAS Y PESTAÑAS',
    combo: 'LAMI BROWS',
    detalle: 'Laminado + Vitaminas + Depilación y Visagismo',
    precio: 80,
    activo: true
  },
  {
    servicio: 'CEJAS Y PESTAÑAS',
    combo: 'LASH PERFECT',
    detalle: 'Lifting + Tinte efecto rimel',
    precio: 85,
    activo: true
  },
  {
    servicio: 'CEJAS Y PESTAÑAS',
    combo: 'PERFECT BROWS',
    detalle: 'Laminado + Henna + Depilación + Visagismo',
    precio: 135,
    activo: true
  },
  {
    servicio: 'CEJAS Y PESTAÑAS',
    combo: 'GLOW UP EXPRESS',
    detalle: 'Laminado + Henna + Depilación y Visagismo + Lifting + Tinte efecto rimel',
    precio: 220,
    activo: true
  },
  {
    servicio: 'CEJAS Y PESTAÑAS',
    combo: 'PERFECT EXPRESS',
    detalle: 'Henna + Depilación y Visagismo + Lifting + Tinte efecto rimel',
    precio: 165,
    activo: true
  },
  {
    servicio: 'CEJAS Y PESTAÑAS',
    combo: 'LASH & BROWS EXPRESS',
    detalle: 'Laminado + Lifting + Tinte efecto rimel + Vitaminas + Depilación y Visagismo',
    precio: 165,
    activo: true
  },
  {
    servicio: 'CEJAS Y PESTAÑAS',
    combo: 'RETOQUE BROWS PRO',
    detalle: 'Henna',
    precio: 40,
    activo: true
  }
]

const form = ref({
  id: null,
  servicio: 'CEJAS Y PESTAÑAS',
  combo: '',
  detalle: '',
  precio: 0,
  activo: true
})

const usuarioActual = computed(() => {
  try {
    if (typeof window === 'undefined') {
      return null
    }

    const user = localStorage.getItem('glamur_user')

    if (!user) {
      return null
    }

    return JSON.parse(user)
  } catch {
    return null
  }
})

const rolUsuario = computed(() => {
  const rol = String(usuarioActual.value?.rol || 'admin').toLowerCase().trim()

  if (rol === 'administrador') {
    return 'admin'
  }

  if (rol === 'empleado') {
    return 'empleado'
  }

  return 'admin'
})

const isAdmin = computed(() => rolUsuario.value === 'admin')

const columns = computed(() => {
  const baseColumns = [
    {
      name: 'servicio',
      label: 'Servicio',
      field: 'servicio',
      align: 'left',
      sortable: true
    },
    {
      name: 'combo',
      label: 'Combo',
      field: 'combo',
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
      name: 'activo',
      label: 'Estado',
      field: 'activo',
      align: 'center'
    }
  ]

  if (isAdmin.value) {
    baseColumns.push({
      name: 'actions',
      label: 'Acciones',
      field: 'actions',
      align: 'center'
    })
  }

  return baseColumns
})

const categoriaActual = computed(() => {
  return categoriasUI.find(cat => cat.value === selectedCategoria.value) || categoriasUI[0]
})

const categoriasFormulario = computed(() => {
  const base = [
    'CEJAS Y PESTAÑAS',
    'MAQUILLAJE Y CABELLO',
    'UÑAS',
    'OTROS SERVICIOS'
  ]

  const existentes = servicios.value
    .map(item => item.servicio)
    .filter(Boolean)

  return [...new Set([...base, ...existentes])]
})

const serviciosCategoria = computed(() => {
  return servicios.value.filter(item => perteneceCategoria(item, selectedCategoria.value))
})

const filteredServicios = computed(() => {
  const texto = normalizar(search.value)

  if (!texto) return serviciosCategoria.value

  return serviciosCategoria.value.filter(item => {
    return normalizar(item.servicio).includes(texto) ||
      normalizar(item.combo).includes(texto) ||
      normalizar(item.detalle).includes(texto) ||
      normalizar(item.nombre).includes(texto) ||
      normalizar(item.descripcion).includes(texto) ||
      normalizar(item.categoria).includes(texto) ||
      normalizar(item.grupo).includes(texto)
  })
})

function money(value) {
  return Number(value || 0).toFixed(2)
}

function normalizar(valor) {
  return String(valor || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function responseToArray(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.servicios)) return data.servicios
  return []
}

function booleanValue(value) {
  return value === true || value === 1 || value === '1' || value === 'true'
}

function normalizarServicioRow(row) {
  const servicio = row.servicio || row.grupo || row.categoria || 'OTROS SERVICIOS'
  const combo = row.combo || row.nombre || ''
  const detalle = row.detalle || row.descripcion || ''
  const activo = row.activo === undefined || row.activo === null
    ? true
    : booleanValue(row.activo)

  return {
    ...row,

    servicio,
    combo,
    detalle,

    grupo: row.grupo || servicio,
    categoria: row.categoria || servicio,
    nombre: row.nombre || combo,
    descripcion: row.descripcion || detalle,

    precio: Number(row.precio || 0),
    activo
  }
}

function perteneceCategoria(item, categoria) {
  const servicio = normalizar(item.servicio || item.grupo || item.categoria)

  if (categoria === 'OTROS SERVICIOS') {
    if (servicio === normalizar('OTROS SERVICIOS')) return true

    const pertenecePrincipal = categoriasPrincipales.some(cat => {
      return coincideConCategoria(servicio, cat)
    })

    return !pertenecePrincipal
  }

  return coincideConCategoria(servicio, categoria)
}

function coincideConCategoria(servicioNormalizado, categoria) {
  const aliases = aliasCategorias[categoria] || [categoria]

  return aliases.some(alias => {
    return servicioNormalizado === normalizar(alias)
  })
}

function resumenCategoria(categoria) {
  const items = servicios.value.filter(item => perteneceCategoria(item, categoria))
  const precios = items
    .map(item => Number(item.precio || 0))
    .filter(precio => precio > 0)

  return {
    count: items.length,
    minPrecio: precios.length ? Math.min(...precios) : 0
  }
}

function crearPayloadDesdeForm() {
  return {
    grupo: form.value.servicio,
    categoria: form.value.servicio,
    nombre: form.value.combo,
    descripcion: form.value.detalle,

    servicio: form.value.servicio,
    combo: form.value.combo,
    detalle: form.value.detalle,

    precio: Number(form.value.precio || 0),
    activo: form.value.activo
  }
}

function crearPayloadDesdeCombo(combo) {
  return {
    grupo: combo.servicio,
    categoria: combo.servicio,
    nombre: combo.combo,
    descripcion: combo.detalle,

    servicio: combo.servicio,
    combo: combo.combo,
    detalle: combo.detalle,

    precio: Number(combo.precio || 0),
    activo: combo.activo
  }
}

function getErrorMessage(error) {
  const data = error?.response?.data

  if (data?.errors) {
    return Object.values(data.errors).flat().join(' ')
  }

  return data?.message || data?.error || 'Ocurrió un error'
}

function validarAdmin(accion = 'realizar esta acción') {
  if (isAdmin.value) {
    return true
  }

  $q.notify({
    type: 'warning',
    message: `No tienes permiso para ${accion}.`
  })

  return false
}

async function load() {
  loading.value = true

  try {
    const { data } = await api.get('/servicios')
    servicios.value = responseToArray(data).map(normalizarServicioRow)
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(error)
    })
  } finally {
    loading.value = false
  }
}

function openDialog(categoria = selectedCategoria.value) {
  if (!validarAdmin('agregar servicios')) return

  const categoriaInicial = categoria || 'CEJAS Y PESTAÑAS'

  form.value = {
    id: null,
    servicio: categoriaInicial,
    combo: '',
    detalle: '',
    precio: 0,
    activo: true
  }

  dialog.value = true
}

function edit(row) {
  if (!validarAdmin('editar servicios')) return

  const item = normalizarServicioRow(row)

  form.value = {
    id: item.id,
    servicio: item.servicio || 'OTROS SERVICIOS',
    combo: item.combo || '',
    detalle: item.detalle || '',
    precio: Number(item.precio || 0),
    activo: item.activo !== false
  }

  dialog.value = true
}

async function save() {
  if (!validarAdmin('guardar servicios')) return

  if (!form.value.servicio) {
    $q.notify({
      type: 'warning',
      message: 'El servicio es obligatorio'
    })

    return
  }

  if (!form.value.combo) {
    $q.notify({
      type: 'warning',
      message: 'El nombre del combo es obligatorio'
    })

    return
  }

  if (!form.value.detalle) {
    $q.notify({
      type: 'warning',
      message: 'El detalle del combo es obligatorio'
    })

    return
  }

  if (Number(form.value.precio || 0) <= 0) {
    $q.notify({
      type: 'warning',
      message: 'El precio debe ser mayor a 0'
    })

    return
  }

  saving.value = true

  try {
    const payload = crearPayloadDesdeForm()

    if (form.value.id) {
      await api.put(`/servicios/${form.value.id}`, payload)

      $q.notify({
        type: 'positive',
        message: 'Servicio actualizado correctamente'
      })
    } else {
      await api.post('/servicios', payload)

      $q.notify({
        type: 'positive',
        message: 'Servicio registrado correctamente'
      })
    }

    selectedCategoria.value = form.value.servicio
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
  if (!validarAdmin('eliminar servicios')) return

  const item = normalizarServicioRow(row)

  $q.dialog({
    title: 'Eliminar servicio',
    message: `¿Seguro que deseas eliminar el combo "${item.combo}"?`,
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
      await api.delete(`/servicios/${item.id}`)

      $q.notify({
        type: 'positive',
        message: 'Servicio eliminado correctamente'
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

function confirmarCargarBase() {
  if (!validarAdmin('cargar combos base')) return

  $q.dialog({
    title: 'Cargar combos base',
    message: 'Esto registrará o actualizará los combos principales de Cejas y Pestañas.',
    persistent: true,
    ok: {
      label: 'Cargar',
      color: 'positive',
      unelevated: true
    },
    cancel: {
      label: 'Cancelar',
      color: 'grey-7',
      flat: true
    }
  }).onOk(async () => {
    await cargarCombosBase()
  })
}

async function cargarCombosBase() {
  if (!validarAdmin('cargar combos base')) return

  loadingBase.value = true

  try {
    try {
      await api.post('/servicios/cargar-base')
    } catch {
      for (const combo of combosBase) {
        const payload = crearPayloadDesdeCombo(combo)

        const existente = servicios.value.find(item => {
          return normalizar(item.combo) === normalizar(combo.combo) ||
            normalizar(item.nombre) === normalizar(combo.combo)
        })

        if (existente?.id) {
          await api.put(`/servicios/${existente.id}`, payload)
        } else {
          await api.post('/servicios', payload)
        }
      }
    }

    selectedCategoria.value = 'CEJAS Y PESTAÑAS'

    $q.notify({
      type: 'positive',
      message: 'Combos base cargados correctamente'
    })

    await load()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(error)
    })
  } finally {
    loadingBase.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.servicios-page {
  min-height: 100vh;
  background: #faf7fb;
}

.page-hero {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  border-radius: 28px;
  padding: 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 16px 40px rgba(233, 30, 99, 0.25);
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.employee-mode {
  background: #fff7fb;
  color: #4b2b55;
  border: 1px solid rgba(233, 30, 99, 0.16);
  box-shadow: 0 10px 28px rgba(156, 39, 176, 0.08);
}

.btn-glamur-white {
  background: white;
  color: #c2185b;
  font-weight: 900;
  border-radius: 16px;
  padding: 10px 18px;
  box-shadow: 0 10px 24px rgba(20, 10, 30, 0.18);
}

.btn-glamur {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
  font-weight: 900;
  border-radius: 16px;
  padding: 10px 18px;
  box-shadow: 0 10px 24px rgba(233, 30, 99, 0.25);
}

.btn-cancelar {
  background: #f2f2f5;
  color: #666;
  font-weight: 900;
  border-radius: 16px;
  padding: 10px 18px;
}

.categorias-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.categoria-card {
  background: white;
  border-radius: 24px;
  padding: 18px;
  min-height: 150px;
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(233, 30, 99, 0.12);
  box-shadow: 0 12px 30px rgba(156, 39, 176, 0.1);
  transition: all 0.2s ease;
}

.categoria-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 38px rgba(156, 39, 176, 0.18);
}

.categoria-card.active {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
  border-color: transparent;
}

.categoria-icon {
  width: 52px;
  height: 52px;
  min-width: 52px;
  border-radius: 18px;
  background: #fce4ec;
  color: #e91e63;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
}

.categoria-card.active .categoria-icon {
  background: rgba(255, 255, 255, 0.22);
  color: white;
}

.categoria-info {
  flex: 1;
  min-width: 0;
}

.categoria-title {
  font-weight: 900;
  font-size: 17px;
  line-height: 1.15;
}

.categoria-subtitle {
  margin-top: 5px;
  font-size: 12px;
  color: #6b6070;
  line-height: 1.3;
}

.categoria-card.active .categoria-subtitle {
  color: rgba(255, 255, 255, 0.86);
}

.categoria-extra {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.categoria-arrow {
  position: absolute;
  right: 14px;
  bottom: 14px;
  font-size: 24px;
  opacity: 0.8;
}

.categoria-panel {
  border-radius: 24px;
  padding: 18px;
  background: white;
  box-shadow: 0 14px 35px rgba(156, 39, 176, 0.1);
}

.categoria-panel-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.categoria-panel-icon {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
}

.search-card,
.table-card {
  border-radius: 24px;
  overflow: hidden;
  background: white;
  box-shadow: 0 14px 35px rgba(156, 39, 176, 0.12);
}

.search-card {
  padding: 16px;
}

.table-card :deep(.q-table__middle) {
  overflow-x: auto;
}

.table-card :deep(.q-table thead tr) {
  background: linear-gradient(135deg, #fce4ec, #f3e5f5);
  color: #880e4f;
}

.table-card :deep(.q-table th) {
  font-weight: 900;
  font-size: 13px;
}

.table-card :deep(.q-table tbody tr:hover) {
  background: #fff0f6;
}

.precio-badge,
.estado-badge {
  padding: 6px 10px;
  font-weight: 800;
}

.combo-detalle {
  max-width: 520px;
  white-space: normal;
  line-height: 1.35;
}

.acciones {
  display: flex;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
}

.dialog-card {
  width: 520px;
  max-width: 96vw;
  max-height: 92vh;
  border-radius: 24px;
  overflow: hidden;
}

.dialog-card-main {
  display: flex;
  flex-direction: column;
}

.dialog-header {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
  position: sticky;
  top: 0;
  z-index: 3;
}

.dialog-body {
  background: #ffffff;
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.dialog-actions {
  padding: 16px 22px;
  background: white;
  border-top: 1px solid #eee;
  position: sticky;
  bottom: 0;
  z-index: 3;
}

/* TABLET */
@media (max-width: 1024px) {
  .categorias-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* TABLET Y CELULAR */
@media (max-width: 768px) {
  .servicios-page {
    padding: 12px;
  }

  .page-hero {
    padding: 22px;
    border-radius: 24px;
    flex-direction: column;
    align-items: stretch;
    gap: 18px;
  }

  .page-hero .text-h4 {
    font-size: 28px;
    line-height: 1.15;
  }

  .hero-actions {
    width: 100%;
  }

  .hero-actions .q-btn {
    width: 100%;
  }

  .categorias-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .categoria-card {
    min-height: 118px;
    padding: 16px;
  }

  .categoria-panel-content {
    flex-direction: column;
    align-items: stretch;
  }

  .categoria-panel-content .q-btn {
    width: 100%;
  }

  .search-card {
    padding: 12px;
  }

  .dialog-card {
    width: 100%;
    max-width: 100%;
    border-radius: 0;
  }

  .dialog-body {
    padding: 18px;
  }

  .dialog-actions {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .dialog-actions .q-btn {
    width: 100%;
  }
}

/* CELULAR PEQUEÑO */
@media (max-width: 480px) {
  .page-hero .text-h4 {
    font-size: 25px;
  }

  .page-hero .text-subtitle2 {
    font-size: 13px;
  }

  .categoria-title {
    font-size: 16px;
  }

  .categoria-subtitle {
    font-size: 12px;
  }

  .btn-glamur-white,
  .btn-glamur,
  .btn-cancelar {
    padding: 10px 14px;
    font-size: 13px;
  }

  .table-card :deep(.q-table th),
  .table-card :deep(.q-table td) {
    font-size: 12px;
    padding: 8px;
  }
}
</style>