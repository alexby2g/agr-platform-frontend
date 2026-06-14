<template>
  <q-page class="denied-page">
    <q-card class="denied-card">
      <q-icon name="lock" size="72px" color="negative" />

      <h1>Acceso denegado</h1>

      <p>
        No tienes permiso para acceder a este módulo.
      </p>

      <q-btn
        label="Volver al inicio"
        icon="home"
        class="btn-primary"
        to="/"
      />
    </q-card>
  </q-page>
</template>

<style scoped>
.denied-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at top left, rgba(124, 58, 237, 0.35), transparent 35%),
    radial-gradient(circle at bottom right, rgba(239, 68, 68, 0.25), transparent 35%),
    #070b18;
  color: white;
  padding: 24px;
}

.denied-card {
  width: 100%;
  max-width: 460px;
  padding: 42px;
  text-align: center;
  border-radius: 28px;
  color: white;
  background: rgba(15, 23, 42, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.denied-card h1 {
  font-size: 36px;
  font-weight: 900;
}

.denied-card p {
  opacity: 0.75;
  margin-bottom: 24px;
}

.btn-primary {
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  color: white;
  border-radius: 14px;
  font-weight: 800;
}
</style>