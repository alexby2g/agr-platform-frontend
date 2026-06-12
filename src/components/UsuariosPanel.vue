<template>
  <div class="usuarios-panel">
    <div class="panel-header">
      <div>
        <h2>Usuarios</h2>
        <p>Administra los usuarios del sistema</p>
      </div>

      <q-btn
        label="Nuevo usuario"
        icon="person_add"
        class="btn-primary"
        @click="abrirDialogo()"
      />
    </div>

    <q-card class="panel-card">
      <q-table
        :rows="usuarios"
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

        <template #body-cell-acciones="props">
          <q-td :props="props">
            <q-btn
              flat
              dense
              icon="edit"
              color="warning"
              @click="abrirDialogo(props.row)"
            />

            <q-btn
              flat
              dense
              icon="delete"
              color="negative"
              @click="eliminarUsuario(props.row)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="dialogo">
      <q-card class="dialog-card">

        <q-card-section>
          <div class="text-h6">
            {{ editando ? 'Editar Usuario' : 'Nuevo Usuario' }}
          </div>
        </q-card-section>

        <q-card-section>

          <q-input
            v-model="form.nombre"
            label="Nombre"
            outlined
            dark
            class="q-mb-md"
          />

          <q-input
            v-model="form.usuario"
            label="Usuario"
            outlined
            dark
            class="q-mb-md"
          />

          <q-input
            v-model="form.email"
            label="Email"
            outlined
            dark
            class="q-mb-md"
          />

          <q-input
            v-model="form.password"
            label="Contraseña"
            type="password"
            outlined
            dark
            class="q-mb-md"
          />

          <q-select
            v-model="form.rol"
            :options="roles"
            label="Rol"
            outlined
            dark
            class="q-mb-md"
          />

          <q-input
            v-model="form.empresa_id"
            label="Empresa ID"
            outlined
            dark
            class="q-mb-md"
          />

          <q-toggle
            v-model="form.activo"
            label="Usuario activo"
            color="positive"
          />

        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            label="Guardar"
            icon="save"
            class="btn-primary"
            @click="guardarUsuario"
            :loading="guardando"
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

const usuarios = ref([])
const loading = ref(false)
const guardando = ref(false)

const dialogo = ref(false)
const editando = ref(false)
const usuarioId = ref(null)

const roles = [
  'super_admin',
  'admin_empresa',
  'usuario'
]

const form = ref({
  nombre: '',
  usuario: '',
  email: '',
  password: '',
  rol: 'usuario',
  empresa_id: null,
  activo: true
})

const columns = [
  {
    name: 'id',
    label: 'ID',
    field: 'id'
  },
  {
    name: 'nombre',
    label: 'Nombre',
    field: 'nombre'
  },
  {
    name: 'usuario',
    label: 'Usuario',
    field: 'usuario'
  },
  {
    name: 'email',
    label: 'Email',
    field: 'email'
  },
  {
    name: 'rol',
    label: 'Rol',
    field: 'rol'
  },
  {
    name: 'activo',
    label: 'Estado',
    field: 'activo'
  },
  {
    name: 'acciones',
    label: 'Acciones',
    field: 'acciones'
  }
]

function getToken() {
  return localStorage.getItem('agr_token')
}

async function cargarUsuarios() {
  loading.value = true

  try {
    const response = await fetch(`${API_URL}/usuarios-sistema`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        Accept: 'application/json'
      }
    })

    usuarios.value = await response.json()
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

function abrirDialogo(usuario = null) {
  if (usuario) {

    editando.value = true
    usuarioId.value = usuario.id

    form.value = {
      nombre: usuario.nombre,
      usuario: usuario.usuario,
      email: usuario.email,
      password: '',
      rol: usuario.rol,
      empresa_id: usuario.empresa_id,
      activo: usuario.activo
    }

  } else {

    editando.value = false
    usuarioId.value = null

    form.value = {
      nombre: '',
      usuario: '',
      email: '',
      password: '',
      rol: 'usuario',
      empresa_id: null,
      activo: true
    }
  }

  dialogo.value = true
}

async function guardarUsuario() {

  guardando.value = true

  try {

    const url = editando.value
      ? `${API_URL}/usuarios-sistema/${usuarioId.value}`
      : `${API_URL}/usuarios-sistema`

    const method = editando.value
      ? 'PUT'
      : 'POST'

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${getToken()}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form.value)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Error')
    }

    $q.notify({
      type: 'positive',
      message: 'Usuario guardado correctamente'
    })

    dialogo.value = false

    cargarUsuarios()

  } catch (error) {

    $q.notify({
      type: 'negative',
      message: error.message
    })

  } finally {
    guardando.value = false
  }
}

async function eliminarUsuario(usuario) {

  if (!confirm(`Eliminar ${usuario.nombre}?`)) {
    return
  }

  try {

    await fetch(
      `${API_URL}/usuarios-sistema/${usuario.id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      }
    )

    cargarUsuarios()

  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  cargarUsuarios()
})
</script>

<style scoped>
.usuarios-panel {
  margin-top: 40px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.panel-header h2 {
  margin: 0;
  font-size: 32px;
  font-weight: 900;
}

.panel-header p {
  opacity: .7;
}

.panel-card,
.dialog-card {
  background: rgba(15,23,42,.92);
  color: white;
  border-radius: 20px;
}

.dialog-card {
  width: 600px;
  max-width: 95vw;
}

.btn-primary {
  background: linear-gradient(
    135deg,
    #7c3aed,
    #2563eb
  );
  color: white;
}
</style>