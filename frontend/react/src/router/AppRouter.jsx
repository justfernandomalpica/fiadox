import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'

import ProtectedRoute        from './ProtectedRoute.jsx'
import AppLayout             from '../layouts/AppLayout.jsx'

import LoginPage             from '../pages/LoginPage.jsx'
import ClientsPage           from '../pages/ClientsPage.jsx'
import ClientDetailPage      from '../pages/ClientDetailPage.jsx'
import NewClientPage         from '../pages/NewClientPage.jsx'
import EditClientPage        from '../pages/EditClientPage.jsx'
import NewTransactionPage    from '../pages/NewTransactionPage.jsx'
import SummaryPage           from '../pages/SummaryPage.jsx'

/**
 * router/AppRouter.jsx — Mapa de rutas de FiaDOX
 * FiaDOX · Abarrotes Virrey
 *
 * Se usa HashRouter para mantener la misma estrategia de routing que la SPA
 * vanilla (#/clientes, #/clientes/:id, etc.).
 *
 * Ventaja del hash routing en este deploy:
 *   - Nginx solo ve "/" en todas las navegaciones (el # no llega al servidor).
 *   - No requiere ningún cambio en la configuración de DOM Cloud.
 *   - Compatible con el comportamiento actual en producción.
 *
 * Árbol de rutas:
 *   /login                              → LoginPage (pública)
 *   /                                   → ProtectedRoute
 *     /                                 → AppLayout (header + toast + modal logout)
 *       /clientes                       → ClientsPage
 *       /clientes/:id                   → ClientDetailPage
 *       /clientes/:id/nueva-transaccion → NewTransactionPage
 *       /clientes/:id/editar            → EditClientPage
 *       /nuevo-cliente                  → NewClientPage
 *       /resumen                        → SummaryPage
 *       *                               → redirige a /clientes
 *
 * Para agregar una ruta nueva:
 *   1. Crear src/pages/MiNuevaPagina.jsx
 *   2. Importarla aquí
 *   3. Agregar <Route path="/mi-ruta" element={<MiNuevaPagina />} />
 *      dentro del bloque de ProtectedRoute → AppLayout
 */
export default function AppRouter() {
  return (
    <HashRouter>
      <Routes>

        {/* Ruta pública */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas privadas: pasan por el guard de sesión */}
        <Route element={<ProtectedRoute />}>

          {/* Layout con header, toast y modal de logout */}
          <Route element={<AppLayout />}>
            <Route path="/clientes"                          element={<ClientsPage />} />
            <Route path="/clientes/:id"                      element={<ClientDetailPage />} />
            <Route path="/clientes/:id/nueva-transaccion"    element={<NewTransactionPage />} />
            <Route path="/clientes/:id/editar"               element={<EditClientPage />} />
            <Route path="/nuevo-cliente"                     element={<NewClientPage />} />
            <Route path="/resumen"                           element={<SummaryPage />} />

            {/* Cualquier ruta desconocida → lista de clientes */}
            <Route path="*" element={<Navigate to="/clientes" replace />} />
          </Route>

        </Route>

        {/* Raíz sin hash → lista de clientes (el guard decidirá si hay sesión) */}
        <Route index element={<Navigate to="/clientes" replace />} />

      </Routes>
    </HashRouter>
  )
}
