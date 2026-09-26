import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import './motion.css'
import { scrollToTarget, setScrollLocked, useReveal, useSmoothScroll } from './motion.js'
import {
  disciplines,
  heroFacts,
  infoline,
  manifesto,
  lakes,
  mapEmbedSrc,
  method,
  mincio,
  navItems,
  places,
  profile,
  projects,
  sections,
  serviceAreas,
  serviceIndex,
  sheets,
  studio,
} from './content.js'
import { Sym } from './Sym.jsx'
import { symbols } from './symbols.jsx'
import { Key } from './Key.jsx'
import LedDisplay from './LedDisplay.jsx'
import SheetViewer from './viewer/SheetViewer.jsx'
import Nuvola from './Nuvola.jsx'

/* ---------------------------------------------------------------------------
   Marchio
   Il logo della targa ridisegnato in vettoriale: una "D" a doppio profilo,
   in nero, sovrapposta alla sua immagine speculare in grigio. I tracciati
   hanno pathLength="1" così il CSS può "disegnarli" con un dash.
   --------------------------------------------------------------------------- */

const LOGO_OUTER = 'M64 64H520A456 456 0 0 1 520 976H64Z'
const LOGO_INNER = 'M164 164H520A356 356 0 0 1 520 876H164Z'

function Logo({ className = '', draw = false, ...props }) {
  return (
    <svg
      viewBox="0 0 1040 1040"
      fill="none"
      aria-hidden="true"
      className={`logo${draw ? ' logo--draw' : ''} ${className}`}
      {...props}
    >
      <g className="logo__ghost" stroke="#8a8a8a" strokeWidth="48" transform="matrix(-1 0 0 1 1040 0)">
        <path d={LOGO_OUTER} pathLength="1" />
        <path d={LOGO_INNER} pathLength="1" />
      </g>
      <g className="logo__ink" stroke="currentColor" strokeWidth="48">
        <path d={LOGO_OUTER} pathLength="1" />
        <path d={LOGO_INNER} pathLength="1" />
      </g>
    </svg>
  )
}

/**
 * La "D" minima: il dettaglio ricorrente del sito. Fa da punto elenco,
 * separatore, marcatore sulla mappa e sulla fotografia, cursore.
 */
function DMark(props) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="dmark" {...props}>
      <path d="M2.5 2.5h5.5a5.5 5.5 0 0 1 0 11H2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

/* ---------------------------------------------------------------------------
   Icone
   --------------------------------------------------------------------------- */

function IconPhone(props) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M5.4 2.5H3.2c-.6 0-1.1.5-1 1.1.2 2.3 1.2 4.5 2.9 6.2 1.7 1.7 3.9 2.7 6.2 2.9.6.1 1.1-.4 1.1-1v-2.2c0-.5-.4-.9-.9-1l-1.6-.3c-.4-.1-.8.1-1 .4l-.5.8A8.6 8.6 0 0 1 5.6 6l.8-.5c.3-.2.5-.6.4-1l-.4-1.1c-.1-.5-.5-.9-1-.9Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ---------------------------------------------------------------------------
   Hook di supporto
   --------------------------------------------------------------------------- */

function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])
  return scrolled
}

/**
 * Scroll-spy: l'id della sezione che attraversa la linea di lettura, posta
 * poco sotto l'header. Alimenta la navigazione e l'indicatore nell'angolo.
 */
function useScrollSpy(ids) {
  const [active, setActive] = useState('')
  useEffect(() => {
    let frame = 0
    const compute = () => {
      frame = 0
      const line = window.scrollY + 160
      let current = ''
      for (const id of ids) {
        const el = document.getElementById(id)
        if (!el) continue
        if (el.getBoundingClientRect().top + window.scrollY <= line) current = id
      }
      const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 2
      if (atBottom) {
        const last = ids.filter((id) => document.getElementById(id)).pop()
        if (last) current = last
      }
      setActive(current)
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(compute)
    }
    compute()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ids])
  return active
}

function scrollToSection(id) {
  if (!document.getElementById(id)) return
  scrollToTarget(id)
  window.history.replaceState(null, '', `#${id}`)
}

/* ---------------------------------------------------------------------------
   Testo spezzato per le rivelazioni: parole o lettere in maschera
   (motion.css, sezione 2). Il testo resta testo: gli spazi sono veri.
   --------------------------------------------------------------------------- */

function Words({ text }) {
  return text.split(' ').map((word, i) => (
    <Fragment key={i}>
      {i > 0 && ' '}
      <span className="word">
        <span className="word__in" style={{ '--w': i }}>
          {word}
        </span>
      </span>
    </Fragment>
  ))
}

/** Lettere per la testata; chi usa un lettore di schermo sente il nome intero. */
function Letters({ text }) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {[...text].map((char, i) =>
          char === ' ' ? (
            ' '
          ) : (
            <span className="char" key={i}>
              <span className="char__in" style={{ '--c': i }}>
                {char}
              </span>
            </span>
          ),
        )}
      </span>
    </>
  )
}

function useAnchorNav() {
  return useCallback((event) => {
    const id = event.currentTarget.getAttribute('href').slice(1)
    event.preventDefault()
    scrollToSection(id)
  }, [])
}

/* ---------------------------------------------------------------------------
   Header, binario laterale, indicatore d'angolo
   --------------------------------------------------------------------------- */

const sectionIds = sections.map((section) => section.id)

function Brand({ className = '', draw = false }) {
  return (
    <span className={`brand__inner ${className}`}>
      <span className="brand__mark">
        <Logo draw={draw} />
      </span>
      <span className="brand__copy">
        <span className="brand__name">{studio.name}</span>
        <span className="brand__role">{studio.role}</span>
      </span>
    </span>
  )
}

/** Il telefono mostra "Telefono" e rivela il numero al passaggio. */
function PhoneReveal({ className = '' }) {
  return (
    <a className={`phone ${className}`} href={studio.phoneHref} aria-label={`Chiama ${studio.phoneDisplay}`}>
      <IconPhone />
      <span className="phone__text">
        <span className="phone__label">Telefono</span>
        <span className="phone__num">{studio.phoneDisplay}</span>
      </span>
    </a>
  )
}

