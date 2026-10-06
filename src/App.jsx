import { Fragment, useCallback, useEffect, useState } from 'react'
import './App.css'
import { scrollToTarget, setScrollLocked, useReveal, useSmoothScroll } from './motion.js'
import {
  ambiti,
  disciplines,
  heroFacts,
  infoline,
  manifesto,
  mapEmbedSrc,
  method,
  navItems,
  profile,
  projects,
  sections,
  serviceAreas,
  serviceIndex,
  studio,
} from './content.js'

/* ---------------------------------------------------------------------------
   Marchio
   Il logo della targa ridisegnato in vettoriale: una "D" a doppio profilo,
   in nero, sovrapposta alla sua immagine speculare in grigio.
   --------------------------------------------------------------------------- */

const LOGO_OUTER = 'M64 64H520A456 456 0 0 1 520 976H64Z'
const LOGO_INNER = 'M164 164H520A356 356 0 0 1 520 876H164Z'

function Logo({ className = '', ...props }) {
  return (
    <svg viewBox="0 0 1040 1040" fill="none" aria-hidden="true" className={`logo ${className}`} {...props}>
      <g className="logo__ghost" stroke="#b9b5ae" strokeWidth="48" transform="matrix(-1 0 0 1 1040 0)">
        <path d={LOGO_OUTER} />
        <path d={LOGO_INNER} />
      </g>
      <g stroke="currentColor" strokeWidth="48">
        <path d={LOGO_OUTER} />
        <path d={LOGO_INNER} />
      </g>
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
 * poco sotto l'header. Alimenta la sottolineatura della navigazione.
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

function useAnchorNav() {
  return useCallback((event) => {
    const id = event.currentTarget.getAttribute('href').slice(1)
    event.preventDefault()
    scrollToSection(id)
  }, [])
}

/* ---------------------------------------------------------------------------
   Header
   --------------------------------------------------------------------------- */

const sectionIds = sections.map((section) => section.id)

function Brand() {
  return (
    <span className="brand__inner">
      <Logo className="brand__mark" />
      <span className="brand__copy">
        <span className="brand__name">{studio.name}</span>
        <span className="brand__role">{studio.role}</span>
      </span>
    </span>
  )
}

function Header({ active }) {
  const scrolled = useScrolled()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    setScrollLocked(menuOpen)
    return () => {
      document.body.style.overflow = ''
      setScrollLocked(false)
    }
  }, [menuOpen])

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
            <Brand />
          </a>

          <nav className="nav" aria-label="Navigazione principale">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={active === item.id ? 'nav__link is-active' : 'nav__link'}
                aria-current={active === item.id ? 'true' : undefined}
                onClick={(e) => go(e, item.id)}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="header__actions">
            <a className="header__phone" href={studio.phoneHref}>
              {studio.phoneDisplay}
            </a>
            <button
              type="button"
              className="menu-toggle"
              aria-expanded={menuOpen}
              aria-controls="mobile-panel"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? 'Chiudi' : 'Menu'}
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
        <button type="button" className="mobile-panel__close" onClick={() => setMenuOpen(false)}>
          Chiudi
        </button>
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
          <a href={studio.phoneHref}>{studio.phoneDisplay}</a>
          <a href={studio.emailHref}>{studio.email}</a>
        </div>
      </aside>
    </>
  )
}

/* ---------------------------------------------------------------------------
   Blocchi riutilizzabili
   --------------------------------------------------------------------------- */

/**
 * Intestazione di sezione: numero ed etichetta sul filetto, poi il titolo.
 * Il filetto sottile è l'unico segno grafico che attraversa il sito.
 */
