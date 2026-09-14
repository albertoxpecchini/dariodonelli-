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
  mapsHref:
    'https://www.google.com/maps/search/?api=1&query=Via+Filippo+Turati+1+46040+Rivalta+sul+Mincio+MN',
}

export const navItems = [
  { label: 'Servizi', path: '/servizi' },
  { label: 'Progetti', path: '/progetti' },
  { label: 'Lo Studio', path: '/studio' },
  { label: 'Contatti', path: '/contatti' },
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
