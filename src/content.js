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

/** Righe dei dati societari mostrate nella pagina Contatti. */
export const companyDetails = [
  // La ragione sociale è già l'intestazione del riquadro: non si ripete qui.
  { label: 'Sede legale', value: company.address },
  // P. IVA e codice fiscale coincidono: una riga sola, come da prassi.
  { label: 'P. IVA e C.F.', value: company.vat },
  { label: 'Partita IVA UE', value: company.vatEu },
  { label: 'REA', value: company.rea },
  { label: 'Capitale sociale', value: company.shareCapital },
  { label: 'Codice destinatario (SDI)', value: company.sdi },
]

/**
 * Voci di navigazione. Il sito è una pagina sola: ogni voce punta a una
 * sezione tramite ancora, e l'id serve anche allo scroll-spy dell'header
 * per illuminare la voce corrispondente alla sezione che si sta leggendo.
 */
export const navItems = [
  { label: 'Servizi', id: 'servizi' },
  { label: 'Progetti', id: 'progetti' },
  { label: 'Lo Studio', id: 'studio' },
  { label: 'Contatti', id: 'contatti' },
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

/** Ambiti di intervento. Le immagini sono fotografie di repertorio. */
export const projects = [
  {
    id: 'residenze',
    category: 'Residenziale',
    title: 'Residenze private',
    location: 'Rivalta sul Mincio (MN)',
    year: '2025',
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
    text: 'Supporto completo a privati per trasformazioni, ristrutturazioni e nuove realizzazioni, con attenzione alla funzionalità degli spazi, alla qualità dei materiali e alla corretta definizione delle opere in fase di cantiere.',
  },
  {
    id: 'pubblici',
    category: 'Opere civili',
    title: 'Interventi pubblici e civili',
    location: 'Provincia di Mantova',
    year: '2024',
    image:
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1400&q=80',
    text: 'Coordinamento tecnico e progettuale per opere civili e pubbliche: verifiche di fattibilità, sicurezza, contenimento dei costi e gestione delle diverse fasi di realizzazione.',
  },
  {
    id: 'riqualificazione',
    category: 'Riqualificazione',
    title: 'Riqualificazione e adeguamento strutturale',
    location: 'Mantova e territorio',
    year: '2023',
    image:
      'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1400&q=80',
    text: 'Interventi di recupero, miglioramento sismico e restauro di edifici esistenti, per valorizzare il patrimonio costruito e migliorarne prestazioni, comfort e sicurezza.',
  },
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

/** Palette proposte al cliente. Lo swatch mostra il colore d'accento. */
export const palettes = [
  { id: 'terracotta', name: 'Terracotta', swatch: '#b4541b' },
  { id: 'blu', name: 'Blu tecnico', swatch: '#1f4e79' },
  { id: 'oliva', name: 'Verde oliva', swatch: '#4a5a33' },
  { id: 'grafite', name: 'Grafite', swatch: '#33343a' },
  { id: 'bordeaux', name: 'Bordeaux', swatch: '#7a2431' },
]
