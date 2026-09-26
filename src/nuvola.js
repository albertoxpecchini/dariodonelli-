/* ---------------------------------------------------------------------------
   Nuvola — l'area di riferimento come nuvola di punti in tre dimensioni
   Un sistema di assi con l'origine sulla sede di Rivalta sul Mincio:
   X vale zero per tutti i centri, Y è la distanza in linea d'aria in
   chilometri, Z è una quota scelta solo perché i centri stiano lontani
   l'uno dall'altro. Ogni comune e frazione della provincia (provincia.js)
   è un ammasso di punti come in un rilievo laser: più grande il centro,
   più punti e più largo l'alone. Sotto la nuvola corre il righello dei
   chilometri.

   Il disegno è WebGL (punti additivi su fondo nero); i nomi sono elementi
   del DOM che questo modulo sposta sulla proiezione dei centri e accende
   quando il puntatore si avvicina: solo i paesi grandi e le città portano
   il nome (SOGLIA_NOME), i paesini restano luce anonima. Da fermo, un
   fronte percorre l'asse e accende i nomi al passaggio, come il fascio del
   radar sulla carta. Trascinando si ruota un poco la vista.

   `luoghi` e `tacche` si calcolano all'import, in modo deterministico:
   servono anche al prerender (Nuvola.jsx). Il resto parte solo nel
   browser, da avviaNuvola.
   --------------------------------------------------------------------------- */

import { places } from './content.js'
import { comuni, frazioni, FRAZIONE_POP, SOGLIA_CITTA, SOGLIA_NOME } from './provincia.js'

const KM_PER_DEG_LAT = 111.32
const home = places.find((place) => place.studio)
const kmPerDegLng = KM_PER_DEG_LAT * Math.cos((home.lat * Math.PI) / 180)
const distanza = (p) => Math.hypot((p.lng - home.lng) * kmPerDegLng, (p.lat - home.lat) * KM_PER_DEG_LAT)

/** Numeri pseudo-casuali con seme (mulberry32), come in App.jsx: le stesse
    quote e gli stessi punti a ogni avvio. */
function seeded(seed) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
const easeOut = (t) => 1 - (1 - t) ** 3

/* --- La disposizione ------------------------------------------------------ */

/** Mezza altezza della nuvola, in km-equivalenti: la Z va da -Z_MAX a Z_MAX. */
export const Z_MAX = 7.5
/** La quota del righello dei chilometri, sotto la nuvola. */
export const Z_ASSE = -(Z_MAX + 3)
/** Gli "slot" del bagliore: 0 nessuno, 1..N i comuni, poi la sede. */
export const SLOT_SEDE = comuni.length + 1
const SLOTS = comuni.length + 2

/** Larghezza (deviazione standard, km) dell'ammasso di un centro. */
const alone = (pop) => 0.035 * pop ** 0.36
/** Quanti punti fa un centro. */
const numPunti = (pop) => Math.round(6 + 2.6 * Math.sqrt(pop))

/**
 * Tutti i centri con distanza (km) e quota (z). La quota si assegna una
 * alla volta: prima i centri che portano il nome, dal più grande, poi gli
 * altri comuni, poi le frazioni; ognuno prende, tra 56 livelli, quello più
 * lontano da tutti i già collocati (distanza nel piano km-quota, pesata
 * con la larghezza degli aloni), con una lieve preferenza per il centro.
 */
