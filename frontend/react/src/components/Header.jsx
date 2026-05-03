import { useTheme } from '../hooks/useTheme.js'

/**
 * components/Header.jsx — Header de la aplicación autenticada
 * FiaDOX · Abarrotes Virrey
 *
 * Migrado desde renderHeader() + mountHeader() de app.js vanilla.
 * Recibe `onLogout` como prop desde AppLayout, que coordina el modal
 * de confirmación antes de ejecutar el logout real.
 *
 * Props:
 *   onLogout {function} Callback que abre el modal de confirmación de logout
 *
 * Uso (desde AppLayout):
 *   <Header onLogout={() => setLogoutModalOpen(true)} />
 */
export default function Header({ onLogout }) {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <header className="app-header" role="banner">
      <div className="header-inner">
        <div className="header-brand">
          <span className="brand-name">FiaDOX</span>
          <span className="brand-store">Abarrotes Virrey</span>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-ghost theme-btn"
            type="button"
            onClick={toggle}
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            title="Cambiar modo de color"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={onLogout}
            aria-label="Cerrar sesión"
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  )
}
