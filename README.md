# Sito — Ing. Dario Donelli

Sito dello studio tecnico dell'Ing. Dario Donelli, Rivalta sul Mincio (MN).
Pagina singola in React + Vite, identità in bianco e nero ripresa dalla targa
dello studio.

## Comandi

```bash
npm install
npm run dev       # sviluppo su http://localhost:5173
npm run build     # produzione in dist/
npm run preview   # anteprima della build
npm run lint      # oxlint
```

## Struttura

- `src/content.js` — tutti i testi e i dati (recapiti, servizi, progetti, albo)
- `src/App.jsx` — componenti della pagina
- `src/symbols.jsx` — i 48 simboli da progettista e da cantiere (elenchi e sfondo); `src/Sym.jsx` li disegna per nome
- `src/Key.jsx` — i tasti in CSS: rettangolari o tondi, alluminio blu con la scritta retroilluminata
- `src/LedDisplay.jsx` — il display a segmenti del footer
- `src/Nuvola.jsx` — l'area di riferimento: l'esplosione di punti in 3D nel vuoto nero, la sede al centro e la provincia tutt'intorno, con i nomi che il motore porta sui centri; `src/nuvola.js` è il motore (WebGL, camera, puntatore), `src/provincia.js` i 64 comuni e le frazioni con coordinate e popolazione
- `src/index.css` — token di design (colori, tipografia, spazio, metalli)
- `src/App.css` — stili dei componenti
- `src/sfondo.css` — lo sfondo: la lastra d’acciaio inox che scorre in parallasse (`src/sfondo.js` la muove dove manca lo scroll-timeline), i veli per sezione e il brunito blu di contatti e footer; spegne i simboli a margine
- `public/images/` — fotografie (jpg + webp); `metallo/` sono le lastre d'acciaio e blu delle carte; la foto `14092026 (1).JPG` è l'originale della sede

Il deploy è su Vercel (`vercel.json` reindirizza ogni percorso a `index.html`).
