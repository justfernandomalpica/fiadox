/**
 * components/Alert.jsx — Alerta de feedback al usuario
 * FiaDOX · Abarrotes Virrey
 *
 * Reemplaza los <div class="alert alert-error"> que se construían
 * como strings HTML en cada vista de la SPA vanilla.
 *
 * El prop `message` puede ser:
 *   - string:   se muestra directamente
 *   - string[]: se muestra como lista <ul>
 *   - null/undefined/vacío: el componente no renderiza nada
 *
 * Uso:
 *   <Alert type="error" message={errorMsg} />
 *   <Alert type="warning" message="Sesión expirada." />
 *   <Alert type="success" message="Cliente guardado." />
 */
export default function Alert({ type = 'error', message }) {
  if (!message) return null

  const cssClass = {
    error:   'alert alert-error',
    success: 'alert alert-success',
    warning: 'alert alert-warning',
  }[type] ?? 'alert alert-error'

  const isArray = Array.isArray(message)

  return (
    <div className={cssClass} role="alert">
      {isArray ? (
        <ul>
          {message.map((m, i) => <li key={i}>{m}</li>)}
        </ul>
      ) : (
        message
      )}
    </div>
  )
}
