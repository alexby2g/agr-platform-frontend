<template>
  <div class="usuarios-panel">
    <div class="panel-header">
      <div>
        <h2>Usuarios</h2>
        <p>Administra los usuarios del sistema con roles claros: super admin, administrador y empleado.</p>
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
        <template #body-cell-rol="props">
          <q-td :props="props">
            <q-chip
              :color="rolColor(props.row.rol)"
              text-color="white"
              dense
            >
              {{ rolLabel(props.row.rol) }}
            </q-chip>
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
              :disable="props.row.rol === 'super_admin'"
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
            {{ editando ? 'Editar usuario' : 'Nuevo usuario' }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model.trim="form.nombre"
            label="Nombre"
            outlined
            dark
            class="q-mb-md"
          />

          <q-input
            v-model.trim="form.usuario"
            label="Usuario"
            outlined
            dark
            class="q-mb-md"
          />

          <q-input
            v-model.trim="form.email"
            label="Email"
            type="email"
            outlined
            dark
            class="q-mb-md"
          />

          <q-input
            v-model="form.password"
            :label="editando ? 'Nueva contraseña (opcional)' : 'Contraseña'"
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
            emit-value
            map-options
            class="q-mb-md"
          />

          <q-input
            v-model.number="form.empresa_id"
            label="Empresa ID"
            type="number"
            outlined
            dark
            class="q-mb-md"
            hint="Déjalo vacío para super_admin. Para administrador/empleado coloca la empresa correspondiente."
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
            :loading="guardando"
            @click="guardarUsuario"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar, Dialog } from 'quasar'

const $q = useQuasar()

const API_URL = import.meta.env.VITE_API_URL || 'https://agr-platform-backend-2.onrender.com/api'

const usuarios = ref([])
const loading = ref(false)
const guardando = ref(false)

const dialogo = ref(false)
const editando = ref(false)
const usuarioId = ref(null)

const roles = [
  {
    label: 'Super administrador',
    value: 'super_admin'
  },
  {
    label: 'Administrador',
    value: 'administrador'
  },
  {
    label: 'Empleado',
    value: 'empleado'
  }
]

const form = ref(formVacio())

const columns = [
  {
    name: 'id',
    label: 'ID',
    field: 'id',
    align: 'left',
    sortable: true
  },
  {
    name: 'nombre',
    label: 'Nombre',
    field: 'nombre',
    align: 'left',
    sortable: true
  },
  {
    name: 'usuario',
    label: 'Usuario',
    field: 'usuario',
    align: 'left',
    sortable: true
  },
  {
    name: 'email',
    label: 'Email',
    field: 'email',
    align: 'left',
    sortable: true
  },
  {
    name: 'rol',
    label: 'Rol',
    field: 'rol',
    align: 'center',
    sortable: true
  },
  {
    name: 'activo',
    label: 'Estado',
    field: 'activo',
    align: 'center',
    sortable: true
  },
  {
    name: 'acciones',
    label: 'Acciones',
    field: 'acciones',
    align: 'center'
  }
]

function formVacio() {
  return {
    nombre: '',
    usuario: '',
    email: '',
    password: '',
    rol: 'empleado',
    empresa_id: null,
    activo: true
  }
}

function normalizarRol(rol) {
  if (rol === 'admin_empresa') return 'administrador'
  if (rol === 'usuario') return 'empleado'

  return rol || 'empleado'
}

function rolLabel(rol) {
  const value = normalizarRol(rol)
  const found = roles.find((item) => item.value === value)

  return found?.label || 'Empleado'
}

function rolColor(rol) {
  const value = normalizarRol(rol)

  if (value === 'super_admin') return 'deep-purple'
  if (value === 'administrador') return 'primary'

  return 'teal'
}

function getToken() {
  return localStorage.getItem('agr_token')
}

function getErrorMessage(data, fallback = 'Ocurrió un error') {
  if (data?.errors) {
    return Object.values(data.errors).flat().join(' ')
  }

  return data?.message || fallback
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

    const data = await response.json()

    if (!response.ok) {
      throw new Error(getErrorMessage(data, 'No se pudieron cargar los usuarios'))
    }

    usuarios.value = Array.isArray(data)
      ? data.map((usuario) => ({
        ...usuario,
        rol: normalizarRol(usuario.rol)
      }))
      : []
  } catch (error) {
    console.error(error)

    $q.notify({
      type: 'negative',
      message: error.message
    })
  } finally {
    loading.value = false
  }
}

function abrirDialogo(usuario = null) {
  if (usuario) {
    editando.value = true
    usuarioId.value = usuario.id

    form.value = {
      nombre: usuario.nombre || '',
      usuario: usuario.usuario || '',
      email: usuario.email || '',
      password: '',
      rol: normalizarRol(usuario.rol),
      empresa_id: usuario.empresa_id || null,
      activo: Boolean(usuario.activo)
    }
  } else {
    editando.value = false
    usuarioId.value = null
    form.value = formVacio()
  }

  dialogo.value = true
}

async function guardarUsuario() {
  guardando.value = true

  try {
    const payload = {
      ...form.value,
      rol: normalizarRol(form.value.rol),
      empresa_id: form.value.empresa_id || null
    }

    if (editando.value && !payload.password) {
      delete payload.password
    }

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
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(getErrorMessage(data, 'No se pudo guardar el usuario'))
    }

    $q.notify({
      type: 'positive',
      message: 'Usuario guardado correctamente'
    })

    dialogo.value = false
    await cargarUsuarios()
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
  if (usuario.rol === 'super_admin') {
    $q.notify({
      type: 'warning',
      message: 'No puedes eliminar un super administrador'
    })
    return
  }

  Dialog.create({
    title: 'Confirmar eliminación',
    message: `¿Eliminar a ${usuario.nombre}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const response = await fetch(`${API_URL}/usuarios-sistema/${usuario.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          Accept: 'application/json'
        }
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(getErrorMessage(data, 'No se pudo eliminar el usuario'))
      }

      $q.notify({
        type: 'positive',
        message: 'Usuario eliminado correctamente'
      })

      await cargarUsuarios()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.message
      })
    }
  })
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