function Header({ active }) {
  const scrolled = useScrolled()
  const [menuOpen, setMenuOpen] = useState(false)
  const navRef = useRef(null)

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    setScrollLocked(menuOpen)
    return () => {
      document.body.style.overflow = ''
      setScrollLocked(false)
    }
  }, [menuOpen])

  // Il segno blu sotto la voce in lettura: uno solo, che scivola da una
  // voce all'altra invece di spegnersi e riaccendersi.
  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const place = () => {
      const link = nav.querySelector('.nav__link.is-active')
      nav.dataset.indicator = link ? 'on' : 'off'
      if (!link) return
      nav.style.setProperty('--ind-x', `${link.offsetLeft}px`)
      nav.style.setProperty('--ind-w', String(link.offsetWidth))
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [active])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const go = useCallback((event, id) => {
    event.preventDefault()
    setMenuOpen(false)
    // Si sblocca subito: riprendere lo scorrimento dopo, nell'effetto,
    // interromperebbe il viaggio verso la sezione appena partito.
    setScrollLocked(false)
    scrollToSection(id)
  }, [])

  return (
    <>
      <header className={scrolled ? 'header header--scrolled' : 'header'}>
        <div className="container header__inner">
          <a
            href="#top"
            className="brand"
            aria-label={`${studio.name}, torna all'inizio`}
            onClick={(e) => {
              e.preventDefault()
              scrollToTarget(0)
              window.history.replaceState(null, '', ' ')
            }}
          >
            <Brand draw />
          </a>

          <nav className="nav" aria-label="Navigazione principale" ref={navRef}>
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={active === item.id ? 'nav__link is-active' : 'nav__link'}
                aria-current={active === item.id ? 'true' : undefined}
                onClick={(e) => go(e, item.id)}
              >
                <sup className="nav__num">{item.num}</sup>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="header__actions">
            <PhoneReveal className="header__phone" />
            <a className="action header__cta" href="#contatti" onClick={(e) => go(e, 'contatti')}>
              <Key wide label="Enter" />
              Parliamo del progetto
            </a>
            <button
              type="button"
              className="menu-toggle"
              aria-expanded={menuOpen}
              aria-controls="mobile-panel"
              aria-label={menuOpen ? 'Chiudi il menu' : 'Apri il menu'}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Key label="Menu" />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && <button type="button" className="scrim" aria-label="Chiudi il menu" onClick={() => setMenuOpen(false)} />}

      <aside
        id="mobile-panel"
        className={menuOpen ? 'mobile-panel is-open' : 'mobile-panel'}
        aria-hidden={!menuOpen}
        inert={!menuOpen}
        data-lenis-prevent
      >
        <div className="mobile-panel__head">
          <Brand />
          <button type="button" className="mobile-panel__close" aria-label="Chiudi il menu" onClick={() => setMenuOpen(false)}>
            <Key label="Esc" />
          </button>
        </div>

        <nav className="mobile-nav" aria-label="Navigazione mobile">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={active === item.id ? 'mobile-nav__link is-active' : 'mobile-nav__link'}
              aria-current={active === item.id ? 'true' : undefined}
              onClick={(e) => go(e, item.id)}
            >
              <span className="mobile-nav__num">{item.num}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mobile-panel__foot">
          <a className="mobile-panel__phone" href={studio.phoneHref}>
            {studio.phoneDisplay}
          </a>
          <a className="mobile-panel__mail" href={studio.emailHref}>
            {studio.email}
          </a>
          <a className="action" href="#contatti" onClick={(e) => go(e, 'contatti')}>
            <Key wide label="Enter" />
            Parliamo del progetto
          </a>
        </div>
      </aside>
    </>
  )
}

/**
 * Binario laterale: nome, indirizzo e telefono restano sempre a portata,
 * in verticale lungo il bordo destro, come la costa di un fascicolo.
 */
function SideRail() {
  return (
    <a className="rail" href={studio.mapsHref} target="_blank" rel="noreferrer" aria-label={`${studio.name}, ${studio.address}, ${studio.phoneDisplay}`}>
      <span>{studio.name}</span>
      <DMark />
      <span>Via Filippo Turati 1, Rivalta sul Mincio</span>
      <DMark />
      <span>{studio.phoneDisplay}</span>
    </a>
  )
}

/**
 * Indicatore d'angolo: "STUDIO · 03", segue la sezione in lettura. Il
 * numero rotola nel verso dello scroll: sale scendendo, scende risalendo.
 */
