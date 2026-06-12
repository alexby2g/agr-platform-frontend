<template>
  <div class="permisos-panel">
    <div class="panel-header">
      <div>
        <h2>Permisos</h2>
        <p>Asigna qué módulos puede usar cada empresa</p>
      </div>
    </div>

    <q-card class="panel-card">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-5">
            <q-select
              v-model="empresaSeleccionada"
              :options="empresasOptions"
              label="Seleccionar empresa"
              dark
              outlined
              emit-value
              map-options
              @update:model-value="cargarPermisos"
            />
          </div>

          <div class="col-12 col-md-7 flex items-center">
            <q-btn
              label="Guardar permisos"
              icon="save"
              class="btn-primary"
              :loading="guardando"
              :disable="!empresaSeleccionada"
              @click="guardarPermisos"
            />
          </div>
        </div>
      </q-card-section>

      <q-separator dark />

      <q-card-section v-if="empresaSeleccionada">
        <div class="modulos-grid">
          <q-card
            v-for="modulo in modulos"
            :key="modulo.id"
            class="modulo-card"
            :class="{ activo: modulosSeleccionados.includes(modulo.id) }"
            @click="toggleModulo(modulo.id)"
          >
            <div class="row items-center no-wrap">
              <q-checkbox
                :model-value="modulosSeleccionados.includes(modulo.id)"
                color="purple"
                dark
                @update:model-value="toggleModulo(modulo.id)"
              />

              <q-icon :name="modulo.icono" size="32px" class="q-mx-md" />

              <div>
                <div class="modulo-nombre">{{ modulo.nombre }}</div>
                <div class="modulo-ruta">{{ modulo.ruta_frontend }}</div>
              </div>
            </div>
          </q-card>
        </div>
      </q-card-section>

      <q-card-section v-else>
        <div class="empty">
          Selecciona una empresa para asignar sus módulos.
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const API_URL = 'http://127.0.0.1:8000/api'

const empresas = ref([])
const modulos = ref([])
const empresasOptions = ref([])
const empresaSeleccionada = ref(null)
const modulosSeleccionados = ref([])
const guardando = ref(false)

function token() {
  return localStorage.getItem('agr_token')
}

async function cargarEmpresas() {
  const response = await fetch(`${API_URL}/empresas`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token()}`
    }
  })

  const data = await response.json()
  empresas.value = data

  empresasOptions.value = data.map((empresa) => ({
    label: empresa.nombre,
    value: empresa.id
  }))
}

async function cargarModulos() {
  const response = await fetch(`${API_URL}/modulos`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token()}`
    }
  })

  const data = await response.json()
  modulos.value = data
}

async function cargarPermisos() {
  if (!empresaSeleccionada.value) return

  const response = await fetch(
    `${API_URL}/empresas/${empresaSeleccionada.value}/modulos`,
    {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token()}`
      }
    }
  )

  const data = await response.json()
  modulosSeleccionados.value = data.map((modulo) => modulo.id)
}

function toggleModulo(id) {
  if (modulosSeleccionados.value.includes(id)) {
    modulosSeleccionados.value = modulosSeleccionados.value.filter(
      (moduloId) => moduloId !== id
    )
  } else {
    modulosSeleccionados.value.push(id)
  }
}

async function guardarPermisos() {
  if (!empresaSeleccionada.value) {
    $q.notify({
      type: 'warning',
      message: 'Selecciona una empresa'
    })
    return
  }

  guardando.value = true

  try {
    const response = await fetch(
      `${API_URL}/empresas/${empresaSeleccionada.value}/modulos`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`
        },
        body: JSON.stringify({
          modulos: modulosSeleccionados.value
        })
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'No se pudieron guardar los permisos')
    }

    $q.notify({
      type: 'positive',
      message: data.message
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message
    })
  } finally {
    guardando.value = false
  }
}

onMounted(async () => {
  await cargarEmpresas()
  await cargarModulos()
})
</script>

<style scoped>
.permisos-panel {
  margin-top: 42px;
  margin-bottom: 80px;
}

.panel-header {
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

.panel-card {
  background: rgba(15, 23, 42, 0.92);
  color: white;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.btn-primary {
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  color: white;
  border-radius: 12px;
  font-weight: 700;
}

.modulos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 18px;
}

.modulo-card {
  cursor: pointer;
  padding: 18px;
  border-radius: 18px;
  color: white;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.12);
  transition: 0.2s ease;
}

.modulo-card.activo {
  border-color: #8b5cf6;
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.35);
}

.modulo-nombre {
  font-weight: 900;
  font-size: 16px;
}

.modulo-ruta {
  opacity: 0.6;
  font-size: 12px;
}

.empty {
  opacity: 0.65;
}
</style>