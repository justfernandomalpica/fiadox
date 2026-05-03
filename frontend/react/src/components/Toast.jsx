import { useEffect } from 'react'

/**
 * components/Toast.jsx — Notificación temporal
 * FiaDOX · Abarrotes Virrey
 *
 * Migrado desde showToast() de app.js vanilla.
 * El toast se muestra mientras `message` tenga valor.
 * Se auto-cierra después de `duration` ms llamando a `onClose`.
 *
 * El estado del toast vive en AppLayout, que lo pasa a este componente.
 * Las páginas muestran el toast llamando a la función showToast del layout
 * (pasada por prop o por contexto según se prefiera — ver AppLayout).
 *
 * Props:
 *   message  {string|null}  Texto a mostrar. null = no renderiza.
 *   duration {number}       Milisegundos hasta auto-cerrar (default: 4000)
 *   onClose  {function}     Callback para limpiar el mensaje en el padre
 *
 * Uso (desde AppLayout):
 *   <Toast message={toastMsg} onClose={() => setToastMsg(null)} />
 */
export default function Toast({ message, duration = 4000, onClose }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [message, duration, onClose])

  if (!message) return null

  return (
    <div id="app-toast" className="toast" role="alert">
      {message}
    </div>
  )
}