export const luoghi = (() => {
  const tutti = [
    ...comuni.map((c, i) => ({
      ...c,
      comune: true,
      slot: i + 1,
      nome: c.pop >= SOGLIA_NOME,
      citta: c.pop >= SOGLIA_CITTA,
    })),
    ...frazioni.map((f) => ({ ...f, pop: f.pop ?? FRAZIONE_POP, comune: false, slot: 0, nome: false, citta: false })),
  ].map((p) => ({ ...p, km: distanza(p), sigma: alone(p.pop), z: 0 }))

  const ordine = tutti
    .slice()
    .sort((a, b) => Number(b.nome) - Number(a.nome) || Number(b.comune) - Number(a.comune) || b.pop - a.pop)
  const rand = seeded(1495)
  const LIVELLI = 56
  const passo = (2 * Z_MAX) / LIVELLI
  // La sede è già al suo posto, all'origine, e tiene gli altri a distanza
  // perché il suo nome, sempre acceso, non finisca sopra un vicino.
  const posti = [{ km: 0, z: 0, sigma: 3 }]
  for (const p of ordine) {
    let migliore = 0
    let punteggio = -Infinity
    for (let k = 0; k < LIVELLI; k += 1) {
      const z = -Z_MAX + (k + 0.5) * passo + (rand() - 0.5) * passo
      let s
      if (posti.length === 1) {
        // Il capoluogo sta a mezza altezza.
        s = -Math.abs(z)
      } else {
        s = Infinity
        for (const q of posti) {
          const d = Math.hypot(p.km - q.km, z - q.z) / (p.sigma + q.sigma + 0.8)
          if (d < s) s = d
        }
        s *= 1 - 0.3 * (z / Z_MAX) ** 2
      }
      if (s > punteggio) {
        punteggio = s
        migliore = z
      }
    }
    p.z = migliore
    posti.push(p)
  }
  return tutti
})()

/** Fine dell'asse: la distanza massima arrotondata alla decina. */
export const Y_MAX = Math.ceil(Math.max(...luoghi.map((p) => p.km)) / 10) * 10
/** Le tacche con il numero, ogni 10 km. */
export const tacche = Array.from({ length: Y_MAX / 10 + 1 }, (_, i) => i * 10)

/* --- La geometria ----------------------------------------------------------- */

const STRIDE = 7 // x y z dimensione alfa slot tinta

/** I punti: la sede in blu all'origine, gli ammassi dei centri (nucleo
    fitto e alone rado), e un pulviscolo rado di campagna tutto intorno. */
function costruisciPunti() {
  const rand = seeded(46040)
  const gauss = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand())
  const N_SEDE = 110
  const N_CAMPAGNA = 1600
  let n = N_SEDE + N_CAMPAGNA
  for (const p of luoghi) n += numPunti(p.pop)

  const data = new Float32Array(n * STRIDE)
  let k = 0
  const metti = (x, y, z, dim, alfa, slot, tinta) => {
    data[k] = x
    data[k + 1] = y
    data[k + 2] = z
    data[k + 3] = dim
    data[k + 4] = alfa
    data[k + 5] = slot
    data[k + 6] = tinta
    k += STRIDE
  }

  for (let i = 0; i < N_SEDE; i += 1) {
    const s = i < 80 ? 0.32 : 0.8
    metti(gauss() * s * 0.6, gauss() * s, gauss() * s, i < 80 ? 2.8 : 2.2, i < 80 ? 0.9 : 0.5, SLOT_SEDE, 1)
  }
  for (const p of luoghi) {
    const tot = numPunti(p.pop)
    const nucleo = Math.round(tot * 0.7)
    const base = p.comune ? 2.3 : 2.0
    for (let i = 0; i < tot; i += 1) {
      const halo = i >= nucleo
      const s = p.sigma * (halo ? 2.3 : 1)
      metti(gauss() * s * 0.55, p.km + gauss() * s, p.z + gauss() * s, halo ? base * 0.8 : base, halo ? 0.26 : 0.55, p.slot, 0)
    }
  }
  for (let i = 0; i < N_CAMPAGNA; i += 1) {
    metti((rand() * 2 - 1) * 4, -3 + rand() * (Y_MAX + 6), (rand() * 2 - 1) * (Z_MAX + 2), 1.5, 0.1, 0, 0)
  }
  return { data, count: n }
}

/** Il righello: l'asse dei chilometri, una tacca ogni 5 km (più alta ogni
    10) e il filo a piombo dalla sede all'asse. x y z alfa. */
function costruisciRighello() {
  const v = []
  const seg = (a, b, alfa) => v.push(a[0], a[1], a[2], alfa, b[0], b[1], b[2], alfa)
  seg([0, -1.5, Z_ASSE], [0, Y_MAX + 1.5, Z_ASSE], 0.3)
  for (let km = 0; km <= Y_MAX; km += 5) {
    const decina = km % 10 === 0
    seg([0, km, Z_ASSE], [0, km, Z_ASSE + (decina ? 1.3 : 0.65)], decina ? 0.5 : 0.3)
  }
  seg([0, 0, 0], [0, 0, Z_ASSE], 0.2)
  return new Float32Array(v)
}

/* --- Algebra minima (matrici 4x4 per colonne, come WebGL) ------------------ */

