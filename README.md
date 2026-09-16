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
- `src/index.css` — token di design (colori, tipografia, spazio)
- `src/App.css` — stili dei componenti
- `public/images/` — fotografie (jpg + webp); le foto `14092026 (*).JPG` sono gli originali

Il deploy è su Vercel (`vercel.json` reindirizza ogni percorso a `index.html`).
