/**
 * components/Spinner.jsx — Indicador de carga
 * FiaDOX · Abarrotes Virrey
 *
 * Reemplaza el HTML inline <div class="spinner-wrap">...</div>
 * que se repetía en cada vista de la SPA vanilla.
 *
 * Uso:
 *   <Spinner />
 *   <Spinner label="Cargando clientes…" />
 */
export default function Spinner({ label = 'Cargando…' }) {
  return (
    <div className="spinner-wrap" aria-live="polite" aria-label={label}>
      <div className="spinner" role="status"></div>
      <p>{label}</p>
    </div>
  )
}
