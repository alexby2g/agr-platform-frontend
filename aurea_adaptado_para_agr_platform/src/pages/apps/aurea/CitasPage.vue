<template>
  <q-page class="q-pa-md citas-page">

    <!-- HERO -->
    <div class="page-hero q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold text-white">
          📅 Citas
        </div>

        <div class="text-subtitle2 text-white">
          Gestión de reservas, servicios, empleados, pagos y estados
        </div>
      </div>

      <div class="hero-actions">
        <q-btn
          class="btn-glamur-white"
          label="Servicios"
          icon="spa"
          to="/apps/aurea/servicios"
        />

        <q-btn
          class="btn-glamur-white"
          label="Nueva Cita"
          icon="add"
          @click="openDialog()"
        />
      </div>
    </div>

    <!-- BUSCADOR -->
    <q-card class="buscador-card q-mb-md" flat bordered>
      <div class="buscador-row">
        <q-input
          v-model="busqueda"
          class="buscador-input"
          outlined
          rounded
          dense
          clearable
          bg-color="white"
          debounce="200"
          placeholder="Buscar por cliente, empleado, teléfono, servicio, fecha, estado o pago..."
        >
          <template #prepend>
            <q-icon name="search" color="pink" />
          </template>
        </q-input>

        <q-badge class="buscador-badge" rounded>
          {{ citasFiltradas.length }} de {{ citas.length }}
        </q-badge>
      </div>
    </q-card>

    <!-- FILTROS DE CITAS -->
    <q-card class="filtros-citas-card q-mb-md" flat bordered>
      <div class="filtros-citas-header">
        <div>
          <div class="filtros-citas-title">
            Ver citas
          </div>
          <div class="filtros-citas-subtitle">
            Organiza las reservas por hoy, próximas fechas o anteriores.
          </div>
        </div>

        <q-badge class="filtro-activo-badge" rounded>
          {{ nombreFiltroActivo }}
        </q-badge>
      </div>

      <div class="filtros-citas-grid">
        <button
          v-for="filtro in filtrosCitas"
          :key="filtro.value"
          type="button"
          class="filtro-cita-btn"
          :class="{ active: filtroCitasActivo === filtro.value }"
          @click="filtroCitasActivo = filtro.value"
        >
          <q-icon :name="filtro.icon" />
          <span>{{ filtro.label }}</span>
          <small>{{ contarCitasPorFiltro(filtro.value) }}</small>
        </button>
      </div>
    </q-card>

    <!-- LISTA MÓVIL PRIORIZADA: HOY / PRÓXIMAS / ANTERIORES -->
    <div class="citas-mobile-list">
      <template
        v-for="grupo in gruposCitasFiltradas"
        :key="grupo.key"
      >
        <div
          v-if="grupo.items.length > 0"
          class="cita-mobile-section"
          :class="`section-${grupo.key}`"
        >
          <div>
            <div class="cita-mobile-section-title">
              {{ grupo.titulo }}
            </div>
            <div class="cita-mobile-section-subtitle">
              {{ grupo.descripcion }}
            </div>
          </div>

          <q-badge rounded class="cita-mobile-section-badge">
            {{ grupo.items.length }}
          </q-badge>
        </div>

        <q-card
          v-for="cita in grupo.items"
          :key="`${grupo.key}-${cita.id}`"
          class="cita-mobile-card"
          :class="`cita-${grupo.key}`"
          flat
          bordered
        >
          <div class="cita-mobile-top">
            <div>
              <div class="cita-mobile-cliente">
                {{ cita.cliente?.nombre || 'Sin cliente' }}
              </div>
              <div class="cita-mobile-telefono">
                {{ cita.cliente?.telefono || 'Sin teléfono' }}
              </div>
            </div>

            <div class="cita-mobile-hora">
              {{ formatHora(cita.hora) }}
            </div>
          </div>

          <div class="cita-mobile-fecha">
            <q-icon name="event" />
            {{ etiquetaFechaCita(cita.fecha) }} · {{ formatDate(cita.fecha) }}
          </div>

          <div class="cita-mobile-servicio">
            {{ cita.servicio || 'Sin servicio' }}
          </div>

          <div class="cita-mobile-empleado">
            <q-icon name="person" />
            {{ empleadoNombre(cita) }}
          </div>

          <div class="cita-mobile-info-row">
            <div class="text-green-8 text-weight-bold">
              Bs {{ money(cita.precio) }}
            </div>

            <q-badge
              rounded
              class="estado-badge"
              :color="colorEstado(cita.estado)"
            >
              {{ mostrarEstado(cita.estado) }}
            </q-badge>

            <q-badge
              rounded
              class="estado-badge"
              :color="cita.estado_pago === 'pagado' ? 'green' : 'red'"
            >
              {{ mostrarPago(cita.estado_pago) }}
            </q-badge>
          </div>

          <div class="cita-mobile-actions">
            <q-btn
              round
              unelevated
              size="sm"
              color="primary"
              icon="edit"
              @click="edit(cita)"
            />

            <q-btn
              v-if="cita.estado !== 'concluida'"
              round
              unelevated
              size="sm"
              color="positive"
              icon="check"
              @click="finalizar(cita.id)"
            />

            <q-btn
              v-if="cita.estado_pago !== 'pagado'"
              round
              unelevated
              size="sm"
              color="blue"
              icon="payments"
              @click="pagar(cita)"
            />

            <q-btn
              round
              unelevated
              size="sm"
              color="purple"
              icon="history"
              @click="verHistorial(cita.id)"
            />

            <q-btn
              round
              unelevated
              size="sm"
              color="negative"
              icon="delete"
              @click="remove(cita.id)"
            />
          </div>
        </q-card>
      </template>

      <q-card
        v-if="citasFiltradas.length === 0 && !loading"
        class="cita-mobile-card empty-mobile"
        flat
        bordered
      >
        {{ busqueda ? 'No se encontraron citas con esa búsqueda' : 'No hay citas registradas' }}
      </q-card>
    </div>

    <!-- TABLA -->
    <q-table
      class="tabla-glamur tabla-desktop"

      :rows="citasFiltradas"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :no-data-label="busqueda ? 'No se encontraron citas con esa búsqueda' : 'No hay citas registradas'"
      flat
      bordered
      :rows-per-page-options="[5, 10, 20, 50]"
    >

      <!-- CLIENTE -->
      <template #body-cell-cliente="props">
        <q-td :props="props">
          <div class="text-weight-bold text-pink-7">
            {{ props.row.cliente?.nombre || 'Sin cliente' }}
          </div>

          <div class="text-caption text-grey-7">
            {{ props.row.cliente?.telefono || 'Sin teléfono' }}
          </div>
        </q-td>
      </template>

      <!-- EMPLEADO -->
      <template #body-cell-empleado="props">
        <q-td :props="props">
          <div class="text-weight-bold text-purple-7">
            {{ empleadoNombre(props.row) }}
          </div>

          <div class="text-caption text-grey-7">
            {{ empleadoDetalle(props.row) }}
          </div>
        </q-td>
      </template>

      <!-- SERVICIO -->
      <template #body-cell-servicio="props">
        <q-td :props="props">
          <div class="text-weight-bold">
            {{ props.row.servicio || 'Sin servicio' }}
          </div>

          <div class="text-caption text-grey-7">
            Servicio AUREA
          </div>
        </q-td>
      </template>

      <!-- PRECIO -->
      <template #body-cell-precio="props">
        <q-td :props="props">
          <div class="text-weight-bold text-green-8">
            Bs {{ money(props.row.precio) }}
          </div>
        </q-td>
      </template>

      <!-- FECHA -->
      <template #body-cell-fecha="props">
        <q-td :props="props">
          <div class="text-weight-bold text-dark">
            {{ formatDate(props.row.fecha) }}
          </div>
        </q-td>
      </template>

      <!-- HORA -->
      <template #body-cell-hora="props">
        <q-td :props="props">
          <div class="text-weight-bold text-dark">
            {{ formatHora(props.row.hora) }}
          </div>
        </q-td>
      </template>

      <!-- ESTADO -->
      <template #body-cell-estado="props">
        <q-td :props="props" class="text-center">
          <q-badge
            rounded
            class="estado-badge"
            :color="colorEstado(props.row.estado)"
          >
            {{ mostrarEstado(props.row.estado) }}
          </q-badge>
        </q-td>
      </template>

      <!-- PAGO -->
      <template #body-cell-estado_pago="props">
        <q-td :props="props" class="text-center">
          <q-badge
            rounded
            class="estado-badge"
            :color="props.row.estado_pago === 'pagado' ? 'green' : 'red'"
          >
            {{ mostrarPago(props.row.estado_pago) }}
          </q-badge>
        </q-td>
      </template>

      <!-- ACCIONES -->
      <template #body-cell-actions="props">
        <q-td :props="props" class="text-center">
          <div class="acciones">

            <q-btn
              round
              unelevated
              size="sm"
              color="primary"
              icon="edit"
              @click="edit(props.row)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>

            <q-btn
              v-if="props.row.estado !== 'concluida'"
              round
              unelevated
              size="sm"
              color="positive"
              icon="check"
              @click="finalizar(props.row.id)"
            >
              <q-tooltip>Finalizar cita</q-tooltip>
            </q-btn>

            <q-btn
              v-if="props.row.estado_pago !== 'pagado'"
              round
              unelevated
              size="sm"
              color="blue"
              icon="payments"
              @click="pagar(props.row)"
            >
              <q-tooltip>Registrar pago</q-tooltip>
            </q-btn>

            <q-btn
              round
              unelevated
              size="sm"
              color="purple"
              icon="history"
              @click="verHistorial(props.row.id)"
            >
              <q-tooltip>Historial de pagos</q-tooltip>
            </q-btn>

            <q-btn
              round
              unelevated
              size="sm"
              color="negative"
              icon="delete"
              @click="remove(props.row.id)"
            >
              <q-tooltip>Eliminar cita</q-tooltip>
            </q-btn>

          </div>
        </q-td>
      </template>

    </q-table>

    <!-- DIALOG NUEVA / EDITAR CITA -->
    <q-dialog
      v-model="dialog"
      persistent
      :maximized="$q.screen.lt.md"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="dialog-card dialog-card-main">

        <!-- HEADER FIJO -->
        <q-card-section class="dialog-header row items-center">
          <div class="text-h6 text-weight-bold">
            {{ form.id ? '✏️ Editar cita' : '🗓️ Nueva cita' }}
          </div>

          <q-space />

          <q-btn
            icon="close"
            flat
            round
            dense
            color="white"
            v-close-popup
          />
        </q-card-section>

        <!-- CUERPO CON SCROLL -->
        <q-card-section class="dialog-body">
          <div class="form-stack">

            <!-- CLIENTE -->
            <q-select
              v-model="form.cliente_id"
              :options="clientesFiltrados"
              option-label="nombre"
              option-value="id"
              emit-value
              map-options
              use-input
              input-debounce="0"
              clearable
              label="Cliente *"
              outlined
              rounded
              bg-color="white"
              class="form-field"
              @filter="filtrarClientes"
            >
              <template #prepend>
                <q-icon name="person" color="pink" />
              </template>

              <template #option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-avatar color="pink" text-color="white" icon="person" />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-weight-bold">
                      {{ scope.opt.nombre }}
                    </q-item-label>

                    <q-item-label caption>
                      {{ scope.opt.telefono || 'Sin teléfono' }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>

              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No se encontraron clientes
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <!-- EMPLEADO -->
            <q-select
              v-model="form.empleado_id"
              :options="empleadosFiltrados"
              option-label="nombre"
              option-value="id"
              emit-value
              map-options
              use-input
              input-debounce="0"
              clearable
              label="Empleado que atenderá"
              outlined
              rounded
              bg-color="white"
              class="form-field"
              @filter="filtrarEmpleados"
            >
              <template #prepend>
                <q-icon name="groups" color="purple" />
              </template>

              <template #option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-avatar color="purple" text-color="white" icon="person" />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-weight-bold">
                      {{ scope.opt.nombre }}
                    </q-item-label>

                    <q-item-label caption>
                      {{ scope.opt.especialidad || scope.opt.cargo || 'Empleado general' }}
                    </q-item-label>

                    <q-item-label caption>
                      {{ scope.opt.telefono || 'Sin teléfono' }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>

              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No se encontraron empleados activos
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <!-- CATEGORÍAS DE SERVICIOS -->
            <div class="service-category-box">
              <div class="category-title">Selecciona una categoría</div>

              <div class="service-category-grid">
                <button
                  v-for="cat in categoriasServicios"
                  :key="cat.key"
                  type="button"
                  class="service-category-card"
                  :class="{ active: categoriaSeleccionada === cat.key }"
                  @click="seleccionarCategoria(cat.key)"
                >
                  <q-icon :name="cat.icon" class="category-icon" />
                  <span>{{ cat.label }}</span>
                  <small>{{ contarServiciosCategoria(cat.key) }} opción(es)</small>
                </button>
              </div>
            </div>

            <!-- SERVICIOS / COMBOS MÚLTIPLES -->
            <q-select
              v-model="form.servicioOption"
              :options="serviciosFiltrados"
              option-label="combo"
              option-value="id"
              label="Servicios o combos *"
              outlined
              rounded
              clearable
              multiple
              use-chips
              use-input
              input-debounce="0"
              class="form-field service-select"
              popup-content-class="combo-menu-glamur"
              :disable="serviciosDeCategoriaActual.length === 0"
              @filter="filtrarServicios"
              @update:model-value="seleccionarServicio"
              @clear="limpiarServicio"
            >
              <template #prepend>
                <q-icon :name="categoriaActual.icon" color="pink" class="field-icon" />
              </template>

              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey-7">
                    No hay servicios en esta categoría.
                  </q-item-section>
                </q-item>
              </template>

              <template #option="scope">
                <q-item v-bind="scope.itemProps" class="combo-option">
                  <q-item-section avatar>
                    <q-avatar color="pink-1" text-color="pink" :icon="iconoServicio(scope.opt.servicio)" />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-weight-bold">
                      {{ scope.opt.combo }}
                    </q-item-label>
                    <q-item-label caption>
                      {{ scope.opt.servicio }}
                    </q-item-label>
                    <q-item-label caption>
                      {{ scope.opt.detalle }}
                    </q-item-label>
                    <q-item-label caption class="text-pink text-weight-bold">
                      Bs {{ money(scope.opt.precio) }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>

              <template #selected-item="scope">
                <q-chip
                  removable
                  dense
                  color="pink-1"
                  text-color="pink-9"
                  class="selected-service-chip"
                  @remove="scope.removeAtIndex(scope.index)"
                >
                  {{ scope.opt.combo }}
                </q-chip>
              </template>
            </q-select>

            <!-- RESUMEN MULTI SERVICIOS / COMBOS -->
            <div v-if="serviciosSeleccionados.length > 0" class="multi-servicios-box">
              <div class="multi-servicios-header">
                <div>
                  <div class="multi-servicios-title">
                    Servicios seleccionados
                  </div>
                  <div class="multi-servicios-subtitle">
                    Puedes combinar varios servicios o combos en una sola cita.
                  </div>
                </div>

                <q-badge rounded class="multi-servicios-total">
                  Total Bs {{ money(form.precio) }}
                </q-badge>
              </div>

              <div class="multi-servicios-list">
                <div
                  v-for="servicio in serviciosSeleccionados"
                  :key="servicioKey(servicio)"
                  class="multi-servicio-item"
                >
                  <div>
                    <div class="multi-servicio-name">
                      {{ servicio.combo }}
                    </div>
                    <div class="multi-servicio-detail">
                      {{ servicio.servicio }} · {{ servicio.detalle || 'Sin detalle' }}
                    </div>
                  </div>

                  <div class="multi-servicio-price">
                    Bs {{ money(servicio.precio) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- DETALLE DEL SERVICIO -->
            <q-input
              v-if="form.detalle"
              v-model="form.detalle"
              label="Detalle de servicios"
              outlined
              rounded
              readonly
              bg-color="white"
              class="form-field input-readonly"
            >
              <template #prepend>
                <q-icon name="description" color="pink" />
              </template>
            </q-input>

            <!-- PRECIO -->
            <q-input
              v-model.number="form.precio"
              type="number"
              label="Precio total Bs. *"
              outlined
              rounded
              min="0"
              bg-color="white"
              class="form-field"
              readonly
            >
              <template #prepend>
                <q-icon name="payments" color="green" />
              </template>
            </q-input>

            <!-- FECHA Y HORA -->
            <div class="form-row">
              <q-input
                v-model="form.fecha"
                type="date"
                label="Fecha *"
                outlined
                rounded
                bg-color="white"
                class="form-field"
              >
                <template #prepend>
                  <q-icon name="event" color="pink" />
                </template>
              </q-input>

              <q-input
                v-model="form.hora"
                type="time"
                label="Hora *"
                outlined
                rounded
                bg-color="white"
                class="form-field"
              >
                <template #prepend>
                  <q-icon name="schedule" color="pink" />
                </template>
              </q-input>
            </div>

            <!-- MULTI CITAS -->
            <div v-if="!form.id" class="multi-citas-box">
              <div class="multi-citas-header">
                <div>
                  <div class="multi-citas-title">
                    Multi citas
                  </div>
                  <div class="multi-citas-subtitle">
                    Registra la misma selección de servicios en varios horarios.
                  </div>
                </div>

                <q-toggle
                  v-model="form.multiCitas"
                  color="pink"
                  label="Activar"
                  left-label
                />
              </div>

              <div v-if="form.multiCitas" class="multi-citas-content">
                <div class="multi-citas-help">
                  La primera fecha y hora de arriba será la cita principal. Agrega otras fechas si la clienta desea reservar más turnos.
                </div>

                <div
                  v-for="(item, index) in form.citasMultiples"
                  :key="index"
                  class="multi-cita-row"
                >
                  <q-input
                    v-model="item.fecha"
                    type="date"
                    label="Fecha adicional"
                    outlined
                    rounded
                    bg-color="white"
                    class="form-field"
                  >
                    <template #prepend>
                      <q-icon name="event_repeat" color="pink" />
                    </template>
                  </q-input>

                  <q-input
                    v-model="item.hora"
                    type="time"
                    label="Hora adicional"
                    outlined
                    rounded
                    bg-color="white"
                    class="form-field"
                  >
                    <template #prepend>
                      <q-icon name="schedule" color="pink" />
                    </template>
                  </q-input>

                  <q-btn
                    round
                    unelevated
                    color="negative"
                    icon="delete"
                    class="multi-cita-delete"
                    @click="quitarCitaMultiple(index)"
                  />
                </div>

                <q-btn
                  class="btn-add-multi-cita"
                  icon="add"
                  label="Agregar otra fecha"
                  unelevated
                  @click="agregarCitaMultiple"
                />
              </div>
            </div>

            <!-- ESTADO -->
            <q-select
              v-model="form.estado"
              :options="estados"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              label="Estado"
              outlined
              rounded
              bg-color="white"
              class="form-field"
            >
              <template #prepend>
                <q-icon name="flag" color="pink" />
              </template>
            </q-select>

          </div>
        </q-card-section>

        <!-- BOTONES FIJOS -->
        <q-card-actions align="right" class="dialog-actions">
          <q-btn
            class="btn-cancelar"
            label="Cancelar"
            icon="close"
            unelevated
            v-close-popup
          />

          <q-btn
            class="btn-glamur"
            :label="form.id ? 'Guardar cambios' : 'Registrar cita'"
            icon="save"
            :loading="saving"
            @click="save"
          />
        </q-card-actions>

      </q-card>
    </q-dialog>

    <!-- DIALOG PAGO -->
    <q-dialog
      v-model="dialogPago"
      persistent
      :maximized="$q.screen.lt.md"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="dialog-card-small dialog-card-main">

        <q-card-section class="dialog-header row items-center">
          <div class="text-h6 text-weight-bold">
            💰 Realizar pago
          </div>

          <q-space />

          <q-btn
            icon="close"
            flat
            round
            dense
            color="white"
            v-close-popup
          />
        </q-card-section>

        <q-card-section class="dialog-body">
          <div class="form-stack">

            <q-select
              v-model="pago.metodo"
              :options="metodosPago"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              label="Método de pago"
              outlined
              rounded
              bg-color="white"
              class="form-field"
              @update:model-value="actualizarMetodoPago"
            >
              <template #prepend>
                <q-icon name="account_balance_wallet" color="pink" />
              </template>
            </q-select>

            <q-input
              v-if="pago.metodo !== 'mixto'"
              v-model.number="pago.monto"
              type="number"
              label="Monto Bs."
              outlined
              rounded
              min="0"
              bg-color="white"
              class="form-field"
            >
              <template #prepend>
                <q-icon name="payments" color="green" />
              </template>
            </q-input>

            <div v-if="pago.metodo === 'mixto'" class="pago-mixto-box">
              <div class="pago-mixto-title">
                Pago mixto
              </div>

              <div class="pago-mixto-subtitle">
                Divide el pago en efectivo, QR o transferencia. El sistema sumará todo automáticamente.
              </div>

              <q-input
                v-model.number="pago.monto_efectivo"
                type="number"
                label="Monto en efectivo Bs."
                outlined
                rounded
                min="0"
                bg-color="white"
                class="form-field"
              >
                <template #prepend>
                  <q-icon name="payments" color="green" />
                </template>
              </q-input>

              <q-input
                v-model.number="pago.monto_qr"
                type="number"
                label="Monto por QR Bs."
                outlined
                rounded
                min="0"
                bg-color="white"
                class="form-field"
              >
                <template #prepend>
                  <q-icon name="qr_code_2" color="pink" />
                </template>
              </q-input>

              <q-input
                v-model.number="pago.monto_transferencia"
                type="number"
                label="Monto por transferencia Bs."
                outlined
                rounded
                min="0"
                bg-color="white"
                class="form-field"
              >
                <template #prepend>
                  <q-icon name="account_balance" color="blue" />
                </template>
              </q-input>

              <div class="pago-total-box">
                <span>Total del pago</span>
                <strong>Bs {{ money(totalPagoMixto) }}</strong>
              </div>
            </div>

            <div v-if="pago.metodo === 'qr' || (pago.metodo === 'mixto' && Number(pago.monto_qr || 0) > 0)" class="qr-box">
              <q-img
                src="~@/assets/qr.jpg"
                class="qr-img"
                fit="contain"
              />

              <div class="text-caption text-grey-7 q-mt-sm">
                Escanea el QR para realizar el pago.
              </div>
            </div>

          </div>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn
            class="btn-cancelar"
            label="Cancelar"
            icon="close"
            unelevated
            v-close-popup
          />

          <q-btn
            class="btn-glamur"
            label="Confirmar pago"
            icon="payments"
            :loading="savingPago"
            @click="confirmarPago"
          />
        </q-card-actions>

      </q-card>
    </q-dialog>

    <!-- DIALOG HISTORIAL -->
    <q-dialog
      v-model="dialogHistorial"
      :maximized="$q.screen.lt.md"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="dialog-card-historial dialog-card-main">

        <q-card-section class="dialog-header row items-center">
          <div class="text-h6 text-weight-bold">
            📜 Historial de pagos
          </div>

          <q-space />

          <q-btn
            icon="close"
            flat
            round
            dense
            color="white"
            v-close-popup
          />
        </q-card-section>

        <q-card-section class="dialog-body">
          <q-table
            class="tabla-glamur tabla-historial"
            :rows="historial"
            :columns="columnsHistorial"
            row-key="id"
            dense
            flat
            bordered
            no-data-label="Esta cita no tiene pagos registrados"
          >
            <template #body-cell-monto="props">
              <q-td :props="props">
                <b class="text-green-8">
                  Bs {{ money(props.row.monto) }}
                </b>
              </q-td>
            </template>

            <template #body-cell-metodo="props">
              <q-td :props="props">
                {{ mostrarMetodo(props.row.metodo) }}
              </q-td>
            </template>

            <template #body-cell-estado="props">
              <q-td :props="props">
                <q-badge color="green" rounded>
                  {{ props.row.estado || 'pagado' }}
                </q-badge>
              </q-td>
            </template>

            <template #body-cell-fecha_pago="props">
              <q-td :props="props">
                {{ formatDateTime(props.row.fecha_pago) }}
              </q-td>
            </template>
          </q-table>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn
            class="btn-cancelar"
            label="Cerrar"
            icon="close"
            unelevated
            v-close-popup
          />
        </q-card-actions>

      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/boot/axios'

defineOptions({
  name: 'CitasPage'
})

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

const citas = ref([])
const busqueda = ref('')
const filtroCitasActivo = ref('hoy')
const clientes = ref([])
const clientesFiltrados = ref([])
const empleados = ref([])
const empleadosFiltrados = ref([])
const servicios = ref([])
const serviciosFiltrados = ref([])
const categoriaSeleccionada = ref('cejas')

const filtrosCitas = [
  {
    label: 'Hoy',
    value: 'hoy',
    icon: 'today'
  },
  {
    label: 'Próximas',
    value: 'proximas',
    icon: 'event_available'
  },
  {
    label: 'Anteriores',
    value: 'anteriores',
    icon: 'history'
  },
  {
    label: 'Todas',
    value: 'todas',
    icon: 'view_list'
  }
]

const categoriasServicios = [
  {
    key: 'cejas',
    label: 'Cejas y pestañas',
    icon: 'spa',
    match: ['cejas', 'pestañas', 'pestanas', 'brows', 'lash']
  },
  {
    key: 'maquillaje',
    label: 'Maquillaje y cabello',
    icon: 'face_retouching_natural',
    match: ['maquillaje', 'cabello', 'peinado', 'hair', 'makeup']
  },
  {
    key: 'unas',
    label: 'Uñas',
    icon: 'back_hand',
    match: ['uñas', 'unas', 'manicure', 'pedicure', 'nail']
  },
  {
    key: 'otros',
    label: 'Otros',
    icon: 'more_horiz',
    match: []
  }
]

const historial = ref([])

const dialog = ref(false)
const dialogPago = ref(false)
const dialogHistorial = ref(false)

const loading = ref(false)
const saving = ref(false)
const savingPago = ref(false)

const estados = [
  { label: 'Pendiente', value: 'pendiente' },
  { label: 'Concluida', value: 'concluida' },
  { label: 'Cancelada', value: 'cancelada' }
]

const metodosPago = [
  { label: 'Efectivo', value: 'efectivo' },
  { label: 'QR', value: 'qr' },
  { label: 'Transferencia', value: 'transferencia' },
  { label: 'Mixto: efectivo + QR', value: 'mixto' }
]

const form = ref({
  id: null,
  cliente_id: null,
  empleado_id: null,
  servicioOption: [],
  combo: '',
  detalle: '',
  precio: 0,
  fecha: '',
  hora: '',
  estado: 'pendiente',
  multiCitas: false,
  citasMultiples: []
})

const pago = ref({
  cita_id: null,
  monto: 0,
  monto_efectivo: 0,
  monto_qr: 0,
  monto_transferencia: 0,
  metodo: 'efectivo'
})

const columns = [
  {
    name: 'cliente',
    label: 'Cliente',
    field: row => row.cliente?.nombre || 'Sin cliente',
    align: 'left',
    sortable: true
  },
  {
    name: 'empleado',
    label: 'Empleado',
    field: row => row.empleado?.nombre || 'Sin empleado',
    align: 'left',
    sortable: true
  },
  {
    name: 'servicio',
    label: 'Servicio',
    field: 'servicio',
    align: 'left',
    sortable: true
  },
  {
    name: 'precio',
    label: 'Precio',
    field: 'precio',
    align: 'left',
    sortable: true
  },
  {
    name: 'fecha',
    label: 'Fecha',
    field: 'fecha',
    align: 'left',
    sortable: true
  },
  {
    name: 'hora',
    label: 'Hora',
    field: 'hora',
    align: 'left'
  },
  {
    name: 'estado',
    label: 'Estado',
    field: 'estado',
    align: 'center'
  },
  {
    name: 'estado_pago',
    label: 'Pago',
    field: 'estado_pago',
    align: 'center'
  },
  {
    name: 'actions',
    label: 'Acciones',
    field: 'actions',
    align: 'center'
  }
]

const columnsHistorial = [
  {
    name: 'monto',
    label: 'Monto',
    field: 'monto',
    align: 'left'
  },
  {
    name: 'metodo',
    label: 'Método',
    field: 'metodo',
    align: 'left'
  },
  {
    name: 'estado',
    label: 'Estado',
    field: 'estado',
    align: 'left'
  },
  {
    name: 'fecha_pago',
    label: 'Fecha pago',
    field: row => formatDateTime(row.fecha_pago),
    align: 'left'
  }
]

const totalPagoMixto = computed(() => {
  return Number(pago.value.monto_efectivo || 0) +
    Number(pago.value.monto_qr || 0) +
    Number(pago.value.monto_transferencia || 0)
})

const serviciosSeleccionados = computed(() => {
  const seleccion = Array.isArray(form.value.servicioOption)
    ? form.value.servicioOption
    : (form.value.servicioOption ? [form.value.servicioOption] : [])

  return seleccion.filter(Boolean)
})

function money(value) {
  return Number(value || 0).toFixed(2)
}

function fechaParaInput(fecha) {
  if (!fecha) return ''

  const texto = String(fecha)

  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    return texto
  }

  if (texto.includes('T')) {
    return texto.slice(0, 10)
  }

  return texto.slice(0, 10)
}

function formatDate(fecha) {
  const limpia = fechaParaInput(fecha)

  if (!limpia) return '-'

  const [year, month, day] = limpia.split('-')

  if (!year || !month || !day) return limpia

  return `${day}/${month}/${year}`
}

function formatDateTime(fecha) {
  if (!fecha) return 'Sin fecha'

  const soloFecha = formatDate(fecha)
  const texto = String(fecha)

  if (!texto.includes('T')) {
    return soloFecha
  }

  const hora = texto.split('T')[1]?.slice(0, 5)

  return hora ? `${soloFecha} ${hora}` : soloFecha
}

function formatHora(hora) {
  if (!hora) return '-'

  return String(hora).slice(0, 5)
}

function fechaLocal(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function hoy() {
  return fechaLocal(new Date())
}

function normalizar(valor) {
  return String(valor || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function valorFechaOrden(fecha) {
  const limpia = fechaParaInput(fecha)

  if (!limpia) {
    return '9999-12-31'
  }

  return limpia
}

function valorHoraOrden(hora) {
  if (!hora) {
    return '99:99'
  }

  return String(hora).slice(0, 5)
}

function prioridadFecha(fecha) {
  const fechaCita = valorFechaOrden(fecha)
  const fechaHoy = hoy()

  if (fechaCita === fechaHoy) {
    return 0
  }

  if (fechaCita > fechaHoy) {
    return 1
  }

  return 2
}

function grupoFechaCita(fecha) {
  const prioridad = prioridadFecha(fecha)

  if (prioridad === 0) return 'hoy'
  if (prioridad === 1) return 'proximas'
  return 'anteriores'
}

function etiquetaFechaCita(fecha) {
  const grupo = grupoFechaCita(fecha)

  if (grupo === 'hoy') return 'Hoy'
  if (grupo === 'proximas') return 'Próxima'
  return 'Anterior'
}

function ordenarCitasPorPrioridad(lista = []) {
  return [...lista].sort((a, b) => {
    const prioridadA = prioridadFecha(a.fecha)
    const prioridadB = prioridadFecha(b.fecha)

    if (prioridadA !== prioridadB) {
      return prioridadA - prioridadB
    }

    const fechaA = valorFechaOrden(a.fecha)
    const fechaB = valorFechaOrden(b.fecha)

    if (fechaA !== fechaB) {
      if (prioridadA === 2) {
        return fechaB.localeCompare(fechaA)
      }

      return fechaA.localeCompare(fechaB)
    }

    const horaA = valorHoraOrden(a.hora)
    const horaB = valorHoraOrden(b.hora)

    if (horaA !== horaB) {
      return horaA.localeCompare(horaB)
    }

    return Number(a.id || 0) - Number(b.id || 0)
  })
}

function agruparCitasPorPrioridad(lista = []) {
  const ordenadas = ordenarCitasPorPrioridad(lista)

  return [
    {
      key: 'hoy',
      titulo: 'Citas de hoy',
      descripcion: 'Prioridad principal del día, ordenadas por hora.',
      items: ordenadas.filter(cita => grupoFechaCita(cita.fecha) === 'hoy')
    },
    {
      key: 'proximas',
      titulo: 'Próximas citas',
      descripcion: 'Fechas futuras, ordenadas por fecha y hora.',
      items: ordenadas.filter(cita => grupoFechaCita(cita.fecha) === 'proximas')
    },
    {
      key: 'anteriores',
      titulo: 'Citas anteriores',
      descripcion: 'Registros pasados que quedan al final.',
      items: ordenadas.filter(cita => grupoFechaCita(cita.fecha) === 'anteriores')
    }
  ]
}

const citasBaseFiltradas = computed(() => {
  const texto = normalizar(busqueda.value)

  if (!texto) {
    return ordenarCitasPorPrioridad(citas.value)
  }

  const resultado = citas.value.filter(cita => {
    const datos = [
      cita.id,
      cita.cliente?.nombre,
      cita.cliente?.telefono,
      cita.empleado?.nombre,
      cita.empleado?.telefono,
      cita.empleado?.cargo,
      cita.empleado?.especialidad,
      cita.servicio,
      cita.precio,
      formatDate(cita.fecha),
      formatHora(cita.hora),
      cita.estado,
      mostrarEstado(cita.estado),
      cita.estado_pago,
      mostrarPago(cita.estado_pago)
    ]

    return datos.some(dato => normalizar(dato).includes(texto))
  })

  return ordenarCitasPorPrioridad(resultado)
})

const citasFiltradas = computed(() => {
  if (filtroCitasActivo.value === 'todas') {
    return citasBaseFiltradas.value
  }

  return citasBaseFiltradas.value.filter(cita => grupoFechaCita(cita.fecha) === filtroCitasActivo.value)
})

const nombreFiltroActivo = computed(() => {
  return filtrosCitas.find(filtro => filtro.value === filtroCitasActivo.value)?.label || 'Hoy'
})

function contarCitasPorFiltro(filtro) {
  if (filtro === 'todas') {
    return citasBaseFiltradas.value.length
  }

  return citasBaseFiltradas.value.filter(cita => grupoFechaCita(cita.fecha) === filtro).length
}

const gruposCitasFiltradas = computed(() => {
  return agruparCitasPorPrioridad(citasFiltradas.value)
})

function responseToArray(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.servicios)) return data.servicios
  if (Array.isArray(data?.clientes)) return data.clientes
  if (Array.isArray(data?.empleados)) return data.empleados
  if (Array.isArray(data?.citas)) return data.citas
  if (Array.isArray(data?.pagos)) return data.pagos
  return []
}

function getErrorMessage(error) {
  const data = error?.response?.data

  if (data?.errors) {
    return Object.values(data.errors).flat().join(' ')
  }

  return data?.message || data?.error || 'Ocurrió un error'
}

function empleadoNombre(row) {
  return row?.empleado?.nombre || 'Sin empleado asignado'
}

function empleadoDetalle(row) {
  if (!row?.empleado) {
    return 'Puedes asignarlo al editar'
  }

  return row.empleado.especialidad || row.empleado.cargo || row.empleado.telefono || 'Empleado del salón'
}

function mapServicio(item) {
  return {
    id: item.id,
    servicio: item.servicio || item.categoria || 'CEJAS Y PESTAÑAS',
    combo: item.combo || item.nombre || '',
    detalle: item.detalle || item.descripcion || '',
    precio: Number(item.precio || 0),
    activo: item.activo !== false && item.activo !== 0 && item.activo !== '0'
  }
}

function categoriaDeServicio(nombreServicio = '') {
  const texto = normalizar(nombreServicio)

  const categoria = categoriasServicios.find(cat => {
    if (cat.key === 'otros') return false
    return cat.match.some(palabra => texto.includes(normalizar(palabra)))
  })

  return categoria?.key || 'otros'
}

const categoriaActual = computed(() => {
  return categoriasServicios.find(cat => cat.key === categoriaSeleccionada.value) || categoriasServicios[0]
})

const serviciosDeCategoriaActual = computed(() => {
  return servicios.value.filter(servicio => categoriaDeServicio(servicio.servicio) === categoriaSeleccionada.value)
})

function contarServiciosCategoria(key) {
  return servicios.value.filter(servicio => categoriaDeServicio(servicio.servicio) === key).length
}

function iconoServicio(nombreServicio) {
  const key = categoriaDeServicio(nombreServicio)
  return categoriasServicios.find(cat => cat.key === key)?.icon || 'spa'
}

function actualizarServiciosFiltrados() {
  serviciosFiltrados.value = serviciosDeCategoriaActual.value
}

function seleccionarCategoria(key) {
  categoriaSeleccionada.value = key
  actualizarServiciosFiltrados()
}

function colorEstado(estado) {
  if (estado === 'concluida') return 'green'
  if (estado === 'cancelada') return 'red'
  return 'orange'
}

function mostrarEstado(estado) {
  if (estado === 'concluida') return 'Concluida'
  if (estado === 'cancelada') return 'Cancelada'
  return 'Pendiente'
}

function mostrarPago(estado) {
  if (estado === 'pagado') return 'Pagado'
  return 'Pendiente'
}

function mostrarMetodo(metodo) {
  if (metodo === 'mixto') return 'Mixto'
  if (metodo === 'qr') return 'QR'
  if (metodo === 'transferencia') return 'Transferencia'
  return 'Efectivo'
}

function actualizarMetodoPago(metodo) {
  const montoActual = Number(pago.value.monto || 0)

  if (metodo === 'mixto') {
    pago.value.monto_efectivo = montoActual
    pago.value.monto_qr = 0
    pago.value.monto_transferencia = 0
    return
  }

  pago.value.monto = montoActual || Number(pago.value.monto_efectivo || 0) + Number(pago.value.monto_qr || 0) + Number(pago.value.monto_transferencia || 0)
  pago.value.monto_efectivo = 0
  pago.value.monto_qr = 0
  pago.value.monto_transferencia = 0
}

async function load() {
  loading.value = true

  try {
    const { data } = await api.get('/citas')
    citas.value = ordenarCitasPorPrioridad(responseToArray(data))
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(error)
    })
  } finally {
    loading.value = false
  }
}

async function loadClientes() {
  try {
    const { data } = await api.get('/clientes')

    clientes.value = responseToArray(data)
    clientesFiltrados.value = clientes.value
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(error)
    })
  }
}

async function loadEmpleados() {
  try {
    const { data } = await api.get('/empleados/activos')

    empleados.value = responseToArray(data).filter(empleado => {
      return empleado.activo !== false && empleado.activo !== 0 && empleado.activo !== '0'
    })

    empleadosFiltrados.value = empleados.value
  } catch (error) {
    empleados.value = []
    empleadosFiltrados.value = []

    $q.notify({
      type: 'warning',
      message: getErrorMessage(error)
    })
  }
}

async function loadServicios() {
  try {
    const { data } = await api.get('/servicios')

    servicios.value = responseToArray(data)
      .map(mapServicio)
      .filter(item => item.activo)

    actualizarServiciosFiltrados()
  } catch (error) {
    servicios.value = []
    serviciosFiltrados.value = []

    $q.notify({
      type: 'warning',
      message: getErrorMessage(error)
    })
  }
}

function filtrarClientes(valor, update) {
  update(() => {
    const texto = normalizar(valor)

    if (!texto) {
      clientesFiltrados.value = clientes.value
      return
    }

    clientesFiltrados.value = clientes.value.filter(cliente => {
      return normalizar(cliente.nombre).includes(texto) ||
        normalizar(cliente.telefono).includes(texto)
    })
  })
}

function filtrarEmpleados(valor, update) {
  update(() => {
    const texto = normalizar(valor)

    if (!texto) {
      empleadosFiltrados.value = empleados.value
      return
    }

    empleadosFiltrados.value = empleados.value.filter(empleado => {
      return normalizar(empleado.nombre).includes(texto) ||
        normalizar(empleado.telefono).includes(texto) ||
        normalizar(empleado.ci).includes(texto) ||
        normalizar(empleado.cargo).includes(texto) ||
        normalizar(empleado.especialidad).includes(texto)
    })
  })
}

function filtrarServicios(valor, update) {
  update(() => {
    const texto = normalizar(valor)
    const base = serviciosDeCategoriaActual.value

    if (!texto) {
      serviciosFiltrados.value = base
      return
    }

    serviciosFiltrados.value = base.filter(servicio => {
      return normalizar(servicio.servicio).includes(texto) ||
        normalizar(servicio.combo).includes(texto) ||
        normalizar(servicio.detalle).includes(texto)
    })
  })
}

function servicioKey(servicio) {
  return servicio?.id || `${servicio?.combo || ''}-${servicio?.precio || 0}`
}

function actualizarResumenServicios() {
  const seleccion = serviciosSeleccionados.value

  form.value.combo = seleccion
    .map(servicio => servicio.combo || servicio.nombre || '')
    .filter(Boolean)
    .join(' + ')

  form.value.detalle = seleccion
    .map(servicio => {
      const nombre = servicio.combo || servicio.nombre || 'Servicio'
      const detalle = servicio.detalle || servicio.descripcion || servicio.servicio || ''
      const precio = money(servicio.precio || 0)

      return `${nombre} - ${detalle} (Bs ${precio})`
    })
    .join(' | ')

  form.value.precio = seleccion.reduce((total, servicio) => {
    return total + Number(servicio.precio || 0)
  }, 0)
}

function seleccionarServicio(serviciosSeleccionadosNuevos) {
  const seleccion = Array.isArray(serviciosSeleccionadosNuevos)
    ? serviciosSeleccionadosNuevos.filter(Boolean)
    : (serviciosSeleccionadosNuevos ? [serviciosSeleccionadosNuevos] : [])

  form.value.servicioOption = seleccion

  const ultimoServicio = seleccion[seleccion.length - 1]

  if (ultimoServicio) {
    categoriaSeleccionada.value = categoriaDeServicio(ultimoServicio.servicio)
    actualizarServiciosFiltrados()
  }

  actualizarResumenServicios()
}

function limpiarServicio() {
  form.value.servicioOption = []
  form.value.combo = ''
  form.value.detalle = ''
  form.value.precio = 0
}

function openDialog(fechaSeleccionada = null) {
  categoriaSeleccionada.value = 'cejas'
  actualizarServiciosFiltrados()

  form.value = {
    id: null,
    cliente_id: null,
    empleado_id: null,
    servicioOption: [],
    combo: '',
    detalle: '',
    precio: 0,
    fecha: fechaSeleccionada || String(route.query.fecha || '') || hoy(),
    hora: '',
    estado: 'pendiente',
    multiCitas: false,
    citasMultiples: []
  }

  empleadosFiltrados.value = empleados.value
  clientesFiltrados.value = clientes.value

  dialog.value = true
}

function obtenerServiciosDesdeTexto(textoServicio, precio = 0) {
  const partes = String(textoServicio || '')
    .split('+')
    .map(item => item.trim())
    .filter(Boolean)

  const encontrados = partes
    .map(parte => servicios.value.find(servicio => normalizar(servicio.combo) === normalizar(parte)))
    .filter(Boolean)

  if (encontrados.length > 0) {
    return encontrados
  }

  if (textoServicio) {
    return [{
      id: null,
      servicio: 'Servicio guardado',
      combo: textoServicio,
      detalle: '',
      precio: Number(precio || 0),
      activo: true
    }]
  }

  return []
}

function edit(row) {
  const serviciosEditados = obtenerServiciosDesdeTexto(row.servicio, row.precio)
  const primerServicio = serviciosEditados[0] || null
  const empleadoId = row.empleado_id || row.empleado?.id || null

  if (row.empleado && empleadoId && !empleados.value.some(empleado => Number(empleado.id) === Number(empleadoId))) {
    empleados.value = [...empleados.value, row.empleado]
    empleadosFiltrados.value = empleados.value
  }

  categoriaSeleccionada.value = primerServicio ? categoriaDeServicio(primerServicio.servicio) : 'cejas'
  actualizarServiciosFiltrados()

  form.value = {
    id: row.id,
    cliente_id: row.cliente_id,
    empleado_id: empleadoId,
    servicioOption: serviciosEditados,
    combo: row.servicio || '',
    detalle: serviciosEditados.map(servicio => servicio.detalle).filter(Boolean).join(' | '),
    precio: Number(row.precio || 0),
    fecha: fechaParaInput(row.fecha) || hoy(),
    hora: row.hora ? String(row.hora).slice(0, 5) : '',
    estado: row.estado || 'pendiente',
    multiCitas: false,
    citasMultiples: []
  }

  if (serviciosEditados.length > 0) {
    actualizarResumenServicios()
    form.value.precio = Number(row.precio || form.value.precio || 0)
  }

  empleadosFiltrados.value = empleados.value
  clientesFiltrados.value = clientes.value

  dialog.value = true
}

function agregarCitaMultiple() {
  form.value.citasMultiples.push({
    fecha: form.value.fecha || hoy(),
    hora: ''
  })
}

function quitarCitaMultiple(index) {
  form.value.citasMultiples.splice(index, 1)
}

function citasMultiplesValidas() {
  if (!form.value.multiCitas) {
    return []
  }

  return form.value.citasMultiples
    .map(item => ({
      fecha: fechaParaInput(item.fecha),
      hora: item.hora ? String(item.hora).slice(0, 5) : ''
    }))
    .filter(item => item.fecha && item.hora)
}

async function save() {
  if (!form.value.cliente_id) {
    $q.notify({
      type: 'warning',
      message: 'Selecciona un cliente'
    })

    return
  }

  if (serviciosSeleccionados.value.length === 0 || !form.value.combo) {
    $q.notify({
      type: 'warning',
      message: 'Selecciona uno o más servicios o combos'
    })

    return
  }

  if (!form.value.fecha || !form.value.hora) {
    $q.notify({
      type: 'warning',
      message: 'Completa la fecha y la hora'
    })

    return
  }

  if (Number(form.value.precio || 0) <= 0) {
    $q.notify({
      type: 'warning',
      message: 'El precio debe ser mayor a 0'
    })

    return
  }

  saving.value = true

  try {
    const payloadBase = {
      cliente_id: form.value.cliente_id,
      empleado_id: form.value.empleado_id || null,
      servicio: form.value.combo,
      precio: Number(form.value.precio || 0),
      fecha: form.value.fecha,
      hora: String(form.value.hora).slice(0, 5),
      estado: form.value.estado
    }

    if (form.value.id) {
      await api.put(`/citas/${form.value.id}`, payloadBase)

      $q.notify({
        type: 'positive',
        message: 'Cita actualizada correctamente'
      })
    } else {
      const citasExtra = citasMultiplesValidas()
      const citasParaCrear = [payloadBase]

      citasExtra.forEach(item => {
        citasParaCrear.push({
          ...payloadBase,
          fecha: item.fecha,
          hora: item.hora
        })
      })

      for (const payload of citasParaCrear) {
        await api.post('/citas', payload)
      }

      $q.notify({
        type: 'positive',
        message: citasParaCrear.length > 1
          ? `${citasParaCrear.length} citas registradas correctamente`
          : 'Cita registrada correctamente'
      })
    }

    dialog.value = false

    await load()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(error)
    })
  } finally {
    saving.value = false
  }
}

