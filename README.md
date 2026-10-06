# Sito — Ing. Dario Donelli

Sito dello studio tecnico dell'Ing. Dario Donelli, Rivalta sul Mincio (MN).
Pagina singola in React + Vite, impostazione minimale ed elegante: carta
calda, inchiostro, filetti sottili, titoli in Fraunces e testo in Inter,
fotografie in bianco e nero. Nessuna icona e nessun pulsante: le azioni
sono collegamenti testuali.

## Comandi

```bash
npm install
npm run dev       # sviluppo su http://localhost:5173
npm run build     # produzione in dist/ (build SSR + prerender)
npm run preview   # anteprima della build
npm run lint      # oxlint
```

## Struttura

- `src/content.js` — tutti i testi e i dati (recapiti, servizi, ambiti, albo)
- `src/App.jsx` — componenti della pagina
- `src/motion.js` — scorrimento morbido (Lenis) e rivelazioni allo scroll
- `src/index.css` — token di design (colori, tipografia, spazio), font e base
- `src/App.css` — stili dei componenti
- `public/images/` — fotografie (jpg/png + webp)
- `public/fonts/` — Fraunces e Inter auto-ospitati (woff2 variabili)
- `originali/` — materiali sorgente non pubblicati (l'originale della foto
  della sede)

Il sito viene prerenderizzato in fase di build (`plugins/prerender.js`):
l'HTML finito sta già dentro `dist/index.html` e React vi si aggancia con
l'hydration.

Il deploy è su Vercel (`vercel.json` reindirizza ogni percorso a `index.html`).
