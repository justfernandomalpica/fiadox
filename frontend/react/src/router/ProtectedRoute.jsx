import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import Spinner from '../components/Spinner.jsx'

/**
 * router/ProtectedRoute.jsx — Guard de autenticación
 * FiaDOX · Abarrotes Virrey
 *
 * Migrado desde la función guard(renderFn, params) de app.js vanilla.
 *
 * Verifica la sesión PHP antes de renderizar cualquier ruta privada.
 * Mientras verifica → muestra spinner.
 * Sin sesión → redirige a /login.
 * Con sesión → renderiza el Outlet (la ruta solicitada).
 *
 * En la SPA vanilla, guard() llamaba api.checkSession() en cada navegación.
 * Aquí, useAuth() lo llama una vez al montar ProtectedRoute. Si la sesión
 * expira durante el uso, cada página lo detecta en su propio catch (err.status === 401)
 * y redirige a /login con navigate('/login').
 */
export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()

  // Todavía verificando la sesión con el servidor
  if (loading) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Spinner label="Verificando sesión…" />
      </div>
    )
  }

  // Sin sesión: redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Con sesión: renderizar la ruta solicitada
  return <Outlet />
}
