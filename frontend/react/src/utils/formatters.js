/**
 * utils/formatters.js — Funciones puras de formato
 * FiaDOX · Abarrotes Virrey
 *
 * Migradas desde app.js vanilla. Sin dependencias externas.
 * En React no se necesita escapeHtml(): JSX escapa el contenido automáticamente.
 */

/** Formatea un número como moneda mexicana: $1,234.00 */
export function formatMXN(value) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(value ?? 0)
}

/**
 * Convierte "2026-04-25 15:15:19" → "25/04/2026"
 * El backend retorna fechas en este formato desde MySQL.
 */
export function formatDateShort(str) {
  if (!str) return '—'
  const [date] = str.split(' ')
  const [y, m, d] = date.split('-')
  return `${d}/${m}/${y}`
}

/** Traduce el tipo de transacción del backend al español para la UI */
export function txLabel(type) {
  return type === 'payment' ? 'Pago' : 'Cargo'
}
