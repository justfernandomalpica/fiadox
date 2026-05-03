/**
 * components/Pagination.jsx — Paginación simple
 * FiaDOX · Abarrotes Virrey
 *
 * Migrado desde renderPagination() de app.js vanilla.
 *
 * La lógica de "¿hay página siguiente?" es la misma que en la SPA:
 * si el backend retornó exactamente `perPage` resultados, asumimos que
 * puede haber más. Si retornó menos, no hay siguiente página.
 *
 * Props:
 *   page     {number}   Página actual (base 1)
 *   count    {number}   Cantidad de resultados recibidos en esta página
 *   perPage  {number}   Tamaño de página (default 10)
 *   onPrev   {function} Callback al ir a página anterior
 *   onNext   {function} Callback al ir a página siguiente
 *
 * Uso:
 *   <Pagination
 *     page={page}
 *     count={clients.length}
 *     onPrev={() => setPage(p => p - 1)}
 *     onNext={() => setPage(p => p + 1)}
 *   />
 */
export default function Pagination({ page, count, perPage = 10, onPrev, onNext }) {
  const hasPrev = page > 1
  const hasNext = count === perPage

  // Si no hay nada que paginar, no renderizar el componente
  if (!hasPrev && !hasNext) return null

  return (
    <div className="pagination" aria-label="Paginación">
      <button
        className="btn btn-secondary"
        type="button"
        disabled={!hasPrev}
        onClick={onPrev}
      >
        ← Anterior
      </button>

      <span className="page-info">Página {page}</span>

      <button
        className="btn btn-secondary"
        type="button"
        disabled={!hasNext}
        onClick={onNext}
      >
        Siguiente →
      </button>
    </div>
  )
}
