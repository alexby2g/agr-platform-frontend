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
      :width="245"
      class="aurea-drawer"
    >
      <div class="drawer-content">
        <div class="drawer-brand">
          <div class="drawer-logo">A</div>
          <div>
            <div class="drawer-title">AUREA</div>
            <div class="drawer-subtitle">Beauty Salon</div>
          </div>
        </div>

        <q-list class="menu-list">
          <q-item-label header class="menu-title">
            MENÚ AUREA
          </q-item-label>

          <q-item
            v-for="item in menu"
            :key="item.to"
            clickable
            :to="item.to"
            exact
            class="menu-item"
            active-class="active-link"
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
.aurea-layout {
  background: #fff7fb;
}

.aurea-header {
  background: linear-gradient(135deg, #db2777 0%, #9c27b0 100%);
  color: white;
  box-shadow: 0 8px 26px rgba(157, 23, 77, 0.24);
}

.aurea-toolbar {
  min-height: 58px;
  padding: 0 18px;
}

.menu-btn {
  margin-right: 10px;
}

.brand-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 950;
  letter-spacing: -0.3px;
}

.brand-icon {
  font-size: 24px;
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
  padding: 12px 12px 18px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  margin-bottom: 8px;
}

.drawer-logo {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  color: white;
  font-size: 24px;
  font-weight: 950;
  background: linear-gradient(135deg, #ec4899, #9333ea);
  box-shadow: 0 12px 24px rgba(236, 72, 153, 0.25);
}

.drawer-title {
  font-weight: 950;
  color: #111827;
  line-height: 1;
}

.drawer-subtitle {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  margin-top: 3px;
}

.menu-list {
  flex: 1;
}

.menu-title {
  color: #ec4899;
  font-weight: 950;
  font-size: 12px;
  letter-spacing: 0.7px;
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
  .brand-title {
    font-size: 17px;
  }

  .agr-btn :deep(.q-btn__content span) {
    display: none;
  }
}
</style>