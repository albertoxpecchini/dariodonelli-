/**
 * Contenuti del sito.
 *
 * Tutti i testi derivano dai materiali già presenti nell'implementazione
 * precedente: non sono state introdotte specializzazioni, certificazioni,
 * anni di esperienza, numeri o referenze non verificate.
 */

export const studio = {
  name: 'Ing. Dario Donelli',
  role: 'Ingegnere',
  place: 'Rivalta sul Mincio · Mantova',
  address: 'Via Filippo Turati, 1, 46040 Rivalta sul Mincio MN',
  phone: '+39 338 4007913',
  phoneHref: 'tel:+393384007913',
  phoneDisplay: '+39 338 400 7913',
  email: 'ing.dario.donelli@hotmail.it',
  emailHref: 'mailto:ing.dario.donelli@hotmail.it',
  /* Si punta alle coordinate e non all'indirizzo: la ricerca testuale su
     Rivalta sul Mincio non porta sempre al civico giusto. */
  mapsHref: 'https://www.google.com/maps/search/?api=1&query=45.180182%2C10.677598',
  /** Coordinate dello studio: alimentano la mini-mappa del footer. */
  geo: { lat: 45.180182, lng: 10.677598 },
}

/**
 * Sorgente del riquadro cartografico nel footer.
 *
 * Si usa OpenStreetMap e non l'embed di Google Maps: non richiede chiave
 * API e non installa cookie di profilazione, quindi non impone un banner
 * di consenso. Il click sulla mappa porta comunque su Google Maps, che è
 * l'applicazione con cui la maggior parte delle persone calcola il percorso.
 */
