import { useEffect, useRef } from 'react'
import { avviaNuvola, luoghi, tacche } from './nuvola.js'
import { places } from './content.js'

/* ---------------------------------------------------------------------------
   Area di riferimento — la nuvola di punti nel vuoto
   Un nastro nero da bordo a bordo. Dentro, la nuvola in tre dimensioni
   (nuvola.js, WebGL): la sede all'origine, l'asse dei chilometri in linea
   d'aria, tutti i comuni e le frazioni della provincia come ammassi di
   punti. I nomi qui sotto sono elementi veri: il motore li porta sui
   centri e li accende quando ci si avvicina. Solo i paesi grandi e le
   città ne hanno uno; i paesini restano luce senza nome.
   --------------------------------------------------------------------------- */

const home = places.find((place) => place.studio)
const conNome = luoghi.filter((p) => p.nome)
const elenco = luoghi
  .filter((p) => p.comune)
  .slice()
  .sort((a, b) => a.km - b.km)

function DMark(props) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="dmark" {...props}>
      <path d="M2.5 2.5h5.5a5.5 5.5 0 0 1 0 11H2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

export default function Nuvola() {
  const root = useRef(null)

  useEffect(() => avviaNuvola(root.current), [])

  return (
    <div className="reach" ref={root}>
      <canvas className="reach__canvas" aria-hidden="true" />

      <div className="container reach__copy reveal">
        <span className="label">Area di riferimento</span>
        <h3 className="reach__title">Rivalta sul Mincio all&rsquo;origine, la provincia in linea d&rsquo;aria.</h3>
        <p className="reach__body">
          Ogni comune e frazione del Mantovano &egrave; un ammasso di punti, pi&ugrave; fitto dove il centro
          &egrave; pi&ugrave; grande. L&rsquo;asse misura la distanza dalla sede; avvicinandosi, i paesi grandi
          e le citt&agrave; si accendono con il nome.
        </p>
      </div>

      {/* I nomi e le tacche: il motore li sposta sulla proiezione dei punti. */}
      <div className="reach__labels" aria-hidden="true">
        {tacche.map((km) => (
          <span key={km} className="reach__tick" data-km={km}>
            {km} km
          </span>
        ))}
        <span className="reach__place reach__place--home">
          <span className="reach__pin">
            <DMark />
          </span>
          <span className="reach__text">
            <span className="reach__name">{home.name}</span>
            <span className="reach__km">Sede dello studio</span>
          </span>
        </span>
        {conNome.map((p) => (
          <span key={p.name} className={`reach__place${p.citta ? ' reach__place--citta' : ''}`} data-slot={p.slot}>
            <span className="reach__mark" />
            <span className="reach__text">
              <span className="reach__name">{p.name}</span>
              <span className="reach__km">{Math.round(p.km)} km</span>
            </span>
          </span>
        ))}
      </div>

      <p className="container reach__hint">
        <span className="reach__hint-dot" aria-hidden="true" />
        Avvicina il puntatore o il dito: i paesi grandi e le citt&agrave; si accendono con nome e distanza.
        Trascina per ruotare.
      </p>

      {/* L'elenco per chi legge senza vedere la nuvola. */}
      <ul className="reach__elenco" aria-label="Comuni della provincia di Mantova con la distanza in linea d'aria dalla sede">
        <li>
          <strong>{home.name}</strong>, sede dello studio
        </li>
        {elenco.map((p) => (
          <li key={p.name}>
            {p.name}, {Math.round(p.km)} km
          </li>
        ))}
      </ul>
    </div>
  )
}
