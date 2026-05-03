import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api.js'
import { formatApiError } from '../utils/errors.js'
import Alert from '../components/Alert.jsx'

/**
 * pages/LoginPage.jsx — Pantalla de inicio de sesión
 * FiaDOX · Abarrotes Virrey
 *
 * Migrado desde renderLogin() de app.js vanilla.
 * No usa el AppLayout porque login no tiene header ni está protegida.
 *
 * Flujo:
 *   1. Usuario ingresa email y contraseña.
 *   2. Validación frontend: campos no vacíos.
 *   3. POST /auth/login con FormData.
 *   4. Éxito → navegar a /clientes.
 *   5. Error → mostrar mensaje del backend.
 */
export default function LoginPage() {
  const navigate = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState(null)
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    // Validación frontend — mismo criterio que la SPA vanilla
    if (!email.trim() || !password) {
      setError('Por favor ingresa tu correo y contraseña.')
      return
    }

    setLoading(true)
    try {
      await api.login(email.trim(), password)
      navigate('/clientes')
    } catch (err) {
      setError(formatApiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-wrap">
      <main className="login-card">
        <div className="login-header">
          <h1 className="login-title">FiaDOX</h1>
          <p className="login-subtitle">Abarrotes Virrey</p>
        </div>

        <Alert type="error" message={error} />

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">
              Correo electrónico
              <span className="required-mark" aria-hidden="true">*</span>
            </label>
            <input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              required
              placeholder="usuario@ejemplo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Contraseña
              <span className="required-mark" aria-hidden="true">*</span>
            </label>
            <input
              id="password"
              type="password"
              name="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-block"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
          </button>
        </form>
      </main>
    </div>
  )
}
