<template>
  <q-layout view="lHh Lpr lFf" class="aurea-layout">
    <q-header elevated class="aurea-header">
      <q-toolbar class="aurea-toolbar">
        <q-btn
          flat
          dense
          round
          icon="menu"
          class="menu-btn"
          @click="drawer = !drawer"
        />

        <q-toolbar-title class="brand-title">
          <span class="brand-icon">💄</span>
          <span>AUREA Beauty</span>
        </q-toolbar-title>

        <div class="header-user gt-xs">
          <q-chip dense class="user-chip">
            {{ usuario?.rol_nombre || usuario?.rol || 'Usuario' }}
          </q-chip>
        </div>

        <q-btn
          flat
          icon="apps"
          label="AGR Studio"
          class="agr-btn"
          to="/"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawer"
      show-if-above
      bordered
      :width="$q.screen.lt.md ? 286 : 260"
      class="aurea-drawer"
      @hide="onDrawerHide"
    >
      <div class="drawer-content">
        <div class="drawer-brand">
          <div class="drawer-logo">A</div>
          <div class="drawer-brand-text">
            <div class="drawer-title">AUREA</div>
            <div class="drawer-subtitle">Beauty Boutique</div>
          </div>
        </div>

        <q-card class="user-card" flat>
          <div class="user-name">{{ usuario?.nombre || 'Usuario AGR' }}</div>
          <div class="user-meta">
            {{ usuario?.empresa?.nombre || 'AGR Studio' }} · {{ usuario?.rol_nombre || usuario?.rol || 'Rol' }}
          </div>
        </q-card>

        <q-list class="menu-list">
          <q-item-label header class="menu-title">
            MENÚ AUREA
          </q-item-label>

          <q-item
            v-for="item in menuFiltrado"
            :key="item.to"
            clickable
            :to="item.to"
            exact
            class="menu-item"
            active-class="active-link"
            @click="cerrarDrawerMobile"
          >
            <q-item-section avatar class="menu-avatar">
              <q-icon :name="item.icon" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="menu-label">
                {{ item.label }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <div class="drawer-footer">
          <q-icon name="verified" color="pink-6" />
          <span>Sistema activo</span>
        </div>
      </div>
    </q-drawer>

    <q-page-container class="aurea-container">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'
import { getAgrUsuario, puedeAurea } from '@/utils/auth.js'

const $q = useQuasar()
const drawer = ref(!$q.screen.lt.md)
const usuario = computed(() => getAgrUsuario())

const menu = [
  { label: 'Dashboard', icon: 'dashboard', to: '/apps/aurea/dashboard', permiso: 'aurea.dashboard.ver' },
  { label: 'Clientes', icon: 'groups', to: '/apps/aurea/clientes', permiso: 'aurea.clientes.ver' },
  { label: 'Citas', icon: 'event', to: '/apps/aurea/citas', permiso: 'aurea.citas.ver' },
  { label: 'Pagos', icon: 'payments', to: '/apps/aurea/pagos', permiso: 'aurea.pagos.ver' },
  { label: 'Servicios', icon: 'spa', to: '/apps/aurea/servicios', permiso: 'aurea.servicios.ver' },
  { label: 'Calendario', icon: 'calendar_month', to: '/apps/aurea/calendario', permiso: 'aurea.citas.ver' },
  { label: 'Mis citas', icon: 'today', to: '/apps/aurea/mis-citas', permiso: 'aurea.citas.ver' },
  { label: 'Empleados', icon: 'badge', to: '/apps/aurea/empleados', permiso: 'aurea.empleados.ver' },
  { label: 'Caja diaria', icon: 'point_of_sale', to: '/apps/aurea/caja-diaria', permiso: 'aurea.caja.ver' },
  { label: 'Historial', icon: 'history', to: '/apps/aurea/historial', permiso: 'aurea.historial.ver' },
  { label: 'Reporte empleados', icon: 'bar_chart', to: '/apps/aurea/reporte-empleados', permiso: 'aurea.reportes.ver' },
  { label: 'Configuración', icon: 'settings', to: '/apps/aurea/configuracion', permiso: 'aurea.configuracion.ver' }
]

const menuFiltrado = computed(() => {
  return menu.filter((item) => puedeAurea(item.permiso))
})

function cerrarDrawerMobile() {
  if ($q.screen.lt.md) {
    drawer.value = false
  }
}

function onDrawerHide() {
  // Mantiene comportamiento limpio en mobile sin afectar escritorio.
}
</script>

<style scoped>
.aurea-layout {
  background: #fff7fb;
}

.aurea-header {
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.22), transparent 34%),
    linear-gradient(135deg, #db2777 0%, #9333ea 100%);
  color: white;
  box-shadow: 0 12px 32px rgba(157, 23, 77, 0.26);
}

