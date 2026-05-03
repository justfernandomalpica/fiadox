import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api.js'
import { formatApiError } from '../utils/errors.js'
import Spinner from '../components/Spinner.jsx'
import Alert from '../components/Alert.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Pagination from '../components/Pagination.jsx'
import ClientRow from '../components/ClientRow.jsx'

/**
 * pages/ClientsPage.jsx — Lista de clientes
 * FiaDOX · Abarrotes Virrey
 *
 * Migrado desde renderClients() + loadClients() + attachClientSearch()
 * de app.js vanilla.
 *
 * Estado local:
 *   clients  → array de clientes de la página actual
 *   page     → página actual de paginación (base 1)
 *   search   → texto del campo de búsqueda (lo que el usuario escribe)
 *   name     → término de búsqueda activo (se aplica al hacer clic o Enter)
 *   loading  → true mientras se espera la respuesta del backend
 *   error    → mensaje de error del backend, o null
 */
export default function ClientsPage() {
  const [clients, setClients] = useState([])
  const [page,    setPage]    = useState(1)
  const [search,  setSearch]  = useState('')   // valor del input
  const [name,    setName]    = useState('')   // búsqueda activa (aplicada)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  // Cargar clientes cuando cambia la página o el término de búsqueda activo
  const loadClients = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.getClients({ page, perPage: 10, name })
      setClients(res.data?.clients ?? [])
    } catch (err) {
      // 404 = sin resultados (el backend retorna 404 cuando no hay clientes)
      if (err.status === 404) {
        setClients([])
      } else {
        setError(formatApiError(err))
      }
    } finally {
      setLoading(false)
    }
  }, [page, name])

  useEffect(() => {
    loadClients()
  }, [loadClients])

  function applySearch() {
    setPage(1)
    setName(search)
  }

  function clearSearch() {
    setSearch('')
    setPage(1)
    setName('')
  }

  function handleSearchKeyDown(e) {
    if (e.key === 'Enter') applySearch()
  }

  return (
    <main className="page">
      <div className="section-header">
        <div>
          <h1 className="section-title">Clientes</h1>
        </div>
        <div className="section-actions">
          <Link to="/resumen" className="btn btn-secondary">
            Resumen global
          </Link>
          <Link to="/nuevo-cliente" className="btn btn-primary btn-lg">
            ＋ Nuevo cliente
          </Link>
        </div>
      </div>

      <div className="search-bar" role="search">
        <label htmlFor="search-input" className="sr-only">
          Buscar cliente por nombre
        </label>
        <input
          id="search-input"
          type="text"
          placeholder="Buscar por nombre…"
          autoComplete="off"
          aria-label="Buscar cliente por nombre"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={handleSearchKeyDown}
        />
        <button
          className="btn btn-secondary"
          type="button"
          onClick={applySearch}
        >
          Buscar
        </button>
        <button
          className="btn btn-ghost"
          type="button"
          title="Limpiar búsqueda"
          onClick={clearSearch}
        >
          ✕
        </button>
      </div>

      {/* Contenido principal: spinner, error, lista vacía o clientes */}
      {loading && <Spinner label="Cargando clientes…" />}

      {!loading && error && <Alert type="error" message={error} />}

      {!loading && !error && clients.length === 0 && (
        <EmptyState message="Aún no hay nada que mostrar." />
      )}

      {!loading && !error && clients.length > 0 && (
        <>
          <div className="clients-list" role="list" aria-label="Lista de clientes">
            {clients.map(c => (
              <ClientRow key={c.id} client={c} />
            ))}
          </div>

          <Pagination
            page={page}
            count={clients.length}
            onPrev={() => setPage(p => p - 1)}
            onNext={() => setPage(p => p + 1)}
          />
        </>
      )}
    </main>
  )
}
