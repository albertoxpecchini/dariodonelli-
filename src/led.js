/* ---------------------------------------------------------------------------
   Display a sedici segmenti
   La geometria e il carattere dei display a LED del sito: l'insegna del
   footer e i display piccoli del visualizzatore (tutti e due in
   LedDisplay.jsx). Qui non c'è React: viewer.js aggiorna i display con
   setLedText, accendendo e spegnendo i segmenti che ci sono già.

   Il carattere sta in una cella di 68 × 100 unità: telaio da x 8 a 56 e
   da y 8 a 92, traversa a metà, asta centrale, quattro diagonali, punto.
   --------------------------------------------------------------------------- */

const H = 4.3 // mezzo spessore del segmento
const G = 1.6 // luce tra un segmento e l'altro
const X = { l: 8, c: 32, r: 56 }
export const Y = { t: 8, m: 50, b: 92 }
export const CELL = 78 // passo tra i caratteri: 68 di cella più 10 di spazio

const pts = (list) => list.map(([x, y]) => `${+x.toFixed(2)},${+y.toFixed(2)}`).join(' ')

/** Segmento orizzontale con le punte a 45°, da xa a xb all'altezza y. */
const hSeg = (xa, xb, y) => {
  const x0 = xa + G
  const x1 = xb - G
  return pts([[x0, y], [x0 + H, y - H], [x1 - H, y - H], [x1, y], [x1 - H, y + H], [x0 + H, y + H]])
}

/** Segmento verticale, da ya a yb sull'asse x. */
const vSeg = (x, ya, yb) => {
  const y0 = ya + G
  const y1 = yb - G
  return pts([[x, y0], [x + H, y0 + H], [x + H, y1 - H], [x, y1], [x - H, y1 - H], [x - H, y0 + H]])
}

/** Riquadro libero di un quarto di cella, dove corre la diagonale. */
const box = (xa, xb, ya, yb) => [xa + H + G, xb - H - G, ya + H + G, yb - H - G]
const W = 5.2 // larghezza della diagonale in orizzontale…
const V = 9.5 // …e in verticale

/** Diagonale "\" nel riquadro. */
const back = ([x1, x2, y1, y2]) => pts([[x1, y1], [x1 + W, y1], [x2, y2 - V], [x2, y2], [x2 - W, y2], [x1, y1 + V]])
/** Diagonale "/" nel riquadro. */
const slash = ([x1, x2, y1, y2]) => pts([[x2, y1], [x2, y1 + V], [x1 + W, y2], [x1, y2], [x1, y2 - V], [x2 - W, y1]])

export const SEGMENTS = {
  a1: hSeg(X.l, X.c, Y.t),
  a2: hSeg(X.c, X.r, Y.t),
  f: vSeg(X.l, Y.t, Y.m),
  h: back(box(X.l, X.c, Y.t, Y.m)),
  i: vSeg(X.c, Y.t, Y.m),
  j: slash(box(X.c, X.r, Y.t, Y.m)),
  b: vSeg(X.r, Y.t, Y.m),
  g1: hSeg(X.l, X.c, Y.m),
  g2: hSeg(X.c, X.r, Y.m),
  e: vSeg(X.l, Y.m, Y.b),
  k: slash(box(X.l, X.c, Y.m, Y.b)),
  l: vSeg(X.c, Y.m, Y.b),
  m: back(box(X.c, X.r, Y.m, Y.b)),
  c: vSeg(X.r, Y.m, Y.b),
  d1: hSeg(X.l, X.c, Y.b),
  d2: hSeg(X.c, X.r, Y.b),
}

/** L'ordine in cui la penna accende i segmenti di un carattere. */
export const ORDER = [...Object.keys(SEGMENTS), 'dp']

/** I caratteri che servono, nella codifica classica a sedici segmenti:
    le lettere del nome, le cifre e i segni dei display del visualizzatore
    (la barra del "01/02", la percentuale dell'ingrandimento). */
export const FONT = {
  A: 'a1 a2 b c e f g1 g2',
  D: 'a1 a2 b c d1 d2 i l',
  E: 'a1 a2 d1 d2 e f g1',
  G: 'a1 a2 c d1 d2 e f g2',
  I: 'a1 a2 d1 d2 i l',
  L: 'd1 d2 e f',
  N: 'b c e f h m',
  O: 'a1 a2 b c d1 d2 e f',
  R: 'a1 a2 b e f g1 g2 m',
  0: 'a1 a2 b c d1 d2 e f',
  1: 'b c',
  2: 'a1 a2 b d1 d2 e g1 g2',
  3: 'a1 a2 b c d1 d2 g2',
  4: 'b c f g1 g2',
  5: 'a1 a2 c d1 d2 f g1 g2',
  6: 'a1 a2 c d1 d2 e f g1 g2',
  7: 'a1 a2 b c',
  8: 'a1 a2 b c d1 d2 e f g1 g2',
  9: 'a1 a2 b c d1 d2 f g1 g2',
  '/': 'j k',
  '%': 'a1 f g1 i j k g2 l c d2',
  '-': 'g1 g2',
  ' ': '',
}

/** Il testo in celle, ognuna con i suoi segmenti; il punto si accende nella
    cella che lo precede. */
export function cellsOf(text) {
  const cells = []
  for (const char of String(text).toUpperCase()) {
    if (char === '.' && cells.length) cells[cells.length - 1].push('dp')
    else cells.push((FONT[char] ?? '').split(' ').filter(Boolean))
  }
  return cells
}

/** Le celle portate a `n`: allineate a destra, come le cifre di uno
    strumento, o a sinistra. */
export function fitCells(cells, n, align = 'right') {
  const pad = Array.from({ length: Math.max(0, n - cells.length) }, () => [])
  return align === 'left' ? [...cells, ...pad].slice(0, n) : [...pad, ...cells].slice(-n)
}

/** La finestra dell'SVG per `n` celle, con un filo di margine per l'alone. */
export const viewBoxOf = (n) => `-6 -4 ${n * CELL + 2} 108`

/**
 * Scrive `text` su un display già disegnato (LedReadout): accende i
 * segmenti del testo e spegne gli altri, senza ridisegnare niente. `el` è
 * il display o un elemento che lo contiene.
 */
export function setLedText(el, text) {
  const root = el.matches('.led') ? el : el.querySelector('.led')
  if (!root) return
  const groups = root.querySelectorAll('.led__on [data-cell]')
  const cells = fitCells(cellsOf(text), groups.length, root.dataset.align)
  groups.forEach((g, i) => {
    for (const seg of g.children) seg.classList.toggle('is-lit', cells[i].includes(seg.dataset.s))
  })
}