async function finalizar(id) {
  $q.dialog({
    title: 'Finalizar cita',
    message: '¿Deseas marcar esta cita como concluida?',
    persistent: true,
    ok: {
      label: 'Finalizar',
      color: 'positive',
      unelevated: true
    },
    cancel: {
      label: 'Cancelar',
      color: 'grey-7',
      flat: true
    }
  }).onOk(async () => {
    try {
      await api.put(`/citas/finalizar/${id}`)

      $q.notify({
        type: 'positive',
        message: 'Cita finalizada correctamente'
      })

      await load()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: getErrorMessage(error)
      })
    }
  })
}

function pagar(row) {
  pago.value = {
    cita_id: row.id,
    monto: Number(row.precio || 0),
    monto_efectivo: 0,
    monto_qr: 0,
    monto_transferencia: 0,
    metodo: 'efectivo'
  }

  dialogPago.value = true
}

async function confirmarPago() {
  if (!pago.value.cita_id) {
    $q.notify({
      type: 'warning',
      message: 'No se encontró la cita para registrar el pago'
    })

    return
  }

  const esMixto = pago.value.metodo === 'mixto'
  const montoTotal = esMixto ? totalPagoMixto.value : Number(pago.value.monto || 0)

  if (montoTotal <= 0) {
    $q.notify({
      type: 'warning',
      message: 'El monto del pago debe ser mayor a 0'
    })

    return
  }

  savingPago.value = true

  try {
    const payload = {
      cita_id: pago.value.cita_id,
      metodo: pago.value.metodo,
      monto: montoTotal
    }

    if (esMixto) {
      payload.monto_efectivo = Number(pago.value.monto_efectivo || 0)
      payload.monto_qr = Number(pago.value.monto_qr || 0)
      payload.monto_transferencia = Number(pago.value.monto_transferencia || 0)
    }

    await api.post('/pagos', payload)

    dialogPago.value = false

    $q.notify({
      type: 'positive',
      message: 'Pago registrado correctamente'
    })

    await load()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(error)
    })
  } finally {
    savingPago.value = false
  }
}

