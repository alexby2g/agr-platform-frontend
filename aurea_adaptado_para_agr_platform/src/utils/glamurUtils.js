export function toArray(payload, keys = []) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data

  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key]
  }

  return []
}

export function money(value) {
  const number = Number(value || 0)
  return number.toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

export function getErrorMessage(error, fallback = 'Ocurrió un error inesperado') {
  const data = error?.response?.data

  if (data?.errors) {
    return Object.values(data.errors).flat().join(' ')
  }

  return data?.message || data?.error || error?.message || fallback
}

export function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

export function formatDate(value) {
  if (!value) return 'Sin fecha'

  const parts = String(value).split('-')

  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return String(value)

  return date.toLocaleDateString('es-BO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

export function formatDateTime(value) {
  if (!value) return 'Sin fecha'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return String(value)

  return date.toLocaleString('es-BO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatTime(value) {
  if (!value) return 'Sin hora'
  return String(value).slice(0, 5)
}

export function estadoCita(cita) {
  const estado = normalizeText(cita?.estado || 'pendiente')

  if (estado.includes('cancel') || estado.includes('anulad')) {
    return {
      key: 'cancelada',
      label: 'Cancelada',
      color: 'negative',
      icon: 'cancel'
    }
  }

  if (
    estado.includes('conclu') ||
    estado.includes('final') ||
    estado.includes('realiz') ||
    estado.includes('complet')
  ) {
    return {
      key: 'concluida',
      label: 'Concluida',
      color: 'positive',
      icon: 'check_circle'
    }
  }

  return {
    key: 'pendiente',
    label: 'Pendiente',
    color: 'warning',
    icon: 'schedule'
  }
}

export function estadoPago(cita) {
  const pago = normalizeText(cita?.estado_pago || cita?.pago_estado || cita?.estadoPago || '')

  if (!pago) {
    return {
      key: 'sin_pago',
      label: 'Sin pago',
      color: 'grey',
      icon: 'payments'
    }
  }

  if (pago.includes('pag')) {
    return {
      key: 'pagado',
      label: 'Pagado',
      color: 'positive',
      icon: 'paid'
    }
  }

  return {
    key: 'pendiente',
    label: 'Pago pendiente',
    color: 'warning',
    icon: 'pending'
  }
}

export function percent(value, total) {
  const numberValue = Number(value || 0)
  const numberTotal = Number(total || 0)

  if (numberTotal <= 0) return 0

  return Math.min(numberValue / numberTotal, 1)
}

export function maxBy(items, field) {
  const max = Math.max(...(items || []).map(item => Number(item?.[field] || 0)), 0)
  return max <= 0 ? 1 : max
}

export function barPercent(value, max) {
  const numberValue = Number(value || 0)
  const numberMax = Number(max || 1)

  if (numberValue <= 0) return 4

  return Math.max((numberValue / numberMax) * 100, 8)
}