function perspective(fovy, aspect, near, far) {
  const f = 1 / Math.tan(fovy / 2)
  const nf = 1 / (near - far)
  return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0])
}

function lookAt(eye, center, up) {
  let zx = eye[0] - center[0]
  let zy = eye[1] - center[1]
  let zz = eye[2] - center[2]
  let l = Math.hypot(zx, zy, zz)
  zx /= l
  zy /= l
  zz /= l
  let xx = up[1] * zz - up[2] * zy
  let xy = up[2] * zx - up[0] * zz
  let xz = up[0] * zy - up[1] * zx
  l = Math.hypot(xx, xy, xz)
  xx /= l
  xy /= l
  xz /= l
  const yx = zy * xz - zz * xy
  const yy = zz * xx - zx * xz
  const yz = zx * xy - zy * xx
  return new Float32Array([
    xx,
    yx,
    zx,
    0,
    xy,
    yy,
    zy,
    0,
    xz,
    yz,
    zz,
    0,
    -(xx * eye[0] + xy * eye[1] + xz * eye[2]),
    -(yx * eye[0] + yy * eye[1] + yz * eye[2]),
    -(zx * eye[0] + zy * eye[1] + zz * eye[2]),
    1,
  ])
}

function mul(a, b) {
  const out = new Float32Array(16)
  for (let c = 0; c < 4; c += 1) {
    for (let r = 0; r < 4; r += 1) {
      out[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3]
    }
  }
  return out
}

const transform = (m, x, y, z) => [
  m[0] * x + m[4] * y + m[8] * z + m[12],
  m[1] * x + m[5] * y + m[9] * z + m[13],
  m[2] * x + m[6] * y + m[10] * z + m[14],
  m[3] * x + m[7] * y + m[11] * z + m[15],
]

/* --- La camera -------------------------------------------------------------- */

const FOV = (28 * Math.PI) / 180
/** Azimut dal piano della nuvola (0 = di fronte, π/2 = di taglio) e alzata. */
const BASE_PHI = 0.42
const BASE_THETA = 0.3
/** In un riquadro largo l'asse dei chilometri corre verso destra e la
    quota sta in alto; in uno stretto (telefono) l'asse sale lungo lo
    schermo, la sede in basso, e la quota si stende in larghezza. */
const SU = { piano: [0, 0, 1], verticale: [0, 1, 0] }
/** Margini nel riquadro (in frazione della semi-larghezza NDC): dove
    stanno i nomi e i numeri delle tacche. */
const MARGINI = {
  piano: { sx: 0.08, dx: 0.12, su: 0.06, giu: 0.12 },
  verticale: { sx: 0.16, dx: 0.1, su: 0.06, giu: 0.06 },
}

function occhio(phi, theta, R, target, verticale) {
  return [
    target[0] + (verticale ? -1 : 1) * R * Math.cos(theta) * Math.cos(phi),
    target[1] - R * Math.cos(theta) * Math.sin(phi),
    target[2] + R * Math.sin(theta),
  ]
}

function vistaProiezione(phi, theta, R, target, aspect, verticale) {
  const P = perspective(FOV, aspect, R * 0.05, R * 4)
  const V = lookAt(occhio(phi, theta, R, target, verticale), target, verticale ? SU.verticale : SU.piano)
  return mul(P, V)
}

/** Gli otto spigoli del volume che deve stare nel riquadro. */
const SPIGOLI = (() => {
  const xs = [-3, 3]
  const ys = [-3, Y_MAX + 2]
  const zs = [Z_ASSE - 1.5, Z_MAX + 2.5]
  const out = []
  for (const x of xs) for (const y of ys) for (const z of zs) out.push([x, y, z])
  return out
})()

/** La distanza della camera perché la nuvola stia nel riquadro con i
    margini, e lo spostamento che la centra dentro i margini. */
