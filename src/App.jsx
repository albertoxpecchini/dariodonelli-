import { useCallback, useEffect, useState } from 'react'
import './App.css'
import { scrollToTarget, useReveal, useSmoothScroll } from './motion.js'
import SheetViewer from './viewer/SheetViewer.jsx'
import {
  ambiti,
  disciplines,
  heroFacts,
  infoline,
  manifesto,
  mapEmbedSrc,
  method,
  profile,
  projects,
  sections,
  serviceAreas,
  serviceIndex,
  sheets,
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

/* Solo il marchio: niente voci né tasti, la pagina si legge scorrendo e
   le sezioni sono comunque elencate nel footer. */
function Header() {
  const scrolled = useScrolled()

  return (
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
      </div>
    </header>
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
          {/* Il separatore sta nel CSS, legato alla voce: così il "·" non
              resta mai orfano quando la riga va a capo. */}
          {infoline.map((item) => (
            <span className="infoline__item" key={item}>
              {item}
            </span>
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
            <p className="lead intro__lead">
              Studio tecnico di ingegneria a Rivalta sul Mincio. Un unico riferimento dalla verifica
              di fattibilità alla chiusura del cantiere.
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

          {/* La targa vera, quella all'ingresso dello studio: porta già
              marchio, nome e le due righe di specializzazione. */}
          <figure className="intro__plate">
            <Photo
              base="/images/hero-targa"
              ext="png"
              alt="La targa dello studio: Ing. Dario Donelli, ingegneria, architettura, ambiente, progettazione integrale e coordinata"
              width="1489"
              height="967"
              eager
            />
            <figcaption className="intro__caption">
              <span className="label">La targa dello studio</span>
              <span>Via Filippo Turati 1, Rivalta sul Mincio</span>
            </figcaption>
          </figure>
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
          title="Tre aree di competenza, un unico interlocutore."
          text="Lo studio copre il percorso completo di un intervento edilizio. In base alle esigenze si può attivare una singola prestazione oppure affidare l'intera gestione tecnica."
        />

        <div className="service-blocks">
          {serviceAreas.map((area, i) => (
            <article key={area.id} className={`service-block reveal${i % 2 === 1 ? ' service-block--flip' : ''}`}>
              <figure className="service-block__media">
                <Photo base={area.image} ext="png" alt={area.imageAlt} width={area.width} height={area.height} />
              </figure>

              <div className="service-block__copy">
                <span className="service-block__num" aria-hidden="true">
                  {area.num}
                </span>
                <h3 className="service-block__title">{area.title}</h3>
                <p className="body-text">{area.text}</p>

                {/* role="list": il reset list-style:none toglie ad alcuni
                    lettori di schermo la semantica di elenco; così resta. */}
                <ul className="service-block__list" role="list">
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
          <ol className="index-list" role="list">
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

        <ol className="ambiti-list reveal" role="list">
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
                <Photo base={project.image} alt={project.imageAlt} width={project.width} height={project.height} />
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

        <Drawings />
      </div>
    </section>
  )
}

/**
 * Elaborati consultabili: DWG e PDF aperti direttamente nella pagina, da
 * guardare e non da scaricare. Per ora due file di esempio (vedi `sheets`
 * in content.js). Il visualizzatore non sta dentro un .reveal: il suo
 * transform sposterebbe le misure dei gesti.
 */
function Drawings() {
  return (
    <div className="drawings">
      <div className="drawings__head reveal">
        <span className="label">Elaborati consultabili</span>
        <h3 className="drawings__title">Disegni e documenti si aprono qui, senza programmi.</h3>
        <p className="body-text">
          Il DWG si legge così come esce da AutoCAD, il PDF così come è stampato: si ingrandisce fino
          al dettaglio e ci si sposta sul foglio. I due file qui sotto sono esempi.
        </p>
      </div>
      <SheetViewer sheets={sheets} label="Elaborati di esempio" />
    </div>
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
            <h3 className="label">Discipline</h3>
            <ol className="rail-list" role="list">
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
            width="1600"
            height="1067"
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
        <ol className="method reveal" role="list">
          {method.map((step) => (
            <li key={step.num} className="method__step">
              <span className="method__num" aria-hidden="true">
                {step.num}
              </span>
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
          <ul className="contact-list reveal" role="list">
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
        {/* Quattro colonne uguali, ognuna aperta dalla sua etichetta: le
            righe partono tutte alla stessa altezza, e la riga in fondo
            usa la stessa griglia, così le voci cadono sulle colonne. */}
        <div className="footer__grid">
          <div className="footer__col">
            <h2 className="label">Studio</h2>
            <ul role="list">
              <li className="footer__name">{studio.name}</li>
              <li>Via Filippo Turati 1</li>
              <li>46040 Rivalta sul Mincio (MN)</li>
            </ul>
          </div>

          <div className="footer__col">
            <h2 className="label">Recapiti</h2>
            <ul role="list">
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
            <h2 className="label">Iscrizione</h2>
            <ul role="list">
              <li>Ordine degli Ingegneri di Mantova</li>
              <li>n. 1495 · dal 24 maggio 2010</li>
              <li>Settore a) civile e ambientale</li>
            </ul>
          </div>

          <div className="footer__col">
            <h2 className="label">Sezioni</h2>
            <ul role="list">
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
            © {year} <span className="footer__meta-name">{studio.name}</span>
          </span>
          <span className="footer__meta-wide">Privacy e cookie policy in preparazione</span>
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

      <Header />

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
