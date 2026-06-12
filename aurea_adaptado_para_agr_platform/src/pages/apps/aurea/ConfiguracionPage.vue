<template>
  <q-page class="glamur-page configuracion-page">
    <section class="glamur-hero q-mb-md">
      <div>
        <div class="glamur-eyebrow">
          <q-icon name="settings" />
          Configuración del negocio
        </div>

        <div class="glamur-title q-mt-sm">
          Identidad de {{ form.nombre_corto || 'AUREA Beauty' }}
        </div>

        <div class="glamur-subtitle q-mt-xs">
          Administra los datos visibles del salón, WhatsApp, dirección y presentación del sistema.
        </div>
      </div>

      <div class="hero-actions">
        <q-btn
          icon="refresh"
          label="Actualizar"
          class="glamur-btn-light"
          unelevated
          :loading="loading"
          @click="cargarConfiguracion"
        />
      </div>
    </section>

    <q-linear-progress
      v-if="loading || saving"
      indeterminate
      color="pink"
      class="q-mb-md"
    />

    <div class="row q-col-gutter-md">
      <div class="col-12 col-lg-8">
        <q-card class="glamur-card form-card">
          <q-card-section>
            <div class="glamur-section-title">
              Datos principales
            </div>

            <div class="glamur-section-subtitle">
              Esta información se usará como base para la identidad del sistema.
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.nombre_negocio"
                  label="Nombre del negocio"
                  outlined
                  dense
                  class="aurea-input"
                  :rules="[required]"
                >
                  <template #prepend>
                    <q-icon name="storefront" color="pink-7" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.nombre_corto"
                  label="Nombre corto para APK o encabezado"
                  outlined
                  dense
                  class="aurea-input"
                  :rules="[required]"
                >
                  <template #prepend>
                    <q-icon name="auto_awesome" color="pink-7" />
                  </template>
                </q-input>
              </div>

              <div class="col-12">
                <q-input
                  v-model="form.slogan"
                  label="Slogan o descripción corta"
                  outlined
                  dense
                  class="aurea-input"
                >
                  <template #prepend>
                    <q-icon name="format_quote" color="pink-7" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.telefono"
                  label="Teléfono del negocio"
                  outlined
                  dense
                  class="aurea-input"
                >
                  <template #prepend>
                    <q-icon name="phone" color="pink-7" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.whatsapp"
                  label="WhatsApp del negocio"
                  outlined
                  dense
                  class="aurea-input"
                  hint="Ejemplo: 59170000000"
                >
                  <template #prepend>
                    <q-icon name="chat" color="pink-7" />
                  </template>
                </q-input>
              </div>

              <div class="col-12">
                <q-input
                  v-model="form.direccion"
                  label="Dirección"
                  outlined
                  dense
                  class="aurea-input"
                >
                  <template #prepend>
                    <q-icon name="location_on" color="pink-7" />
                  </template>
                </q-input>
              </div>

              <div class="col-12">
                <q-input
                  v-model="form.mensaje_whatsapp"
                  label="Mensaje de WhatsApp por defecto"
                  type="textarea"
                  outlined
                  autogrow
                  class="aurea-input"
                  hint="Puedes usar {cliente} y {negocio} para personalizar mensajes después."
                >
                  <template #prepend>
                    <q-icon name="sms" color="pink-7" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.logo_url"
                  label="URL del logo"
                  outlined
                  dense
                  class="aurea-input"
                  hint="Opcional. Puedes dejarlo vacío para usar el logo actual."
                  @update:model-value="logoError = false"
                >
                  <template #prepend>
                    <q-icon name="image" color="pink-7" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-3">
                <q-input
                  v-model="form.moneda"
                  label="Moneda"
                  outlined
                  dense
                  class="aurea-input"
                >
                  <template #prepend>
                    <q-icon name="payments" color="pink-7" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-3">
                <q-select
                  v-model="form.activo"
                  :options="estadoOptions"
                  emit-value
                  map-options
                  label="Estado"
                  outlined
                  dense
                  class="aurea-input"
                >
                  <template #prepend>
                    <q-icon name="verified" color="pink-7" />
                  </template>
                </q-select>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right" class="q-pa-md actions-bar">
            <q-btn
              flat
              no-caps
              icon="restart_alt"
              label="Valores base"
              color="grey-7"
              @click="restaurarValoresBase"
            />

            <q-btn
              unelevated
              no-caps
              icon="save"
              label="Guardar configuración"
              class="glamur-btn"
              :loading="saving"
              @click="guardarConfiguracion"
            />
          </q-card-actions>
        </q-card>
      </div>

      <div class="col-12 col-lg-4">
        <q-card class="glamur-card preview-card">
          <q-card-section class="preview-header">
            <q-avatar class="preview-logo" size="78px">
              <img
                v-if="form.logo_url && !logoError"
                :src="form.logo_url"
                alt="Logo"
                @error="logoError = true"
              />

              <img
                v-else
                src="~@/assets/logo-glamur.png"
                alt="AUREA Beauty"
              />
            </q-avatar>

            <div class="preview-name">
              {{ form.nombre_negocio || 'AUREA Beauty Salon' }}
            </div>

            <div class="preview-slogan">
              {{ form.slogan || 'Sistema inteligente para salones de belleza' }}
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="info-row">
              <q-icon name="phone" color="pink-7" />
              <span>{{ form.telefono || 'Sin teléfono registrado' }}</span>
            </div>

            <div class="info-row">
              <q-icon name="chat" color="green-7" />
              <span>{{ form.whatsapp || 'Sin WhatsApp registrado' }}</span>
            </div>

            <div class="info-row">
              <q-icon name="location_on" color="purple-7" />
              <span>{{ form.direccion || 'Sin dirección registrada' }}</span>
            </div>

            <div class="info-row">
              <q-icon name="payments" color="teal-7" />
              <span>Moneda: {{ form.moneda || 'Bs' }}</span>
            </div>

            <div class="info-row">
              <q-icon
                :name="form.activo ? 'check_circle' : 'cancel'"
                :color="form.activo ? 'positive' : 'negative'"
              />
              <span>{{ form.activo ? 'Negocio activo' : 'Negocio inactivo' }}</span>
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="message-preview">
              <div class="message-title">
                Mensaje WhatsApp
              </div>

              <div class="message-body">
                {{ form.mensaje_whatsapp || 'Hola, quiero información sobre los servicios de AUREA Beauty Salon.' }}
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '@/boot/axios'
import { getErrorMessage } from 'src/utils/glamurUtils'

