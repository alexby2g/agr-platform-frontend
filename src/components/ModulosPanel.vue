<template>
  <div class="modulos-panel">
    <div class="panel-header">
      <div>
        <h2>Módulos</h2>
        <p>Administra las aplicaciones disponibles dentro de AGR Studio</p>
      </div>

      <q-btn
        label="Nuevo módulo"
        icon="extension"
        class="btn-primary"
        @click="abrirDialogo()"
      />
    </div>

    <q-card class="panel-card">
      <q-table
        :rows="modulos"
        :columns="columns"
        row-key="id"
        flat
        dark
        :loading="loading"
      >
        <template #body-cell-icono="props">
          <q-td :props="props">
            <q-icon :name="props.row.icono" size="26px" />
            <span class="q-ml-sm">{{ props.row.icono }}</span>
          </q-td>
        </template>

        <template #body-cell-color="props">
          <q-td :props="props">
            <div class="color-dot" :style="{ background: props.row.color }"></div>
          </q-td>
        </template>

        <template #body-cell-activo="props">
          <q-td :props="props">
            <q-chip
              :color="props.row.activo ? 'positive' : 'negative'"
              text-color="white"
              dense
            >
              {{ props.row.activo ? 'Activo' : 'Inactivo' }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-acciones="props">
          <q-td :props="props">
            <q-btn dense flat icon="edit" color="warning" @click="abrirDialogo(props.row)" />
            <q-btn dense flat icon="delete" color="negative" @click="eliminarModulo(props.row)" />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="dialogo">
      <q-card class="dialog-card">
        <q-card-section>
          <div class="text-h6">
            {{ editando ? 'Editar módulo' : 'Nuevo módulo' }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="form.nombre" label="Nombre del módulo" dark outlined class="q-mb-md" />
          <q-input v-model="form.slug" label="Slug" dark outlined class="q-mb-md" />
          <q-input v-model="form.icono" label="Icono Material" dark outlined class="q-mb-md" />
          <q-input v-model="form.ruta_frontend" label="Ruta frontend" dark outlined class="q-mb-md" />
          <q-input v-model="form.color" label="Color" dark outlined class="q-mb-md" />

          <q-toggle
            v-model="form.activo"
            label="Módulo activo"
            color="positive"
          />

          <div class="hint">
            Ejemplos de iconos: spa, fitness_center, ac_unit, directions_bus, local_hospital
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn
            label="Guardar"
            icon="save"
            class="btn-primary"
            :loading="guardando"
            @click="guardarModulo"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const API_URL = import.meta.env.VITE_API_URL || 'https://agr-platform-backend-2.onrender.com/api'

const modulos = ref([])
const loading = ref(false)
const guardando = ref(false)
const dialogo = ref(false)
const editando = ref(false)
const moduloId = ref(null)

const form = ref({
  nombre: '',
  slug: '',
  icono: 'apps',
  ruta_frontend: '/apps/',
  color: '#111827',
  activo: true
})

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
  { name: 'slug', label: 'Slug', field: 'slug', align: 'left' },
  { name: 'icono', label: 'Icono', field: 'icono', align: 'left' },
  { name: 'ruta_frontend', label: 'Ruta', field: 'ruta_frontend', align: 'left' },
  { name: 'color', label: 'Color', field: 'color', align: 'center' },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

function token() {
  return localStorage.getItem('agr_token')
}

async function cargarModulos() {
  loading.value = true

  try {
    const response = await fetch(`${API_URL}/modulos`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token()}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error('No se pudieron cargar los módulos')
    }

    modulos.value = data
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message })
  } finally {
    loading.value = false
  }
}

function generarSlug(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function abrirDialogo(modulo = null) {
  if (modulo) {
    editando.value = true
    moduloId.value = modulo.id

    form.value = {
      nombre: modulo.nombre,
      slug: modulo.slug,
      icono: modulo.icono || 'apps',
      ruta_frontend: modulo.ruta_frontend,
      color: modulo.color || '#111827',
      activo: Boolean(modulo.activo)
    }
  } else {
    editando.value = false
    moduloId.value = null

    form.value = {
      nombre: '',
      slug: '',
      icono: 'apps',
      ruta_frontend: '/apps/',
      color: '#111827',
      activo: true
    }
  }

  dialogo.value = true
}

async function guardarModulo() {
  if (!form.value.nombre) {
    $q.notify({ type: 'warning', message: 'El nombre es obligatorio' })
    return
  }

  if (!form.value.slug) {
    form.value.slug = generarSlug(form.value.nombre)
  }

  if (!form.value.ruta_frontend || form.value.ruta_frontend === '/apps/') {
    form.value.ruta_frontend = `/apps/${form.value.slug}`
  }

  guardando.value = true

  try {
    const url = editando.value
      ? `${API_URL}/modulos/${moduloId.value}`
      : `${API_URL}/modulos`

    const method = editando.value ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token()}`
      },
      body: JSON.stringify(form.value)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'No se pudo guardar el módulo')
    }

    $q.notify({
      type: 'positive',
      message: data.message
    })

    dialogo.value = false
    await cargarModulos()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message
    })
  } finally {
    guardando.value = false
  }
}

async function eliminarModulo(modulo) {
  const confirmar = confirm(`¿Eliminar el módulo ${modulo.nombre}?`)

  if (!confirmar) return

  try {
    const response = await fetch(`${API_URL}/modulos/${modulo.id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token()}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'No se pudo eliminar')
    }

    $q.notify({
      type: 'positive',
      message: data.message
    })

    await cargarModulos()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message
    })
  }
}

onMounted(() => {
  cargarModulos()
})
</script>

<style scoped>
.modulos-panel {
  margin-top: 42px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.panel-header h2 {
  margin: 0;
  font-size: 32px;
  font-weight: 900;
}

.panel-header p {
  margin: 4px 0 0;
  opacity: 0.65;
}

.panel-card,
.dialog-card {
  background: rgba(15, 23, 42, 0.92);
  color: white;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.dialog-card {
  width: 560px;
  max-width: 95vw;
}

.btn-primary {
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  color: white;
  border-radius: 12px;
  font-weight: 700;
}

.color-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin: auto;
  border: 2px solid rgba(255, 255, 255, 0.45);
}

.hint {
  margin-top: 12px;
  font-size: 12px;
  opacity: 0.65;
}
</style>