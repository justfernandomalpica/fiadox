import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../services/api.js'
import { formatApiError } from '../utils/errors.js'
import Alert from '../components/Alert.jsx'

/**
 * pages/NewClientPage.jsx — Crear nuevo cliente
 * FiaDOX · Abarrotes Virrey
 *
 * Migrado desde renderNewClient() de app.js vanilla.
 *
 * Flujo (idéntico al original):
 *   1. Validación frontend: nombre obligatorio, primer fiado > 0.
 *   2. POST /api/clients → obtiene el ID del cliente creado.
 *   3. POST /api/transactions → crea el primer cargo con ese ID.
 *   4. Navegar al detalle del cliente recién creado.
 *
 * Si el paso 1 falla, el paso 2 no se ejecuta.
 * Si el paso 2 falla, el cliente ya existe pero sin transacción.
 * Ambos errores se muestran en pantalla.
 */
export default function NewClientPage() {
  const navigate = useNavigate()

  const [name,    setName]    = useState('')
  const [phone,   setPhone]   = useState('')
  const [debt,    setDebt]    = useState('')
  const [note,    setNote]    = useState('')
  const [error,   setError]   = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    // Validación frontend — mismo criterio que la SPA vanilla
    const errors = []
    if (!name.trim()) errors.push('El nombre del cliente es obligatorio.')
    if (!debt.trim()) errors.push('El primer fiado es obligatorio.')
    else if (isNaN(parseFloat(debt)) || parseFloat(debt) <= 0)
      errors.push('El primer fiado debe ser un número mayor a 0.')

    if (errors.length > 0) {
      setError(errors.length === 1 ? errors[0] : errors)
      return
    }

    setLoading(true)
    try {
      // Paso 1: crear el cliente
      const clientRes = await api.createClient({ name: name.trim(), phone: phone.trim() })
      const clientId  = clientRes.data.client.id

      // Paso 2: crear el primer cargo
      await api.createTransaction({
        clientId,
        type: 'charge',
        amount: parseFloat(debt),
        description: note.trim() || 'Primer fiado',
      })

      // Navegar al detalle del cliente recién creado
      navigate(`/clientes/${clientId}`)
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
        <Link to="/clientes" className="btn btn-ghost">← Volver</Link>
      </div>

      <div className="form-card">
        <h1 className="form-title">Nuevo cliente</h1>

        <Alert type="error" message={error} />

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="nc-name">
              Nombre del cliente
              <span className="required-mark" aria-hidden="true">*</span>
            </label>
            <input
              id="nc-name"
              type="text"
              name="name"
              autoComplete="name"
              required
              placeholder="Nombre completo"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="nc-phone">Teléfono</label>
            <input
              id="nc-phone"
              type="tel"
              name="phone"
              autoComplete="tel"
              placeholder="10 dígitos (opcional)"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
            <span className="form-hint">Solo números. Opcional.</span>
          </div>

          <div className="form-group">
            <label htmlFor="nc-debt">
              Primer fiado
              <span className="required-mark" aria-hidden="true">*</span>
            </label>
            <input
              id="nc-debt"
              type="number"
              name="firstDebt"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              required
              value={debt}
              onChange={e => setDebt(e.target.value)}
            />
            <span className="form-hint">Monto inicial del primer cargo al cliente.</span>
          </div>

          <div className="form-group">
            <label htmlFor="nc-note">Nota (opcional)</label>
            <input
              id="nc-note"
              type="text"
              name="description"
              placeholder="Descripción del primer cargo…"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-block"
            disabled={loading}
          >
            {loading ? 'Guardando…' : 'Guardar cliente'}
          </button>
        </form>
      </div>
    </main>
  )
}