function calcolaInquadratura(aspect, verticale) {
  const MARGINE = verticale ? MARGINI.verticale : MARGINI.piano
  const target = [0, Y_MAX / 2, (Z_ASSE + Z_MAX) / 2]
  const dentro = (R) => {
    const vp = vistaProiezione(BASE_PHI, BASE_THETA, R, target, aspect, verticale)
    for (const [x, y, z] of SPIGOLI) {
      const c = transform(vp, x, y, z)
      if (c[3] <= 0) return false
      const nx = c[0] / c[3]
      const ny = c[1] / c[3]
      if (nx < -1 + MARGINE.sx || nx > 1 - MARGINE.dx || ny < -1 + MARGINE.giu || ny > 1 - MARGINE.su) return false
    }
    return true
  }
  let lo = 5
  let hi = 3000
  for (let i = 0; i < 40; i += 1) {
    const mid = (lo + hi) / 2
    if (dentro(mid)) hi = mid
    else lo = mid
  }
  const R = hi
  const vp = vistaProiezione(BASE_PHI, BASE_THETA, R, target, aspect, verticale)
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const [x, y, z] of SPIGOLI) {
    const c = transform(vp, x, y, z)
    const nx = c[0] / c[3]
    const ny = c[1] / c[3]
    minX = Math.min(minX, nx)
    maxX = Math.max(maxX, nx)
    minY = Math.min(minY, ny)
    maxY = Math.max(maxY, ny)
  }
  const delta = [(MARGINE.sx - MARGINE.dx) / 2 - (minX + maxX) / 2, (MARGINE.giu - MARGINE.su) / 2 - (minY + maxY) / 2]
  return { R, target, delta }
}

/* --- WebGL ------------------------------------------------------------------ */

const VERT_PUNTI = `
attribute vec3 aPos;
attribute float aDim;
attribute float aAlfa;
attribute float aSlot;
attribute float aTinta;
uniform mat4 uVP;
uniform vec2 uScala;
uniform vec2 uScarto;
uniform float uPx;
uniform float uRif;
uniform float uFronte;
uniform float uBagliore[${SLOTS}];
varying float vAlfa;
varying float vTinta;
void main() {
  vec4 clip = uVP * vec4(aPos, 1.0);
  float w = max(clip.w, 0.01);
  float g = uBagliore[int(aSlot + 0.5)];
  float att = uRif / w;
  gl_PointSize = clamp(aDim * att * (1.0 + 0.45 * g), 1.0, 22.0) * uPx;
  float nebbia = mix(0.5, 1.0, clamp((1.7 * uRif - w) / uRif, 0.0, 1.0));
  float fronte = 1.0 - smoothstep(uFronte - 5.0, uFronte + 3.0, aPos.y);
  vAlfa = aAlfa * nebbia * fronte * (1.0 + 1.7 * g);
  vTinta = aTinta;
  gl_Position = vec4(clip.xy * uScala + uScarto * clip.w, clip.z, clip.w);
}`

const FRAG_PUNTI = `
precision mediump float;
varying float vAlfa;
varying float vTinta;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float a = (1.0 - smoothstep(0.2, 1.0, d)) * vAlfa;
  vec3 col = mix(vec3(1.0), vec3(0.42, 0.55, 1.0), vTinta);
  gl_FragColor = vec4(col * a, a);
}`

const VERT_LINEE = `
attribute vec3 aPos;
attribute float aAlfa;
uniform mat4 uVP;
uniform vec2 uScala;
uniform vec2 uScarto;
uniform float uFronte;
varying float vAlfa;
void main() {
  vec4 clip = uVP * vec4(aPos, 1.0);
  vAlfa = aAlfa * (1.0 - smoothstep(uFronte - 5.0, uFronte + 3.0, aPos.y));
  gl_Position = vec4(clip.xy * uScala + uScarto * clip.w, clip.z, clip.w);
}`

const FRAG_LINEE = `
precision mediump float;
varying float vAlfa;
void main() {
  gl_FragColor = vec4(vec3(vAlfa), vAlfa);
}`

function compila(gl, tipo, src) {
  const sh = gl.createShader(tipo)
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh)
    gl.deleteShader(sh)
    throw new Error(`Shader: ${log}`)
  }
  return sh
}

function programma(gl, vert, frag, attributi, uniformi) {
  const prog = gl.createProgram()
  gl.attachShader(prog, compila(gl, gl.VERTEX_SHADER, vert))
  gl.attachShader(prog, compila(gl, gl.FRAGMENT_SHADER, frag))
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(prog)
    gl.deleteProgram(prog)
    throw new Error(`Programma: ${log}`)
  }
  const a = {}
  for (const nome of attributi) a[nome] = gl.getAttribLocation(prog, nome)
  const u = {}
  for (const nome of uniformi) u[nome] = gl.getUniformLocation(prog, nome)
  return { prog, a, u }
}

