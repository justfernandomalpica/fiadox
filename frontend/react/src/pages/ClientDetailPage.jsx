import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link, useOutletContext } from 'react-router-dom'
import { api } from '../services/api.js'
import { formatApiError } from '../utils/errors.js'
import { formatMXN } from '../utils/formatters.js'
import Spinner from '../components/Spinner.jsx'
import Alert from '../components/Alert.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Pagination from '../components/Pagination.jsx'
import Modal from '../components/Modal.jsx'
import TransactionRow from '../components/TransactionRow.jsx'

/**
 * pages/ClientDetailPage.jsx — Detalle de cliente
 * FiaDOX · Abarrotes Virrey
 *
 * Migrado desde renderClientDetail() + loadClientDetail() + loadTransactions()
 * + deleteClient() de app.js vanilla.
 *
 * Hace dos llamadas independientes al backend:
 *   1. GET /api/clients/:id          → datos del cliente + balance
 *   2. GET /api/clients/:id/transactions → transacciones paginadas
 *
 * Estado local:
 *   client/balance → datos del cliente y su balance
 *   transactions   → lista de transacciones de la página actual
 *   txPage         → página actual de transacciones
 *   deleteModal    → controla visibilidad del modal de eliminación
 *   clientLoading / txLoading → estados de carga independientes
 *   clientError / txError     → errores independientes por sección
 */
export default function ClientDetailPage() {
  const { id }         = useParams()
  const navigate       = useNavigate()
  const { showToast }  = useOutletContext()

  // Datos del cliente
  const [client,        setClient]        = useState(null)
  const [balance,       setBalance]       = useState({})
  const [clientLoading, setClientLoading] = useState(true)
  const [clientError,   setClientError]   = useState(null)

  // Transacciones
  const [transactions, setTransactions] = useState([])
  const [txPage,       setTxPage]       = useState(1)
  const [txLoading,    setTxLoading]    = useState(true)
  const [txError,      setTxError]      = useState(null)

  // Modal de eliminación
  const [deleteModal, setDeleteModal] = useState(false)

  // ── Carga del cliente ──────────────────────────────────────────────────────

  useEffect(() => {
    async function loadClient() {
      setClientLoading(true)
      setClientError(null)
      try {
        const res = await api.getClient(id)
        setClient(res.data.client)
        setBalance(res.data.balance ?? {})
      } catch (err) {
        if (err.status === 401) { navigate('/login'); return }
        setClientError(formatApiError(err))
      } finally {
        setClientLoading(false)
      }
    }
    loadClient()
  }, [id, navigate])

  // ── Carga de transacciones ─────────────────────────────────────────────────

  const loadTransactions = useCallback(async () => {
    setTxLoading(true)
    setTxError(null)
    try {
      const res = await api.getClientTransactions(id, { page: txPage, perPage: 10 })
      setTransactions(res.data?.transactions ?? [])
    } catch (err) {
      if (err.status === 401) { navigate('/login'); return }
      if (err.status === 404) { setTransactions([]); return }
      setTxError(formatApiError(err))
    } finally {
      setTxLoading(false)
    }
  }, [id, txPage, navigate])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  // ── Eliminar cliente ───────────────────────────────────────────────────────

  async function handleDelete() {
    setDeleteModal(false)
    try {
      await api.deleteClient(id)
      navigate('/clientes')
    } catch (err) {
      if (err.status === 401) { navigate('/login'); return }
      showToast(`Error al eliminar: ${formatApiError(err)}`)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <main className="page">
      <div className="back-bar">
        <Link to="/clientes" className="btn btn-ghost">← Clientes</Link>
      </div>

      {/* Sección: datos del cliente */}
      {clientLoading && <Spinner />}
      {!clientLoading && clientError && <Alert type="error" message={clientError} />}
      {!clientLoading && !clientError && client && (
        <section className="detail-card" aria-label="Información del cliente">
          <h1 className="client-detail-name">{client.name}</h1>
          {client.phone && (
            <p className="client-detail-phone">📞 {client.phone}</p>
          )}

          <div className="balance-grid" aria-label="Resumen de cuenta">
            <div className="balance-item">
              <div className="balance-label">Total fiado</div>
              <div className="balance-value">{formatMXN(balance['Total fiado'] ?? 0)}</div>
            </div>
            <div className="balance-item">
              <div className="balance-label">Total pagado</div>
              <div className="balance-value">{formatMXN(balance['Total pagado'] ?? 0)}</div>
            </div>
            <div className="balance-item highlight">
              <div className="balance-label">Saldo pendiente</div>
              <div className="balance-value">{formatMXN(balance['Gran total'] ?? 0)}</div>
            </div>
          </div>

          <div className="detail-actions">
            <Link
              to={`/clientes/${client.id}/nueva-transaccion`}
              className="btn btn-primary btn-lg"
            >
              ＋ Agregar transacción
            </Link>
            <Link
              to={`/clientes/${client.id}/editar`}
              className="btn btn-secondary"
            >
              ✏️ Editar cliente
            </Link>
            <button
              className="btn btn-danger-outline"
              type="button"
              onClick={() => setDeleteModal(true)}
            >
              🗑 Eliminar cliente
            </button>
          </div>
        </section>
      )}

      {/* Sección: transacciones */}
      {!clientLoading && !clientError && (
        <>
          <h2 className="tx-section-title">Transacciones</h2>

          {txLoading && <Spinner label="Cargando transacciones…" />}
          {!txLoading && txError && <Alert type="error" message={txError} />}
          {!txLoading && !txError && transactions.length === 0 && (
            <EmptyState message="Este cliente no tiene transacciones aún." />
          )}
          {!txLoading && !txError && transactions.length > 0 && (
            <>
              <div className="tx-list" role="list" aria-label="Lista de transacciones">
                {transactions.map(tx => (
                  <TransactionRow key={tx.id} tx={tx} />
                ))}
              </div>
              <Pagination
                page={txPage}
                count={transactions.length}
                onPrev={() => setTxPage(p => p - 1)}
                onNext={() => setTxPage(p => p + 1)}
              />
            </>
          )}
        </>
      )}

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={deleteModal}
        title="Eliminar cliente"
        body={`¿Seguro que quieres eliminar a ${client?.name ?? 'este cliente'}? Esta acción no se puede deshacer.`}
        confirmLabel="Sí, eliminar"
        confirmClass="btn-danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal(false)}
      />
    </main>
  )
}
