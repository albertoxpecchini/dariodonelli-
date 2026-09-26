/* ---------------------------------------------------------------------------
   Simboli
   Quarantotto segni del mestiere, metà dal tavolo da disegno e metà dal
   cantiere, disegnati tutti sulla stessa griglia di 32 unità, con lo
   stesso tratto e gli stessi raccordi: si leggono come una famiglia, dal
   punto elenco (16 px) al tasto al segno a margine (240 px).

   Il tratto è currentColor. In ogni simbolo un solo dettaglio ha la classe
   "sym__a": il pezzo che, dove serve, si accende di Electric Sapphire (la
   punta della matita, la bolla della livella, il carico della gru).
   Nessuno è una freccia.
   --------------------------------------------------------------------------- */

const A = 'sym__a'
/** Pieno invece che tratto: puntini, bande, dettagli piccoli. */
const F = { fill: 'currentColor', stroke: 'none' }
/** Testo inciso nel simbolo (quote, sigle). */
const T = { fill: 'currentColor', stroke: 'none', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700, textAnchor: 'middle' }

const studio = [
  {
    name: 'compasso',
    label: 'Compasso',
    draw: (
      <>
        <path d="M16 2.5V5" />
        <circle cx="16" cy="7" r="2" />
        <path d="M14.9 8.7 7.4 29.2M17.1 8.7l6.5 17.8" />
        <path d="M11.3 18.5h9.4" />
        <path className={A} d="m23.6 26.5 1 2.7" strokeWidth="2.2" />
      </>
    ),
  },
  {
    name: 'squadra',
    label: 'Squadra',
    draw: (
      <>
        <path d="M4 28V4l24 24Z" />
        <path className={A} d="M8.5 23.5v-8.6l8.6 8.6Z" />
        <path d="M4 9h2.5M4 14h2.5M4 19h2.5M4 24h2.5" strokeWidth="1" />
      </>
    ),
  },
  {
    name: 'riga-t',
    label: 'Riga a T',
    draw: (
      <>
        <rect x="3" y="4" width="6" height="24" rx="1" />
        <path d="M9 13h20v6H9" />
        <path d="M13 13v2.5M17 13v1.5M21 13v2.5M25 13v1.5" strokeWidth="1" />
        <circle className={A} cx="6" cy="7.5" r="1.1" {...F} />
      </>
    ),
  },
  {
    name: 'scalimetro',
    label: 'Scalimetro',
    draw: (
      <>
        <path d="M3 20 24 7l4 2.5L7 22.5Z" />
        <path d="M7 22.5V26L28 13V9.5" />
        <path className={A} d="M3 20v3.5L7 26v-3.5Z" {...F} />
        <path
          d="m10.15 20.55-2-1.25m5.15-.7-1.2-.75m4.35-1.2-2-1.25m5.15-.7-1.2-.75m4.35-1.2-2-1.25m5.15-.7-1.2-.75"
          strokeWidth="1"
        />
      </>
    ),
  },
  {
    name: 'matita',
    label: 'Matita',
    draw: (
      <g transform="rotate(-45 16 16)">
        <path d="M5 13h17v6H5z" />
        <path d="m22 13 6.5 3-6.5 3" />
        <path d="M8.5 13v6M8.5 16H22" strokeWidth="1" />
        <path className={A} d="m26.3 15 2.2 1-2.2 1z" {...F} />
      </g>
    ),
  },
  {
    name: 'goniometro',
    label: 'Goniometro',
    draw: (
      <>
        <path d="M3 24a13 13 0 0 1 26 0Z" />
        <path d="M9 24a7 7 0 0 1 14 0" strokeWidth="1" />
        <path d="m27.3 17.5-1.73 1M22.5 12.7l-1 1.73M16 11v2M9.5 12.7l1 1.73M4.7 17.5l1.73 1" />
        <path className={A} d="m16 24 7.4-8.8" strokeWidth="1" />
        <circle className={A} cx="16" cy="24" r="1.4" {...F} />
      </>
    ),
  },
  {
    name: 'quota',
    label: 'Quota',
    draw: (
      <>
        <path d="M5 8v15M27 8v15" strokeWidth="1" />
        <path d="M2.5 19h27" />
        <path className={A} d="m3.5 21.5 3-5m19 5 3-5" strokeWidth="2" />
        <text x="16" y="15" fontSize="7" {...T}>
          2,40
        </text>
      </>
    ),
  },
  {
    name: 'asse',
    label: 'Asse di riferimento',
    draw: (
      <>
        <circle cx="16" cy="9.5" r="7" />
        <text x="16" y="12.6" fontSize="8.5" {...T}>
          A
        </text>
        <path className={A} d="M16 16.5V30" strokeWidth="1.2" strokeDasharray="5 2 1 2" />
      </>
    ),
  },
  {
    name: 'sezione',
    label: 'Richiamo di dettaglio',
    draw: (
      <>
        <circle cx="14" cy="16" r="9.5" />
        <path d="M4.5 16h19" />
        <path className={A} d="M23.5 16H30" />
        <text x="14" y="13.6" fontSize="7" {...T}>
          3
        </text>
        <text x="14" y="22.6" fontSize="5.5" {...T}>
          A.05
        </text>
      </>
    ),
  },
  {
    name: 'porta',
    label: 'Porta',
    draw: (
      <>
        <path d="M2 25h5v4H2m28-4h-5v4h5" />
        <path d="M7 7h1.8v18H7z" />
        <path className={A} d="M8.8 7.1A18 18 0 0 1 25 25" strokeDasharray="2 2" />
      </>
    ),
  },
  {
    name: 'finestra',
    label: 'Finestra',
    draw: (
      <>
        <path d="M2 11h7v10H2m28-10h-7v10h7" />
        <path d="M9 11h14M9 21h14" strokeWidth="1" />
        <path className={A} d="M9 16h14" />
        <path d="m2 13 2-2m-2 6 6-6m-6 10 7-7m-3 7 3-3m14-5 2-2m-2 6 6-6m-6 10 7-7m-3 7 3-3" strokeWidth=".8" />
      </>
    ),
  },
  {
    name: 'scala',
    label: 'Scala',
    draw: (
      <>
        <rect x="6" y="3" width="20" height="26" />
        <path d="M6 8h20M6 13h20M6 18h20M6 23h20" strokeWidth="1" />
        <path className={A} d="m4 20 8.5-2.5 1.5 3 3-7 1.5 3L28 14" />
      </>
    ),
  },
  {
    name: 'campitura',
    label: 'Campitura cls',
    draw: (
      <>
        <rect x="4" y="4" width="24" height="24" />
        <path d="m4 12 8-8M4 20 20 4M4 28 28 4M12 28l16-16m-8 16 8-8" strokeWidth=".9" />
        <g className={A} {...F}>
          <circle cx="9" cy="17" r="1.1" />
          <circle cx="18" cy="9" r="1.1" />
          <circle cx="23" cy="20" r="1.1" />
          <circle cx="14" cy="23.5" r="1.1" />
          <path d="m13 12.5 2.2-.6-.6 2.2z" />
          <path d="m21.5 14.5 2-.3-1 1.8z" />
        </g>
      </>
    ),
  },
  {
    name: 'isolante',
    label: 'Isolante',
    draw: (
      <>
        <path d="M3 7h26M3 25h26" />
        <path className={A} d="M3 25 6.25 7 9.5 25 12.75 7 16 25l3.25-18 3.25 18 3.25-18L29 25" strokeWidth="1.1" />
      </>
    ),
  },
  {
    name: 'ipe',
    label: 'Profilo IPE',
    draw: (
      <>
        <path d="M7 5h18v3h-7.5v16H25v3H7v-3h7.5V8H7Z" />
        <path className={A} d="M16 1.5v29M2.5 16h27" strokeWidth=".9" strokeDasharray="4 1.5 1 1.5" />
      </>
    ),
  },
  {
    name: 'pilastro',
    label: 'Pilastro in c.a.',
    draw: (
      <>
        <rect x="5" y="5" width="22" height="22" />
        <rect className={A} x="8.5" y="8.5" width="15" height="15" rx="2" strokeWidth="1.1" />
        <g {...F}>
          <circle cx="11" cy="11" r="1.5" />
          <circle cx="21" cy="11" r="1.5" />
          <circle cx="11" cy="21" r="1.5" />
          <circle cx="21" cy="21" r="1.5" />
          <circle cx="16" cy="11" r="1.2" />
          <circle cx="16" cy="21" r="1.2" />
        </g>
      </>
    ),
  },
  {
    name: 'prospettiva',
    label: 'Prospettiva',
    draw: (
      <>
        <path className={A} d="M1 5h30" strokeWidth=".9" strokeDasharray="1.5 1.5" />
        <path className={A} d="M5 12.35 1 11.2m4 10-4-2.6m26-6.4 4-.9m-4 8.6 4-1.9" strokeWidth=".8" />
        <path d="M14 15v12M5 12.35v8.83M27 12.17v8.61M5 21.18 14 27l13-6.22M5 12.35 14 15l13-2.83-9.64-1.47Z" />
      </>
    ),
  },
  {
    name: 'tavola',
    label: 'Tavola',
    draw: (
      <>
        <rect x="4" y="4" width="24" height="24" />
        <path d="M8 8h9v8H8zm4.5 0v4.5" strokeWidth="1" />
        <path className={A} d="M16 28v-8h12m-12 4h12m-6-4v4" strokeWidth="1" />
      </>
    ),
  },
  {
    name: 'lente',
    label: 'Lente',
    draw: (
      <>
        <circle cx="13" cy="13" r="8.5" />
        <path className={A} d="M8 13a5 5 0 0 1 5-5" />
        <path d="m19 19 2.5 2.5" />
        <rect x="20" y="23" width="10" height="4" rx="2" transform="rotate(45 25 25)" />
      </>
    ),
  },
  {
    name: 'sisma',
    label: 'Sismogramma',
    draw: (
      <>
        <path d="M2 16h28" strokeWidth=".6" strokeDasharray="1 1.5" />
        <path className={A} d="M2 16h5l1.5-4 1.5 8 1.5-13 1.5 18 1.5-21 1.5 24 1.5-19 1.5 13 1.5-9 1.5 5 1.5-2H30" />
      </>
    ),
  },
  {
    name: 'energia',
    label: 'Termometro',
    draw: (
      <>
        <path d="M13.5 19.5v-13a2.5 2.5 0 0 1 5 0v13a5.5 5.5 0 1 1-5 0Z" />
        <path className={A} d="M16 10v13" strokeWidth="2" />
        <circle className={A} cx="16" cy="24.4" r="2.6" {...F} />
        <path d="M21 8h2.5M21 11.5h1.5M21 15h2.5M21 18.5h1.5" strokeWidth="1" />
      </>
    ),
  },
  {
    name: 'catasto',
    label: 'Particella catastale',
    draw: (
      <>
        <path d="m4 9 15-5 9 8.5-2 14.5-17 1.5-6-10Z" />
        <path d="m19 4-4 13.5L26 27M15 17.5l-12 1" strokeWidth="1" />
        <g {...F}>
          <circle cx="4" cy="9" r="1.3" />
          <circle cx="19" cy="4" r="1.3" />
          <circle cx="28" cy="12.5" r="1.3" />
          <circle cx="26" cy="27" r="1.3" />
          <circle cx="9" cy="28.5" r="1.3" />
          <circle cx="3" cy="18.5" r="1.3" />
          <circle cx="15" cy="17.5" r="1.3" />
        </g>
        <text x="9.8" y="15" fontSize="5" {...T}>
          37
        </text>
        <text className={A} x="21.8" y="17" fontSize="5" {...T}>
          124
        </text>
      </>
    ),
  },
  {
    name: 'impianti',
    label: 'Valvola',
    draw: (
      <>
        <path d="M2.5 17H12m8 0h9.5M2.5 14v6m27-6v6" />
        <path className={A} d="m12 12 8 10V12l-8 10Z" />
        <path d="M16 17V7m-3.5 0h7" />
      </>
    ),
  },
  {
    name: 'urbanistica',
    label: 'Isolato',
    draw: (
      <>
        <rect x="4" y="4" width="10" height="10" />
        <path d="M18 4h4.5v10H18zm5.5 0H28v10h-4.5z" />
        <circle cx="9" cy="23" r="5" />
        <rect x="18" y="18" width="10" height="10" />
        <rect x="21" y="21" width="4" height="4" strokeWidth="1" />
        <path className={A} d="M16 2v28M2 16h28" strokeWidth=".9" strokeDasharray="2 1.5" />
      </>
    ),
  },
]