function SectionHead({ id, title, text }) {
  const section = sections.find((s) => s.id === id)
  return (
    <div className="section-head reveal">
      <div className="section-head__meta">
        <span className="section-head__index">{section.num}</span>
        <span className="label">{section.label}</span>
      </div>
      <div className="section-head__body">
        <h2 className="headline">{title}</h2>
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

/** Collegamento testuale con la sottolineatura sottile: l'unica "azione" del sito. */
function TextLink({ href, onClick, children, ...props }) {
  return (
    <a className="text-link" href={href} onClick={onClick} {...props}>
      {children}
    </a>
  )
}

/* ---------------------------------------------------------------------------
   Intro
   --------------------------------------------------------------------------- */

function Intro() {
  const onNav = useAnchorNav()

  return (
    <section className="intro" id="top">
      <div className="container">
        <h1 className="masthead">
          <span className="masthead__pre">Ing.</span>
          <span className="masthead__name">Dario Donelli</span>
        </h1>

        <p className="infoline">
          {infoline.map((item, i) => (
            <Fragment key={item}>
              {i > 0 && <span aria-hidden="true">·</span>}
              <span>{item}</span>
            </Fragment>
          ))}
        </p>

        <div className="intro__grid">
          <div className="intro__body">
            <p className="manifesto">
              {manifesto.map((line) => (
                <span className="manifesto__line" key={line}>
                  {line}
                </span>
              ))}
            </p>
          </div>

          <div className="intro__aside">
            <p className="lead intro__lead">
              Studio tecnico di ingegneria a Rivalta sul Mincio. Un unico riferimento dalla verifica
              di fattibilità alla chiusura del cantiere.
            </p>
            <p className="intro__plate">
              {studio.plate.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>
            <div className="intro__actions">
              <TextLink href="#contatti" onClick={onNav}>
                Parliamo del progetto
              </TextLink>
              <TextLink href="#servizi" onClick={onNav}>
                I servizi
              </TextLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FactsBand() {
  return (
    <div className="facts-band">
      <div className="container">
        <dl className="facts reveal">
          {heroFacts.map((fact) => (
            <div className="facts__item" key={fact.label}>
              <dt className="label">{fact.label}</dt>
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
    <section className="section" id="servizi">
      <div className="container">
        <SectionHead
          id="servizi"
          title="Tre ambiti di intervento, un unico interlocutore."
          text="Lo studio copre il percorso completo di un intervento edilizio. In base alle esigenze si può attivare una singola prestazione oppure affidare l'intera gestione tecnica."
        />

        <div className="service-blocks">
          {serviceAreas.map((area, i) => (
            <article key={area.id} className={`service-block reveal${i % 2 === 1 ? ' service-block--flip' : ''}`}>
              <figure className="service-block__media">
                <Photo base={area.image} ext="png" alt={area.imageAlt} width="900" height="600" />
              </figure>

              <div className="service-block__copy">
                <span className="service-block__num">{area.num}</span>
                <h3 className="service-block__title">{area.title}</h3>
                <p className="body-text">{area.text}</p>

                <ul className="service-block__list">
                  {area.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>

                <TextLink href="#contatti" onClick={onNav}>
                  Parliamo del progetto
                </TextLink>
              </div>
            </article>
          ))}
        </div>

        <div className="service-index reveal">
          <div className="service-index__head">
            <span className="label">Tutte le prestazioni</span>
            <span className="service-index__count">{serviceIndex.length} voci</span>
          </div>
          <ol className="index-list">
            {serviceIndex.map((item, i) => (
              <li key={item}>
                <span className="index-list__num">{String(i + 1).padStart(2, '0')}</span>
                {item}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------
   02 Ambiti di intervento
   --------------------------------------------------------------------------- */

function AmbitiSection() {
  return (
    <section className="section section--surface" id="ambiti">
      <div className="container">
        <SectionHead
          id="ambiti"
          title="Gli ambiti in cui opera lo studio."
          text="Dalla nuova costruzione al restauro: gli interventi vengono seguiti dalla prima valutazione alla consegna, sul territorio mantovano e nei comuni limitrofi."
        />

        <ol className="ambiti-list reveal">
          {ambiti.map((item, i) => (
            <li key={item}>
              <span className="ambiti-list__num">{String(i + 1).padStart(2, '0')}</span>
              <span className="ambiti-list__label">{item}</span>
            </li>
          ))}
        </ol>

        <div className="project-grid">
          {projects.map((project, i) => (
            <article key={project.id} className={i === 0 ? 'project project--lead reveal' : 'project reveal'}>
              <figure className="project__figure">
                <Photo base={project.image} alt={project.imageAlt} width="1600" height={i === 0 ? '1067' : '1200'} />
              </figure>
              <div className="project__body">
                <p className="project__meta">
                  <span>{project.category}</span>
                  <span>
                    {project.location} · {project.year}
                  </span>
                </p>
                <h3 className="project__title">{project.title}</h3>
                <p className="body-text">{project.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------
   03 Lo Studio
   --------------------------------------------------------------------------- */

function StudioSection() {
  return (
    <section className="section" id="studio">
      <div className="container">
        <SectionHead id="studio" title="Un riferimento tecnico diretto." />

        <div className="studio-layout">
          <aside className="studio__rail">
            <span className="label">Discipline</span>
            <ol className="rail-list">
              {disciplines.map((item, i) => (
                <li key={item}>
                  <span className="rail-list__num">{String(i + 1).padStart(2, '0')}</span>
                  {item}
                </li>
              ))}
            </ol>
          </aside>

          <div className="studio__main">
            <p className="studio__intro reveal">
              Dietro allo studio c’è una persona sola: chi valuta il progetto è la stessa che poi
              segue il cantiere.
            </p>

            <div className="studio__bio">
              {profile.bio.map((paragraph) => (
                <p className="body-text" key={paragraph.slice(0, 32)}>
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Profilo tecnico impostato come scheda, non come paragrafo. */}
            <dl className="datasheet reveal">
              {profile.credentials.map((row) => (
                <div className="datasheet__row" key={row.label}>
                  <dt className="label">{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
              <div className="datasheet__row">
                <dt className="label">Sede</dt>
                <dd>{studio.address}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* La sede: fotografia larga, ferma, con la didascalia sul filetto. */}
      <div className="container">
        <figure className="studio-photo reveal">
          <Photo
            base="/images/studio-esterno"
            alt="L'edificio d'angolo che ospita lo studio, con la vetrina e l'ingresso su strada"
            width="1536"
            height="1024"
          />
          <figcaption className="studio-photo__caption">
            <span className="label">La sede</span>
            <span>
              Via Filippo Turati 1, Rivalta sul Mincio — alle porte del Parco del Mincio, attività in
              tutta la provincia di Mantova.
            </span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------
   04 Metodo
   --------------------------------------------------------------------------- */

function MethodSection() {
  return (
    <section className="section section--surface" id="metodo">
      <div className="container">
        <SectionHead
          id="metodo"
          title="Come si sviluppa un incarico."
          text="Quattro fasi, con un punto di verifica alla fine di ciascuna: si procede alla successiva solo quando il quadro è chiaro."
        />
        <ol className="method reveal">
          {method.map((step) => (
            <li key={step.num} className="method__step">
              <span className="method__num">{step.num}</span>
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
   05 Contatti
   --------------------------------------------------------------------------- */

function ContactSection() {
  return (
    <section className="section" id="contatti">
      <div className="container">
        <SectionHead
          id="contatti"
          title="Parliamo del progetto."
          text="Il primo contatto serve a capire se e come posso essere utile. Una telefonata o una mail sono sufficienti per fissare un sopralluogo."
        />

        <div className="contact-grid">
          <ul className="contact-list reveal">
            <li className="contact-item">
              <span className="label">Telefono</span>
              <a className="contact-item__value" href={studio.phoneHref}>
                {studio.phoneDisplay}
              </a>
              <span className="contact-item__note">Risponde direttamente lo studio</span>
            </li>
            <li className="contact-item">
              <span className="label">Email</span>
              <a className="contact-item__value contact-item__value--break" href={studio.emailHref}>
                {studio.email}
              </a>
              <span className="contact-item__note">Descriva l&rsquo;immobile e cosa ha in mente</span>
            </li>
            <li className="contact-item">
              <span className="label">Studio</span>
              <span className="contact-item__value">
                Via Filippo Turati, 1<br />
                46040 Rivalta sul Mincio (MN)
              </span>
              <span className="contact-item__note">All&rsquo;angolo tra via Turati e vicolo Zibramonda</span>
            </li>
          </ul>

          <div className="contact__map-col reveal">
            {/* La carta è virata in bianco e nero dal CSS: resta una mappa
                leggibile, senza colori che stonano con la pagina. */}
            <div className="map">
              <iframe
                className="map__frame"
                src={mapEmbedSrc}
                title="Mappa della posizione dello studio a Rivalta sul Mincio"
                loading="lazy"
              />
            </div>
            <p className="map__links">
              <TextLink href={studio.mapsHref} target="_blank" rel="noreferrer">
                Itinerario su Google Maps
              </TextLink>
              <a className="map__credit" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
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
   Footer
   --------------------------------------------------------------------------- */

function Footer() {
  const year = new Date().getFullYear()
  const onNav = useAnchorNav()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <Logo className="footer__logo" />
            <p className="footer__name">{studio.name}</p>
            <p className="footer__role">{studio.plate[0]}</p>
            <p className="footer__address">
              Via Filippo Turati 1<br />
              46040 Rivalta sul Mincio
              <br />
              Mantova · Italia
            </p>
          </div>

          <div className="footer__col">
            <span className="label">Recapiti</span>
            <ul>
              <li>
                <a href={studio.phoneHref}>{studio.phoneDisplay}</a>
              </li>
              <li>
                <a className="footer__break" href={studio.emailHref}>
                  {studio.email}
                </a>
              </li>
              <li>
                <a href={studio.mapsHref} target="_blank" rel="noreferrer">
                  Itinerario
                </a>
              </li>
            </ul>
          </div>

          <div className="footer__col">
            <span className="label">Iscrizione</span>
            <ul>
              <li>Ordine degli Ingegneri della Provincia di Mantova</li>
              <li>n. 1495 · dal 24 maggio 2010</li>
              <li>Settore a) civile e ambientale</li>
            </ul>
          </div>

          <div className="footer__col">
            <span className="label">Sezioni</span>
            <ul>
              {sections.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} onClick={onNav}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer__meta">
          <span>
            © {year} {studio.name}
          </span>
          <span>Privacy e cookie policy in preparazione</span>
          <span>
            Sito{' '}
            <a href="https://www.albertopecchini.it" target="_blank" rel="noreferrer">
              Alberto Pecchini
            </a>
          </span>
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
  '/progetti': 'ambiti',
  '/studio': 'studio',
  '/contatti': 'contatti',
}

function Layout() {
  useSmoothScroll()
  useReveal()
  const active = useScrollSpy(sectionIds)

  useEffect(() => {
    const path = window.location.pathname.replace(/\/$/, '')
    const hash = window.location.hash.slice(1)
    // Anche gli indirizzi della versione precedente del sito restano vivi.
    const target = legacyPaths[path] || (hash === 'progetti' || hash === 'territorio' ? 'ambiti' : hash)
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

      <Header active={active} />

      <main className="site-main" id="contenuto">
        <Intro />
        <FactsBand />
        <ServicesSection />
        <AmbitiSection />
        <StudioSection />
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