async function verHistorial(id) {
  try {
    const { data } = await api.get(`/pagos/historial/${id}`)

    historial.value = responseToArray(data)
    dialogHistorial.value = true
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(error)
    })
  }
}

function remove(id) {
  $q.dialog({
    title: 'Eliminar cita',
    message: '¿Seguro que deseas eliminar esta cita?',
    persistent: true,
    ok: {
      label: 'Eliminar',
      color: 'negative',
      unelevated: true
    },
    cancel: {
      label: 'Cancelar',
      color: 'grey-7',
      flat: true
    }
  }).onOk(async () => {
    try {
      await api.delete(`/citas/${id}`)

      $q.notify({
        type: 'positive',
        message: 'Cita eliminada correctamente'
      })

      await load()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: getErrorMessage(error)
      })
    }
  })
}

watch(
  () => route.query.fecha,
  async nuevaFecha => {
    if (nuevaFecha) {
      await Promise.all([
        loadClientes(),
        loadEmpleados(),
        loadServicios()
      ])

      openDialog(String(nuevaFecha))
      router.replace({ path: '/apps/aurea/citas' })
    }
  }
)

onMounted(async () => {
  await Promise.all([
    load(),
    loadClientes(),
    loadEmpleados(),
    loadServicios()
  ])

  if (route.query.fecha) {
    openDialog(String(route.query.fecha))
    router.replace({ path: '/apps/aurea/citas' })
  }
})
</script>

