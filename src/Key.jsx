/**
 * Tasto: un cappuccio in alluminio anodizzato Electric Sapphire, spazzolato,
 * con lo smusso cromato e la scritta retroilluminata dai LED, dentro la
 * sua sede di metallo scuro. Rettangolare come i tasti di una tastiera
 * (`wide` per l'Invio, largo il doppio) oppure tondo come i pulsanti di
 * un computer (`round`). È tutto CSS: nitido a ogni misura.
 *
 * Il tasto è decorativo: il nome dell'azione lo porta sempre il link o il
 * pulsante che lo contiene.
 */
export function Key({ label, round = false, wide = false, className = '', children }) {
  const shape = round ? ' key--round' : wide ? ' key--wide' : ''
  return (
    <span className={`key${shape} ${className}`} aria-hidden="true">
      <span className="key__cap">
        <span className="key__label">{children ?? label}</span>
      </span>
    </span>
  )
}
