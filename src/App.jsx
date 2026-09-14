import { useCallback, useEffect, useRef, useState } from 'react'
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import './palettes.css'
import './App.css'
import {
  company,
  companyDetails,
  disciplines,
  heroCompetences,
  mapEmbedSrc,
  method,
  navItems,
  palettes,
  profile,
  projects,
  serviceAreas,
  serviceIndex,
  studio,
} from './content.js'

/* ---------------------------------------------------------------------------
   Icone — disegnate inline per evitare una dipendenza da una icon library
   per soli tre glifi, e per tenerle coerenti di peso (1.5px).
   --------------------------------------------------------------------------- */

function IconArrow(props) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M2.5 8h11m0 0L9 3.5M13.5 8 9 12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconClose(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconCheck(props) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M3 8.5 6.5 12 13 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

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

function IconMail(props) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <rect x="2" y="3.5" width="12" height="9" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
      <path d="m2.6 4.6 4.7 3.4c.4.3 1 .3 1.4 0l4.7-3.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function IconPin(props) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M8 14.2s4.5-4 4.5-7.4a4.5 4.5 0 0 0-9 0C3.5 10.2 8 14.2 8 14.2Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="6.7" r="1.6" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

function IconExternal(props) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M6.5 3.5h-3v9h9v-3M9.5 3.5h3v3M12.5 3.5 7 9"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ---------------------------------------------------------------------------
   Hook di supporto
   --------------------------------------------------------------------------- */

/** Aggiunge una classe all'header dopo una breve soglia di scroll. */
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
 * Rivelazione allo scroll. Un solo observer per tutti gli elementi .reveal
 * presenti nella pagina corrente; gli elementi già visibili non vengono
 * ri-animati quando escono dallo schermo.
 */
function useReveal(deps) {
  useEffect(() => {
    const nodes = document.querySelectorAll('.reveal:not(.is-visible)')
    if (!nodes.length) return

    // Se il browser non supporta l'observer, mostra tutto subito.
    if (typeof IntersectionObserver === 'undefined') {
      nodes.forEach((node) => node.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
    )

    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/** Riporta in cima a ogni cambio di rotta. */
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

/* ---------------------------------------------------------------------------
   Selettore di palette
   --------------------------------------------------------------------------- */

const THEME_KEY = 'dd-theme'

/** Legge la palette salvata. Isolata perché localStorage può lanciare. */
function readSavedTheme() {
  try {
    const saved = window.localStorage.getItem(THEME_KEY)
    if (saved && palettes.some((p) => p.id === saved)) return saved
  } catch {
    // localStorage non disponibile: si resta sul default.
  }
  return 'terracotta'
}

function ThemeSwitcher() {
  // Inizializzazione pigra: evita un secondo render al primo caricamento.
  const [theme, setTheme] = useState(readSavedTheme)
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      window.localStorage.setItem(THEME_KEY, theme)
    } catch {
      // Ignora: la palette resta comunque applicata per la sessione.
    }
  }, [theme])

  // Chiude il pannello con Esc o con un clic all'esterno.
  useEffect(() => {
    if (!open) return

    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const onClick = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [open])

  const current = palettes.find((p) => p.id === theme) ?? palettes[0]

  return (
    <div className="theme-switch" ref={rootRef}>
      {open && (
        <div className="theme-switch__panel" role="group" aria-label="Palette del sito">
          <span className="label theme-switch__label">Palette</span>
          {palettes.map((palette) => (
            <button
              key={palette.id}
              type="button"
              className="theme-switch__option"
              aria-pressed={palette.id === theme}
              onClick={() => setTheme(palette.id)}
            >
              <span
                className="theme-switch__swatch"
                style={{ background: palette.swatch }}
                aria-hidden="true"
              />
              {palette.name}
              {palette.id === theme && <IconCheck className="theme-switch__check" />}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        className="theme-switch__toggle"
        aria-expanded={open}
        aria-label={`Palette: ${current.name}. Cambia palette`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="theme-switch__dot" aria-hidden="true" />
        <span className="theme-switch__name">{current.name}</span>
      </button>
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Header
   --------------------------------------------------------------------------- */

function Header() {
  const scrolled = useScrolled()
  const { pathname } = useLocation()
  const [openedAt, setOpenedAt] = useState(null)

  // Il pannello è aperto solo finché si resta sulla rotta da cui è stato
  // aperto: la navigazione lo chiude senza bisogno di un effetto.
  const menuOpen = openedAt === pathname
  const setMenuOpen = useCallback(
    (next) => setOpenedAt(next ? pathname : null),
    [pathname],
  )

  // Blocca lo scroll della pagina mentre il pannello è aperto.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event) => {
      // setOpenedAt è stabile: chiudere significa sempre azzerare la rotta.
      if (event.key === 'Escape') setOpenedAt(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const navClass = useCallback(
    ({ isActive }) => (isActive ? 'nav__link is-active' : 'nav__link'),
    [],
  )

  return (
    <>
      <header className={scrolled ? 'header header--scrolled' : 'header'}>
        <div className="container header__inner">
          <Link to="/" className="brand" aria-label={`${studio.name}, torna alla home`}>
            <span className="brand__mark">
              <img src="/chatgpt-logo.png" alt="" width="42" height="42" />
            </span>
            <span className="brand__copy">
              <span className="brand__name">{studio.name}</span>
              <span className="brand__role">{studio.role}</span>
            </span>
          </Link>

          <nav className="nav" aria-label="Navigazione principale">
            {navItems.map((item) => (
              <NavLink key={item.path} to={item.path} className={navClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="header__actions">
            <a className="header__phone" href={studio.phoneHref}>
              {studio.phoneDisplay}
            </a>
            <Link className="btn btn--primary header__cta" to="/contatti">
              Richiedi un appuntamento
            </Link>

            <button
              type="button"
              className="menu-toggle"
              aria-expanded={menuOpen}
              aria-controls="mobile-panel"
              aria-label={menuOpen ? 'Chiudi il menu' : 'Apri il menu'}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span className="menu-toggle__bars" aria-hidden="true">
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <button
          type="button"
          className="scrim"
          aria-label="Chiudi il menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        id="mobile-panel"
        className={menuOpen ? 'mobile-panel is-open' : 'mobile-panel'}
        aria-hidden={!menuOpen}
        {...(!menuOpen && { inert: '' })}
      >
        <div className="mobile-panel__head">
          <span className="brand__copy">
            <span className="brand__name">{studio.name}</span>
            <span className="brand__role">{studio.role}</span>
          </span>
          <button
            type="button"
            className="mobile-panel__close"
            aria-label="Chiudi il menu"
            onClick={() => setMenuOpen(false)}
          >
            <IconClose />
          </button>
        </div>

        <nav className="mobile-nav" aria-label="Navigazione mobile">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? 'mobile-nav__link is-active' : 'mobile-nav__link'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mobile-panel__foot">
          <a className="mobile-panel__phone" href={studio.phoneHref}>
            {studio.phoneDisplay}
          </a>
          <Link className="btn btn--primary" to="/contatti">
            Richiedi un appuntamento
          </Link>
        </div>
      </aside>
    </>
  )
}

/* ---------------------------------------------------------------------------
   Blocchi riutilizzabili
   --------------------------------------------------------------------------- */

function SectionHead({ label, title, text, action }) {
  return (
    <div className="section-head reveal">
      <div className="section-head__meta">
        <span className="label label--accent">{label}</span>
        {action}
      </div>
      <h2 className="headline">{title}</h2>
      {text && <p className="lead">{text}</p>}
    </div>
  )
}

function CtaBand({ title, text }) {
  return (
    <div className="cta-band reveal">
      <div className="cta-band__text">
        <h2 className="subhead">{title}</h2>
        <p className="body-text">{text}</p>
      </div>
      <div className="btn-row">
        <Link className="btn btn--primary" to="/contatti">
          Richiedi un appuntamento
        </Link>
        <a className="btn btn--secondary" href={studio.phoneHref}>
          {studio.phoneDisplay}
        </a>
      </div>
    </div>
  )
}

function PageHead({ label, title, text }) {
  return (
    <section className="page-head">
      <div className="container page-head__inner">
        <span className="label label--accent">{label}</span>
        <h1 className="headline">{title}</h1>
        {text && <p className="lead">{text}</p>}
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------
   Home
   --------------------------------------------------------------------------- */

function HomePage() {
  useReveal([])

  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__copy">
            <span className="label hero__place">{studio.place}</span>

            <h1 className="display hero__title">
              Progettare e seguire <em>ogni fase</em> dell&rsquo;intervento.
            </h1>

            <p className="lead hero__lead">
              Studio tecnico di ingegneria a Rivalta sul Mincio. Seguo privati, imprese e
              committenze pubbliche dalla verifica di fattibilità alla chiusura del cantiere,
              con un unico riferimento tecnico per tutto il percorso.
            </p>

            <div className="btn-row hero__actions">
              <Link className="btn btn--primary" to="/contatti">
                Richiedi un appuntamento
              </Link>
              <Link className="btn btn--secondary" to="/servizi">
                Scopri i servizi
              </Link>
            </div>
          </div>

          <figure className="hero__visual">
            <img
              src="/ggg-min.png"
              alt="Due tecnici in cantiere consultano un elaborato di progetto"
              width="1000"
              height="880"
            />
            <figcaption className="hero__stat">
              <strong>Rivalta sul Mincio</strong>
              <span className="label">Mantova e provincia</span>
            </figcaption>
          </figure>
        </div>

        <div className="marquee-strip">
          <div className="container marquee-strip__inner">
            {heroCompetences.map((item, index) => (
              <span key={item} style={{ display: 'contents' }}>
                {index > 0 && <span className="marquee-strip__sep" aria-hidden="true" />}
                <span className="marquee-strip__item">{item}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="servizi">
        <div className="container">
          <SectionHead
            label="Servizi"
            title="Tre ambiti di intervento, un unico interlocutore."
            text="Lo studio copre il percorso completo di un intervento edilizio. In base alle esigenze si può attivare una singola prestazione oppure affidare l'intera gestione tecnica."
            action={
              <Link className="link-arrow" to="/servizi">
                Tutti i servizi <IconArrow />
              </Link>
            }
          />

          <div className="service-rows">
            {serviceAreas.map((area) => (
              <article key={area.id} className="service-row reveal">
                <span className="service-row__num">{area.num}</span>

                {/* Il WebP è la sorgente preferita, il PNG resta il fallback:
                    stessa immagine, un ottavo del peso. */}
                <figure className="service-row__media">
                  <picture>
                    <source srcSet={`${area.image}.webp`} type="image/webp" />
                    <img
                      src={`${area.image}.png`}
                      alt={area.imageAlt}
                      width="900"
                      height="600"
                      loading="lazy"
                      decoding="async"
                    />
                  </picture>
                </figure>

                <h3 className="service-row__title">{area.title}</h3>

                <div className="service-row__body">
                  <p className="body-text">{area.text}</p>
                  <ul className="service-row__list">
                    {area.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="service-row__action">
                  <Link className="link-arrow" to="/servizi">
                    Approfondisci <IconArrow />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--surface">
        <div className="container">
          <SectionHead
            label="Progetti"
            title="Interventi seguiti sul territorio."
            action={
              <Link className="link-arrow" to="/progetti">
                Tutti i progetti <IconArrow />
              </Link>
            }
          />
          <ProjectGrid />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead label="Lo Studio" title="Un riferimento tecnico diretto." />
          <StudioBlock />
        </div>
      </section>

      <ContactSection />
    </>
  )
}

/* ---------------------------------------------------------------------------
   Blocchi condivisi fra home e pagine interne
   --------------------------------------------------------------------------- */

function ProjectGrid() {
  const [lead, ...rest] = projects

  return (
    <div className="project-grid">
      <article className="project project--lead reveal">
        <figure className="project__figure">
          <img src={lead.image} alt={lead.title} loading="lazy" />
        </figure>
        <div className="project__body">
          <div className="project__meta">
            <span className="is-category">{lead.category}</span>
            <span>
              {lead.location} · {lead.year}
            </span>
          </div>
          <h3 className="project__title">{lead.title}</h3>
          <p className="body-text">{lead.text}</p>
        </div>
      </article>

      {rest.map((project) => (
        <article key={project.id} className="project reveal">
          <figure className="project__figure">
            <img src={project.image} alt={project.title} loading="lazy" />
          </figure>
          <div className="project__body">
            <div className="project__meta">
              <span className="is-category">{project.category}</span>
              <span>
                {project.location} · {project.year}
              </span>
            </div>
            <h3 className="project__title">{project.title}</h3>
            <p className="body-text">{project.text}</p>
          </div>
        </article>
      ))}
    </div>
  )
}

function StudioBlock() {
  return (
    <div className="studio-grid reveal">
      {/* In attesa di un ritratto del professionista, la targa dello studio:
          fotografia reale, stesso rapporto 4:5 previsto per il ritratto. */}
      <figure className="studio__portrait">
        <picture>
          <source srcSet="/images/studio-targa.webp" type="image/webp" />
          <img
            src="/images/studio-targa.jpg"
            alt={`Targa dello studio di ${studio.name} in ${studio.address}`}
            width="1200"
            height="1800"
            loading="lazy"
          />
        </picture>
        <figcaption>
          <span className="studio__portrait-name">{studio.name}</span>
          <span className="label">{studio.role}</span>
        </figcaption>
      </figure>

      <div className="studio__copy">
        <p className="lead">
          Dietro allo studio c&rsquo;è una persona sola: chi valuta il progetto è la stessa
          che poi segue il cantiere.
        </p>

        {profile.bio.map((paragraph) => (
          <p className="body-text" key={paragraph.slice(0, 32)}>
            {paragraph}
          </p>
        ))}

        {/* Titoli e iscrizione all'albo: dati verificabili, tenuti distinti
            dal testo discorsivo. */}
        <dl className="credentials">
          {profile.credentials.map((row) => (
            <div className="credentials__item" key={row.label}>
              <dt className="label">{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>

        <ul className="discipline-list">
          {disciplines.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/**
 * Blocco recapiti. In home porta la propria intestazione; nella pagina
 * Contatti quella è già fornita dal PageHead, quindi va omessa per non
 * ripetere titolo e occhiello.
 */
function ContactSection({ withHead = true }) {
  return (
    <section className="section contact" id="contatti">
      <div className="container">
        {withHead && (
          <SectionHead
            label="Contatti"
            title="Parliamo del suo progetto."
            text="Il primo contatto serve a capire se e come posso essere utile. Una telefonata o una mail sono sufficienti per fissare un sopralluogo."
          />
        )}

        <div className="contact-grid">
          <dl className="contact-list reveal">
            <div className="contact-item">
              <dt className="label">Telefono</dt>
              <dd>
                <a className="contact-item__value" href={studio.phoneHref}>
                  {studio.phone}
                </a>
              </dd>
            </div>

            <div className="contact-item">
              <dt className="label">Email</dt>
              <dd>
                <a className="contact-item__value" href={studio.emailHref}>
                  {studio.email}
                </a>
              </dd>
            </div>

            <div className="contact-item">
              <dt className="label">Studio</dt>
              <dd>
                <a
                  className="contact-item__value"
                  href={studio.mapsHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  {studio.address}
                </a>
              </dd>
            </div>
          </dl>

          <figure className="contact__photo reveal">
            <picture>
              <source srcSet="/images/studio-esterno.webp" type="image/webp" />
              <img
                src="/images/studio-esterno.jpg"
                alt="L'edificio d'angolo che ospita lo studio, con la vetrina e l'ingresso su strada"
                width="1800"
                height="1200"
                loading="lazy"
              />
            </picture>
            <figcaption className="label">
              All&rsquo;angolo tra via Turati e vicolo Zibramonda
            </figcaption>
          </figure>

          <div className="contact__aside reveal">
            <h3 className="subhead">Come procediamo</h3>
            <p className="body-text">
              Mi descriva l&rsquo;immobile e cosa ha in mente. Se l&rsquo;intervento rientra
              negli ambiti dello studio, concordiamo un sopralluogo e da lì definiamo tempi,
              procedure e un ordine di spesa.
            </p>

            <div className="btn-row">
              <a className="btn btn--primary" href={studio.emailHref}>
                Scrivi una mail
              </a>
              <a className="btn btn--onDark" href={studio.phoneHref}>
                Chiama ora
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------
   Pagine interne
   --------------------------------------------------------------------------- */

function ServicesPage() {
  useReveal([])

  return (
    <>
      <PageHead
        label="Servizi"
        title="Servizi tecnici, dal primo sopralluogo alla fine dei lavori."
        text="Ogni incarico può riguardare una singola prestazione o l'intero percorso. Di seguito gli ambiti principali e l'elenco completo delle prestazioni."
      />

      <section className="section">
        <div className="container">
          <div className="service-rows">
            {serviceAreas.map((area) => (
              <article key={area.id} className="service-row reveal">
                <span className="service-row__num">{area.num}</span>

                <figure className="service-row__media">
                  <picture>
                    <source srcSet={`${area.image}.webp`} type="image/webp" />
                    <img
                      src={`${area.image}.png`}
                      alt={area.imageAlt}
                      width="900"
                      height="600"
                      loading="lazy"
                      decoding="async"
                    />
                  </picture>
                </figure>

                <h2 className="service-row__title">{area.title}</h2>
                <div className="service-row__body">
                  <p className="body-text">{area.text}</p>
                  <ul className="service-row__list">
                    {area.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="service-row__action">
                  <Link className="link-arrow" to="/contatti">
                    Richiedi <IconArrow />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--surface">
        <div className="container">
          <SectionHead label="Elenco" title="Tutte le prestazioni." />
          <ul className="index-list reveal">
            {serviceIndex.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section--tight">
        <div className="container">
          <CtaBand
            title="Non trova quello che cerca?"
            text="Mi descriva l'intervento: se non rientra nei miei ambiti, le indico a chi rivolgersi."
          />
        </div>
      </section>
    </>
  )
}

function ProjectsPage() {
  useReveal([])

  return (
    <>
      <PageHead
        label="Progetti"
        title="Esperienza applicata a interventi reali."
        text="Gli ambiti in cui lo studio opera più di frequente, sul territorio di Mantova e provincia."
      />

      <section className="section">
        <div className="container">
          <ProjectGrid />
        </div>
      </section>

      <section className="section--tight">
        <div className="container">
          <CtaBand
            title="Ha un intervento simile in mente?"
            text="Fissiamo un sopralluogo per valutarlo insieme."
          />
        </div>
      </section>
    </>
  )
}

function AboutPage() {
  useReveal([])

  return (
    <>
      <PageHead
        label="Lo Studio"
        title="Uno studio tecnico diretto, vicino a chi commissiona il lavoro."
        text="Un servizio completo lungo l'intero percorso dell'opera: dalle fasi preliminari alla progettazione integrale e coordinata, fino alla realizzazione."
      />

      <section className="section">
        <div className="container">
          <StudioBlock />
        </div>
      </section>

      <section className="section section--surface">
        <div className="container">
          <SectionHead
            label="Metodo"
            title="Come si sviluppa un incarico."
            text="Quattro fasi, con un punto di verifica alla fine di ciascuna: si procede alla successiva solo quando il quadro è chiaro."
          />
          <div className="method reveal">
            {method.map((step) => (
              <div key={step.num} className="method__step">
                <span className="method__num">{step.num}</span>
                <h3 className="method__title">{step.title}</h3>
                <p className="method__text">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section--tight">
        <div className="container">
          <CtaBand
            title="Parliamone di persona."
            text="Il primo confronto non impegna: serve a capire se posso esserle utile."
          />
        </div>
      </section>
    </>
  )
}

function ContactPage() {
  useReveal([])

  return (
    <>
      <PageHead
        label="Contatti"
        title="Parliamo del suo progetto."
        text="Telefono, mail o un sopralluogo in loco: scelga il modo più comodo per iniziare."
      />
      <ContactSection withHead={false} />
      <CompanySection />
    </>
  )
}

/**
 * Dati societari e canali di fatturazione elettronica. Sezione informativa,
 * volutamente sobria: sono dati di trasparenza, non materiale promozionale.
 */
function CompanySection() {
  return (
    <section className="section--tight company" id="dati-societari">
      <div className="container">
        <div className="company-box reveal">
          <div className="company-box__head">
            <p className="label">Dati societari</p>
            <p className="company-box__name">{company.legalName}</p>
          </div>

          <dl className="company-grid">
            {companyDetails.map((row) => (
              <div className="company-item" key={row.label}>
                <dt className="label">{row.label}</dt>
                <dd className="company-item__value">{row.value}</dd>
              </div>
            ))}

            <div className="company-item">
              <dt className="label">PEC</dt>
              <dd>
                <a className="company-item__value" href={company.pecHref}>
                  {company.pec}
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}

function NotFoundPage() {
  return (
    <>
      <PageHead
        label="404"
        title="Questa pagina non esiste."
        text="L'indirizzo digitato non corrisponde ad alcuna pagina del sito."
      />
      <section className="section">
        <div className="container">
          <Link className="btn btn--primary" to="/">
            Torna alla home
          </Link>
        </div>
      </section>
    </>
  )
}

/* ---------------------------------------------------------------------------
   Footer
   --------------------------------------------------------------------------- */

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      {/* Fascia principale: il footer è l'ultimo punto in cui chi legge
          può agire, quindi contatti e mappa hanno più peso dei link. */}
      <div className="container footer__main">
        <div className="footer__col footer__col--brand">
          <p className="footer__name">{studio.name}</p>
          <span className="footer__role">{studio.role}</span>
          <p className="footer__text">
            Studio tecnico di ingegneria a Rivalta sul Mincio. Progettazione, strutture,
            sicurezza e direzione lavori per privati, imprese e committenze pubbliche.
          </p>
          <p className="footer__albo">
            Ordine degli Ingegneri di Mantova, n.&nbsp;1495 — settore a) civile e ambientale
          </p>
        </div>

        <div className="footer__col">
          <h2 className="footer__title">Contatti</h2>
          <ul className="footer__list">
            <li className="footer__item">
              <IconPhone className="footer__icon" />
              <a className="footer__link" href={studio.phoneHref}>
                {studio.phoneDisplay}
              </a>
            </li>
            <li className="footer__item">
              <IconMail className="footer__icon" />
              <a className="footer__link footer__link--break" href={studio.emailHref}>
                {studio.email}
              </a>
            </li>
            <li className="footer__item">
              <IconPin className="footer__icon" />
              {/* Le due righe sono blocchi distinti e non un <br>: così lo
                  screen reader non legge "Turati, 1" e "46040" di seguito. */}
              <a
                className="footer__link footer__link--address"
                href={studio.mapsHref}
                target="_blank"
                rel="noreferrer"
              >
                <span>Via Filippo Turati, 1</span>
                <span>46040 Rivalta sul Mincio (MN)</span>
              </a>
            </li>
          </ul>
        </div>

        <div className="footer__col">
          <h2 className="footer__title">Navigazione</h2>
          <ul className="footer__list">
            <li className="footer__item">
              <Link className="footer__link" to="/">
                Home
              </Link>
            </li>
            {navItems.map((item) => (
              <li className="footer__item" key={item.path}>
                <Link className="footer__link" to={item.path}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

        </div>

        {/* Mini-mappa. L'iframe è decorativo, caricato in lazy e inerte: il
            click cade sempre sul link, che apre l'itinerario su Google Maps.
            Il riquadro ritaglia i controlli di zoom e la barra di OpenStreetMap,
            perciò l'attribuzione richiesta dalla licenza è resa qui sotto. */}
        <div className="footer__col footer__col--map">
          <h2 className="footer__title">Dove siamo</h2>
          <a
            className="footer__map"
            href={studio.mapsHref}
            target="_blank"
            rel="noreferrer"
            aria-label={`Apri su Google Maps la posizione dello studio: ${studio.address}`}
          >
            <span className="footer__map-crop" aria-hidden="true">
              <iframe
                className="footer__map-frame"
                src={mapEmbedSrc}
                title="Mappa della posizione dello studio a Rivalta sul Mincio"
                loading="lazy"
                tabIndex={-1}
              />
            </span>
            <span className="footer__map-veil" aria-hidden="true" />
            <span className="footer__map-cta" aria-hidden="true">
              <IconPin className="footer__map-cta-icon" />
              Apri in Google Maps
              <IconExternal className="footer__map-cta-icon" />
            </span>
          </a>
          <p className="footer__map-note">
            Rivalta sul Mincio, alle porte del Parco del Mincio. Cartografia{' '}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
              © OpenStreetMap
            </a>
          </p>
        </div>
      </div>

      {/* Dati societari: informazioni obbligatorie ex art. 2250 c.c., che
          devono comparire su ogni pagina. */}
      <div className="footer__company">
        <div className="container footer__company-inner">
          <h2 className="footer__company-name">{company.legalName}</h2>
          <dl className="footer__company-data">
            <div className="footer__company-row">
              <dt>Sede legale</dt>
              <dd>{company.address}</dd>
            </div>
            <div className="footer__company-row">
              <dt>P. IVA e C.F.</dt>
              <dd>{company.vat}</dd>
            </div>
            <div className="footer__company-row">
              <dt>REA</dt>
              <dd>{company.rea}</dd>
            </div>
            <div className="footer__company-row">
              <dt>Capitale sociale</dt>
              <dd>{company.shareCapital}</dd>
            </div>
            <div className="footer__company-row">
              <dt>PEC</dt>
              <dd>
                <a href={company.pecHref}>{company.pec}</a>
              </dd>
            </div>
            <div className="footer__company-row">
              <dt>Codice SDI</dt>
              <dd>{company.sdi}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="footer__bar">
        <div className="container footer__bar-inner">
          <span className="footer__copy">
            © {year} {studio.name}
          </span>

          {/* Le pagine legali non sono ancora disponibili: i collegamenti
              vanno attivati quando i testi saranno forniti dal cliente. */}
          <span className="footer__legal">
            <span>Privacy e cookie policy in preparazione</span>
          </span>

          <span className="footer__credit">
            Sito di{' '}
            <a href="https://albertopecchini.it/" target="_blank" rel="noreferrer">
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

function Layout() {
  return (
    <>
      <a className="skip-link" href="#contenuto">
        Salta al contenuto
      </a>

      <ScrollToTop />
      <Header />

      <main className="site-main" id="contenuto">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/servizi" element={<ServicesPage />} />
          <Route path="/progetti" element={<ProjectsPage />} />
          <Route path="/studio" element={<AboutPage />} />
          <Route path="/contatti" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
      <ThemeSwitcher />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}
