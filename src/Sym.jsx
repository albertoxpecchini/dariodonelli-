import { symbolByName } from './symbols.jsx'

/**
 * Un simbolo di src/symbols.jsx per nome: griglia di 32 unità,
 * tratto currentColor. Decorativo: il testo accanto dice già tutto, quindi
 * è nascosto ai lettori di schermo.
 */
export function Sym({ name, className = '', ...props }) {
  const symbol = symbolByName[name]
  if (!symbol) return null
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`sym ${className}`}
      data-sym={name}
      {...props}
    >
      {symbol.draw}
    </svg>
  )
}
