<template>
  <div class="empresas-panel">
    <div class="panel-header">
      <div>
        <h2>Empresas</h2>
        <p>Administra clientes, identidad visual, plan y estado de cada empresa.</p>
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
        <template #body-cell-identidad="props">
          <q-td :props="props">
            <div class="empresa-identidad">
              <q-avatar size="42px" class="empresa-avatar">
                <img v-if="props.row.logo" :src="props.row.logo" />
                <span v-else>{{ iniciales(props.row.nombre) }}</span>
              </q-avatar>

              <div>
                <div class="empresa-nombre">{{ props.row.nombre }}</div>
                <div class="empresa-slug">{{ props.row.slug }}</div>
              </div>
            </div>
          </q-td>
        </template>

        <template #body-cell-plan="props">
          <q-td :props="props">
            <q-chip
              :color="planColor(props.row.plan)"
              text-color="white"
              dense
            >
              {{ planLabel(props.row.plan) }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-vencimiento="props">
          <q-td :props="props">
            <span :class="{ vencido: estaVencida(props.row.fecha_vencimiento) }">
              {{ props.row.fecha_vencimiento || 'Sin fecha' }}
            </span>
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
          <div class="preview-card" :style="previewStyle">
            <q-avatar size="66px" class="preview-avatar">
              <img v-if="form.logo" :src="form.logo" />
              <span v-else>{{ iniciales(form.nombre || 'AGR') }}</span>
            </q-avatar>

            <div>
              <div class="preview-title">{{ form.nombre || 'Nombre de empresa' }}</div>
              <div class="preview-subtitle">{{ form.slug || 'slug-empresa' }}</div>
              <q-chip size="sm" color="white" text-color="dark">
                {{ planLabel(form.plan) }}
              </q-chip>
            </div>
          </div>

          <q-input
            v-model.trim="form.nombre"
            label="Nombre"
            dark
            outlined
            class="q-mb-md"
            @update:model-value="autogenerarSlug"
          />

          <q-input
            v-model.trim="form.slug"
            label="Slug"
            dark
            outlined
            class="q-mb-md"
          />

          <q-input
            v-model.trim="form.logo"
            label="URL del logo"
            dark
            outlined
            class="q-mb-md"
            hint="Opcional. Puedes pegar una URL de imagen."
          />

          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.color_primario"
                label="Color primario"
                type="color"
                dark
                outlined
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="form.color_secundario"
                label="Color secundario"
                type="color"
                dark
                outlined
              />
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.plan"
                :options="planes"
                label="Plan"
                dark
                outlined
                emit-value
                map-options
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="form.fecha_vencimiento"
                label="Fecha de vencimiento"
                type="date"
                dark
                outlined
              />
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
import { computed, ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const API_URL = import.meta.env.VITE_API_URL || 'https://agr-platform-backend-2.onrender.com/api'

const empresas = ref([])
const loading = ref(false)
const guardando = ref(false)
const dialogo = ref(false)
const editando = ref(false)
const empresaId = ref(null)

const planes = [
  { label: 'Básico', value: 'basico' },
  { label: 'Profesional', value: 'profesional' },
  { label: 'Empresarial', value: 'empresarial' }
]

const form = ref(formVacio())

const previewStyle = computed(() => ({
  background: `linear-gradient(135deg, ${form.value.color_primario || '#ec4899'}, ${form.value.color_secundario || '#9333ea'})`
}))

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' },
  { name: 'identidad', label: 'Empresa', field: 'nombre', align: 'left' },
  { name: 'plan', label: 'Plan', field: 'plan', align: 'center' },
  { name: 'vencimiento', label: 'Vence', field: 'fecha_vencimiento', align: 'center' },
  { name: 'colores', label: 'Colores', field: 'colores', align: 'center' },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

function formVacio() {
  return {
    nombre: '',
    slug: '',
    logo: '',
    color_primario: '#ec4899',
    color_secundario: '#9333ea',
    plan: 'basico',
    fecha_vencimiento: '',
    activo: true
  }
}

function token() {
  return localStorage.getItem('agr_token')
}

function getErrorMessage(data, fallback = 'Ocurrió un error') {
  if (data?.errors) {
    return Object.values(data.errors).flat().join(' ')
  }

  return data?.message || fallback
}

function iniciales(nombre = '') {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0]?.toUpperCase())
    .join('') || 'A'
}

function planLabel(plan) {
  return planes.find((item) => item.value === plan)?.label || 'Básico'
}

function planColor(plan) {
  if (plan === 'empresarial') return 'deep-purple'
  if (plan === 'profesional') return 'primary'
  return 'teal'
}

function estaVencida(fecha) {
  if (!fecha) return false

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const vencimiento = new Date(fecha)
  vencimiento.setHours(0, 0, 0, 0)

  return vencimiento < hoy
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
      throw new Error(getErrorMessage(data, 'No se pudieron cargar las empresas'))
    }

    empresas.value = Array.isArray(data) ? data : data.data || []
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
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function autogenerarSlug() {
  if (!editando.value && form.value.nombre) {
    form.value.slug = generarSlug(form.value.nombre)
  }
}

function abrirDialogo(empresa = null) {
  if (empresa) {
    editando.value = true
    empresaId.value = empresa.id

    form.value = {
      nombre: empresa.nombre || '',
      slug: empresa.slug || '',
      logo: empresa.logo || '',
      color_primario: empresa.color_primario || '#ec4899',
      color_secundario: empresa.color_secundario || '#9333ea',
      plan: empresa.plan || 'basico',
      fecha_vencimiento: empresa.fecha_vencimiento || '',
      activo: Boolean(empresa.activo)
    }
  } else {
    editando.value = false
    empresaId.value = null
    form.value = formVacio()
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
    const payload = {
      ...form.value,
      logo: form.value.logo || null,
      fecha_vencimiento: form.value.fecha_vencimiento || null
    }

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
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(getErrorMessage(data, 'No se pudo guardar la empresa'))
    }

    $q.notify({
      type: 'positive',
      message: data.message || 'Empresa guardada correctamente'
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
  const confirmar = window.confirm(`¿Eliminar la empresa ${empresa.nombre}?`)

  if (!confirmar) return

  try {
    const response = await fetch(`${API_URL}/empresas/${empresa.id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token()}`
      }
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(getErrorMessage(data, 'No se pudo eliminar la empresa'))
    }

    $q.notify({
      type: 'positive',
      message: data.message || 'Empresa eliminada correctamente'
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
  gap: 16px;
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
  width: 680px;
  max-width: 95vw;
}

.btn-primary {
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  color: white;
  border-radius: 12px;
  font-weight: 700;
}

.empresa-identidad {
  display: flex;
  align-items: center;
  gap: 12px;
}

.empresa-avatar,
.preview-avatar {
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  color: white;
  font-weight: 900;
}

.empresa-nombre {
  font-weight: 900;
}

.empresa-slug {
  opacity: 0.6;
  font-size: 12px;
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

.preview-card {
  display: flex;
  align-items: center;
  gap: 18px;
  min-height: 130px;
  padding: 22px;
  border-radius: 22px;
  margin-bottom: 20px;
  color: white;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.28);
}

.preview-title {
  font-size: 24px;
  font-weight: 900;
}

.preview-subtitle {
  opacity: 0.78;
  margin-bottom: 8px;
}

.vencido {
  color: #f87171;
  font-weight: 900;
}

@media (max-width: 680px) {
  .panel-header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