function Corner({ active }) {
  const index = sections.findIndex((section) => section.id === active)
  const [roll, setRoll] = useState({ index, dir: 'up' })
  if (roll.index !== index) setRoll({ index, dir: index > roll.index ? 'up' : 'down' })

  return (
    <div className="corner" aria-hidden="true">
      <span className="corner__word">Studio</span>
      <DMark />
      <span className="corner__num">
        <span className={`corner__roll corner__roll--${roll.dir}`} key={index}>
          {index >= 0 ? sections[index].num : '00'}
        </span>
      </span>
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Blocchi riutilizzabili
   --------------------------------------------------------------------------- */

/**
 * Intestazione di sezione. Il filetto attraversa tutta la pagina, da bordo
 * a bordo: è il filo conduttore. Il numero sta sul filo, come una quota.
 */
function SectionHead({ id, title, text }) {
  const section = sections.find((s) => s.id === id)
  return (
    <div className="section-head reveal">
      <div className="section-head__meta">
        <span className="section-head__index" aria-hidden="true">
          {section.num}
        </span>
        <span className="label">{section.label}</span>
        <Sym name={section.sym} className="section-head__sym" />
      </div>
      <div className="section-head__body">
        <h2 className="headline">
          <Words text={title} />
        </h2>
        {text && <p className="lead">{text}</p>}
      </div>
    </div>
  )
}

function Photo({ base, ext = 'jpg', alt, width, height, eager = false, className = '' }) {
  return (
    <picture className={`photo ${className}`}>
      <source srcSet={`${base}.webp`} type="image/webp" />
      <img
        src={`${base}.${ext}`}
        alt={alt}
        width={width}
        height={height}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        {...(eager && { fetchPriority: 'high' })}
      />
    </picture>
  )
}

/**
 * Icona a oggetto: un piccolo modello in nero lucido e acciaio con un solo
 * dettaglio in Electric Sapphire. È decorativa, il testo accanto dice già
 * tutto: alt vuoto e nascosta ai lettori di schermo.
 */
function Emblem({ name, className = '' }) {
  return (
    <picture className={`emblem ${className}`} aria-hidden="true">
      <source srcSet={`/images/icone/${name}.webp`} type="image/webp" />
      <img src={`/images/icone/${name}.png`} alt="" width="512" height="512" loading="lazy" decoding="async" />
    </picture>
  )
}

/** Numeri pseudo-casuali con seme (mulberry32): le stesse posizioni nel
    prerender e nel browser, quindi nessuna differenza all'idratazione. */
function seeded(seed) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Altri segni sparsi a griglia su tutta la sezione: una cella per segno e
 * una posizione a caso dentro la cella, così coprono il fondo senza
 * ammucchiarsi. Quelli nelle colonne centrali, dietro al testo, sono più
 * tenui (sesto valore: fattore d'opacità).
 */
function scatter(seed, count, cols = 5) {
  const rand = seeded(seed)
  const rows = Math.ceil(count / cols)
  return Array.from({ length: count }, (_, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = -4 + ((col + 0.1 + rand() * 0.8) * 100) / cols
    const y = ((row + 0.05 + rand() * 0.85) * 97) / rows
    const name = symbols[Math.floor(rand() * symbols.length)].name
    const size = Math.round(80 + rand() * 140)
    const rot = Math.round((rand() - 0.5) * 30)
    const edge = col === 0 || col === cols - 1
    return [name, +x.toFixed(2), +y.toFixed(2), size, rot, edge ? 1 : 0.6]
  })
}

/**
 * Dove cadono i segni sullo sfondo, sezione per sezione: [simbolo, x, y,
 * lato in px, rotazione in gradi], con x e y in percentuale della sezione.
 * I primi sono messi a mano nelle fasce ai lati del contenuto e sbordano
 * appena dallo schermo, come un disegno tagliato dal bordo del foglio;
 * scatter() ne aggiunge il doppio sparsi su tutto il fondo.
 */
const MARGINS_HAND = {
  intro: [
    ['gru', 74, 1, 250, 0],
    ['compasso', -3, 20, 210, -12],
    ['caposaldo', 90, 29, 120, 0],
    ['squadra', 38, 42, 170, 8],
    ['stazione-totale', 5, 56, 230, 0],
    ['quota', 68, 64, 190, -6],
    ['ponteggio', 89, 79, 210, 0],
    ['livella', 20, 86, 180, -4],
  ],
  servizi: [
    ['escavatore', -4, 2, 230, 0],
    ['goniometro', 90, 8, 170, 10],
    ['ipe', 93, 26, 150, 0],
    ['mattoni', -3, 37, 170, -6],
    ['cono', 91, 49, 140, 6],
    ['riga-t', -2, 60, 190, -8],
    ['cazzuola', 92, 71, 160, 12],
    ['scalimetro', -4, 83, 210, 0],
    ['pericolo', 90, 92, 130, 0],
    ['bullone', 3, 18, 110, 0],
    ['metro', 94, 40, 120, -10],
    ['campitura', 2, 73, 120, 0],
  ],
  progetti: [
    ['porta', 91, 3, 170, 0],
    ['prospettiva', -4, 17, 210, 0],
    ['carriola', 90, 33, 190, -4],
    ['pala', -2, 49, 170, 8],
    ['tavola', 92, 63, 150, 6],
    ['finestra', -3, 79, 170, 0],
    ['betoniera', 90, 91, 180, 0],
    ['scala', 3, 34, 130, 0],
    ['martello', 94, 48, 130, 20],
    ['caposaldo', 2, 93, 110, 0],
  ],
  studio: [
    ['matita', 88, 3, 180, 0],
    ['pilastro', -3, 29, 150, 6],
    ['asse', 92, 38, 150, 0],
    ['piombo', -2, 60, 180, 0],
    ['sezione', 90, 71, 160, -6],
    ['isolante', -3, 90, 150, 0],
    ['compasso', 3, 12, 140, 10],
    ['ipe', 94, 22, 120, 0],
    ['livella', 91, 54, 160, -8],
  ],
  territorio: [
    ['palina', 90, 1, 200, 0],
    ['catasto', -4, 7, 210, -8],
    ['urbanistica', 92, 71, 170, 0],
    ['idraulica', -2, 79, 160, 0],
    ['ponte', 40, 93, 230, 0],
    ['stazione-totale', 2, 40, 150, 0],
    ['asse', 94, 30, 120, 0],
  ],
  metodo: [
    ['metro', -3, 8, 180, -10],
    ['lente', 90, 10, 170, 0],
    ['chiave', 88, 66, 160, 10],
    ['martello', 2, 70, 160, -6],
    ['cono', 45, 2, 120, 0],
    ['casco', 93, 40, 130, 0],
    ['piombo', -1, 38, 150, 0],
  ],
  contatti: [
    ['stazione-totale', 90, 5, 230, 0],
    ['caposaldo', -3, 38, 180, 0],
    ['transenna', 88, 76, 200, 0],
    ['casco', 3, 84, 160, -8],
    ['matita', 94, 44, 130, 0],
  ],
  footer: [
    ['bullone', 92, 8, 130, 0],
    ['compasso', -2, 26, 150, 10],
    ['livella', 70, 70, 150, -4],
  ],
}

const MARGINS = Object.fromEntries(
  Object.entries(MARGINS_HAND).map(([set, items], i) => [set, [...items, ...scatter(1495 + i * 97, items.length * 2)]]),
)

/**
 * Segni a margine: simboli grandi, a tratto sottile e quasi trasparenti,
 * sparsi nelle sezioni come gli schizzi ai bordi di una tavola. Stanno
 * sotto il contenuto e scorrono un poco più lenti o più veloci della
 * pagina (motion.css). Le posizioni sono in MARGINS.
 */
function Margins({ set }) {
  return (
    <div className="margins" aria-hidden="true">
      {MARGINS[set].map(([name, x, y, size, rot, o = 1], i) => (
        <Sym
          key={`${name}-${i}`}
          name={name}
          className="margins__sym"
          style={{
            '--x': `${x}%`,
            '--y': `${y}%`,
            '--size': `${size}px`,
            '--rot': `${rot}deg`,
            '--o': o,
            '--k': ((i % 4) - 1.5) / 1.5,
          }}
        />
      ))}
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Intro — cambia mentre si scorre
   Una sezione alta tre schermi con un palcoscenico fisso: la testata
   enorme atterra in alto a sinistra, entra la targa, poi il manifesto
   riga per riga. Senza animazioni scroll-driven (o su telefono) è un
   normale hero statico con gli stessi elementi.
   --------------------------------------------------------------------------- */

function Plate() {
  const ref = useRef(null)

  const onMove = useCallback((event) => {
    const el = ref.current
    if (!el || event.pointerType !== 'mouse') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = el.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    el.style.setProperty('--tilt-x', `${(-y * 6).toFixed(2)}deg`)
    el.style.setProperty('--tilt-y', `${(x * 8).toFixed(2)}deg`)
  }, [])

  const onLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.removeProperty('--tilt-x')
    el.style.removeProperty('--tilt-y')
  }, [])

  return (
    <div className="plate" ref={ref} onPointerMove={onMove} onPointerLeave={onLeave}>
      <picture className="plate__picture">
        <source srcSet="/images/hero-targa.webp" type="image/webp" />
        <img
          src="/images/hero-targa.png"
          alt="La targa dello studio: Ing. Dario Donelli, ingegneria, architettura, ambiente, progettazione integrale e coordinata"
          width="1489"
          height="967"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      </picture>
    </div>
  )
}

function Intro() {
  const onNav = useAnchorNav()

  return (
    <section className="intro has-margins" id="top">
      <Margins set="intro" />
      <div className="intro__stage">
        <div className="container intro__grid">
          <div className="intro__head">
            <h1 className="masthead">
              <span className="masthead__pre">Ing.</span>
              <span className="masthead__name">
                <Letters text="Dario Donelli" />
              </span>
            </h1>
            <p className="infoline">
              {infoline.map((item, i) => (
                <Fragment key={item}>
                  {i > 0 && <DMark />}
                  <span>{item}</span>
                </Fragment>
              ))}
            </p>
          </div>

          <div className="intro__body">
            <p className="manifesto">
              {manifesto.map((line, i) => (
                <span className="manifesto__line" key={line} style={{ '--i': i }}>
                  <span className="manifesto__in">{line}</span>
                </span>
              ))}
            </p>
            <p className="lead intro__lead">
              Studio tecnico di ingegneria a Rivalta sul Mincio. Un unico riferimento dalla
              verifica di fattibilità alla chiusura del cantiere.
            </p>
            <div className="action-row intro__actions">
              <a className="action" href="#contatti" onClick={onNav}>
                <Key wide label="Enter" />
                Parliamo del progetto
              </a>
              <a className="action" href="#servizi" onClick={onNav}>
                <Key label="F1" />
                I servizi
              </a>
            </div>
          </div>

          {/* reveal: su telefono la targa è sotto la piega, e il suo
              ingresso (con la luce che la attraversa) aspetta di vedersi. */}
          <figure className="intro__plate reveal">
            <Plate />
            <figcaption className="intro__caption">
              <span className="label">La targa dello studio</span>
              <span>{studio.address}</span>
            </figcaption>
          </figure>
        </div>

        <div className="intro__hint" aria-hidden="true">
          <span>Scorri</span>
          <span className="intro__hint-line" />
        </div>
      </div>
    </section>
  )
}

function FactsBand() {
  return (
    <div className="facts-band">
      <div className="container">
        <dl className="facts reveal reveal-stagger">
          {heroFacts.map((fact, i) => (
            <div className="facts__item" key={fact.label} style={{ '--i': i }}>
              <dt className="label">
                <Sym name={fact.sym} className="facts__sym" />
                {fact.label}
              </dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
   01 Servizi
   --------------------------------------------------------------------------- */

function ServicesSection() {
  const onNav = useAnchorNav()

  return (
    <section className="section has-margins" id="servizi">
      <Margins set="servizi" />
      <div className="container">
        <SectionHead
          id="servizi"
          title="Tre ambiti di intervento, un unico interlocutore."
          text="Lo studio copre il percorso completo di un intervento edilizio. In base alle esigenze si può attivare una singola prestazione oppure affidare l'intera gestione tecnica."
        />

        <div className="service-blocks">
          {serviceAreas.map((area, i) => (
            <article key={area.id} className={`service-block reveal${i % 2 === 1 ? ' service-block--flip' : ''}`}>
              <figure className="service-block__media wipe">
                <Photo base={area.image} ext="png" alt={area.imageAlt} width="900" height="600" />
              </figure>

              <div className="service-block__copy">
                <div className="service-block__head">
                  <span className="service-block__num" aria-hidden="true">
                    {area.num}
                  </span>
                  <Emblem name={area.icon} className="service-block__emblem" />
                </div>
                <h3 className="service-block__title">{area.title}</h3>
                <p className="body-text">{area.text}</p>

                <ul className="service-block__list reveal reveal-stagger">
                  {area.items.map((item, j) => (
                    <li key={item} style={{ '--i': j }}>
                      <DMark />
                      {item}
                    </li>
                  ))}
                </ul>

                <a className="link-sym" href="#contatti" onClick={onNav}>
                  <Sym name={area.sym} />
                  Parliamo del progetto
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="service-index reveal">
          <div className="service-index__head">
            <span className="label">Tutte le prestazioni</span>
            <span className="service-index__count">{serviceIndex.length} voci</span>
          </div>
          <ol className="index-list reveal reveal-stagger">
            {serviceIndex.map((item, i) => (
              <li key={item.label} style={{ '--i': i }}>
                <span className="index-list__num" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <Sym name={item.sym} className="index-list__sym" />
                {item.label}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------
   02 Progetti
   --------------------------------------------------------------------------- */

function ProjectsSection() {
  const [lead, ...rest] = projects

  const card = (project, isLead, i) => (
    <article key={project.id} className={isLead ? 'project project--lead reveal' : 'project reveal'} style={{ '--i': i }}>
      <figure className="project__figure wipe">
        <Photo base={project.image} alt={project.imageAlt} width="1600" height={isLead ? '1067' : '1200'} />
      </figure>
      <div className="project__body">
        <div className="project__meta">
          <span className="is-category">
            <Sym name={project.sym} className="project__sym" />
            {project.category}
          </span>
          <span>
            {project.location} · {project.year}
          </span>
        </div>
        <h3 className="project__title">{project.title}</h3>
        <p className="body-text">{project.text}</p>
      </div>
    </article>
  )

  return (
    <section className="section section--surface has-margins" id="progetti">
      <Margins set="progetti" />
      <div className="container">
        <SectionHead
          id="progetti"
          title="Interventi seguiti sul territorio."
          text="Residenziale, opere civili, recupero dell'esistente: tre ambiti in cui lo studio segue l'intervento dalla prima valutazione alla consegna."
        />
        <div className="project-grid">
          {card(lead, true, 0)}
          {rest.map((project, i) => card(project, false, i + 1))}
        </div>
        <Drawings />
      </div>
    </section>
  )
}

/**
 * Elaborati consultabili: DWG e PDF aperti direttamente nella pagina.
 * Per ora due file di esempio (vedi `sheets` in content.js). Il
 * visualizzatore non sta dentro un .reveal: a schermo intero è fisso e
 * nessun suo antenato deve avere un transform.
 */
function Drawings() {
  return (
    <div className="drawings">
      <div className="drawings__head reveal">
        <div className="drawings__meta">
          <span className="label">Elaborati consultabili</span>
          <span className="drawings__tag">Esempi</span>
        </div>
        <h3 className="drawings__title">Disegni e documenti si aprono qui, senza scaricare programmi.</h3>
        <p className="body-text drawings__lead">
          Il DWG si legge così come esce da AutoCAD, il PDF così come è stampato: si ingrandisce fino
          al dettaglio, ci si sposta sul foglio, si scarica l&rsquo;originale. I due file qui sotto
          sono esempi.
        </p>
      </div>
      <SheetViewer sheets={sheets} label="Elaborati di esempio" />
    </div>
  )
}

/* ---------------------------------------------------------------------------
   03 Lo Studio — colonna delle discipline, scheda tecnica, firma
   --------------------------------------------------------------------------- */

function Signature() {
  return (
    <div className="signature reveal">
      <Logo className="signature__logo" />
      <div className="signature__text">
        <span className="signature__name">Dario Donelli</span>
        <span className="label">Ingegnere · Rivalta sul Mincio</span>
      </div>
    </div>
  )
}

function StudioSection() {
  return (
    <section className="section section--grid has-margins" id="studio">
      <Margins set="studio" />
      <div className="container">
        <SectionHead id="studio" title="Un riferimento tecnico diretto." />

        <div className="studio-layout">
          {/* La colonna verticale delle discipline: resta ferma mentre il
              testo scorre e la voce "in lettura" si accende una alla volta. */}
          <aside className="studio__rail">
            <span className="label">Discipline</span>
            <ol className="rail-list">
              {disciplines.map((item, i) => (
                <li key={item.label} style={{ '--i': i }}>
                  <span className="rail-list__num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="rail-list__text">{item.label}</span>
                  <Sym name={item.sym} className="rail-list__sym" />
                </li>
              ))}
            </ol>
          </aside>

          <div className="studio__main">
            <p className="studio__intro reveal reveal--host">
              <Words text="Dietro allo studio c’è una persona sola: chi valuta il progetto è la stessa che poi segue il cantiere." />
            </p>

            <div className="studio__bio">
              {profile.bio.map((paragraph) => (
                <p className="body-text" key={paragraph.slice(0, 32)}>
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Profilo tecnico impostato come scheda, non come paragrafo. */}
            <div className="datasheet reveal">
              <div className="datasheet__head">
                <span className="label">Scheda tecnica</span>
                <span className="datasheet__ref">
                  {studio.name} <DMark /> Rev. {new Date().getFullYear()}
                </span>
              </div>
              <dl className="datasheet__rows">
                {profile.credentials.map((row, i) => (
                  <div className="datasheet__row" key={row.label} style={{ '--i': i }}>
                    <span className="datasheet__num" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
                <div className="datasheet__row" style={{ '--i': profile.credentials.length }}>
                  <span className="datasheet__num" aria-hidden="true">
                    07
                  </span>
                  <dt>Sede</dt>
                  <dd>{studio.address}</dd>
                </div>
              </dl>
            </div>

            <Signature />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------
   04 Territorio — fotografia della sede, cartografia, area di riferimento
   --------------------------------------------------------------------------- */

/* --- Cartografia ---
   Proiezione equirettangolare con il parallelo di riferimento a 45.2°:
   le distanze est-ovest sono scalate del coseno della latitudine, così
   la carta è geometricamente corretta e non schiacciata. */
const MAP = { w: 1200, h: 600, lng0: 10.3, lng1: 11.05, lat0: 45.335 }
const COS_LAT = Math.cos((45.2 * Math.PI) / 180)
MAP.lat1 = MAP.lat0 - ((MAP.lng1 - MAP.lng0) * COS_LAT * MAP.h) / MAP.w
const KM_PER_DEG_LAT = 111.32

const project = (lat, lng) => ({
  x: ((lng - MAP.lng0) / (MAP.lng1 - MAP.lng0)) * MAP.w,
  y: ((MAP.lat0 - lat) / (MAP.lat0 - MAP.lat1)) * MAP.h,
})
const kmToPx = (km) => (km / KM_PER_DEG_LAT / (MAP.lat0 - MAP.lat1)) * MAP.h
const f = (n) => n.toFixed(1)

/** Tracciato liscio per punti: curve quadratiche sui punti medi. */
function smoothPath(points) {
  if (points.length < 3) return points.map((p, i) => `${i ? 'L' : 'M'}${f(p.x)} ${f(p.y)}`).join(' ')
  let d = `M${f(points[0].x)} ${f(points[0].y)}`
  for (let i = 1; i < points.length - 1; i += 1) {
    const mx = (points[i].x + points[i + 1].x) / 2
    const my = (points[i].y + points[i + 1].y) / 2
    d += ` Q${f(points[i].x)} ${f(points[i].y)} ${f(mx)} ${f(my)}`
  }
  const last = points[points.length - 1]
  d += ` L${f(last.x)} ${f(last.y)}`
  return d
}

/** Tracciato chiuso liscio: come sopra, ma il giro si richiude su sé stesso. */
function smoothClosed(points) {
  const n = points.length
  const mid = (i) => ({ x: (points[i % n].x + points[(i + 1) % n].x) / 2, y: (points[i % n].y + points[(i + 1) % n].y) / 2 })
  let d = `M${f(mid(0).x)} ${f(mid(0).y)}`
  for (let i = 1; i <= n; i += 1) {
    const c = points[i % n]
    const m = mid(i)
    d += ` Q${f(c.x)} ${f(c.y)} ${f(m.x)} ${f(m.y)}`
  }
  return `${d}Z`
}

/** Coordinate in gradi e primi, come sulle carte. */
function dms(value, axis) {
  const abs = Math.abs(value)
  const deg = Math.floor(abs)
  const min = Math.round((abs - deg) * 60)
  const hemi = axis === 'lat' ? (value >= 0 ? 'N' : 'S') : value >= 0 ? 'E' : 'O'
  return `${deg}°${String(min).padStart(2, '0')}′ ${hemi}`
}

/**
 * Rosa dei venti da carta tecnica: due cerchi graduati con tacche ogni 10°,
 * stella a otto punte con le punte divise a metà, bianco e nero, come
 * nelle rose incise; i cardinali in italiano, il nord più lungo.
 */
function CompassRose({ cx, cy, r }) {
  const ticks = []
  for (let deg = 0; deg < 360; deg += 5) {
    const major = deg % 90 === 0
    const mid = deg % 30 === 0
    const inner = major ? r - 9 : mid ? r - 6 : r - 3.5
    ticks.push(
      <line
        key={deg}
        x1="0"
        y1={f(-r)}
        x2="0"
        y2={f(-inner)}
        transform={`rotate(${deg})`}
        className={major ? 'rose__tick rose__tick--major' : 'rose__tick'}
      />,
    )
  }

  // Una punta: due metà, quella destra piena e quella sinistra vuota.
  const point = (length, width, key, angle) => (
    <g key={key} transform={`rotate(${angle})`}>
      <path d={`M0 ${f(-length)}L${f(width)} 0L0 0Z`} className="rose__half rose__half--ink" />
      <path d={`M0 ${f(-length)}L${f(-width)} 0L0 0Z`} className="rose__half" />
    </g>
  )

  const cardinal = [
    ['N', 0, -r - 10, 'middle'],
    ['E', r + 11, 4, 'start'],
    ['S', 0, r + 17, 'middle'],
    ['O', -r - 11, 4, 'end'],
  ]

  return (
    <g className="rose" transform={`translate(${f(cx)} ${f(cy)})`} aria-hidden="true">
      <circle r={f(r + 3)} className="rose__disc" />
      <circle r={f(r)} className="rose__ring" />
      <circle r={f(r - 12)} className="rose__ring rose__ring--inner" />
      <g>{ticks}</g>
      {/* La stella gira da sola quando la carta entra (motion.css). Il
          cerchio invisibile la rende simmetrica, così ruota sul centro. */}
      <g className="rose__spin">
        <circle r={f(r - 1)} fill="none" />
        {/* Intercardinali, più corte e sotto */}
        {[45, 135, 225, 315].map((a) => point(r - 18, 3.2, `i${a}`, a))}
        {/* Cardinali: il nord si allunga fin quasi al bordo */}
        {[90, 180, 270].map((a) => point(r - 8, 4.6, `c${a}`, a))}
        {point(r - 1, 4.6, 'north', 0)}
        <circle r="3.2" className="rose__hub" />
      </g>
      {cardinal.map(([letter, x, y, anchor]) => (
        <text key={letter} x={f(x)} y={f(y)} textAnchor={anchor} className={letter === 'N' ? 'rose__label rose__label--n' : 'rose__label'}>
          {letter}
        </text>
      ))}
    </g>
  )
}

/* --- Radar ---
   La carta è lo schermo di un radar: dalla sede parte il fascio, gira in
   senso orario con la sua scia e accende ogni comune quando ci passa sopra.
   Il giro dura RADAR_TURN secondi; il fascio parte da nord. */
const RADAR_TURN = 6
const RADAR_TRAIL = 54 // gradi di scia dietro il fascio

/** Settore di raggio r tra gli angoli a0 e a1, in gradi da nord in senso orario. */
function sector(r, a0, a1) {
  const at = (a) => [r * Math.sin((a * Math.PI) / 180), -r * Math.cos((a * Math.PI) / 180)]
  const [x0, y0] = at(a0)
  const [x1, y1] = at(a1)
  return `M0 0L${f(x0)} ${f(y0)}A${r} ${r} 0 0 1 ${f(x1)} ${f(y1)}Z`
}

/** Dopo quanti secondi il fascio passa sul punto p, partendo da nord. */
const sweepDelay = (from, p) => {
  const bearing = ((Math.atan2(p.x - from.x, from.y - p.y) * 180) / Math.PI + 360) % 360
  return +((bearing / 360) * RADAR_TURN).toFixed(3)
}

/**
 * Il fascio: una scia fatta di spicchi sovrapposti che finiscono tutti sul
 * fascio, ognuno appena trasparente, così la luce cresce senza scalini
 * fino alla linea piena. Il cerchio vuoto rende il gruppo simmetrico, e il
 * gruppo ruota esattamente sulla sede (motion.css).
 */
function RadarSweep({ at, r }) {
  const slices = 24
  const step = RADAR_TRAIL / slices
  return (
    <g className="radar" transform={`translate(${f(at.x)} ${f(at.y)})`} aria-hidden="true">
      <g className="radar__spin">
        <circle r={r} fill="none" />
        {Array.from({ length: slices }, (_, i) => (
          <path key={i} d={sector(r, -RADAR_TRAIL + i * step, 0)} className="radar__trail" />
        ))}
        <line x1="0" y1="0" x2="0" y2={-r} className="radar__beam" />
      </g>
    </g>
  )
}

function MiniMap() {
  const river = mincio.map(([lat, lng]) => project(lat, lng))
  const riverPath = smoothPath(river)
  // Il parco accompagna il fiume da Goito (indice 3) ai laghi (indice 9).
  const parkPath = smoothPath(river.slice(3, 10))
  const studioPt = project(45.180182, 10.677598)
  const rings = [5, 10, 15, 20]

  // Reticolo ogni 0,1°
  const meridians = []
  for (let lng = Math.ceil(MAP.lng0 * 10) / 10; lng <= MAP.lng1; lng = Math.round((lng + 0.1) * 10) / 10) {
    meridians.push(lng)
  }
  const parallels = []
  for (let lat = Math.ceil(MAP.lat1 * 10) / 10; lat <= MAP.lat0; lat = Math.round((lat + 0.1) * 10) / 10) {
    parallels.push(lat)
  }

  const scaleKm = [0, 5, 10, 15]
  const scaleX = 470
  const scaleY = MAP.h - 44
  // Cartiglio della sede: in alto a destra del punto, dove la carta è libera.
  const callout = project(45.262, 10.722)
  // I comuni che il radar accende al passaggio del fascio.
  const blips = places
    .filter((place) => !place.studio)
    .map((place) => {
      const pt = project(place.lat, place.lng)
      return { name: place.name, ...pt, t: sweepDelay(studioPt, pt) }
    })

  return (
    <svg
      className="chart"
      viewBox={`0 0 ${MAP.w} ${MAP.h}`}
      style={{ '--radar-turn': `${RADAR_TURN}s` }}
      role="img"
      aria-label="Carta schematica della provincia di Mantova: la sede dello studio a Rivalta sul Mincio, il fiume Mincio con i laghi di Mantova, i comuni attorno e i raggi di 5, 10, 15 e 20 chilometri dalla sede"
    >
      <defs>
        <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" className="chart__hatch" />
        </pattern>
        <pattern id="water" width="8" height="8" patternUnits="userSpaceOnUse">
          <line x1="0" y1="4" x2="8" y2="4" className="chart__water" />
        </pattern>
        <clipPath id="frame">
          <rect x="0" y="0" width={MAP.w} height={MAP.h} />
        </clipPath>
        {/* Il vetro dello schermo: più chiaro attorno alla sede, cupo ai
            bordi, attraversato dalle righe di scansione. */}
        <radialGradient id="screen" cx={f(studioPt.x / MAP.w)} cy={f(studioPt.y / MAP.h)} r="0.75">
          <stop offset="0" stopColor="#2447c4" stopOpacity="0.32" />
          <stop offset="0.55" stopColor="#040a1d" stopOpacity="0.2" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.72" />
        </radialGradient>
        <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="1" fill="#8aa2ff" fillOpacity="0.06" />
        </pattern>
      </defs>

      <rect x="0" y="0" width={MAP.w} height={MAP.h} className="chart__bg" />

      <g clipPath="url(#frame)">
        {/* Reticolo geografico */}
        <g className="chart__grid">
          {meridians.map((lng) => {
            const { x } = project(MAP.lat0, lng)
            return <line key={`m${lng}`} x1={f(x)} y1="0" x2={f(x)} y2={MAP.h} />
          })}
          {parallels.map((lat) => {
            const { y } = project(lat, MAP.lng0)
            return <line key={`p${lat}`} x1="0" y1={f(y)} x2={MAP.w} y2={f(y)} />
          })}
        </g>

        {/* Raggi dalla sede */}
        <g className="chart__rings">
          {rings.map((km, i) => (
            <g key={km} style={{ '--i': i }}>
              <circle cx={f(studioPt.x)} cy={f(studioPt.y)} r={f(kmToPx(km))} />
              <text x={f(studioPt.x - kmToPx(km) * 0.707 - 4)} y={f(studioPt.y - kmToPx(km) * 0.707 - 4)} textAnchor="end">
                {km} km
              </text>
            </g>
          ))}
        </g>

        {/* Parco del Mincio, fiume, laghi */}
        <path d={parkPath} className="chart__park" />
        <path d={parkPath} className="chart__park-hatch" />
        {lakes.map((poly, i) => (
          <path key={i} d={smoothClosed(poly.map(([lat, lng]) => project(lat, lng)))} className="chart__lake" />
        ))}
        {/* pathLength="1": il fiume si traccia dal Garda ai laghi (motion.css). */}
        <path d={riverPath} className="chart__river-casing" pathLength="1" />
        <path d={riverPath} className="chart__river" pathLength="1" />
        <text className="chart__toponym" transform={`translate(${f(river[1].x - 10)} ${f(river[1].y + 46)}) rotate(-82)`}>
          fiume Mincio
        </text>
        <text className="chart__toponym" x={f(project(45.208, 10.702).x)} y={f(project(45.208, 10.702).y)}>
          Parco del Mincio
        </text>
        <text className="chart__toponym chart__toponym--small" x={f(project(45.147, 10.716).x)} y={f(project(45.147, 10.716).y)}>
          laghi di Mantova
        </text>

        {/* Comuni */}
        {places.map((place) => {
          if (place.studio) return null
          const { x, y } = project(place.lat, place.lng)
          const side = place.label || (x > MAP.w - 130 ? 'left' : 'right')
          const anchor = side === 'left' ? 'end' : side === 'above' ? 'middle' : 'start'
          const dx = side === 'left' ? -9 : side === 'above' ? 0 : 9
          const dy = side === 'above' ? -8 : 3.5
          if (place.capital) {
            return (
              <g key={place.name} className="chart__capital">
                <circle cx={f(x)} cy={f(y)} r="7" className="chart__capital-ring" />
                <circle cx={f(x)} cy={f(y)} r="3.2" className="chart__capital-dot" />
                <text x={f(x + 13)} y={f(y + 4)} className="chart__label chart__label--capital">
                  {place.name.toUpperCase()}
                </text>
              </g>
            )
          }
          return (
            <g key={place.name}>
              <rect x={f(x - 2.5)} y={f(y - 2.5)} width="5" height="5" className="chart__town" />
              <text x={f(x + dx)} y={f(y + dy)} textAnchor={anchor} className="chart__label">
                {place.name}
              </text>
            </g>
          )
        })}

        {/* Il radar: croce di riferimento sulla sede, fascio che gira, comuni
            che si accendono quando il fascio ci passa sopra. */}
        <g className="radar__cross" aria-hidden="true">
          <line x1="0" y1={f(studioPt.y)} x2={MAP.w} y2={f(studioPt.y)} />
          <line x1={f(studioPt.x)} y1="0" x2={f(studioPt.x)} y2={MAP.h} />
        </g>
        <RadarSweep at={studioPt} r={780} />
        <g className="radar__blips" aria-hidden="true">
          {blips.map((blip) => (
            <circle key={blip.name} cx={f(blip.x)} cy={f(blip.y)} r="11" className="radar__blip" style={{ '--t': `${blip.t}s` }} />
          ))}
        </g>

        {/* Sede dello studio: marcatore a D, linea di richiamo, cartiglio */}
        <g className="chart__studio">
          <circle cx={f(studioPt.x)} cy={f(studioPt.y)} r="16" className="chart__halo" />
          <path d={`M${f(studioPt.x - 6)} ${f(studioPt.y - 6)}h6a6 6 0 0 1 0 12h-6z`} className="chart__d" />
          <path
            d={`M${f(studioPt.x + 10)} ${f(studioPt.y - 10)}L${f(callout.x)} ${f(callout.y + 76)}`}
            className="chart__leader"
            pathLength="1"
          />
          <g transform={`translate(${f(callout.x)} ${f(callout.y)})`}>
            <g className="chart__callout-in">
              <rect x="0" y="0" width="212" height="76" className="chart__callout" />
              <text x="12" y="20" className="chart__callout-label">
                Sede dello studio
              </text>
              <text x="12" y="40" className="chart__callout-title">
                Rivalta sul Mincio
              </text>
              <text x="12" y="60" className="chart__callout-coords">
                {dms(45.180182, 'lat')} · {dms(10.677598, 'lng')}
              </text>
            </g>
          </g>
        </g>
      </g>

      {/* Etichette del reticolo sui bordi */}
      <g className="chart__grid-labels">
        {meridians.map((lng) => {
          const { x } = project(MAP.lat0, lng)
          return (
            <text key={`ml${lng}`} x={f(x + 3)} y="12">
              {dms(lng, 'lng')}
            </text>
          )
        })}
        {parallels.map((lat) => {
          const { y } = project(lat, MAP.lng0)
          return (
            <text key={`pl${lat}`} x={MAP.w - 6} y={f(y - 4)} textAnchor="end">
              {dms(lat, 'lat')}
            </text>
          )
        })}
      </g>

      {/* Scala grafica a blocchi alterni */}
      <g className="chart__scale" transform={`translate(${scaleX} ${scaleY})`}>
        {scaleKm.slice(0, -1).map((km, i) => (
          <rect
            key={km}
            x={f(kmToPx(km))}
            y="0"
            width={f(kmToPx(scaleKm[i + 1]) - kmToPx(km))}
            height="6"
            className={i % 2 ? 'chart__scale-block chart__scale-block--alt' : 'chart__scale-block'}
          />
        ))}
        {scaleKm.map((km) => (
          <text key={`t${km}`} x={f(kmToPx(km))} y="20" textAnchor="middle">
            {km}
          </text>
        ))}
        <text x={f(kmToPx(scaleKm[scaleKm.length - 1]) + 10)} y="20">
          km
        </text>
      </g>

      <CompassRose cx={MAP.w - 84} cy={188} r={50} />

      <rect x="0" y="0" width={MAP.w} height={MAP.h} className="chart__scan" />

    </svg>
  )
}

function TerritorySection() {
  const scroller = useRef(null)

  // Su schermo stretto la carta scorre in orizzontale: si parte centrati
  // sulla sede, non sul bordo ovest della provincia.
  useEffect(() => {
    const el = scroller.current
    if (!el) return
    el.scrollLeft = (el.scrollWidth - el.clientWidth) * 0.48
  }, [])

  return (
    <section className="section section--surface has-margins" id="territorio">
      <Margins set="territorio" />
      <div className="container">
        <SectionHead
          id="territorio"
          title="Sede a Rivalta sul Mincio, attività in tutta la provincia."
          text="Lo studio ha sede alle porte del Parco del Mincio e opera nel territorio mantovano e nei comuni limitrofi."
        />
      </div>

      {/* Fotografia a tutto schermo, ferma: non si ritaglia né si muove
          mentre si scorre. */}
      <div className="terr">
        <figure className="terr__photo">
          <Photo
            base="/images/studio-esterno"
            alt="L'edificio d'angolo che ospita lo studio, con la vetrina e l'ingresso su strada"
            width="1536"
            height="1024"
          />
        </figure>
      </div>

      <div className="container">
        <div className="terr__map reveal">
          <div className="terr__map-head">
            <span className="label">Cartografia</span>
            <span className="terr__map-title">Provincia di Mantova</span>
            <span className="terr__map-note">Carta schematica · reticolo 0,1° · equirettangolare, parallelo 45°12′</span>
          </div>
          {/* I gesti orizzontali restano alla carta, quelli verticali alla pagina. */}
          <div className="terr__map-scroll" ref={scroller} data-lenis-prevent-horizontal>
            <MiniMap />
          </div>
          <p className="terr__map-hint" aria-hidden="true">
            <Sym name="quota" />
            Scorri la carta in orizzontale
          </p>
        </div>

        <Nuvola />
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------
   05 Metodo
   --------------------------------------------------------------------------- */

function MethodSection() {
  return (
    <section className="section has-margins" id="metodo">
      <Margins set="metodo" />
      <div className="container">
        <SectionHead
          id="metodo"
          title="Come si sviluppa un incarico."
          text="Quattro fasi, con un punto di verifica alla fine di ciascuna: si procede alla successiva solo quando il quadro è chiaro."
        />
        <ol className="method reveal reveal-stagger">
          {method.map((step, i) => (
            <li key={step.num} className="method__step" style={{ '--i': i }}>
              <div className="method__head">
                <span className="method__num" aria-hidden="true">
                  {step.num}
                </span>
                <Emblem name={step.icon} className="method__emblem" />
              </div>
              <h3 className="method__title">{step.title}</h3>
              <p className="method__text">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------
   06 Contatti — il blocco nero della pagina
   --------------------------------------------------------------------------- */

function ContactSection() {
  return (
    <section className="section contact has-margins" id="contatti">
      <Margins set="contatti" />
      <div className="container">
        <SectionHead
          id="contatti"
          title="Parliamo del progetto."
          text="Il primo contatto serve a capire se e come posso essere utile. Una telefonata o una mail sono sufficienti per fissare un sopralluogo."
        />

        <div className="contact-grid">
          <ul className="contact-list reveal reveal-stagger">
            <li className="contact-item" style={{ '--i': 0 }}>
              <a className="contact-item__link" href={studio.phoneHref}>
                <Key label="Tel" className="contact-item__icon" />
                <span className="contact-item__text">
                  <span className="label">Telefono</span>
                  <span className="contact-item__value">{studio.phoneDisplay}</span>
                  <span className="contact-item__note">Risponde direttamente lo studio</span>
                </span>
              </a>
            </li>
            <li className="contact-item" style={{ '--i': 1 }}>
              <a className="contact-item__link" href={studio.emailHref}>
                <Key label="Mail" className="contact-item__icon" />
                <span className="contact-item__text">
                  <span className="label">Email</span>
                  <span className="contact-item__value">{studio.email}</span>
                  <span className="contact-item__note">Descriva l&rsquo;immobile e cosa ha in mente</span>
                </span>
              </a>
            </li>
            <li className="contact-item" style={{ '--i': 2 }}>
              <a className="contact-item__link" href={studio.mapsHref} target="_blank" rel="noreferrer">
                <Key label="Sede" className="contact-item__icon" />
                <span className="contact-item__text">
                  <span className="label">Studio</span>
                  <span className="contact-item__value">
                    Via Filippo Turati, 1<br />
                    46040 Rivalta sul Mincio (MN)
                  </span>
                  <span className="contact-item__note">All&rsquo;angolo tra via Turati e vicolo Zibramonda</span>
                </span>
              </a>
            </li>
          </ul>

          <div className="contact__map-col reveal">
            <a
              className="map"
              href={studio.mapsHref}
              target="_blank"
              rel="noreferrer"
              aria-label={`Apri su Google Maps la posizione dello studio: ${studio.address}`}
            >
              {/* Lo schermo sta dentro una cornice d'acciaio: la carta di
                  dettaglio virata in blu notte, sopra gli anelli e il fascio
                  del radar che gira sulla sede. */}
              <span className="map__screen" aria-hidden="true">
                <span className="map__crop">
                  <iframe
                    className="map__frame"
                    src={mapEmbedSrc}
                    title="Mappa della posizione dello studio a Rivalta sul Mincio"
                    loading="lazy"
                    tabIndex={-1}
                  />
                </span>
                <span className="map__radar" />
                <span className="map__pin">
                  <DMark />
                </span>
                <span className="map__cta">
                  <Sym name="caposaldo" />
                  Itinerario su Google Maps
                </span>
              </span>
            </a>
            <p className="map__note">
              Cartografia di dettaglio{' '}
              <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
                © OpenStreetMap
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------
   Footer — impostato come la testata di una tavola: celle, etichette,
   revisione. Senza fingere di essere un cartiglio.
   --------------------------------------------------------------------------- */

function Footer() {
  const year = new Date().getFullYear()
  const onNav = useAnchorNav()
  const updated = new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' }).format(new Date())

  return (
    <footer className="footer has-margins">
      <Margins set="footer" />
      <div className="container">
        {/* Il nome si compone segmento per segmento mentre si arriva in
            fondo alla pagina, e si cancella risalendo. */}
        <LedDisplay text={studio.name} />
        <div className="titleblock">
          {/* Marchio e indirizzo composti come sulla targa. In fondo alla
              pagina il marchio si ridisegna, come nell'header all'apertura. */}
          <div className="tb tb--brand reveal reveal--host">
            <Logo className="tb__logo" />
            <div className="tb__brand-copy">
              <span className="tb__name">{studio.name}</span>
              <span className="tb__role">Ingegneria · Architettura · Ambiente</span>
            </div>
            <p className="address-mark">
              <span>Via Filippo Turati 1</span>
              <span>46040 Rivalta sul Mincio</span>
              <span>Mantova · Italia</span>
            </p>
          </div>

          <div className="tb">
            <span className="tb__label">Recapiti</span>
            <ul className="tb__list">
              <li>
                <a href={studio.phoneHref}>{studio.phoneDisplay}</a>
              </li>
              <li>
                <a className="tb__break" href={studio.emailHref}>
                  {studio.email}
                </a>
              </li>
              <li>
                <a href={studio.mapsHref} target="_blank" rel="noreferrer">
                  <Sym name="caposaldo" className="tb__ext" />
                  Itinerario
                </a>
              </li>
            </ul>
          </div>

          <div className="tb">
            <span className="tb__label">Iscrizione</span>
            <ul className="tb__list">
              <li>Ordine degli Ingegneri della Provincia di Mantova</li>
              <li>n. 1495 · dal 24 maggio 2010</li>
              <li>Settore a) civile e ambientale</li>
            </ul>
          </div>

          <div className="tb">
            <span className="tb__label">Sezioni</span>
            <ul className="tb__list tb__list--nav">
              {sections.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} onClick={onNav}>
                    <span className="tb__num">{item.num}</span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="tb tb--meta">
            <div>
              <span className="tb__label">Aggiornamento</span>
              <span className="tb__value">{updated}</span>
            </div>
            <div>
              <span className="tb__label">Note legali</span>
              <span className="tb__value">Privacy e cookie policy in preparazione</span>
            </div>
            <div>
              <span className="tb__label">Sito</span>
              <span className="tb__value">
                <a href="https://www.albertopecchini.it" target="_blank" rel="noreferrer">
                  Alberto Pecchini
                </a>
              </span>
            </div>
            <div>
              <span className="tb__label">Copyright</span>
              <span className="tb__value">
                © {year} {studio.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ---------------------------------------------------------------------------
   Composizione
   --------------------------------------------------------------------------- */

const legacyPaths = {
  '/servizi': 'servizi',
  '/progetti': 'progetti',
  '/studio': 'studio',
  '/contatti': 'contatti',
}

function Layout() {
  useSmoothScroll()
  useReveal()
  const active = useScrollSpy(sectionIds)

  useEffect(() => {
    const path = window.location.pathname.replace(/\/$/, '')
    const target = legacyPaths[path] || window.location.hash.slice(1)
    if (path && legacyPaths[path]) {
      window.history.replaceState(null, '', `/#${legacyPaths[path]}`)
    }
    if (!target) return
    const frame = window.requestAnimationFrame(() => {
      if (document.getElementById(target)) scrollToTarget(target, { immediate: true })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [])

  return (
    <>
      <a className="skip-link" href="#contenuto">
        Salta al contenuto
      </a>

      <div className="progress" aria-hidden="true" />

      <Header active={active} />
      <SideRail />
      <Corner active={active} />

      <main className="site-main" id="contenuto">
        <Intro />
        <FactsBand />
        <ServicesSection />
        <ProjectsSection />
        <StudioSection />
        <TerritorySection />
        <MethodSection />
        <ContactSection />
      </main>

      <Footer />
    </>
  )
}

export default function App() {
  return <Layout />
}