/** Crea contesto, programmi e buffer. Ritorna null se WebGL manca. */
function preparaGL(canvas) {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: false,
    depth: false,
    premultipliedAlpha: true,
    powerPreference: 'low-power',
  })
  if (!gl) return null
  try {
    const punti = programma(
      gl,
      VERT_PUNTI,
      FRAG_PUNTI,
      ['aPos', 'aDim', 'aAlfa', 'aSlot', 'aTinta'],
      ['uVP', 'uScala', 'uScarto', 'uPx', 'uRif', 'uFronte', 'uBagliore'],
    )
    const linee = programma(gl, VERT_LINEE, FRAG_LINEE, ['aPos', 'aAlfa'], ['uVP', 'uScala', 'uScarto', 'uFronte'])

    const { data, count } = costruisciPunti()
    const bufPunti = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, bufPunti)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)

    const righello = costruisciRighello()
    const bufRighello = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, bufRighello)
    gl.bufferData(gl.ARRAY_BUFFER, righello, gl.STATIC_DRAW)

    const bufFili = gl.createBuffer()

    gl.disable(gl.DEPTH_TEST)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE)
    gl.clearColor(0, 0, 0, 0)

    return { gl, punti, linee, bufPunti, count, bufRighello, nRighello: righello.length / 4, bufFili }
  } catch (err) {
    console.warn('Nuvola: WebGL non disponibile.', err)
    return null
  }
}

/* --- L'avvio --------------------------------------------------------------- */

/**
 * Avvia la nuvola dentro `root` (il .reach di Nuvola.jsx). Ritorna la
 * funzione che ferma tutto e stacca gli ascoltatori.
 */
