import { useNavigate } from 'react-router-dom'

/**
 * components/ClientRow.jsx — Fila de un cliente en la lista
 * FiaDOX · Abarrotes Virrey
 *
 * Migrado desde la función clientRow(c) de app.js vanilla.
 * Extraído como componente propio para mantener ClientsPage limpio.
 *
 * Props:
 *   client {object} { id, name, phone? }
 *
 * Uso (desde ClientsPage):
 *   {clients.map(c => <ClientRow key={c.id} client={c} />)}
 */
export default function ClientRow({ client }) {
  const navigate = useNavigate()

  return (
    <article className="client-row" role="listitem">
      <div className="client-info">
        <span className="client-name">{client.name}</span>
        {client.phone && (
          <span className="client-phone">📞 {client.phone}</span>
        )}
      </div>
      <div className="client-actions">
        <button
          className="btn btn-secondary"
          type="button"
          onClick={() => navigate(`/clientes/${client.id}`)}
        >
          Ver cliente
        </button>
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => navigate(`/clientes/${client.id}/nueva-transaccion`)}
        >
          Nueva transacción
        </button>
      </div>
    </article>
  )
}
