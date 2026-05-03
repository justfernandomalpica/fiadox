/**
 * components/EmptyState.jsx — Estado vacío
 * FiaDOX · Abarrotes Virrey
 *
 * Migrado desde la función emptyState(msg) de app.js vanilla.
 * Se muestra cuando una lista no tiene resultados.
 *
 * Uso:
 *   <EmptyState message="Aún no hay nada que mostrar." />
 *   <EmptyState message="Este cliente no tiene transacciones aún." />
 */
export default function EmptyState({ message }) {
  return (
    <div className="empty-state" role="status">
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
      <p>{message}</p>
    </div>
  )
}
