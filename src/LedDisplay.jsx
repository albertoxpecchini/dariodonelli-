import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from './motion.js'
import { CELL, ORDER, SEGMENTS, Y, cellsOf, fitCells, viewBoxOf } from './led.js'

/* ---------------------------------------------------------------------------
   Display a segmenti
   Display alfanumerici a sedici segmenti, come quelli degli strumenti da
   misura, accesi in Electric Sapphire (la geometria e il carattere sono in
   led.js). Tutti i segmenti ci sono sempre, spenti in blu notte.

   · LedDisplay è l'insegna del footer: i segmenti del testo si accendono
     uno alla volta mentre si scorre verso il fondo della pagina, e si
     spengono nello stesso ordine al contrario quando si torna su.
   · LedReadout è il display piccolo del visualizzatore: il testo è acceso
     per intero e lo aggiorna viewer.js con setLedText.
   --------------------------------------------------------------------------- */

function Segment({ name, ...props }) {
  return name === 'dp' ? <circle cx="64" cy={Y.b} r="4" {...props} /> : <polygon points={SEGMENTS[name]} {...props} />
}

/** Il testo in celle, con ogni segmento numerato nell'ordine in cui si accende. */
function layout(text) {
  let n = 0
  const cells = cellsOf(text).map((segs) => ORDER.filter((s) => segs.includes(s)).map((s) => ({ s, n: n++ })))
  return { cells, total: n }
}

/**
 * Quanti segmenti accendere: nessuno finché il display non è entrato
 * tutto nello schermo, tutti poco prima del fondo della pagina.
 */
function useCompose(ref, total) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReducedMotion()) {
      el.style.setProperty('--lit', String(total))
      return
    }
    let frame = 0
    const update = () => {
      frame = 0
      const y = window.scrollY
      const vh = window.innerHeight
      const start = y + el.getBoundingClientRect().bottom - vh
      const end = document.documentElement.scrollHeight - vh
      const span = Math.max(1, (end - start) * 0.9)
      const p = Math.min(1, Math.max(0, (y - start) / span))
      el.style.setProperty('--lit', (p * total).toFixed(2))
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ref, total])
}

export default function LedDisplay({ text }) {
  const ref = useRef(null)
  const { cells, total } = layout(text)
  useCompose(ref, total)

  return (
    <div className="led led--sign" ref={ref} role="img" aria-label={text}>
      <svg className="led__glass" viewBox={viewBoxOf(cells.length)} aria-hidden="true">
        <g className="led__off">
          {cells.map((_, i) => (
            <g key={i} transform={`translate(${i * CELL} 0)`}>
              {ORDER.map((s) => (
                <Segment key={s} name={s} />
              ))}
            </g>
          ))}
        </g>
        <g className="led__on">
          {cells.map((segs, i) => (
            <g key={i} transform={`translate(${i * CELL} 0)`}>
              {segs.map(({ s, n }) => (
                <Segment key={s} name={s} style={{ '--n': n }} />
              ))}
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}

/**
 * Display piccolo: `text` acceso per intero su `cells` celle, allineato a
 * destra come le cifre di uno strumento (`align="left"` per il contrario).
 * Ogni cella ha tutti i segmenti, accesi con la classe is-lit: così
 * viewer.js cambia il testo con setLedText senza ridisegnare. È
 * decorativo: il valore lo dà chi lo contiene.
 */
export function LedReadout({ text, cells: n = String(text).length, align = 'right' }) {
  const cells = fitCells(cellsOf(text), n, align)
  return (
    <span className="led led--readout" data-align={align} aria-hidden="true">
      <svg className="led__glass" viewBox={viewBoxOf(n)}>
        <g className="led__off">
          {cells.map((_, i) => (
            <g key={i} transform={`translate(${i * CELL} 0)`}>
              {ORDER.map((s) => (
                <Segment key={s} name={s} />
              ))}
            </g>
          ))}
        </g>
        <g className="led__on">
          {cells.map((lit, i) => (
            <g key={i} data-cell="" transform={`translate(${i * CELL} 0)`}>
              {ORDER.map((s) => (
                <Segment key={s} name={s} data-s={s} className={lit.includes(s) ? 'is-lit' : undefined} />
              ))}
            </g>
          ))}
        </g>
      </svg>
    </span>
  )
}
