import { useEffect, useRef } from 'react'
import './viewer.css'

/* ---------------------------------------------------------------------------
   Visualizzatore delle tavole
   Il piano con zoom e spostamento, sotto la riga dati della tavola e
   l'elenco dei file. Per scelta dello studio non c'è la barra degli
   strumenti e i file non si scaricano: nessun collegamento all'originale,
   le voci dell'elenco sono bottoni e il menu del tasto destro sul piano è
   spento. Si ingrandisce con Ctrl + rotella, due dita o doppio clic; da
   tastiera + e −, 0 per adattare, frecce per cambiare tavola.
   Lo strumento vero (./viewer.js, con i lettori di DWG e PDF) si scarica
   a parte, quando il visualizzatore sta per entrare nello schermo.
   --------------------------------------------------------------------------- */

// Larghezza massima del foglio sullo schermo, in px CSS: DWG e PDF si
// ridisegnano nitidi a qualunque scala, un'immagine si ferma al quadruplo.
const MAX_DRAWN = 40000

const kindOf = (s) => (s.dwg ? 'dwg' : s.src.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image')

const pad2 = (n) => String(n).padStart(2, '0')

/** Riga dati: numero, scala, formato, tipo di file. */
const metaOf = (s, i, total) =>
  [`${s.tag || 'Tav.'} ${pad2(i + 1)} / ${pad2(total)}`, s.scale && `Scala ${s.scale}`, s.paper, kindOf(s) === 'image' ? null : kindOf(s).toUpperCase()].filter(Boolean)

function Item({ sheet, index, total }) {
  const kind = kindOf(sheet)
  return (
    <li>
      <button
        type="button"
        className="viewer__item"
        aria-current={index === 0 ? 'true' : undefined}
        data-viewer-go={sheet.id}
        data-kind={kind}
        data-src={sheet.src}
        data-thumb={sheet.thumb}
        data-w={sheet.width}
        data-h={sheet.height}
        data-max={kind === 'image' ? sheet.width * 4 : MAX_DRAWN}
        data-dwg={sheet.dwg || undefined}
        data-box={sheet.box ? sheet.box.join(',') : undefined}
        data-darken={sheet.darken ? '1' : undefined}
        data-paper={sheet.paper || undefined}
        data-page={sheet.page || undefined}
        data-title={sheet.title}
        data-alt={sheet.alt}
        data-note={sheet.note}
        data-meta={metaOf(sheet, index, total).join('|')}
      >
        <span className="viewer__item-n">
          {pad2(index + 1)} · {kind === 'image' ? 'Immagine' : kind.toUpperCase()}
        </span>
        <span className="viewer__item-title">{sheet.title}</span>
      </button>
    </li>
  )
}

/**
 * @param {{ sheets: object[], label?: string }} props
 *   `sheets`: le tavole, vedi `sheets` in content.js
 */
export default function SheetViewer({ sheets, label = 'Visualizzatore delle tavole' }) {
  const ref = useRef(null)
  const first = sheets[0]
  const total = sheets.length

  useEffect(() => {
    const root = ref.current
    if (!root) return
    let destroy = null
    let cancelled = false

    const start = () => {
      import('./viewer.js').then(({ setupViewer }) => {
        if (!cancelled) destroy = setupViewer(root)
      })
    }

    // Lo strumento si scarica solo quando il visualizzatore si avvicina.
    let observer = null
    if (typeof IntersectionObserver === 'undefined') start()
    else {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return
          observer.disconnect()
          start()
        },
        { rootMargin: '600px 0px' },
      )
      observer.observe(root)
    }

    return () => {
      cancelled = true
      observer?.disconnect()
      destroy?.()
    }
  }, [])

  return (
    <section className="viewer" data-viewer aria-label={label} ref={ref}>
      <div
        className="viewer__stage"
        data-viewer-stage
        tabIndex={0}
        role="region"
        aria-roledescription="visualizzatore"
        aria-label="Tavola: trascina per spostarti, Ctrl e rotella o due dita per ingrandire, frecce per cambiare tavola"
      >
        <div className="viewer__sheet" data-viewer-sheet style={{ '--ratio': `${first.width}/${first.height}` }}>
          <img
            className="viewer__img"
            src={first.thumb}
            width={first.width}
            height={first.height}
            alt={first.alt}
            decoding="async"
            loading="lazy"
            draggable="false"
            data-viewer-thumb
          />
        </div>
        <p className="viewer__status" data-viewer-status aria-live="polite" hidden />
        <p className="viewer__hint" data-viewer-hint aria-hidden="true">
          Ctrl + rotella per ingrandire
        </p>
      </div>

      <div className="viewer__foot">
        <div className="viewer__info">
          <p className="viewer__meta" data-viewer-meta>
            {metaOf(first, 0, total).map((m) => (
              <span key={m}>{m}</span>
            ))}
          </p>
          <p className="viewer__title" data-viewer-name>
            {first.title}
          </p>
          <p className="viewer__note" data-viewer-note>
            {first.note}
          </p>
        </div>

        <nav className="viewer__list" aria-label="Elenco delle tavole" data-viewer-list>
          <ol role="list">
            {sheets.map((sheet, i) => (
              <Item key={sheet.id} sheet={sheet} index={i} total={total} />
            ))}
          </ol>
        </nav>
      </div>

      <p className="sr-only" aria-live="polite" data-viewer-live />
    </section>
  )
}
