import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import './App.css'

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Chi siamo', path: '/about' },
  { label: 'Servizi', path: '/services' },
  { label: 'Progetti', path: '/projects' },
  { label: 'Contatti', path: '/contact' },
]

const services = [
  {
    title: 'ANALISI',
    description: 'Valutiamo opportunità, vincoli e obiettivi prestazionali con precisione.',
    accent: 'analysis',
    icon: (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M16 46V24M28 46V18M40 46V28M52 46V13" />
        <path d="M10 50h44" />
      </svg>
    ),
  },
  {
    title: 'PIANIFICAZIONE',
    description: 'Definiamo roadmap pratiche per allineare design, operatività e realizzazione.',
    accent: 'planning',
    icon: (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M18 42h28M18 22h28M21 16v32M43 16v32" />
        <path d="M16 16h32v32H16z" />
      </svg>
    ),
  },
  {
    title: 'PROGETTAZIONE',
    description: 'Diamo forma a ambienti coerenti, eleganti e performanti nel tempo.',
    accent: 'design',
    icon: (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M18 42l13-13 9 9 14-21" />
        <path d="M44 17h10v10" />
        <path d="M16 50h32" />
      </svg>
    ),
  },
]

const aboutDisciplines = [
  'Progettazione architettonica e strutturale',
  'Valutazione della sicurezza sismica',
  'Riabilitazione strutturale e restauro',
  'Strutture antisismiche',
  'Energia',
  'Impianti',
  'Urbanistica',
  'Infrastrutture',
  'Idraulica e ambiente',
]

const serviceList = [
  'Studi di Fattibilità e Progettazione Preliminare',
  'Rendering e Fotoinserimenti',
  'Progettazione Definitiva',
  'Progettazione Esecutiva',
  'Miglioramento / Adeguamento Sismico di Edifici Esistenti',
  'Riqualificazione e Certificazione Energetica',
  'Direzione Lavori',
  'Direzione Operativa',
  'Sicurezza',
  'Pratiche Antincendio',
  'Pratiche Catastali',
  'Perizie, Stime e Consulenze Tecniche',
]

const projectAreas = [
  {
    title: 'Architettura e strutture',
    text: 'Interventi residenziali, civili e industriali con attenzione alla qualità degli spazi, alla sostenibilità e alla corretta definizione delle strutture.',
  },
  {
    title: 'Sicurezza e sismica',
    text: 'Valutazioni, adeguamenti e soluzioni per migliorare la sicurezza degli edifici esistenti e ridurre i rischi strutturali.',
  },
  {
    title: 'Energia e impianti',
    text: 'Riqualificazione energetica, certificazioni e progettazione integrata di sistemi impiantistici efficienti e affidabili.',
  },
  {
    title: 'Urbanistica e infrastrutture',
    text: 'Supporto per l’analisi del contesto urbano, il coordinamento delle fasi e la definizione di infrastrutture funzionali.',
  },
  {
    title: 'Idraulica e ambiente',
    text: 'Soluzioni tecniche per la gestione dell’acqua, il rispetto delle esigenze ambientali e la tutela del territorio.',
  },
  {
    title: 'Perizie e consulenze',
    text: 'Stime, consulenze tecniche e supporto specialistico per verifiche, valutazioni e decisioni progettuali.',
  },
]

function Layout() {
  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <NavLink to="/" className="brand" aria-label="Home">
            <div className="brand-mark" aria-hidden="true">
              <img src="/chatgpt-logo.png" alt="Logo Ing. Dario Donelli" />
            </div>

            <div className="brand-copy">
              <p className="brand-kicker">Studio</p>
              <span className="brand-name">ING. DARIO DONELLI</span>
            </div>
          </NavLink>

          <nav className="main-nav" aria-label="Main navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <a className="header-phone" href="tel:+393384007913">
            +39 338 4007913
          </a>
        </div>
      </header>

      <main className="page-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <p className="footer-title">Dario Donelli</p>
            <p className="footer-text">
              Studio di architettura, ingegneria e design dedicato a soluzioni integrate,
              eleganti e ad alte prestazioni.
            </p>
          </div>

          <div>
            <p className="footer-title">Contatti</p>
            <ul className="footer-list">
              <li>Via Porto n° 49, Rivalta sul Mincio di Rodigo (MN)</li>
              <li>
                <a href="tel:+393384007913">+39 338 4007913</a>
              </li>
              <li>
                <a href="mailto:ing.dario.donelli@hotmail.it">ing.dario.donelli@hotmail.it</a>
              </li>
            </ul>
          </div>

          <div>
            <p className="footer-title">Navigazione</p>
            <ul className="footer-list">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink to={item.path}>{item.label}</NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </footer>
    </>
  )
}

