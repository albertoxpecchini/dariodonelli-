import { useEffect, useRef } from 'react'
import { Key } from '../Key.jsx'
import { LedReadout } from '../LedDisplay.jsx'
import { Sym } from '../Sym.jsx'
import './viewer.css'

/* ---------------------------------------------------------------------------
   Visualizzatore delle tavole
   L'elenco dei file, un piano con zoom e spostamento, la riga dati della
   tavola e il file originale da scaricare. Il markup è completo anche nel
   prerender: senza JavaScript resta un elenco di miniature che aprono il
   file. Lo strumento vero (./viewer.js, con i lettori di DWG e PDF) si
   scarica a parte, quando il visualizzatore sta per entrare nello schermo.
   --------------------------------------------------------------------------- */

// Larghezza massima del foglio sullo schermo, in px CSS: DWG e PDF si
// ridisegnano nitidi a qualunque scala, un'immagine si ferma al quadruplo.
const MAX_DRAWN = 40000

const kindOf = (s) => (s.dwg ? 'dwg' : s.src.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image')

const fromLabel = { dwg: 'DWG originale', pdf: 'PDF originale' }

const pad2 = (n) => String(n).padStart(2, '0')

/** Riga dati: numero, scala, formato, file d'origine. */
const metaOf = (s, i, total) => [`${s.tag || 'Tav.'} ${pad2(i + 1)} / ${pad2(total)}`, s.scale && `Scala ${s.scale}`, s.paper, fromLabel[kindOf(s)]].filter(Boolean)

const fileLabelOf = (s) => `Scarica il ${kindOf(s) === 'image' ? 'file' : kindOf(s).toUpperCase()}`
const fileNameOf = (s) => s.src.split('/').pop()

function Item({ sheet, index, total }) {
  const kind = kindOf(sheet)
  return (
    <li>
      <a
        className="viewer__item"
        href={sheet.src}
        id={sheet.id}
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
        data-file-label={fileLabelOf(sheet)}
        data-download={fileNameOf(sheet)}
      >
        <span className="viewer__mini">
          <img src={sheet.mini} width="320" height={Math.round((320 * sheet.height) / sheet.width)} alt="" loading="lazy" decoding="async" />
        </span>
        <span className="viewer__item-n">
          {pad2(index + 1)} · {kind === 'image' ? 'Immagine' : kind.toUpperCase()}
        </span>
        <span className="viewer__item-title">{sheet.title}</span>
      </a>
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
            data-viewer-thumb
          />
        </div>
        <p className="viewer__status" data-viewer-status aria-live="polite" hidden />
        <p className="viewer__hint" data-viewer-hint aria-hidden="true">
          Ctrl + rotella per ingrandire
        </p>
      </div>

      <div className="viewer__panel">
        <nav className="viewer__list" aria-label="Elenco delle tavole" data-viewer-list>
          <ol>
            {sheets.map((sheet, i) => (
              <Item key={sheet.id} sheet={sheet} index={i} total={total} />
            ))}
          </ol>
        </nav>
      </div>

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
        <p className="viewer__links">
          <a className="viewer__link" href={first.src} download={fileNameOf(first)} data-viewer-file>
            <Sym name="tavola" />
            <span data-viewer-file-label>{fileLabelOf(first)}</span>
          </a>
        </p>
      </div>

      {/* La tastiera di una stazione totale: gli stessi tasti del sito,
          rettangolari con la scritta retroilluminata (PREC, SUCC) e tondi
          per −, + e lo schermo intero, e due display a LED come l'insegna
          in fondo alla pagina, per il numero della tavola e
          l'ingrandimento (viewer.js li aggiorna con setLedText). */}
      <div className="viewer__tools" role="group" aria-label="Strumenti del visualizzatore">
        <button className="viewer__tool" type="button" data-viewer-prev aria-label="Tavola precedente">
          <Key label="Prec" />
        </button>
        <span className="viewer__tool viewer__count" data-viewer-count aria-hidden="true">
          <LedReadout text={`${pad2(1)}/${pad2(total)}`} />
        </span>
        <button className="viewer__tool" type="button" data-viewer-next aria-label="Tavola successiva">
          <Key label="Succ" />
        </button>
        <button className="viewer__tool" type="button" data-viewer-out aria-label="Riduci">
          <Key round label="−" />
        </button>
        <button className="viewer__tool viewer__zoom" type="button" data-viewer-zoom aria-label="Adatta la tavola allo schermo">
          {/* cinque celle: l'ingrandimento arriva a quattro cifre */}
          <LedReadout text="100%" cells={5} />
        </button>
        <button className="viewer__tool" type="button" data-viewer-in aria-label="Ingrandisci">
          <Key round label="+" />
        </button>
        <button className="viewer__tool" type="button" data-viewer-full aria-label="Schermo intero" aria-pressed="false">
          <Key round>
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2.5 6V2.5H6M10 2.5h3.5V6M2.5 10v3.5H6M13.5 10v3.5H10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Key>
        </button>
      </div>

      <p className="sr-only" aria-live="polite" data-viewer-live />
    </section>
  )
}
