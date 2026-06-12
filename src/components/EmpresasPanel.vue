<template>
  <div class="empresas-panel">
    <div class="panel-header">
      <div>
        <h2>Empresas</h2>
        <p>Administra los clientes de AGR Studio Platform</p>
      </div>

      <q-btn
        label="Nueva empresa"
        icon="add_business"
        class="btn-primary"
        @click="abrirDialogo()"
      />
    </div>

    <q-card class="panel-card">
      <q-table
        :rows="empresas"
        :columns="columns"
        row-key="id"
        flat
        dark
        :loading="loading"
      >
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

        <template #body-cell-colores="props">
          <q-td :props="props">
            <div class="colors">
              <span :style="{ background: props.row.color_primario }"></span>
              <span :style="{ background: props.row.color_secundario }"></span>
            </div>
          </q-td>
        </template>

        <template #body-cell-acciones="props">
          <q-td :props="props">
            <q-btn dense flat icon="edit" color="warning" @click="abrirDialogo(props.row)" />
            <q-btn dense flat icon="delete" color="negative" @click="eliminarEmpresa(props.row)" />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="dialogo">
      <q-card class="dialog-card">
        <q-card-section>
          <div class="text-h6">
            {{ editando ? 'Editar empresa' : 'Nueva empresa' }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="form.nombre" label="Nombre" dark outlined class="q-mb-md" />
          <q-input v-model="form.slug" label="Slug" dark outlined class="q-mb-md" />

          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input v-model="form.color_primario" label="Color primario" dark outlined />
            </div>
            <div class="col-6">
              <q-input v-model="form.color_secundario" label="Color secundario" dark outlined />
            </div>
          </div>

          <q-toggle
            v-model="form.activo"
            label="Empresa activa"
            color="positive"
            class="q-mt-md"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn
            label="Guardar"
            icon="save"
            class="btn-primary"
            :loading="guardando"
            @click="guardarEmpresa"
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

const empresas = ref([])
const loading = ref(false)
const guardando = ref(false)
const dialogo = ref(false)
const editando = ref(false)
const empresaId = ref(null)

const form = ref({
  nombre: '',
  slug: '',
  color_primario: '#4f46e5',
  color_secundario: '#9333ea',
  activo: true
})

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
  { name: 'slug', label: 'Slug', field: 'slug', align: 'left' },
  { name: 'colores', label: 'Colores', field: 'colores', align: 'center' },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

function token() {
  return localStorage.getItem('agr_token')
}

async function cargarEmpresas() {
  loading.value = true

  try {
    const response = await fetch(`${API_URL}/empresas`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token()}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error('No se pudieron cargar las empresas')
    }

    empresas.value = data
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message
    })
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

function abrirDialogo(empresa = null) {
  if (empresa) {
    editando.value = true
    empresaId.value = empresa.id
    form.value = {
      nombre: empresa.nombre,
      slug: empresa.slug,
      color_primario: empresa.color_primario || '#4f46e5',
      color_secundario: empresa.color_secundario || '#9333ea',
      activo: Boolean(empresa.activo)
    }
  } else {
    editando.value = false
    empresaId.value = null
    form.value = {
      nombre: '',
      slug: '',
      color_primario: '#4f46e5',
      color_secundario: '#9333ea',
      activo: true
    }
  }

  dialogo.value = true
}

async function guardarEmpresa() {
  if (!form.value.nombre) {
    $q.notify({ type: 'warning', message: 'El nombre es obligatorio' })
    return
  }

  if (!form.value.slug) {
    form.value.slug = generarSlug(form.value.nombre)
  }

  guardando.value = true

  try {
    const url = editando.value
      ? `${API_URL}/empresas/${empresaId.value}`
      : `${API_URL}/empresas`

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
      throw new Error(data.message || 'No se pudo guardar')
    }

    $q.notify({
      type: 'positive',
      message: data.message
    })

    dialogo.value = false
    await cargarEmpresas()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message
    })
  } finally {
    guardando.value = false
  }
}

async function eliminarEmpresa(empresa) {
  const confirmar = confirm(`¿Eliminar la empresa ${empresa.nombre}?`)

  if (!confirmar) return

  try {
    const response = await fetch(`${API_URL}/empresas/${empresa.id}`, {
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

    await cargarEmpresas()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message
    })
  }
}

onMounted(() => {
  cargarEmpresas()
})
</script>

<style scoped>
.empresas-panel {
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
  width: 520px;
  max-width: 95vw;
}

.btn-primary {
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  color: white;
  border-radius: 12px;
  font-weight: 700;
}

.colors {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.colors span {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: block;
  border: 2px solid rgba(255, 255, 255, 0.4);
}
</style>