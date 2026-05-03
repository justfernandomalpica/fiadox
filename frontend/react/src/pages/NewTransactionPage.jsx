import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../services/api.js'
import { formatApiError } from '../utils/errors.js'
import Alert from '../components/Alert.jsx'

/**
 * pages/NewTransactionPage.jsx — Crear nueva transacción
 * FiaDOX · Abarrotes Virrey
 *
 * Migrado desde renderNewTransaction() de app.js vanilla.
 *
 * Flujo:
 *   1. Al montar: GET /api/clients/:id para mostrar el nombre del cliente
 *      en el encabezado (solo UI, no es crítico si falla).
 *   2. Al guardar: validación frontend + POST /api/transactions con FormData.
 *   3. Éxito → navegar al detalle del cliente.
 */
export default function NewTransactionPage() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [clientName, setClientName] = useState('')
  const [type,       setType]       = useState('charge')
  const [amount,     setAmount]     = useState('')
  const [note,       setNote]       = useState('')
  const [error,      setError]      = useState(null)
  const [loading,    setLoading]    = useState(false)

  // Cargar nombre del cliente para mostrar en el encabezado
  useEffect(() => {
    api.getClient(id)
      .then(res => setClientName(res.data?.client?.name ?? ''))
      .catch(() => { /* No crítico: el formulario funciona igual sin el nombre */ })
  }, [id])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!amount.trim()) {
      setError('El monto es obligatorio.')
      return
    }
    const parsed = parseFloat(amount)
    if (isNaN(parsed) || parsed <= 0) {
      setError('El monto debe ser un número mayor a 0.')
      return
    }

    setLoading(true)
    try {
      await api.createTransaction({
        clientId: id,
        type,
        amount: parsed,
        description: note.trim(),
      })
      navigate(`/clientes/${id}`)
    } catch (err) {
      if (err.status === 401) { navigate('/login'); return }
      setError(formatApiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page">
      <div className="back-bar">
        <Link to={`/clientes/${id}`} className="btn btn-ghost">← Volver al cliente</Link>
      </div>

      <div className="form-card">
        <h1 className="form-title">Nueva transacción</h1>
        {clientName && (
          <div className="section-subtitle" style={{ marginBottom: '1.25rem' }}>
            Cliente: {clientName}
          </div>
        )}

        <Alert type="error" message={error} />

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="tx-type">
              Tipo de transacción
              <span className="required-mark" aria-hidden="true">*</span>
            </label>
            <select
              id="tx-type"
              name="type"
              required
              value={type}
              onChange={e => setType(e.target.value)}
            >
              <option value="charge">Cargo (fiado)</option>
              <option value="payment">Pago</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="tx-amount">
              Monto
              <span className="required-mark" aria-hidden="true">*</span>
            </label>
            <input
              id="tx-amount"
              type="number"
              name="amount"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              required
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="tx-note">Nota (opcional)</label>
            <input
              id="tx-note"
              type="text"
              name="description"
              placeholder="Descripción de la transacción…"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-block"
            disabled={loading}
          >
            {loading ? 'Guardando…' : 'Guardar transacción'}
          </button>
        </form>
      </div>
    </main>
  )
}
