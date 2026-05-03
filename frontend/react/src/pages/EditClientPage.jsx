import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../services/api.js'
import { formatApiError } from '../utils/errors.js'
import Spinner from '../components/Spinner.jsx'
import Alert from '../components/Alert.jsx'

/**
 * pages/EditClientPage.jsx — Editar cliente existente
 * FiaDOX · Abarrotes Virrey
 *
 * Migrado desde renderEditClient() de app.js vanilla.
 *
 * Flujo:
 *   1. Al montar: GET /api/clients/:id para precargar nombre y teléfono.
 *   2. Al guardar: validación frontend + PUT /api/clients/:id con JSON.
 *   3. Éxito → navegar al detalle del cliente.
 */
export default function EditClientPage() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [name,         setName]         = useState('')
  const [phone,        setPhone]        = useState('')
  const [loadError,    setLoadError]    = useState(null)
  const [submitError,  setSubmitError]  = useState(null)
  const [loadLoading,  setLoadLoading]  = useState(true)
  const [saveLoading,  setSaveLoading]  = useState(false)

  // Precargar datos actuales del cliente
  useEffect(() => {
    async function loadClient() {
      try {
        const res = await api.getClient(id)
        setName(res.data.client.name ?? '')
        setPhone(res.data.client.phone ?? '')
      } catch (err) {
        if (err.status === 401) { navigate('/login'); return }
        setLoadError(formatApiError(err))
      } finally {
        setLoadLoading(false)
      }
    }
    loadClient()
  }, [id, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError(null)

    if (!name.trim()) {
      setSubmitError('El nombre del cliente es obligatorio.')
      return
    }

    setSaveLoading(true)
    try {
      await api.updateClient(id, { name: name.trim(), phone: phone.trim() })
      navigate(`/clientes/${id}`)
    } catch (err) {
      if (err.status === 401) { navigate('/login'); return }
      setSubmitError(formatApiError(err))
    } finally {
      setSaveLoading(false)
    }
  }

  return (
    <main className="page">
      <div className="back-bar">
        <Link to={`/clientes/${id}`} className="btn btn-ghost">← Volver al cliente</Link>
      </div>

      <div className="form-card">
        <h1 className="form-title">Editar cliente</h1>

        {loadLoading && <Spinner />}
        {!loadLoading && loadError && <Alert type="error" message={loadError} />}

        {!loadLoading && !loadError && (
          <>
            <Alert type="error" message={submitError} />

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="edit-name">
                  Nombre del cliente
                  <span className="required-mark" aria-hidden="true">*</span>
                </label>
                <input
                  id="edit-name"
                  type="text"
                  name="name"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-phone">Teléfono</label>
                <input
                  id="edit-phone"
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  placeholder="Solo números (opcional)"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg btn-block"
                disabled={saveLoading}
              >
                {saveLoading ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  )
}
