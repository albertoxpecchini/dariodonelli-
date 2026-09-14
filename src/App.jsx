import { useCallback, useEffect, useRef, useState } from 'react'
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import './palettes.css'
import './App.css'
import {
  disciplines,
  heroCompetences,
  method,
  navItems,
  palettes,
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
      <div className="topbar">
        <div className="container topbar__inner">
          <span className="topbar__place">{studio.place}</span>
          <a className="topbar__phone" href={studio.phoneHref}>
            {studio.phoneDisplay}
          </a>
        </div>
      </div>

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
      {/* Segnaposto: sostituire con una fotografia del professionista non
          appena disponibile, mantenendo il rapporto 4:5. Per farlo basta
          rimuovere la classe --empty e inserire un <img>. */}
      <figure className="studio__portrait studio__portrait--empty">
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
        <p className="body-text">
          Lavoro con un approccio concreto, mettendo al centro la qualità tecnica, la
          trasparenza e il rapporto diretto con chi mi affida un incarico. Ogni progetto nasce
          da una lettura attenta delle esigenze d&rsquo;uso e delle condizioni del contesto:
          prima di proporre una soluzione preferisco capire bene il problema.
        </p>
        <p className="body-text">
          Seguo l&rsquo;intervento dalla prima valutazione fino alla realizzazione, coordinando
          le competenze necessarie — architettura, strutture, impianti, sicurezza, energia — e
          mantenendo un solo riferimento per il committente.
        </p>

        <ul className="discipline-list">
          {disciplines.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function ContactSection() {
  return (
    <section className="section contact" id="contatti">
      <div className="container">
        <SectionHead
          label="Contatti"
          title="Parliamo del suo progetto."
          text="Il primo contatto serve a capire se e come posso essere utile. Una telefonata o una mail sono sufficienti per fissare un sopralluogo."
        />

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
        text="Un solo riferimento tecnico per l'intero intervento, dalla verifica iniziale alla consegna."
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
      <ContactSection />
    </>
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
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <p className="footer__name">{studio.name}</p>
          <span className="footer__role">{studio.role}</span>
          <p className="footer__text">
            Studio tecnico di ingegneria a Rivalta sul Mincio. Progettazione, strutture,
            sicurezza e direzione lavori per privati, imprese e committenze pubbliche.
          </p>
        </div>

        <div>
          <p className="footer__title">Contatti</p>
          <ul className="footer__list">
            <li>
              <a href={studio.phoneHref}>{studio.phone}</a>
            </li>
            <li>
              <a href={studio.emailHref}>{studio.email}</a>
            </li>
            <li>
              <a href={studio.mapsHref} target="_blank" rel="noreferrer">
                {studio.address}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="footer__title">Navigazione</p>
          <ul className="footer__list">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link to={item.path}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer__bar">
        <div className="container footer__bar-inner">
          <span>© {new Date().getFullYear()} {studio.name}</span>

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