export function avviaNuvola(root) {
  if (typeof window === 'undefined' || !root) return () => {}

  const canvas = root.querySelector('.reach__canvas')
  const copy = root.querySelector('.reach__copy')
  const hint = root.querySelector('.reach__hint')
  const casa = root.querySelector('.reach__place--home')
  const nomi = [...root.querySelectorAll('.reach__place[data-slot]')]
    .map((el) => ({ el, luogo: luoghi.find((p) => p.slot === Number(el.dataset.slot)) }))
    .filter((n) => n.luogo)
  const tacchi = [...root.querySelectorAll('.reach__tick')].map((el) => ({ el, km: Number(el.dataset.km) }))
  const ridotto = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const G = preparaGL(canvas)
  root.classList.toggle('reach--senza-webgl', !G)

  const bagliore = new Float32Array(SLOTS)
  const fili = new Float32Array(nomi.length * 8)
  const look = { x: 0, y: 0, tx: 0, ty: 0 }
  const pointer = { x: 0, y: 0, attivo: false, ultimo: -1e9 }
  const drag = { on: false, id: null, x0: 0, y0: 0, phi: 0, theta: 0, phi0: 0, theta0: 0 }
  const sweep = { inizio: null }

  let W = 1
  let H = 1
  let dpr = 1
  let rect = { x: 0, y: 0, w: 1, h: 1 }
  let verticale = false
  let inq = calcolaInquadratura(2, false)
  let scala = [1, 1]
  let scarto = [0, 0]
  let vp = null
  let frame = 0
  let visibile = false
  let inizioIntro = null
  let fermo = false

  const proietta = (x, y, z) => {
    const c = transform(vp, x, y, z)
    const w = c[3]
    const nx = (c[0] / w) * scala[0] + scarto[0]
    const ny = (c[1] / w) * scala[1] + scarto[1]
    return { x: ((nx + 1) / 2) * W, y: ((1 - ny) / 2) * H, w }
  }

  const richiedi = () => {
    if (!frame && visibile && !document.hidden && !fermo) frame = window.requestAnimationFrame(disegna)
  }

  function ridimensiona() {
    W = root.clientWidth || 1
    H = root.clientHeight || 1
    dpr = Math.min(2, window.devicePixelRatio || 1)
    const cw = Math.round(W * dpr)
    const ch = Math.round(H * dpr)
    if (canvas.width !== cw || canvas.height !== ch) {
      canvas.width = cw
      canvas.height = ch
    }
    if (G) G.gl.viewport(0, 0, cw, ch)
    // Il riquadro della nuvola: sotto il testo, sopra la didascalia.
    const sopra = copy ? copy.offsetTop + copy.offsetHeight : 0
    const sotto = hint ? H - hint.offsetTop : 0
    const y = Math.min(H * 0.5, sopra - 12)
    rect = { x: 0, y, w: W, h: Math.max(160, H - y - sotto - 8) }
    verticale = rect.w < rect.h * 0.95
    root.classList.toggle('reach--verticale', verticale)
    for (const n of nomi) n.w = n.el.querySelector('.reach__text')?.offsetWidth || 120
    inq = calcolaInquadratura(rect.w / rect.h, verticale)
    scala = [rect.w / W, rect.h / H]
    scarto = [
      (2 * (rect.x + rect.w / 2)) / W - 1 + inq.delta[0] * scala[0],
      1 - (2 * (rect.y + rect.h / 2)) / H + inq.delta[1] * scala[1],
    ]
    richiedi()
  }

  function disegna(now) {
    frame = 0
    const t = now / 1000
    if (inizioIntro === null) inizioIntro = now
    const intro = ridotto ? 1 : Math.min(1, (now - inizioIntro) / 2600)
    const fronte = ridotto ? Y_MAX + 20 : -6 + easeOut(intro) * (Y_MAX + 18)

    // Lo sguardo segue il puntatore con un poco di ritardo; da fermo la
    // camera respira appena.
    look.x += (look.tx - look.x) * 0.06
    look.y += (look.ty - look.y) * 0.06
    const deriva = ridotto ? 0 : 1
    const phi = clamp(BASE_PHI + drag.phi - look.x * 0.14 + deriva * Math.sin(t * 0.11) * 0.05, 0.15, 0.85)
    const theta = clamp(BASE_THETA + drag.theta + look.y * 0.1 + deriva * Math.cos(t * 0.083) * 0.03, -0.05, 0.6)
    const R = inq.R * (1 + (1 - easeOut(intro)) * 0.6)
    vp = vistaProiezione(phi, theta, R, inq.target, rect.w / rect.h, verticale)

    // Il bagliore: vicino al puntatore, o al passaggio del fronte quando
    // nessuno tocca la nuvola da un po'.
    const inattivo = !pointer.attivo && now - pointer.ultimo > 2200
    const conFronte = !ridotto && intro >= 1 && inattivo
    let fronteSweep = -100
    if (conFronte) {
      if (sweep.inizio === null) sweep.inizio = now
      fronteSweep = -6 + (((now - sweep.inizio) / 16000) % 1) * (Y_MAX + 14)
    } else {
      sweep.inizio = null
    }
    // Si accendono al più tre centri per volta: il più vicino al puntatore
    // (o al fronte) per intero, il secondo e il terzo meno. Così i nomi non
    // si accavallano dove i paesi sono fitti.
    const raggio = clamp(rect.w * 0.075, 56, 120)
    const PESI = [1, 0.5, 0.28]
    let inMoto = intro < 1 || deriva > 0 || conFronte
    for (const n of nomi) {
      n.p = proietta(0, n.luogo.km, n.luogo.z)
      n.meta = 0
    }
    if (pointer.attivo || now - pointer.ultimo < 400) {
      for (const n of nomi) n.d = Math.hypot(pointer.x - n.p.x, pointer.y - n.p.y)
      const vicini = nomi.filter((n) => n.d < raggio).sort((a, b) => a.d - b.d)
      vicini.slice(0, PESI.length).forEach((n, i) => {
        n.meta = Math.max(n.meta, clamp(1 - n.d / raggio, 0, 1) ** 0.6 * PESI[i])
      })
    }
    if (conFronte) {
      for (const n of nomi) n.d = Math.abs(n.luogo.km - fronteSweep)
      const vicini = nomi.filter((n) => n.d < 5).sort((a, b) => a.d - b.d)
      vicini.slice(0, PESI.length).forEach((n, i) => {
        n.meta = Math.max(n.meta, Math.exp(-(n.d ** 2) / (2 * 1.8 ** 2)) * 0.9 * PESI[i])
      })
    }
    let nFili = 0
    for (const n of nomi) {
      const { luogo, el, p, meta } = n
      const g0 = bagliore[luogo.slot]
      let g = g0 + (meta - g0) * (meta > g0 ? 0.18 : 0.06)
      if (Math.abs(g - meta) < 0.002) g = meta
      if (g !== g0) inMoto = true
      bagliore[luogo.slot] = g

      const vicino = clamp(inq.R / p.w, 0.7, 1.3)
      el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) scale(${(0.8 + 0.25 * vicino).toFixed(3)})`
      el.style.opacity = g < 0.02 ? '0' : Math.min(1, g * 1.15).toFixed(3)
      el.style.zIndex = String(1 + Math.round(g * 100))
      // Il nome va a sinistra del punto solo se a destra uscirebbe dal
      // riquadro, e a sinistra ci sta.
      const sinistra = p.x + 14 + n.w > W - 6 && p.x - 14 - n.w > 6
      el.classList.toggle('reach__place--left', sinistra)

      if (g > 0.02) {
        const a = 0.4 * g
        fili.set([0, luogo.km, luogo.z, a, 0, luogo.km, Z_ASSE, a], nFili * 8)
        nFili += 1
      }
    }
    bagliore[SLOT_SEDE] = ridotto ? 0.2 : 0.2 + 0.15 * Math.sin(t * 1.6)

    if (casa) {
      const p = proietta(0, 0, 0)
      casa.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`
      casa.style.opacity = fronte > 4 ? '1' : '0'
    }
    for (const { el, km } of tacchi) {
      const p = proietta(0, km, Z_ASSE)
      el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`
      el.style.opacity = fronte > km + 3 ? '1' : '0'
    }

    if (G) {
      const { gl, punti, linee } = G
      gl.clear(gl.COLOR_BUFFER_BIT)
      const px = dpr * clamp(rect.h / 520, 0.85, 1.5)

      gl.useProgram(linee.prog)
      gl.uniformMatrix4fv(linee.u.uVP, false, vp)
      gl.uniform2fv(linee.u.uScala, scala)
      gl.uniform2fv(linee.u.uScarto, scarto)
      gl.uniform1f(linee.u.uFronte, fronte)
      gl.bindBuffer(gl.ARRAY_BUFFER, G.bufRighello)
      gl.enableVertexAttribArray(linee.a.aPos)
      gl.vertexAttribPointer(linee.a.aPos, 3, gl.FLOAT, false, 16, 0)
      gl.enableVertexAttribArray(linee.a.aAlfa)
      gl.vertexAttribPointer(linee.a.aAlfa, 1, gl.FLOAT, false, 16, 12)
      gl.drawArrays(gl.LINES, 0, G.nRighello)
      if (nFili) {
        gl.bindBuffer(gl.ARRAY_BUFFER, G.bufFili)
        gl.bufferData(gl.ARRAY_BUFFER, fili.subarray(0, nFili * 8), gl.DYNAMIC_DRAW)
        gl.vertexAttribPointer(linee.a.aPos, 3, gl.FLOAT, false, 16, 0)
        gl.vertexAttribPointer(linee.a.aAlfa, 1, gl.FLOAT, false, 16, 12)
        gl.drawArrays(gl.LINES, 0, nFili * 2)
      }

      gl.useProgram(punti.prog)
      gl.uniformMatrix4fv(punti.u.uVP, false, vp)
      gl.uniform2fv(punti.u.uScala, scala)
      gl.uniform2fv(punti.u.uScarto, scarto)
      gl.uniform1f(punti.u.uPx, px)
      gl.uniform1f(punti.u.uRif, inq.R)
      gl.uniform1f(punti.u.uFronte, fronte)
      gl.uniform1fv(punti.u.uBagliore, bagliore)
      gl.bindBuffer(gl.ARRAY_BUFFER, G.bufPunti)
      const S = STRIDE * 4
      gl.enableVertexAttribArray(punti.a.aPos)
      gl.vertexAttribPointer(punti.a.aPos, 3, gl.FLOAT, false, S, 0)
      gl.enableVertexAttribArray(punti.a.aDim)
      gl.vertexAttribPointer(punti.a.aDim, 1, gl.FLOAT, false, S, 12)
      gl.enableVertexAttribArray(punti.a.aAlfa)
      gl.vertexAttribPointer(punti.a.aAlfa, 1, gl.FLOAT, false, S, 16)
      gl.enableVertexAttribArray(punti.a.aSlot)
      gl.vertexAttribPointer(punti.a.aSlot, 1, gl.FLOAT, false, S, 20)
      gl.enableVertexAttribArray(punti.a.aTinta)
      gl.vertexAttribPointer(punti.a.aTinta, 1, gl.FLOAT, false, S, 24)
      gl.drawArrays(gl.POINTS, 0, G.count)
    }

    // Con il movimento ridotto la nuvola sta ferma finché non la si tocca.
    if (inMoto || pointer.attivo || drag.on || Math.abs(look.tx - look.x) > 0.001) richiedi()
  }

  /* --- Il puntatore --- */

  const posizione = (e) => {
    const r = root.getBoundingClientRect()
    pointer.x = e.clientX - r.left
    pointer.y = e.clientY - r.top
    pointer.ultimo = performance.now()
    look.tx = clamp((pointer.x / W) * 2 - 1, -1, 1)
    look.ty = clamp((pointer.y / H) * 2 - 1, -1, 1)
  }
  const onMove = (e) => {
    posizione(e)
    pointer.attivo = true
    if (drag.on && e.pointerId === drag.id) {
      drag.phi = clamp(drag.phi0 - (e.clientX - drag.x0) * 0.0025, -0.2, 0.25)
      drag.theta = clamp(drag.theta0 + (e.clientY - drag.y0) * 0.0025, -0.18, 0.18)
    }
    richiedi()
  }
  const onLeave = () => {
    pointer.attivo = false
    look.tx = 0
    look.ty = 0
    richiedi()
  }
  const onDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    posizione(e)
    pointer.attivo = true
    drag.on = true
    drag.id = e.pointerId
    drag.x0 = e.clientX
    drag.y0 = e.clientY
    drag.phi0 = drag.phi
    drag.theta0 = drag.theta
    richiedi()
  }
  const onUp = (e) => {
    if (e.pointerId !== drag.id) return
    drag.on = false
    drag.id = null
    if (e.pointerType !== 'mouse') pointer.attivo = false
    richiedi()
  }
  root.addEventListener('pointermove', onMove)
  root.addEventListener('pointerleave', onLeave)
  root.addEventListener('pointerdown', onDown)
  root.addEventListener('pointerup', onUp)
  root.addEventListener('pointercancel', onUp)

  /* --- Visibilità e misure --- */

  const osservatore =
    typeof IntersectionObserver === 'undefined'
      ? null
      : new IntersectionObserver(
          (entries) => {
            visibile = entries.some((en) => en.isIntersecting)
            if (visibile) richiedi()
          },
          { rootMargin: '12% 0px' },
        )
  if (osservatore) osservatore.observe(root)
  else visibile = true

  const onVisibility = () => richiedi()
  document.addEventListener('visibilitychange', onVisibility)

  const misure = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => ridimensiona())
  if (misure) misure.observe(root)
  else window.addEventListener('resize', ridimensiona)

  const onPerso = (e) => {
    e.preventDefault()
    fermo = true
    if (frame) window.cancelAnimationFrame(frame)
    frame = 0
  }
  const onRipreso = () => {
    const nuovo = preparaGL(canvas)
    if (nuovo) Object.assign(G, nuovo)
    fermo = false
    ridimensiona()
  }
  canvas.addEventListener('webglcontextlost', onPerso)
  canvas.addEventListener('webglcontextrestored', onRipreso)

  ridimensiona()

  return () => {
    fermo = true
    if (frame) window.cancelAnimationFrame(frame)
    root.removeEventListener('pointermove', onMove)
    root.removeEventListener('pointerleave', onLeave)
    root.removeEventListener('pointerdown', onDown)
    root.removeEventListener('pointerup', onUp)
    root.removeEventListener('pointercancel', onUp)
    document.removeEventListener('visibilitychange', onVisibility)
    canvas.removeEventListener('webglcontextlost', onPerso)
    canvas.removeEventListener('webglcontextrestored', onRipreso)
    if (osservatore) osservatore.disconnect()
    if (misure) misure.disconnect()
    else window.removeEventListener('resize', ridimensiona)
    if (G) {
      const { gl } = G
      gl.deleteBuffer(G.bufPunti)
      gl.deleteBuffer(G.bufRighello)
      gl.deleteBuffer(G.bufFili)
      gl.deleteProgram(G.punti.prog)
      gl.deleteProgram(G.linee.prog)
    }
  }
}
