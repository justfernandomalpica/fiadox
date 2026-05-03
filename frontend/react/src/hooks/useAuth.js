import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api.js'

/**
 * hooks/useAuth.js — Estado de autenticación
 * FiaDOX · Abarrotes Virrey
 *
 * Encapsula la lógica de sesión que en la SPA vanilla vivía repartida entre:
 *   - api.checkSession() en app.js
 *   - La función guard() del router
 *   - confirmLogout() en app.js
 *
 * Expone:
 *   - isAuthenticated {boolean|null}  null = todavía verificando
 *   - loading         {boolean}       true mientras se verifica la sesión
 *   - logout          {function}      cierra sesión y redirige a /login
 *
 * Uso:
 *   const { isAuthenticated, loading, logout } = useAuth()
 *
 * Nota: Este hook verifica la sesión UNA vez al montar el componente que lo use.
 * El guard de rutas (ProtectedRoute) es quien lo llama para decidir si renderiza
 * o redirige. Las páginas individuales no necesitan llamarlo directamente.
 */
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.checkSession()
      .then(ok => setIsAuthenticated(ok))
      .finally(() => setLoading(false))
  }, [])

  async function logout() {
    try {
      await api.logout()
    } catch {
      // Si el logout falla en el servidor, salimos de todas formas.
      // Mismo comportamiento que la SPA vanilla.
    }
    navigate('/login')
  }

  return { isAuthenticated, loading, logout }
}
