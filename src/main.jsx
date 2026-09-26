import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// Lo sfondo va per ultimo: ridefinisce i fondi di App.css e motion.css.
import './sfondo.css'
import { avviaSfondo } from './sfondo.js'

const container = document.getElementById('root')

// La lastra dello sfondo segue lo scroll anche dove manca lo scroll-timeline.
avviaSfondo()

const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// In produzione il markup arriva già dal prerender: React ci si aggancia
// sopra invece di ricostruirlo. In sviluppo il contenitore è vuoto, quindi
// si crea la radice come sempre.
if (container.hasChildNodes()) {
  hydrateRoot(container, app)
} else {
  createRoot(container).render(app)
}
