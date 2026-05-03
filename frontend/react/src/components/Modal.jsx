import { useEffect, useRef } from 'react'

/**
 * components/Modal.jsx — Modal de confirmación
 * FiaDOX · Abarrotes Virrey
 *
 * Migrado desde showModal() de app.js vanilla.
 * En la SPA vanilla el modal se inyectaba directamente en el DOM.
 * Aquí es un componente controlado: el padre decide si está abierto
 * mediante el prop `isOpen`.
 *
 * Props:
 *   isOpen       {boolean}   Controla si el modal es visible
 *   title        {string}    Título del modal
 *   body         {string}    Mensaje de confirmación
 *   confirmLabel {string}    Texto del botón de confirmar (default: "Confirmar")
 *   confirmClass {string}    Clase CSS del botón (default: "btn-danger")
 *   onConfirm    {function}  Callback al confirmar
 *   onCancel     {function}  Callback al cancelar o cerrar con ESC
 *
 * Uso:
 *   const [modalOpen, setModalOpen] = useState(false)
 *
 *   <Modal
 *     isOpen={modalOpen}
 *     title="Eliminar cliente"
 *     body="¿Seguro que quieres eliminar a Juan? Esta acción no se puede deshacer."
 *     confirmLabel="Sí, eliminar"
 *     onConfirm={handleDelete}
 *     onCancel={() => setModalOpen(false)}
 *   />
 */
export default function Modal({
  isOpen,
  title,
  body,
  confirmLabel = 'Confirmar',
  confirmClass = 'btn-danger',
  onConfirm,
  onCancel,
}) {
  const cancelRef = useRef(null)

  // Cerrar con tecla ESC — mismo comportamiento que la SPA vanilla
  useEffect(() => {
    if (!isOpen) return
    function handleKey(e) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onCancel])

  // Focus al botón Cancelar al abrir — accesibilidad y UX
  useEffect(() => {
    if (isOpen) cancelRef.current?.focus()
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-box">
        <h2 className="modal-title" id="modal-title">{title}</h2>
        <p className="modal-body">{body}</p>
        <div className="modal-actions">
          <button
            ref={cancelRef}
            className="btn btn-ghost"
            type="button"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            className={`btn ${confirmClass}`}
            type="button"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
