<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="aurea-header">
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="drawer = !drawer" />

        <q-toolbar-title class="text-weight-bold">
          💄 AUREA Beauty
        </q-toolbar-title>

        <q-btn flat icon="apps" label="AGR Studio" to="/" />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawer"
      show-if-above
      bordered
      :width="260"
      class="aurea-drawer"
    >
      <q-list>
        <q-item-label header class="menu-title">
          MENÚ AUREA
        </q-item-label>

        <q-item v-for="item in menu" :key="item.to" clickable :to="item.to" active-class="active-link">
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>{{ item.label }}</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'

const drawer = ref(true)

const menu = [
  { label: 'Inicio', icon: 'home', to: '/apps/aurea' },
  { label: 'Dashboard', icon: 'dashboard', to: '/apps/aurea/dashboard' },
  { label: 'Clientes', icon: 'groups', to: '/apps/aurea/clientes' },
  { label: 'Citas', icon: 'event', to: '/apps/aurea/citas' },
  { label: 'Pagos', icon: 'payments', to: '/apps/aurea/pagos' },
  { label: 'Servicios', icon: 'spa', to: '/apps/aurea/servicios' },
  { label: 'Calendario', icon: 'calendar_month', to: '/apps/aurea/calendario' },
  { label: 'Empleados', icon: 'badge', to: '/apps/aurea/empleados' },
  { label: 'Caja diaria', icon: 'point_of_sale', to: '/apps/aurea/caja-diaria' },
  { label: 'Historial', icon: 'history', to: '/apps/aurea/historial' },
  { label: 'Configuración', icon: 'settings', to: '/apps/aurea/configuracion' }
]
</script>

<style scoped>
.aurea-header {
  background: linear-gradient(135deg, #be185d, #9c27b0);
  color: white;
}

.aurea-drawer {
  background: #1f1f1f;
  color: white;
}

.menu-title {
  color: #f472b6;
  font-weight: 900;
}

.active-link {
  color: #f472b6;
  background: rgba(244, 114, 182, 0.12);
}
</style>
