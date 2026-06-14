<template>
  <q-page class="denied-page">
    <q-card class="denied-card">
      <div class="icon-wrap">
        <q-icon name="lock" size="74px" />
      </div>

      <h1>Acceso denegado</h1>

      <p>
        No tienes permisos para ingresar a este módulo.
        Contacta al administrador si necesitas acceso.
      </p>

      <div class="actions">
        <q-btn
          label="Volver al Dashboard"
          icon="dashboard"
          class="btn-primary"
          to="/"
          no-caps
        />
      </div>
    </q-card>
  </q-page>
</template>

<style scoped>
.denied-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 28px;
  color: white;
  background:
    radial-gradient(circle at top left, rgba(124, 58, 237, 0.35), transparent 34%),
    radial-gradient(circle at bottom right, rgba(239, 68, 68, 0.22), transparent 35%),
    #070b18;
}

.denied-card {
  width: 100%;
  max-width: 520px;
  padding: 46px 34px;
  text-align: center;
  border-radius: 30px;
  color: white;
  background: rgba(15, 23, 42, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.13);
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.45);
}

.icon-wrap {
  width: 118px;
  height: 118px;
  margin: 0 auto 22px;
  display: grid;
  place-items: center;
  border-radius: 34px;
  color: #fff;
  background: linear-gradient(135deg, #ef4444, #7c3aed);
  box-shadow: 0 20px 50px rgba(239, 68, 68, 0.25);
}

.denied-card h1 {
  margin: 0;
  font-size: 40px;
  font-weight: 900;
}

.denied-card p {
  max-width: 390px;
  margin: 14px auto 28px;
  opacity: 0.76;
  line-height: 1.6;
}

.actions {
  display: flex;
  justify-content: center;
}

.btn-primary {
  min-width: 220px;
  height: 48px;
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  color: white;
  border-radius: 14px;
  font-weight: 800;
}
</style>