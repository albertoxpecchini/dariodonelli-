/* ---------------------------------------------------------------------------
   Sfondo — la lastra che scorre, per i browser senza scroll-timeline
   Dove animation-timeline: scroll() esiste, è il CSS (sfondo.css) a muovere
   la lastra e qui non si fa nulla. Altrove si scrive la stessa quota in
   --sfondo-y a ogni scroll: la lastra risale di CORSA (in altezze dello
   schermo) tra l'inizio e la fine della pagina. Con il movimento ridotto
   la lastra sta ferma.
   --------------------------------------------------------------------------- */

/** Lo stesso valore di --lastra-corsa in sfondo.css: 360vh. */
const CORSA = 3.6

export function avviaSfondo() {
  if (typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (window.CSS?.supports?.('animation-timeline: scroll()')) return

  const root = document.documentElement
  let frame = 0

  const aggiorna = () => {
    frame = 0
    const max = root.scrollHeight - window.innerHeight
    const y = max > 0 ? -(window.scrollY / max) * CORSA * window.innerHeight : 0
    root.style.setProperty('--sfondo-y', `${y.toFixed(1)}px`)
  }
  const richiedi = () => {
    if (!frame) frame = window.requestAnimationFrame(aggiorna)
  }

  window.addEventListener('scroll', richiedi, { passive: true })
  window.addEventListener('resize', richiedi)
  aggiorna()
}