export const mapEmbedSrc = (() => {
  const { lat, lng } = studio.geo
  // Riquadro stretto: si deve leggere la via, non la provincia. L'ampiezza
  // in longitudine è doppia perché il riquadro è più largo che alto.
  const dx = 0.0034
  const dy = 0.0017
  const bbox = [lng - dx, lat - dy, lng + dx, lat + dy].join(',')
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`
})()

/**
 * Profilo professionale. I dati provengono dall'iscrizione all'albo:
 * laurea in Ingegneria Edile-Architettura (Bologna, 2008), abilitazione
 * 2009, iscrizione all'Ordine di Mantova n. 1495 dal 24/05/2010,
 * settore a) civile e ambientale.
 */
export const profile = {
  bio: [
    'Mi sono laureato in Ingegneria Edile-Architettura all’Università di Bologna nel 2008, ho conseguito l’abilitazione alla professione l’anno successivo e dal 2010 sono iscritto all’Ordine degli Ingegneri della Provincia di Mantova, settore civile e ambientale.',
    'È una formazione che unisce due sguardi che spesso restano separati: quello dell’architettura, attento allo spazio e a come viene vissuto, e quello dell’ingegneria, che deve rispondere della struttura e dei numeri. Progetto tenendoli insieme, perché un intervento riuscito è quello in cui la soluzione tecnica e l’uso quotidiano dell’edificio non si contraddicono.',
    'Lavoro come libero professionista sul territorio mantovano, con studio a Rivalta sul Mincio. Seguo personalmente ogni incarico dalla prima valutazione fino alla chiusura del cantiere: chi mi affida un lavoro parla sempre con la stessa persona, senza passaggi intermedi.',
    'Questo significa progettazione integrale e coordinata: architettura, strutture, impianti, prevenzione incendi, sicurezza in cantiere ed energia non sono pratiche separate da mettere in fila, ma discipline che vengono tenute insieme fin dall’inizio. È il modo più efficace per evitare che un problema emerga quando è ormai costoso risolverlo.',
  ],
  /** Riquadro sintetico accanto alla biografia. */
  credentials: [
    { label: 'Titolo', value: 'Ingegneria Edile-Architettura' },
    { label: 'Ateneo', value: 'Università di Bologna, 2008' },
    { label: 'Abilitazione', value: 'Bologna, 2009' },
    { label: 'Ordine', value: 'Ingegneri di Mantova, n. 1495' },
    { label: 'Iscritto dal', value: '24 maggio 2010' },
    { label: 'Settore', value: 'a) Civile e ambientale' },
  ],
}

/**
 * Dati societari della DONELLI S.R.L. COSTRUZIONI GENERALI, la società
 * riferita alla targa dello studio. Sono i dati che devono comparire
 * per obbligo informativo (art. 2250 c.c.) su sito e comunicazioni.
 *
 * Nota: la visura riporta il comune di RODIGO, di cui Rivalta sul Mincio
 * è frazione; l'indirizzo civico è lo stesso dello studio.
 */
export const company = {
  name: 'Donelli S.r.l. Costruzioni Generali',
  legalName: 'DONELLI S.R.L. COSTRUZIONI GENERALI',
  address: 'Via Filippo Turati, 1 — 46040 Rodigo (MN)',
  vat: '02728900206',
  vatEu: 'IT02728900206',
  taxCode: '02728900206',
  rea: 'MN 275664',
  shareCapital: '€ 10.000,00 i.v.',
  pec: 'donellicostruzionigenerali@pec.it',
  pecHref: 'mailto:donellicostruzionigenerali@pec.it',
  sdi: 'M5UXCR1',
}

/** Righe dei dati societari mostrate nella fascia del footer. */
export const companyDetails = [
  // La ragione sociale è già l'intestazione della fascia: non si ripete qui.
  { label: 'Sede legale', value: company.address },
  // P. IVA e codice fiscale coincidono: una riga sola, come da prassi.
  { label: 'P. IVA e C.F.', value: company.vat },
  { label: 'REA', value: company.rea },
  { label: 'Capitale sociale', value: company.shareCapital },
  { label: 'Codice SDI', value: company.sdi },
]

/**
 * Voci di navigazione. Il sito è una pagina sola: ogni voce punta a una
 * sezione tramite ancora, e l'id serve anche allo scroll-spy dell'header
 * per illuminare la voce corrispondente alla sezione che si sta leggendo.
 */
export const sections = [
  { id: 'servizi', num: '01', label: 'Servizi', nav: true },
  { id: 'progetti', num: '02', label: 'Progetti', nav: true },
  { id: 'studio', num: '03', label: 'Lo Studio', nav: true },
  { id: 'territorio', num: '04', label: 'Territorio', nav: true },
  { id: 'metodo', num: '05', label: 'Metodo', nav: true },
  { id: 'contatti', num: '06', label: 'Contatti', nav: true },
]

export const navItems = sections.filter((section) => section.nav)

/** Manifesto dell'intro: tre righe, nessuna di più. */
export const manifesto = ['Progettare.', 'Verificare.', 'Seguire il cantiere.']

/**
 * Riga informativa sotto la testata. L'anno è quello corrente: la riga
 * si legge come la data di una tavola, non come una scadenza.
 */
export const infoline = ['Rivalta sul Mincio', 'MN', String(new Date().getFullYear()), 'Ordine Ingegneri n. 1495']

/**
 * Territorio. Lo studio ha sede a Rivalta sul Mincio, frazione di Rodigo,
 * e opera nella provincia di Mantova. I comuni sono riferimenti geografici
 * attorno alla sede, non un elenco di cantieri; "near" segna quelli della
 * fascia sotto la carta. Coordinate approssimate al centro abitato.
 */
export const places = [
  { name: 'Rivalta sul Mincio', lat: 45.18, lng: 10.678, studio: true, near: true },
  { name: 'Mantova', lat: 45.156, lng: 10.791, capital: true, near: true },
  { name: 'Rodigo', lat: 45.199, lng: 10.625, near: true, label: 'above' },
  { name: 'Goito', lat: 45.256, lng: 10.674, near: true },
  { name: 'Volta Mantovana', lat: 45.322, lng: 10.659, near: true },
  { name: 'Marmirolo', lat: 45.22, lng: 10.757, near: true },
  { name: 'Castellucchio', lat: 45.15, lng: 10.65, near: true },
  { name: 'Curtatone', lat: 45.136, lng: 10.717, near: true },
  { name: 'Porto Mantovano', lat: 45.19, lng: 10.79, label: 'above' },
  { name: 'Roverbella', lat: 45.267, lng: 10.767 },
  { name: 'Gazoldo degli Ippoliti', lat: 45.198, lng: 10.578, label: 'left' },
  { name: 'Ceresara', lat: 45.263, lng: 10.571 },
  { name: 'Guidizzolo', lat: 45.323, lng: 10.579 },
  { name: 'Castel Goffredo', lat: 45.298, lng: 10.475 },
  { name: 'Piubega', lat: 45.229, lng: 10.532 },
  { name: 'Asola', lat: 45.22, lng: 10.41 },
  { name: 'Marcaria', lat: 45.12, lng: 10.53 },
  { name: 'Borgo Virgilio', lat: 45.1, lng: 10.78 },
  { name: 'Bagnolo San Vito', lat: 45.09, lng: 10.88 },
  { name: 'San Giorgio Bigarello', lat: 45.168, lng: 10.86 },
  { name: 'Castelbelforte', lat: 45.22, lng: 10.89 },
  { name: 'Castel d\u2019Ario', lat: 45.19, lng: 10.975 },
]

/**
 * Fiume Mincio, tracciato schematico da nord a sud-est (lat, lng), e i
 * tre laghi di Mantova come poligoni. Il parco regionale accompagna il
 * fiume da Goito ai laghi.
 */
export const mincio = [
  [45.34, 10.706],
  [45.3, 10.7],
  [45.27, 10.692],
  [45.256, 10.686],
  [45.23, 10.689],
  [45.2, 10.69],
  [45.18, 10.692],
  [45.172, 10.72],
  [45.17, 10.745],
  [45.165, 10.79],
  [45.155, 10.83],
  [45.13, 10.855],
  [45.1, 10.895],
  [45.07, 10.92],
]

export const lakes = [
  // Lago Superiore
  [
    [45.178, 10.735],
    [45.184, 10.758],
    [45.176, 10.788],
    [45.164, 10.786],
    [45.161, 10.76],
    [45.169, 10.74],
  ],
  // Lago di Mezzo e Lago Inferiore
  [
    [45.171, 10.795],
    [45.177, 10.815],
    [45.166, 10.834],
    [45.153, 10.83],
    [45.151, 10.805],
    [45.16, 10.794],
  ],
]

/**
 * Punti di interesse sulla fotografia della sede (1536×1024), in
 * percentuale della larghezza e dell'altezza dell'immagine.
 */
export const hotspots = [
  { x: 58, y: 67, title: 'L’ingresso', text: 'Porta a vetri su via Filippo Turati, 1.' },
  { x: 69, y: 58.5, title: 'Le targhe', text: 'Studio tecnico e Donelli S.r.l., una sopra l’altra.' },
  { x: 44, y: 66, title: 'La vetrina', text: 'L’edificio d’angolo tra via Turati e vicolo Zibramonda.' },
]

/** Competenze mostrate nella fascia sotto l'hero. */
export const heroCompetences = [
  'Progettazione architettonica e strutturale',
  'Sicurezza sismica',
  'Riqualificazione energetica',
  'Direzione lavori',
]

/**
 * Tre macro-aree. Ognuna spiega cosa comprende, a chi serve e che problema
 * risolve, con un elenco delle prestazioni effettivamente offerte.
 */
export const serviceAreas = [
  {
    id: 'progettazione',
    num: '01',
    image: '/images/servizio-progettazione',
    imageAlt: 'Un tecnico disegna a mano un prospetto su carta da lucido',
    title: 'Progettazione e pratiche edilizie',
    text: 'Dalla prima verifica di fattibilità fino al progetto esecutivo e alle autorizzazioni. Utile a chi deve costruire, ampliare o ristrutturare e ha bisogno di capire in anticipo cosa è possibile fare, con quali costi e con quali tempi.',
    items: [
      'Studi di fattibilità',
      'Progettazione preliminare, definitiva ed esecutiva',
      'Rendering e fotoinserimenti',
      'Pratiche catastali',
      'Pratiche antincendio',
    ],
  },
  {
    id: 'strutture',
    num: '02',
    image: '/images/servizio-strutture',
    imageAlt: 'Armature di ferro predisposte su un solaio prima del getto',
    title: 'Strutture e sicurezza sismica',
    text: 'Verifica e adeguamento di edifici esistenti, progettazione strutturale di nuove opere. Risponde a chi possiede un immobile datato e vuole sapere come si comporta in caso di sisma, o deve intervenire su un edificio vincolato.',
    items: [
      'Valutazione della sicurezza sismica',
      'Miglioramento e adeguamento sismico',
      'Riabilitazione strutturale e restauro',
      'Strutture antisismiche',
    ],
  },
  {
    id: 'cantiere',
    num: '03',
    image: '/images/servizio-cantiere',
    imageAlt: 'Squadra di tecnici in cantiere sul solaio di un edificio in costruzione',
    title: 'Direzione lavori e consulenza',
    text: 'Presidio del cantiere e verifica di quanto viene realizzato rispetto al progetto. Serve a chi vuole un riferimento tecnico unico che segua l’intervento, controlli le lavorazioni e gestisca il rapporto con le imprese.',
    items: [
      'Direzione lavori e direzione operativa',
      'Coordinamento della sicurezza',
      'Riqualificazione e certificazione energetica',
      'Perizie, stime e consulenze tecniche',
    ],
  },
]

/** Elenco completo delle prestazioni, usato nella pagina Servizi. */
export const serviceIndex = [
  'Studi di fattibilità e progettazione preliminare',
  'Rendering e fotoinserimenti',
  'Progettazione definitiva',
  'Progettazione esecutiva',
  'Miglioramento e adeguamento sismico di edifici esistenti',
  'Riqualificazione e certificazione energetica',
  'Direzione lavori',
  'Direzione operativa',
  'Sicurezza',
  'Pratiche antincendio',
  'Pratiche catastali',
  'Perizie, stime e consulenze tecniche',
]

/**
 * Ambiti di intervento. Le immagini sono fotografie di repertorio, servite
 * dal sito stesso (jpg + webp) e non da un CDN esterno: il sito non dipende
 * da un servizio terzo e le foto non cambiano sotto i piedi.
 */
export const projects = [
  {
    id: 'residenze',
    category: 'Residenziale',
    title: 'Residenze private',
    location: 'Rivalta sul Mincio (MN)',
    year: '2025',
    image: '/images/progetto-residenze',
    imageAlt: 'Villa unifamiliare con ampie vetrate, vista dal giardino al tramonto',
    text: 'Supporto completo a privati per trasformazioni, ristrutturazioni e nuove realizzazioni, con attenzione alla funzionalità degli spazi, alla qualità dei materiali e alla corretta definizione delle opere in fase di cantiere.',
  },
  {
    id: 'pubblici',
    category: 'Opere civili',
    title: 'Interventi pubblici e civili',
    location: 'Provincia di Mantova',
    year: '2024',
    image: '/images/progetto-pubblici',
    imageAlt: 'Squadra di tecnici sul solaio di un edificio in costruzione',
    text: 'Coordinamento tecnico e progettuale per opere civili e pubbliche: verifiche di fattibilità, sicurezza, contenimento dei costi e gestione delle diverse fasi di realizzazione.',
  },
  {
    id: 'riqualificazione',
    category: 'Riqualificazione',
    title: 'Riqualificazione e adeguamento strutturale',
    location: 'Mantova e territorio',
    year: '2023',
    image: '/images/progetto-riqualificazione',
    imageAlt: 'Facciata intonacata di bianco di un edificio ristrutturato',
    text: 'Interventi di recupero, miglioramento sismico e restauro di edifici esistenti, per valorizzare il patrimonio costruito e migliorarne prestazioni, comfort e sicurezza.',
  },
]

/**
 * Tre dati verificabili accanto all'hero: sono quelli che qualificano
 * il professionista a colpo d'occhio, presi dall'iscrizione all'albo.
 */
export const heroFacts = [
  { label: 'Ordine degli Ingegneri', value: 'Mantova, n. 1495' },
  { label: 'Iscritto all’albo', value: 'dal 2010' },
  { label: 'Laurea', value: 'Ingegneria Edile-Architettura' },
]

/** Le quattro fasi del metodo di lavoro. */
export const method = [
  {
    num: '01',
    title: 'Sopralluogo',
    text: 'Verifica dello stato dei luoghi, della documentazione disponibile e dei vincoli che riguardano l’immobile.',
  },
  {
    num: '02',
    title: 'Fattibilità',
    text: 'Valutazione di cosa è realizzabile, con un quadro chiaro di tempi, procedure e ordine di spesa.',
  },
  {
    num: '03',
    title: 'Progetto',
    text: 'Sviluppo del progetto nei diversi livelli e predisposizione delle pratiche verso gli enti.',
  },
  {
    num: '04',
    title: 'Cantiere',
    text: 'Direzione lavori, controllo delle lavorazioni e rapporto diretto con le imprese fino alla chiusura.',
  },
]

export const disciplines = [
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
