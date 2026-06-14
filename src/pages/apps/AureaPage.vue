<template>
  <q-page class="aurea-loading-page">
    <q-card class="aurea-loading-card">
      <div class="aurea-logo">A</div>

      <h1>Abriendo AUREA Beauty</h1>

      <p>
        Estamos cargando el panel principal del salón desde AGR Platform.
      </p>

      <q-spinner-dots color="pink" size="46px" class="q-my-md" />

      <q-btn
        label="Ir al dashboard ahora"
        icon="dashboard"
        class="aurea-btn"
        no-caps
        @click="irDashboard"
      />
    </q-card>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function irDashboard() {
  router.replace('/apps/aurea/dashboard')
}

onMounted(() => {
  window.setTimeout(() => {
    irDashboard()
  }, 450)
})
</script>

<style scoped>
.aurea-loading-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 28px;
  color: white;
  background:
    radial-gradient(circle at top left, rgba(236, 72, 153, 0.35), transparent 35%),
    radial-gradient(circle at bottom right, rgba(124, 58, 237, 0.28), transparent 35%),
    #160818;
}

.aurea-loading-card {
  width: 100%;
  max-width: 520px;
  padding: 42px 34px;
  text-align: center;
  border-radius: 30px;
  color: white;
  background: rgba(24, 12, 32, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.42);
}

.aurea-logo {
  width: 92px;
  height: 92px;
  margin: 0 auto 20px;
  display: grid;
  place-items: center;
  border-radius: 28px;
  background: linear-gradient(135deg, #ec4899, #7c3aed);
  font-size: 42px;
  font-weight: 950;
}

.aurea-loading-card h1 {
  margin: 0;
  font-size: 34px;
  font-weight: 950;
}

.aurea-loading-card p {
  max-width: 390px;
  margin: 12px auto 10px;
  opacity: 0.78;
  line-height: 1.6;
}

.aurea-btn {
  min-width: 220px;
  height: 48px;
  color: white;
  border-radius: 14px;
  font-weight: 900;
  background: linear-gradient(135deg, #ec4899, #7c3aed);
}
</style>