function HomePage() {
  return (
    <>
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-visual">
            <img src="/ggg-min.png" alt="Professionisti del settore edile che consultano un progetto tecnico" />
          </div>

          <div className="hero-copy">
            <p className="eyebrow">ABOUT US</p>
            <div className="studio-highlight">
              <span className="studio-label">Sede dello studio</span>
              <span className="studio-address">Via Porto n° 49, Rivalta sul Mincio di Rodigo (MN)</span>
            </div>
            <h1>Studio di Architettura, Ingegneria &amp; Design</h1>
            <p className="lead">
              Progettiamo spazi duraturi e funzionali, unendo architettura, ingegneria e
              direzione del progetto per trasformare ogni esigenza in una soluzione concreta.
            </p>
            <button type="button" className="primary-button">
              LEGGI DI PIÙ
            </button>
          </div>
        </div>
      </section>

      <section className="services-section">
        <div className="container">
          <div className="services-grid">
            {services.map((service) => (
              <article key={service.title} className={`service-column service-${service.accent}`}>
                <div className="icon-circle">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <button type="button" className="service-button">
                  VEDI
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

function AboutPage() {
  return (
    <section className="content-page">
      <div className="container">
        <div className="page-intro">
          <p className="eyebrow">Chi siamo</p>
          <h2>Uno studio tecnico dedicato a ogni fase dell’opera.</h2>
        </div>

        <div className="content-grid">
          <div className="content-card">
            <p>
              È uno studio tecnico che offre un servizio completo durante l’intero percorso
              progettuale ed esecutivo dell’opera.
            </p>
          </div>

          <div className="content-card">
            <p>
              L’obiettivo è accompagnare la committenza sin dalle fasi preliminari,
              ponendosi come unico scopo l’esigenza del cliente, proseguendo con lo sviluppo
              della progettazione integrale e coordinata delle discipline architettonica,
              ambientale, strutturale, impiantistica, prevenzione incendi, sicurezza cantieri
              e concludendo con la realizzazione dell’opera.
            </p>
          </div>
        </div>

        <div className="pill-grid">
          {aboutDisciplines.map((item) => (
            <div key={item} className="pill-item">
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ServicesPage() {
  return (
    <section className="content-page">
      <div className="container">
        <div className="page-intro">
          <p className="eyebrow">Servizi</p>
          <h2>Servizi tecnici completi da progetto a realizzazione.</h2>
        </div>

        <div className="service-list-grid">
          {serviceList.map((item) => (
            <article key={item} className="service-list-item">
              <h3>{item}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProjectsPage() {
  return (
    <section className="content-page">
      <div className="container">
        <div className="page-intro">
          <p className="eyebrow">Progetti</p>
          <h2>Aree di intervento e competenze dell’attività professionale.</h2>
        </div>

        <div className="project-grid">
          {projectAreas.map((area) => (
            <article key={area.title} className="project-card">
              <h3>{area.title}</h3>
              <p>{area.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function ContactPage() {
  return (
    <section className="content-page">
      <div className="container">
        <div className="page-intro">
          <p className="eyebrow">Contatti</p>
          <h2>Parliamo del tuo progetto.</h2>
        </div>

        <div className="contact-grid">
          <div className="content-card page-contact-card">
            <h3>Sede dello studio</h3>
            <p>Via Porto n° 49, Rivalta sul Mincio di Rodigo (MN)</p>
            <p>
              <a href="tel:+393384007913">+39 338 4007913</a>
            </p>
            <p>
              <a href="mailto:ing.dario.donelli@hotmail.it">ing.dario.donelli@hotmail.it</a>
            </p>
          </div>

          <div className="content-card">
            <p>
              Lo studio accompagna ogni fase dell’intervento, dai primi chiarimenti alla
              realizzazione dell’opera, offrendo consulenza tecnica e supporto operativo a
              privati, aziende e committenze pubbliche.
            </p>
            <ul className="feature-list">
              <li>Progettazione architettonica e strutturale</li>
              <li>Valutazione della sicurezza sismica</li>
              <li>Riabilitazione strutturale e restauro</li>
              <li>Energia, impianti e certificazioni</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}

export default App
