import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api.js'
import { formatApiError } from '../utils/errors.js'
import { formatMXN } from '../utils/formatters.js'
import Spinner from '../components/Spinner.jsx'
import Alert from '../components/Alert.jsx'

/**
 * pages/SummaryPage.jsx — Resumen global de fiados
 * FiaDOX · Abarrotes Virrey
 *
 * Migrado desde renderSummary() + loadTransactionsSummary() de app.js vanilla.
 * Muestra el balance total de todos los clientes: fiado, pagado y pendiente.
 */
export default function SummaryPage() {
  const navigate = useNavigate()

  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    async function loadSummary() {
      try {
        const res = await api.getTransactionsSummary()
        setSummary(res.data ?? {})
      } catch (err) {
        if (err.status === 401) { navigate('/login'); return }
        setError(formatApiError(err))
      } finally {
        setLoading(false)
      }
    }
    loadSummary()
  }, [navigate])

  return (
    <main className="page">
      <div className="back-bar">
        <Link to="/clientes" className="btn btn-ghost">← Volver a clientes</Link>
      </div>

      <div className="section-header">
        <div>
          <h1 className="section-title">Resumen global</h1>
          <p className="section-subtitle">Balance total de fiados</p>
        </div>
      </div>

      {loading && <Spinner label="Cargando resumen…" />}
      {!loading && error && <Alert type="error" message={error} />}

      {!loading && !error && summary && (
        <section className="detail-card" aria-label="Resumen global de transacciones">
          <div className="balance-grid" aria-label="Balance total de fiados">
            <div className="balance-item">
              <div className="balance-label">Total fiado</div>
              <div className="balance-value">{formatMXN(summary['Total fiado'] ?? 0)}</div>
            </div>
            <div className="balance-item">
              <div className="balance-label">Total pagado</div>
              <div className="balance-value">{formatMXN(summary['Total pagado'] ?? 0)}</div>
            </div>
            <div className="balance-item highlight">
              <div className="balance-label">Gran total</div>
              <div className="balance-value">{formatMXN(summary['Gran total'] ?? 0)}</div>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
