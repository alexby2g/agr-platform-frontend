<template>
  <q-page class="agr-page">
    <div class="login-card" v-if="!token">
      <div class="brand">
        <div class="logo">AGR</div>
        <h1>AGR Studio Platform</h1>
        <p>Acceso centralizado a tus aplicaciones empresariales</p>
      </div>

      <q-input
        v-model="form.usuario"
        label="Usuario"
        dark
        outlined
        color="purple-4"
        class="q-mb-md"
      />

      <q-input
        v-model="form.password"
        label="Contraseña"
        type="password"
        dark
        outlined
        color="purple-4"
        class="q-mb-lg"
        @keyup.enter="login"
      />

      <q-btn
        label="Ingresar"
        icon="login"
        class="full-width btn-login"
        :loading="loading"
        @click="login"
      />

      <div class="demo">
        Usuario: <b>alex</b> | Contraseña: <b>123456</b>
      </div>
    </div>

    <div class="launcher" v-else>
      <div class="topbar">
        <div>
          <h1>AGR Studio</h1>
          <p>Bienvenido, {{ usuario?.nombre }} · {{ usuario?.rol }}</p>
        </div>

        <q-btn
          flat
          color="white"
          icon="logout"
          label="Salir"
          @click="logout"
        />
      </div>

      <div class="apps-grid">
        <q-card
          v-for="modulo in modulos"
          :key="modulo.id"
          class="app-card"
          @click="abrirModulo(modulo)"
        >
          <q-icon :name="modulo.icono" size="52px" class="app-icon" />
          <div class="app-title">{{ modulo.nombre }}</div>
          <div class="app-subtitle">{{ modulo.ruta_frontend }}</div>

          <q-btn
            label="Abrir"
            icon="open_in_new"
            class="q-mt-md btn-open"
            no-caps
            @click.stop="abrirModulo(modulo)"
          />
        </q-card>
      </div>

      <EmpresasPanel v-if="usuario?.rol === 'super_admin'" />

      <UsuariosPanel v-if="usuario?.rol === 'super_admin'" />

      <ModulosPanel v-if="usuario?.rol === 'super_admin'" />

      <PermisosPanel v-if="usuario?.rol === 'super_admin'" />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Notify } from 'quasar'
import { useRouter } from 'vue-router'

import EmpresasPanel from '@/components/EmpresasPanel.vue'
import UsuariosPanel from '@/components/UsuariosPanel.vue'
import ModulosPanel from '@/components/ModulosPanel.vue'
import PermisosPanel from '@/components/PermisosPanel.vue'

const router = useRouter()

const API_URL = 'http://127.0.0.1:8000/api'

const form = ref({
  usuario: 'alex',
  password: '123456'
})

const loading = ref(false)
const token = ref(localStorage.getItem('agr_token'))
const usuario = ref(null)
const modulos = ref([])

async function login() {
  loading.value = true

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(form.value)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'No se pudo iniciar sesión')
    }

    localStorage.setItem('agr_token', data.token)
    token.value = data.token

    Notify.create({
      type: 'positive',
      message: 'Bienvenido a AGR Studio'
    })

    await cargarLauncher()
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error.message
    })
  } finally {
    loading.value = false
  }
}

async function cargarLauncher() {
  try {
    const response = await fetch(`${API_URL}/launcher`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token.value}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error('Sesión expirada')
    }

    usuario.value = data.usuario
    modulos.value = data.modulos
  } catch (error) {
    localStorage.removeItem('agr_token')
    token.value = null

    Notify.create({
      type: 'warning',
      message: error.message
    })
  }
}

function abrirModulo(modulo) {
  if (!modulo.ruta_frontend) {
    Notify.create({
      type: 'warning',
      message: 'Este módulo no tiene una ruta asignada'
    })
    return
  }

  router.push(modulo.ruta_frontend)
}

async function logout() {
  try {
    await fetch(`${API_URL}/logout`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token.value}`
      }
    })
  } catch (error) {
    console.log(error)
  }

  localStorage.removeItem('agr_token')
  token.value = null
  usuario.value = null
  modulos.value = []

  router.push('/')
}

onMounted(() => {
  if (token.value) {
    cargarLauncher()
  }
})
</script>

<style scoped>
.agr-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(124, 58, 237, 0.35), transparent 35%),
    radial-gradient(circle at bottom right, rgba(14, 165, 233, 0.25), transparent 35%),
    #070b18;
  color: white;
  padding: 28px;
}

.login-card {
  width: 100%;
  max-width: 430px;
  margin: 6vh auto;
  padding: 34px;
  border-radius: 28px;
  background: rgba(15, 23, 42, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.45);
}

.brand {
  text-align: center;
  margin-bottom: 28px;
}

.logo {
  width: 82px;
  height: 82px;
  margin: 0 auto 18px;
  display: grid;
  place-items: center;
  border-radius: 24px;
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  font-size: 28px;
  font-weight: 900;
  letter-spacing: 2px;
}

.brand h1,
.launcher h1 {
  margin: 0;
  font-weight: 900;
}

.brand p,
.launcher p {
  opacity: 0.75;
}

.btn-login,
.btn-open {
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  color: white;
  border-radius: 14px;
  height: 48px;
  font-weight: 700;
}

.demo {
  text-align: center;
  margin-top: 18px;
  opacity: 0.7;
  font-size: 13px;
}

.launcher {
  max-width: 1180px;
  margin: 0 auto;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.apps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 22px;
}

.app-card {
  cursor: pointer;
  padding: 28px;
  min-height: 230px;
  border-radius: 26px;
  color: white;
  background: rgba(15, 23, 42, 0.86);
  border: 1px solid rgba(255, 255, 255, 0.12);
  transition: 0.25s ease;
}

.app-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 26px 70px rgba(0, 0, 0, 0.35);
}

.app-icon {
  color: #a78bfa;
  margin-bottom: 22px;
}

.app-title {
  font-size: 22px;
  font-weight: 900;
}

.app-subtitle {
  margin-top: 6px;
  opacity: 0.6;
}
</style>