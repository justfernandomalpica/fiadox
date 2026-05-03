import { formatMXN, formatDateShort, txLabel } from '../utils/formatters.js'

/**
 * components/TransactionRow.jsx — Fila de una transacción
 * FiaDOX · Abarrotes Virrey
 *
 * Migrado desde la función txRow(tx) de app.js vanilla.
 * Extraído como componente propio para mantener ClientDetailPage limpio.
 *
 * Props:
 *   tx {object} { id, type, amount, description?, time }
 *
 * Uso (desde ClientDetailPage):
 *   {transactions.map(tx => <TransactionRow key={tx.id} tx={tx} />)}
 */
export default function TransactionRow({ tx }) {
  const isCharge = tx.type === 'charge'
  const label    = txLabel(tx.type)
  const badge    = isCharge ? 'tx-charge' : 'tx-payment'
  const amtClass = isCharge ? 'charge' : 'payment'

  return (
    <article className="tx-row" role="listitem">
      <div>
        <span
          className={`tx-type-badge ${badge}`}
          aria-label={`Tipo: ${label}`}
        >
          {isCharge ? '↑' : '↓'} {label}
        </span>
      </div>
      <div className="tx-info">
        <div className="tx-date">{formatDateShort(tx.time)}</div>
        {tx.description && (
          <div className="tx-description">{tx.description}</div>
        )}
      </div>
      <div
        className={`tx-amount ${amtClass}`}
        aria-label={`${label} de ${formatMXN(tx.amount)}`}
      >
        {isCharge ? '+' : '−'}{formatMXN(tx.amount)}
      </div>
    </article>
  )
}
