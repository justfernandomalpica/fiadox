import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// Aplicar el tema guardado ANTES de que React monte cualquier componente.
// Esto evita el parpadeo visual (flash) entre tema claro y oscuro al cargar.
// Lo mismo que hacía applyTheme(getTheme()) en el bootstrap de app.js vanilla.
const savedTheme = localStorage.getItem('fiadox-theme') || 'light'
document.documentElement.setAttribute('data-theme', savedTheme)

createRoot(document.getElementById('app')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