defineOptions({
  name: 'ConfiguracionPage'
})

const $q = useQuasar()
const loading = ref(false)
const saving = ref(false)
const logoError = ref(false)

const estadoOptions = [
  { label: 'Activo', value: true },
  { label: 'Inactivo', value: false }
]

const valoresBase = {
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

const form = reactive({ ...valoresBase })

function required(value) {
  return !!String(value || '').trim() || 'Este campo es obligatorio'
}

function normalizarConfiguracion(configuracion = {}) {
  return {
    ...valoresBase,
    ...configuracion,
    activo: configuracion?.activo === undefined ? true : Boolean(configuracion.activo)
  }
}

function aplicarConfiguracion(configuracion = {}) {
  Object.assign(form, normalizarConfiguracion(configuracion))
  logoError.value = false
}

function guardarLocal(configuracion) {
  const normalizada = normalizarConfiguracion(configuracion)
  localStorage.setItem('aurea_configuracion', JSON.stringify(normalizada))

  window.dispatchEvent(
    new CustomEvent('aurea-configuracion-actualizada', {
      detail: normalizada
    })
  )
}

function cargarLocal() {
  try {
    const guardado = localStorage.getItem('aurea_configuracion')
    return guardado ? JSON.parse(guardado) : null
  } catch {
    return null
  }
}

async function cargarConfiguracion() {
  loading.value = true

  try {
    const { data } = await api.get('/configuracion')
    const configuracion = data?.configuracion || data || valoresBase

    aplicarConfiguracion(configuracion)
    guardarLocal(configuracion)
  } catch (error) {
    const local = cargarLocal()

    if (local) {
      aplicarConfiguracion(local)

      $q.notify({
        type: 'warning',
        message: 'Se cargó la configuración guardada en este dispositivo.'
      })
    } else {
      aplicarConfiguracion(valoresBase)

      $q.notify({
        type: 'warning',
        message: getErrorMessage(error, 'No se pudo cargar la configuración del servidor.')
      })
    }
  } finally {
    loading.value = false
  }
}

async function guardarConfiguracion() {
  if (!String(form.nombre_negocio || '').trim() || !String(form.nombre_corto || '').trim()) {
    $q.notify({
      type: 'warning',
      message: 'Completa el nombre del negocio y el nombre corto.'
    })

    return
  }

  saving.value = true

  try {
    const payload = normalizarConfiguracion({ ...form })
    const { data } = await api.put('/configuracion', payload)
    const configuracion = data?.configuracion || payload

    aplicarConfiguracion(configuracion)
    guardarLocal(configuracion)

    $q.notify({
      type: 'positive',
      icon: 'check_circle',
      message: 'Configuración guardada correctamente.'
    })
  } catch (error) {
    guardarLocal({ ...form })

    $q.notify({
      type: 'warning',
      icon: 'cloud_off',
      message: getErrorMessage(error, 'No se pudo guardar en el servidor, pero quedó guardado localmente.')
    })
  } finally {
    saving.value = false
  }
}

function restaurarValoresBase() {
  $q.dialog({
    title: 'Restaurar valores base',
    message: '¿Deseas volver a los datos base de AUREA Beauty Salon?',
    ok: {
      label: 'Sí, restaurar',
      color: 'pink-7',
      unelevated: true
    },
    cancel: {
      label: 'Cancelar',
      flat: true,
      color: 'grey-7'
    }
  }).onOk(() => {
    aplicarConfiguracion(valoresBase)
    guardarLocal(valoresBase)

    $q.notify({
      type: 'positive',
      message: 'Valores base restaurados. Presiona guardar para enviarlos al servidor.'
    })
  })
}

onMounted(cargarConfiguracion)
</script>

<style scoped>
.configuracion-page {
  padding-bottom: 36px;
}

.hero-actions {
  min-width: 170px;
}

.form-card,
.preview-card {
  height: 100%;
}

.aurea-input :deep(.q-field__control) {
  border-radius: 16px;
}

.actions-bar {
  gap: 10px;
}

.preview-header {
  text-align: center;
  color: white;
  background: linear-gradient(135deg, #15111f, #e91e63);
  padding: 28px 22px;
}

.preview-logo {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  box-shadow: 0 16px 34px rgba(233, 30, 99, 0.35);
}

.preview-logo img {
  object-fit: cover;
}

.preview-name {
  margin-top: 14px;
  font-size: 24px;
  font-weight: 950;
}

.preview-slogan {
  margin-top: 5px;
  color: rgba(255, 255, 255, 0.82);
  font-size: 13px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 0;
  color: #241329;
  font-weight: 800;
  border-bottom: 1px solid rgba(233, 30, 99, 0.10);
}

.info-row:last-child {
  border-bottom: 0;
}

.message-preview {
  padding: 14px;
  border-radius: 18px;
  background: #fff7fb;
  border: 1px solid rgba(233, 30, 99, 0.10);
}

.message-title {
  color: #c2185b;
  font-weight: 950;
  margin-bottom: 6px;
}

.message-body {
  color: #4a3a50;
  font-size: 13px;
  line-height: 1.45;
  white-space: pre-line;
}

@media (max-width: 700px) {
  .hero-actions {
    min-width: 100%;
  }

  .actions-bar {
    justify-content: stretch;
  }

  .actions-bar .q-btn {
    width: 100%;
  }
}
</style>