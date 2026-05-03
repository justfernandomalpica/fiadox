import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import Header from '../components/Header.jsx'
import Modal from '../components/Modal.jsx'
import Toast from '../components/Toast.jsx'

/**
 * layouts/AppLayout.jsx — Envuelve todas las rutas privadas
 * FiaDOX · Abarrotes Virrey
 *
 * Responsabilidades:
 *   1. Renderizar el Header en todas las páginas autenticadas.
 *   2. Gestionar el modal de confirmación de logout.
 *   3. Gestionar el Toast global (notificaciones temporales).
 *
 * El Toast se comparte con las páginas hijas a través de una prop
 * especial de React Router: el Outlet context.
 * Las páginas pueden mostrar un toast llamando:
 *   const { showToast } = useOutletContext()
 *
 * Uso del Outlet context en una página hija:
 *   import { useOutletContext } from 'react-router-dom'
 *   const { showToast } = useOutletContext()
 *   showToast('Cliente eliminado correctamente.')
 */
export default function AppLayout() {
  const { logout } = useAuth()
  const [logoutModalOpen, setLogoutModalOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState(null)

  function showToast(msg) {
    setToastMsg(msg)
  }

  async function handleConfirmLogout() {
    setLogoutModalOpen(false)
    await logout()
  }

  return (
    <>
      <Header onLogout={() => setLogoutModalOpen(true)} />

      {/* Renderiza la página activa según la ruta */}
      <Outlet context={{ showToast }} />

      {/* Modal de confirmación de logout — persiste sobre cualquier página */}
      <Modal
        isOpen={logoutModalOpen}
        title="Cerrar sesión"
        body="¿Seguro que quieres cerrar sesión?"
        confirmLabel="Sí, salir"
        confirmClass="btn-danger"
        onConfirm={handleConfirmLogout}
        onCancel={() => setLogoutModalOpen(false)}
      />

      {/* Toast global — aparece sobre todo el contenido */}
      <Toast
        message={toastMsg}
        onClose={() => setToastMsg(null)}
      />
    </>
  )
}
