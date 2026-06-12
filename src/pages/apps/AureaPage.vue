<template>
  <q-page class="aurea-page">
    <div class="aurea-main-header">
      <div>
        <h1>💄 AUREA Beauty</h1>
        <p>Panel principal del salón de belleza</p>
      </div>

      <q-btn label="Volver a AGR" icon="arrow_back" class="btn-back" to="/" />
    </div>

    <div class="cards-grid">
      <q-card v-for="card in cards" :key="card.title" class="stat-card" @click="ir(card.to)">
        <q-icon :name="card.icon" size="42px" />
        <div>
          <h3>{{ card.title }}</h3>
          <p>{{ card.text }}</p>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const cards = [
  { title: 'Dashboard', text: 'Resumen general del salón', icon: 'dashboard', to: '/apps/aurea/dashboard' },
  { title: 'Clientes', text: 'Gestión de clientes', icon: 'groups', to: '/apps/aurea/clientes' },
  { title: 'Citas', text: 'Agenda del salón', icon: 'event', to: '/apps/aurea/citas' },
  { title: 'Pagos', text: 'Ingresos y facturación', icon: 'payments', to: '/apps/aurea/pagos' },
  { title: 'Servicios', text: 'Tratamientos disponibles', icon: 'spa', to: '/apps/aurea/servicios' },
  { title: 'Calendario', text: 'Vista mensual de reservas', icon: 'calendar_month', to: '/apps/aurea/calendario' }
]

function ir(ruta) {
  router.push(ruta)
}
</script>

<style scoped>
.aurea-page {
  min-height: 100vh;
  padding: 32px;
  background:
    radial-gradient(circle at top left, rgba(236, 72, 153, 0.30), transparent 35%),
    radial-gradient(circle at bottom right, rgba(168, 85, 247, 0.25), transparent 35%),
    #160818;
  color: white;
}

.aurea-main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.aurea-main-header h1 {
  margin: 0;
  font-size: 48px;
  font-weight: 900;
}

.aurea-main-header p {
  opacity: 0.75;
}

.btn-back {
  background: white;
  color: #be185d;
  border-radius: 14px;
  font-weight: 800;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 22px;
}

.stat-card {
  display: flex;
  gap: 18px;
  align-items: center;
  padding: 26px;
  border-radius: 24px;
  color: white;
  background: rgba(88, 28, 135, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.14);
  cursor: pointer;
  transition: 0.25s ease;
}

.stat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 22px 55px rgba(0, 0, 0, 0.35);
}

.stat-card h3 {
  margin: 0;
  font-size: 22px;
  font-weight: 900;
}

.stat-card p {
  margin: 4px 0 0;
  opacity: 0.7;
}
</style>