.aurea-toolbar {
  min-height: 64px;
  padding: 0 18px;
}

.menu-btn {
  margin-right: 10px;
}

.brand-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 21px;
  font-weight: 950;
  letter-spacing: -0.3px;
}

.brand-icon {
  font-size: 25px;
}

.header-user {
  margin-right: 10px;
}

.user-chip {
  color: white;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.22);
  font-weight: 850;
}

.agr-btn {
  border-radius: 14px;
  font-weight: 900;
  padding: 8px 12px;
}

.aurea-drawer {
  background: #ffffff;
  color: #111827;
  border-right: 1px solid rgba(15, 23, 42, 0.08);
}

.drawer-content {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  padding: 14px 10px;
}

.drawer-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 12px 14px;
}

.drawer-logo {
  width: 48px;
  height: 48px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  color: white;
  font-size: 26px;
  font-weight: 950;
  background: linear-gradient(135deg, #ec4899, #9333ea);
  box-shadow: 0 14px 28px rgba(236, 72, 153, 0.25);
}

.drawer-brand-text {
  min-width: 0;
}

.drawer-title {
  font-weight: 950;
  color: #111827;
  line-height: 1;
}

.drawer-subtitle {
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
  margin-top: 4px;
}

.user-card {
  margin: 0 8px 10px;
  padding: 12px;
  border-radius: 18px;
  background: linear-gradient(135deg, #fff0f7, #f8efff);
  border: 1px solid rgba(219, 39, 119, 0.1);
}

.user-name {
  color: #111827;
  font-weight: 950;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-meta {
  color: #64748b;
  font-size: 12px;
  font-weight: 750;
  margin-top: 4px;
  line-height: 1.35;
}

.menu-list {
  flex: 1;
}

.menu-title {
  color: #ec4899;
  font-weight: 950;
  font-size: 12px;
  letter-spacing: 0.8px;
  padding: 12px 12px 8px;
}

.menu-item {
  margin: 5px 0;
  border-radius: 16px;
  min-height: 48px;
  color: #111827;
  font-weight: 800;
  transition: 0.18s ease;
}

.menu-item:hover {
  background: #fff0f6;
  color: #be185d;
}

.menu-avatar {
  min-width: 42px;
}

.menu-avatar .q-icon {
  font-size: 22px;
}

.menu-label {
  font-size: 14px;
  font-weight: 850;
}

.active-link {
  color: #db2777;
  background: linear-gradient(135deg, #ffe4ef, #fff1f8);
  box-shadow: inset 4px 0 0 #ec4899;
}

.drawer-footer {
  margin-top: 14px;
  padding: 12px;
  border-radius: 16px;
  background: #fff7fb;
  color: #be185d;
  font-size: 12px;
  font-weight: 900;
  display: flex;
  align-items: center;
  gap: 8px;
}

.aurea-container {
  background: linear-gradient(180deg, #fff7fb 0%, #ffffff 100%);
}

@media (max-width: 700px) {
  .aurea-toolbar {
    min-height: 58px;
    padding: 0 10px;
  }

  .brand-title {
    font-size: 17px;
  }

  .agr-btn :deep(.q-btn__content span) {
    display: none;
  }
}
</style>
