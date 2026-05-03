/**
 * utils/errors.js — Normalización de errores del backend
 * FiaDOX · Abarrotes Virrey
 *
 * El backend puede retornar errores en dos formatos:
 *   1. String simple:  { error: "Mensaje de error" }
 *   2. Objeto agrupado: { error: { "Argumento Inválido": ["msg1", "msg2"] } }
 *
 * Esta función normaliza ambos casos a un string o array de strings
 * que los componentes Alert pueden renderizar directamente.
 */

/**
 * Recibe el Error lanzado por services/api.js y retorna:
 *   - Un string simple si hay un solo mensaje.
 *   - Un array de strings si hay múltiples mensajes de validación.
 */
export function formatApiError(err) {
  if (!err) return 'Error desconocido.'

  // El payload original trae un objeto de errores detallados de validación
  if (err.data?.error && typeof err.data.error === 'object') {
    const groups = err.data.error
    const items = Object.entries(groups)
      .flatMap(([, msgs]) => (Array.isArray(msgs) ? msgs : [msgs]))

    return items.length === 1 ? items[0] : items
  }

  return err.message || 'Error desconocido.'
}