const cantiere = [
  {
    name: 'casco',
    label: 'Casco',
    draw: (
      <>
        <path d="M5 22a11 11 0 0 1 22 0" />
        <rect x="2.5" y="22" width="27" height="2.8" rx="1.2" />
        <path className={A} d="M13.5 22v-9.7a2.5 1.2 0 0 1 5 0V22" />
      </>
    ),
  },
  {
    name: 'cono',
    label: 'Cono segnaletico',
    draw: (
      <>
        <rect x="4.5" y="26.5" width="23" height="2.6" rx=".8" />
        <path d="M9.2 26.5 14 5h4l4.8 21.5" />
        <path className={A} d="M12.66 11h6.68l.67 3h-8.02zm-1.56 7h9.8l.67 3H10.43z" {...F} />
      </>
    ),
  },
  {
    name: 'gru',
    label: 'Gru a torre',
    draw: (
      <>
        <path d="M11 29V8.5m3 20.5V8.5M4 8.5h26M14 11h16M8 29h9" />
        <path d="m11 26.5 3-3-3-3 3-3-3-3 3-3-3-3" strokeWidth=".9" />
        <path d="m14 11 2-2.5 2 2.5 2-2.5 2 2.5 2-2.5 2 2.5 2-2.5 2 2.5" strokeWidth=".9" />
        <path d="M12.5 3v5.5m0-5.5L30 8.5M12.5 3 4 8.5" strokeWidth=".9" />
        <rect x="4.5" y="9" width="4.5" height="3.5" {...F} />
        <path className={A} d="M25 11v9m0 0-3 3.5m3-3.5 3 3.5" strokeWidth="1" />
        <rect className={A} x="21" y="23.5" width="8" height="4.5" />
      </>
    ),
  },
  {
    name: 'escavatore',
    label: 'Escavatore',
    draw: (
      <>
        <rect x="2.5" y="23" width="17" height="5.5" rx="2.75" />
        <g {...F}>
          <circle cx="5.6" cy="25.75" r="1" />
          <circle cx="11" cy="25.75" r="1" />
          <circle cx="16.4" cy="25.75" r="1" />
        </g>
        <path d="M4 23v-7.5h7.5l2 3.5V23Z" />
        <path d="M5.5 15.5V10H10l1.5 5.5" strokeWidth="1" />
        <path d="M13.5 19 21 8.5l6 5" strokeWidth="2" />
        <path className={A} d="M27 13.5c2 1.2 3 3.4 2.8 6.2l-4.6-.4Z" />
      </>
    ),
  },
  {
    name: 'mattoni',
    label: 'Muratura',
    draw: (
      <>
        <rect x="3" y="6" width="26" height="20" />
        <path d="M3 11h26M3 16h26M3 21h26" />
        <path d="M11.7 6v5m8.6-5v5M7.3 11v5m8.7-5v5m8.7-5v5m-13 0v5m8.6-5v5M7.3 21v5m8.7-5v5m8.7-5v5" strokeWidth="1" />
        <path className={A} d="M16 11h8.7v5H16z" {...F} />
      </>
    ),
  },
  {
    name: 'cazzuola',
    label: 'Cazzuola',
    draw: (
      <>
        <path d="m4 28 6.54-13.62Q14.5 11 18 14q3 3.5-.38 7.46Z" />
        <path className={A} d="m6.5 25.5 9-9" strokeWidth="1" />
        <path d="m18 14 3-3" />
        <rect x="19.5" y="5.5" width="10" height="4" rx="2" transform="rotate(-45 24.5 7.5)" />
      </>
    ),
  },
  {
    name: 'livella',
    label: 'Livella',
    draw: (
      <>
        <rect x="2" y="11.5" width="28" height="9" rx="1.5" />
        <path d="M6 11.5v9m20-9v9" strokeWidth="1" />
        <rect className={A} x="11" y="14" width="10" height="4" rx="2" />
        <circle className={A} cx="16" cy="16" r="1.1" {...F} />
        <path d="M14 13v6m4-6v6" strokeWidth=".8" />
      </>
    ),
  },
  {
    name: 'piombo',
    label: 'Filo a piombo',
    draw: (
      <>
        <path d="M16 2v8" strokeWidth="1" />
        <path d="M12.5 10h7v4L16 27l-3.5-13Z" />
        <path d="M12.5 14h7M14 12h4" strokeWidth=".9" />
        <path className={A} d="M16 14h3.5L16 27Z" {...F} />
        <path d="M16 27v3" strokeWidth="1" strokeDasharray="1 1" />
      </>
    ),
  },
  {
    name: 'metro',
    label: 'Metro a nastro',
    draw: (
      <>
        <rect x="3" y="8" width="18" height="18" rx="4.5" />
        <circle cx="12" cy="17" r="4" />
        <circle cx="12" cy="17" r="1" {...F} />
        <path d="M21 21.5h8.5v3H21" />
        <path d="M23 21.5V23m2-1.5v1m2-1v1.5" strokeWidth=".8" />
        <path className={A} d="M29.5 20v6" strokeWidth="1.8" />
      </>
    ),
  },
  {
    name: 'transenna',
    label: 'Transenna',
    draw: (
      <>
        <rect x="3" y="9" width="26" height="7" />
        <path className={A} d="M7 9h4l-3 7H4zm8 0h4l-3 7h-4zm8 0h4l-3 7h-4z" {...F} />
        <path d="M7 16 4 28.5M7 16l3 12.5M25 16l-3 12.5M25 16l3 12.5M16 9V7" />
        <circle className={A} cx="16" cy="5" r="2" {...F} />
      </>
    ),
  },
  {
    name: 'pericolo',
    label: 'Pericolo',
    draw: (
      <>
        <path d="M16 3.5 29.5 27.5h-27Z" />
        <path className={A} d="M16 11.5v8" strokeWidth="2.2" />
        <circle className={A} cx="16" cy="23.3" r="1.3" {...F} />
      </>
    ),
  },
  {
    name: 'estintore',
    label: 'Estintore',
    draw: (
      <>
        <rect x="10" y="10" width="11" height="19" rx="3" />
        <path d="M13 10V7.5h5V10M12 5.5h6.5M15.5 5.5v2" />
        <path d="M18 8.5c5 0 7 2.5 7 6V21" />
        <path d="M24 21h2l.5 3h-3z" />
        <rect className={A} x="12.5" y="15" width="6" height="7" {...F} />
      </>
    ),
  },
  {
    name: 'ponteggio',
    label: 'Ponteggio',
    draw: (
      <>
        <path d="M6 3v25.5M16 3v25.5M26 3v25.5" />
        <path d="M4 10h24M4 18h24M4 26h24M6 18l10-8m0 16 10-8" strokeWidth="1" />
        <path d="M4 28.5h4m6 0h4m6 0h4" strokeWidth="2" />
        <path className={A} d="M16 8.5h10m-20 8h10" strokeWidth="2.4" />
      </>
    ),
  },
  {
    name: 'pala',
    label: 'Pala',
    draw: (
      <g transform="rotate(35 16 16)">
        <path d="M12.5 2h7m-6 0 2.5 3.5L18.5 2M16 5.5V19" />
        <path className={A} d="M11.5 19h9v6c0 3-2 4.5-4.5 5-2.5-.5-4.5-2-4.5-5z" />
      </g>
    ),
  },
  {
    name: 'carriola',
    label: 'Carriola',
    draw: (
      <>
        <path d="M8 10h18l-4 9H12Z" />
        <path className={A} d="M9.5 12.5h15" strokeWidth="1" />
        <path d="M23 24 3 15m10 4.5-1 8m10-8.5.3 4.4" />
        <circle cx="23" cy="24" r="3.5" />
        <circle cx="23" cy="24" r=".9" {...F} />
      </>
    ),
  },
  {
    name: 'betoniera',
    label: 'Betoniera',
    draw: (
      <>
        <g transform="translate(15 13) rotate(-28)">
          <path d="M3.5-7.5 10-4v8L3.5 7.5H-5a7.5 7.5 0 0 1 0-15Z" />
          <ellipse className={A} cx="10" cy="0" rx="1.3" ry="4" />
          <path d="M-1-7.5v15" strokeWidth="1" />
        </g>
        <path d="m11 20.5-3.5 8.5m10-9.5 3.5 6" />
        <circle cx="23" cy="27" r="2.5" />
      </>
    ),
  },
  {
    name: 'stazione-totale',
    label: 'Stazione totale',
    draw: (
      <>
        <path d="M12 5V3.5h8V5" />
        <rect x="10" y="5" width="12" height="9" rx="1.5" />
        <circle className={A} cx="16" cy="9.5" r="2.4" />
        <circle className={A} cx="16" cy="9.5" r=".8" {...F} />
        <path d="M9 14h14v2.5H9z" />
        <path d="M13.5 16.5 5 29m11-12.5V29m2.5-12.5L27 29" />
      </>
    ),
  },
  {
    name: 'palina',
    label: 'Palina con prisma',
    draw: (
      <>
        <circle cx="16" cy="6.5" r="4.5" />
        <circle className={A} cx="16" cy="6.5" r="2" {...F} />
        <path d="M16 11v18.5m-3 0h6M16 19h2.5" />
        <path d="M14.8 14h2.4v4h-2.4zm0 8h2.4v4h-2.4z" {...F} />
        <circle cx="20" cy="19" r="1.5" strokeWidth="1" />
      </>
    ),
  },
  {
    name: 'caposaldo',
    label: 'Caposaldo',
    draw: (
      <>
        <path d="M16 2v28M2 16h28" strokeWidth=".9" />
        <circle cx="16" cy="16" r="10" />
        <path className={A} d="M16 16V6a10 10 0 0 1 10 10Zm0 0v10A10 10 0 0 1 6 16Z" {...F} />
      </>
    ),
  },
  {
    name: 'martello',
    label: 'Martello',
    draw: (
      <g transform="rotate(-40 16 16)">
        <path d="M8 6h13v5H8z" />
        <path d="M21 7c3 0 5 1.5 6 3.5" />
        <path d="M13 11h3.5v17.5a1.75 1.75 0 0 1-3.5 0z" />
        <path className={A} d="M8 6v5" strokeWidth="2.4" />
      </g>
    ),
  },
  {
    name: 'chiave',
    label: 'Chiave',
    draw: (
      <g transform="rotate(45 16 16)">
        <path d="M13 12c-3.5-1.5-4.5-6-2.5-9l3 3.5h5l3-3.5c2 3 1 7.5-2.5 9" />
        <path d="M13 12v15.5a3 3 0 0 0 6 0V12" />
        <circle className={A} cx="16" cy="26.5" r="1.2" {...F} />
      </g>
    ),
  },
  {
    name: 'bullone',
    label: 'Dado',
    draw: (
      <>
        <path d="m16 4 10.4 6v12L16 28 5.6 22V10Z" />
        <circle cx="16" cy="16" r="10.4" strokeWidth=".8" />
        <circle cx="16" cy="16" r="4" />
        <path className={A} d="M21.2 16a5.2 5.2 0 1 1-5.2-5.2" strokeWidth="1.2" />
      </>
    ),
  },
  {
    name: 'ponte',
    label: 'Ponte ad arco',
    draw: (
      <>
        <path d="M2 12h28M2 14.5h28" />
        <path className={A} d="M4 28Q16 2 28 28" />
        <path d="M8 14.5v6.3m4-6.3v2m8-2v2m4-2v6.3M2 28h28" strokeWidth="1" />
      </>
    ),
  },
  {
    name: 'idraulica',
    label: 'Acqua',
    draw: (
      <>
        <path d="M16 3.5C12.5 9 8.5 13.5 8.5 19a7.5 7.5 0 0 0 15 0c0-5.5-4-10-7.5-15.5Z" />
        <path className={A} d="M11 20.5c1.7-1.3 3.3-1.3 5 0s3.3 1.3 5 0" />
      </>
    ),
  },
]

/** Tutti i simboli in fila: prima il tavolo da disegno, poi il cantiere. */
export const symbols = [...studio, ...cantiere]

/** I simboli per nome, per il componente <Sym> (Sym.jsx). */
export const symbolByName = Object.fromEntries(symbols.map((s) => [s.name, s]))