<style scoped>
.citas-page {
  min-height: 100vh;
  background: #faf7fb;
}

/* HERO */

.page-hero {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  border-radius: 28px;
  padding: 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 16px 40px rgba(233, 30, 99, 0.25);
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

/* BUSCADOR */

.buscador-card {
  border-radius: 22px;
  padding: 14px;
  background: #ffffff;
  box-shadow: 0 10px 28px rgba(156, 39, 176, 0.10);
  border: 1px solid #f3d6e5;
}

.buscador-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.buscador-input {
  flex: 1;
}

.buscador-input :deep(.q-field__control) {
  min-height: 48px;
  border-radius: 24px;
}

.buscador-badge {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
  font-weight: 900;
  padding: 10px 14px;
  white-space: nowrap;
}

/* FILTROS DE CITAS */

.filtros-citas-card {
  border-radius: 22px;
  padding: 14px;
  background: #ffffff;
  box-shadow: 0 10px 28px rgba(156, 39, 176, 0.10);
  border: 1px solid #f3d6e5;
}

.filtros-citas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.filtros-citas-title {
  color: #8a1248;
  font-size: 16px;
  font-weight: 950;
}

.filtros-citas-subtitle {
  color: #7a6f80;
  font-size: 12px;
  font-weight: 750;
  margin-top: 2px;
}

.filtro-activo-badge {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
  font-weight: 950;
  padding: 8px 12px;
}

.filtros-citas-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.filtro-cita-btn {
  border: 1px solid #efc4d8;
  background: #fff7fb;
  color: #8a1248;
  border-radius: 18px;
  padding: 12px 10px;
  min-height: 82px;
  cursor: pointer;
  font-weight: 900;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: all 0.2s ease;
}

.filtro-cita-btn .q-icon {
  font-size: 26px;
}

.filtro-cita-btn span {
  font-size: 13px;
  line-height: 1.1;
}

.filtro-cita-btn small {
  font-size: 12px;
  opacity: 0.82;
  font-weight: 950;
}

.filtro-cita-btn:hover,
.filtro-cita-btn.active {
  color: white;
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  border-color: transparent;
  box-shadow: 0 12px 28px rgba(233, 30, 99, 0.22);
  transform: translateY(-1px);
}

/* BOTONES */

.btn-glamur-white {
  background: white;
  color: #c2185b;
  font-weight: 900;
  border-radius: 16px;
  padding: 10px 18px;
  box-shadow: 0 10px 24px rgba(20, 10, 30, 0.18);
}

.btn-glamur {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
  font-weight: 900;
  border-radius: 16px;
  padding: 10px 18px;
  box-shadow: 0 10px 24px rgba(233, 30, 99, 0.25);
}

.btn-cancelar {
  background: #f2f2f5;
  color: #666;
  font-weight: 900;
  border-radius: 16px;
  padding: 10px 18px;
}

/* TABLA */

.tabla-glamur {
  border-radius: 24px;
  overflow: hidden;
  background: white;
  box-shadow: 0 14px 35px rgba(156, 39, 176, 0.12);
}

.tabla-glamur :deep(.q-table__middle) {
  overflow-x: auto;
}

.tabla-glamur :deep(.q-table thead tr) {
  background: linear-gradient(135deg, #fce4ec, #f3e5f5);
  color: #880e4f;
}

.tabla-glamur :deep(.q-table th) {
  font-weight: 900;
  font-size: 13px;
}

.tabla-glamur :deep(.q-table tbody tr:hover) {
  background: #fff0f6;
}

.estado-badge {
  padding: 6px 10px;
  font-weight: 800;
  text-transform: capitalize;
}

.acciones {
  display: flex;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
}

/* LISTA MÓVIL DE CITAS */

.citas-mobile-list {
  display: none;
}

.cita-mobile-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin: 18px 0 10px;
  padding: 12px 14px;
  border-radius: 18px;
  background: linear-gradient(135deg, #fff7fb, #f3e5f5);
  border: 1px solid #f3d6e5;
}

.cita-mobile-section-title {
  color: #8a1248;
  font-size: 15px;
  font-weight: 950;
}

.cita-mobile-section-subtitle {
  color: #7a6f80;
  font-size: 11px;
  font-weight: 750;
  margin-top: 2px;
}

.cita-mobile-section-badge {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
  font-weight: 950;
  padding: 8px 12px;
}

.section-hoy {
  background: linear-gradient(135deg, #fff1f7, #ffe3ef);
}

.section-proximas {
  background: linear-gradient(135deg, #f7f2ff, #efe3ff);
}

.section-anteriores {
  background: linear-gradient(135deg, #f7f7f7, #eeeeee);
}

.cita-hoy {
  border-left: 5px solid #e91e63;
}

.cita-proximas {
  border-left: 5px solid #9c27b0;
}

.cita-anteriores {
  border-left: 5px solid #9e9e9e;
  opacity: 0.92;
}

.cita-mobile-card {
  border-radius: 22px;
  padding: 14px;
  margin-bottom: 12px;
  background: white;
  border: 1px solid #f3d6e5;
  box-shadow: 0 10px 28px rgba(156, 39, 176, 0.10);
}

.cita-mobile-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.cita-mobile-cliente {
  color: #c2185b;
  font-size: 15px;
  font-weight: 950;
  line-height: 1.2;
}

.cita-mobile-telefono {
  color: #7a6f80;
  font-size: 12px;
  font-weight: 700;
  margin-top: 3px;
}

.cita-mobile-hora {
  min-width: 74px;
  padding: 9px 12px;
  border-radius: 16px;
  text-align: center;
  color: white;
  font-size: 20px;
  font-weight: 950;
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  box-shadow: 0 8px 18px rgba(233, 30, 99, 0.22);
}

.cita-mobile-fecha {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 10px;
  color: #6a536d;
  font-size: 12px;
  font-weight: 850;
}

.cita-mobile-servicio {
  color: #241329;
  font-size: 14px;
  font-weight: 950;
  margin-top: 10px;
}

.cita-mobile-empleado {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #7a6f80;
  font-size: 12px;
  font-weight: 750;
  margin-top: 5px;
}

.cita-mobile-info-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.cita-mobile-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid #f3d6e5;
}

.empty-mobile {
  text-align: center;
  color: #7a6f80;
  font-weight: 850;
}

/* MULTI SERVICIOS Y MULTI CITAS */

.selected-service-chip {
  margin: 3px;
  font-weight: 800;
}

.multi-servicios-box,
.multi-citas-box {
  border-radius: 22px;
  padding: 14px;
  background: #fff7fb;
  border: 1px solid #f7c9dc;
}

.multi-servicios-header,
.multi-citas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.multi-servicios-title,
.multi-citas-title {
  color: #8a1248;
  font-size: 15px;
  font-weight: 950;
}

.multi-servicios-subtitle,
.multi-citas-subtitle,
.multi-citas-help {
  color: #7a6f80;
  font-size: 12px;
  font-weight: 750;
  margin-top: 2px;
}

.multi-servicios-total {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
  font-weight: 950;
  padding: 8px 12px;
  white-space: nowrap;
}

.multi-servicios-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.multi-servicio-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  border-radius: 16px;
  padding: 10px 12px;
  background: white;
  border: 1px solid #f3d6e5;
}

.multi-servicio-name {
  color: #241329;
  font-size: 13px;
  font-weight: 950;
}

.multi-servicio-detail {
  color: #7a6f80;
  font-size: 11px;
  font-weight: 700;
  margin-top: 2px;
}

.multi-servicio-price {
  color: #2e7d32;
  font-size: 13px;
  font-weight: 950;
  white-space: nowrap;
}

.multi-citas-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.multi-cita-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
}

.multi-cita-delete {
  width: 42px;
  height: 42px;
}

.btn-add-multi-cita {
  align-self: flex-start;
  background: #ffffff;
  color: #c2185b;
  border-radius: 16px;
  font-weight: 900;
  border: 1px solid #f3d6e5;
}

/* FORMULARIO */

.form-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.form-field {
  width: 100%;
  margin: 0;
}

.form-field :deep(.q-field__control) {
  min-height: 58px;
  border-radius: 28px;
}

.form-field :deep(.q-field__prepend) {
  min-width: 42px;
  padding-right: 8px;
}

.form-field :deep(.q-field__append) {
  padding-left: 6px;
}

.form-field :deep(.q-field__marginal) {
  height: 58px;
}

.form-field :deep(.q-icon) {
  font-size: 25px;
}

.form-field :deep(.q-field__label) {
  font-size: 13px;
  line-height: 1.1;
}

.form-field :deep(.q-field__native),
.form-field :deep(.q-field__input),
.form-field :deep(input) {
  font-size: 16px;
  line-height: 1.25;
  font-weight: 500;
  color: #222;
  min-height: 24px;
}

.form-field :deep(.q-field__native span) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.input-readonly :deep(.q-field__control) {
  border-style: dashed;
}

.input-readonly :deep(.q-field__native) {
  color: #222;
}

/* DIALOGS DESKTOP */

.dialog-card,
.dialog-card-small,
.dialog-card-historial {
  border-radius: 24px;
  overflow: hidden;
}

.dialog-card {
  width: 620px;
  max-width: 96vw;
  height: auto;
  max-height: 92dvh;
}

.dialog-card-small {
  width: 440px;
  max-width: 96vw;
  height: auto;
  max-height: 92dvh;
}

.dialog-card-historial {
  width: 720px;
  max-width: 96vw;
  height: auto;
  max-height: 92dvh;
}

.dialog-card-main {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dialog-header {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
  flex: 0 0 auto;
  z-index: 3;
}

.dialog-body {
  background: #ffffff;
  padding: 22px;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.dialog-actions {
  padding: 14px 20px;
  background: white;
  border-top: 1px solid #eee;
  flex: 0 0 auto;
  z-index: 4;
  box-shadow: 0 -8px 18px rgba(20, 10, 30, 0.06);
}

.dialog-actions .q-btn {
  min-height: 46px;
}

.qr-box {
  text-align: center;
  padding: 12px;
  border: 1px dashed #e91e63;
  border-radius: 18px;
  background: #fff7fb;
}

.qr-img {
  width: 230px;
  max-width: 100%;
  border-radius: 14px;
}

.pago-mixto-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  border-radius: 20px;
  background: #fff7fb;
  border: 1px solid #f7c9dc;
}

.pago-mixto-title {
  color: #8a1248;
  font-size: 15px;
  font-weight: 950;
}

.pago-mixto-subtitle {
  color: #7a6f80;
  font-size: 12px;
  font-weight: 700;
  margin-top: -6px;
}

.pago-total-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 16px;
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
  font-weight: 900;
}

.pago-total-box strong {
  font-size: 18px;
}

/* MOBILE / TABLET */

@media (max-width: 900px) {
  .citas-page {
    padding: 10px;
  }

  .page-hero {
    padding: 20px;
    border-radius: 22px;
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
  }

  .page-hero .text-h4 {
    font-size: 28px;
  }

  .hero-actions {
    width: 100%;
    flex-direction: column;
  }

  .btn-glamur-white {
    width: 100%;
  }

  .tabla-glamur {
    border-radius: 20px;
  }

  .dialog-card,
  .dialog-card-small,
  .dialog-card-historial {
    width: 100%;
    max-width: 100%;
    height: 100dvh;
    max-height: 100dvh;
    border-radius: 0;
  }

  .dialog-header {
    min-height: 70px;
    padding: 16px 18px;
  }

  .dialog-header .text-h6 {
    font-size: 22px;
  }

  .dialog-body {
    flex: 1 1 auto !important;
    min-height: 0 !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    padding: 22px 30px 26px !important;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
  }

  .form-stack {
    gap: 14px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .form-field :deep(.q-field__control) {
    min-height: 62px;
    border-radius: 28px;
  }

  .form-field :deep(.q-field__marginal) {
    height: 62px;
  }

  .form-field :deep(.q-field__prepend) {
    min-width: 44px;
    padding-right: 8px;
  }

  .form-field :deep(.q-field__append) {
    padding-left: 6px;
  }

  .form-field :deep(.q-icon) {
    font-size: 27px;
  }

  .form-field :deep(.q-field__label) {
    font-size: 13px;
    line-height: 1.1;
  }

  .form-field :deep(.q-field__native),
  .form-field :deep(.q-field__input),
  .form-field :deep(input) {
    font-size: 18px;
    line-height: 1.2;
    font-weight: 600;
    padding-top: 4px;
  }

  .input-readonly :deep(.q-field__native),
  .input-readonly :deep(input) {
    white-space: normal;
    overflow-wrap: anywhere;
  }

  .dialog-actions {
    flex: 0 0 auto !important;
    padding: 12px 30px calc(14px + env(safe-area-inset-bottom)) !important;
    gap: 12px;
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
  }

  .dialog-actions .q-btn {
    flex: 1;
    min-height: 56px;
    font-size: 14px;
    border-radius: 18px;
  }

  .acciones .q-btn {
    margin-bottom: 4px;
  }
}

@media (max-width: 700px) {
  .filtros-citas-header {
    align-items: flex-start;
  }

  .filtros-citas-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .filtro-cita-btn {
    min-height: 74px;
    padding: 10px 8px;
  }

  .filtro-cita-btn .q-icon {
    font-size: 24px;
  }

  .tabla-desktop {
    display: none;
  }

  .citas-mobile-list {
    display: block;
  }

  .buscador-row {
    flex-direction: column;
    align-items: stretch;
  }

  .buscador-badge {
    width: 100%;
    justify-content: center;
    text-align: center;
  }

  .multi-servicios-header,
  .multi-citas-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .multi-cita-row {
    grid-template-columns: 1fr;
  }

  .multi-cita-delete {
    width: 100%;
    border-radius: 16px;
  }

  .btn-add-multi-cita {
    width: 100%;
  }

  .service-category-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .service-category-card {
    min-height: 76px;
    padding: 10px 6px;
  }

  .service-category-card .category-icon {
    font-size: 25px;
  }

  .service-category-card span {
    font-size: 11px;
  }

  .service-category-box {
    padding: 12px;
    margin-bottom: 12px;
  }
}

@media (max-width: 420px) {
  .dialog-body {
    padding: 20px 20px 24px !important;
  }

  .dialog-actions {
    padding-left: 20px !important;
    padding-right: 20px !important;
  }

  .form-field :deep(.q-field__control) {
    min-height: 60px;
  }

  .form-field :deep(.q-field__marginal) {
    height: 60px;
  }

  .form-field :deep(.q-field__native),
  .form-field :deep(.q-field__input),
  .form-field :deep(input) {
    font-size: 17px;
  }

  .dialog-actions .q-btn {
    min-height: 54px;
    font-size: 13px;
  }
}

/* Teléfono en horizontal: campos más bajos y scroll correcto */
@media (max-height: 520px) and (orientation: landscape) {
  .dialog-header {
    min-height: 56px;
    padding: 10px 18px;
  }

  .dialog-header .text-h6 {
    font-size: 20px;
  }

  .dialog-body {
    padding: 14px 26px 16px !important;
  }

  .form-stack {
    gap: 10px;
  }

  .form-field :deep(.q-field__control) {
    min-height: 52px;
    border-radius: 24px;
  }

  .form-field :deep(.q-field__marginal) {
    height: 52px;
  }

  .form-field :deep(.q-field__native),
  .form-field :deep(.q-field__input),
  .form-field :deep(input) {
    font-size: 16px;
  }

  .dialog-actions {
    padding-top: 8px !important;
    padding-bottom: calc(8px + env(safe-area-inset-bottom)) !important;
  }

  .dialog-actions .q-btn {
    min-height: 48px;
  }
}

/* CATEGORÍAS DENTRO DE NUEVA CITA */

.service-category-box {
  background: #fff7fb;
  border: 1px solid #f7c9dc;
  border-radius: 22px;
  padding: 14px;
  margin-bottom: 14px;
}

.category-title {
  color: #8a1248;
  font-weight: 900;
  font-size: 13px;
  margin-bottom: 10px;
}

.service-category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.service-category-card {
  border: 1px solid #efc4d8;
  background: #ffffff;
  border-radius: 18px;
  padding: 12px 8px;
  cursor: pointer;
  color: #8a1248;
  font-weight: 900;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 86px;
  transition: all 0.2s ease;
  text-align: center;
}

.service-category-card:hover,
.service-category-card.active {
  color: white;
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  border-color: transparent;
  box-shadow: 0 12px 28px rgba(233, 30, 99, 0.22);
  transform: translateY(-1px);
}

.service-category-card .category-icon {
  font-size: 28px;
}

.service-category-card span {
  font-size: 12px;
  line-height: 1.15;
}

.service-category-card small {
  font-size: 10px;
  opacity: 0.78;
  font-weight: 700;
}

/* ARREGLO GLOBAL PARA Q-DIALOG MAXIMIZADO EN CELULAR / TABLET */

:global(.q-dialog__inner--maximized) {
  padding: 0 !important;
  overflow: hidden !important;
}

:global(.q-dialog__inner--maximized > .q-card) {
  width: 100vw !important;
  max-width: 100vw !important;
  height: 100dvh !important;
  max-height: 100dvh !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
}
</style>