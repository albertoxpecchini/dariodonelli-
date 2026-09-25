import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

/**
 * Prerendering: al termine della build il sito viene renderizzato in HTML
 * statico e scritto dentro #root. Senza, il file servito contiene solo il
 * contenitore vuoto: chi arriva senza JavaScript — e parte dei crawler —
 * riceve una pagina muta. Con l'HTML già dentro, il contenuto esiste al
 * primo byte; React poi ci si aggancia sopra con l'hydration.
 *
 * Serve una build SSR dei sorgenti, perché il bundle del browser non è
 * eseguibile in Node: la produce `vite build --mode ssr`, che lo script
 * `build` lancia per primo.
 */
export default function prerender() {
  let isSsrBuild = false

  return {
    name: 'prerender',
    apply: 'build',

    configResolved(config) {
      // Nella passata SSR non si prerenderizza nulla: si prepara solo l'entry.
      isSsrBuild = config.mode === 'ssr'
    },

    closeBundle: {
      sequential: true,
      order: 'post',
      async handler() {
        if (isSsrBuild) return

        const root = process.cwd()
        const htmlPath = resolve(root, 'dist/index.html')
        const entry = resolve(root, 'dist-ssr/entry-server.js')

        if (!existsSync(entry)) {
          this.error(
            'prerender: manca dist-ssr/entry-server.js. Lancia `npm run build`, ' +
              'che esegue prima la build SSR.',
          )
        }

        const { render } = await import(`file://${entry}`)
        const markup = render()

        const html = await readFile(htmlPath, 'utf8')
        const out = html.replace('<div id="root"></div>', `<div id="root">${markup}</div>`)

        if (out === html) {
          this.error('prerender: segnaposto #root non trovato in dist/index.html')
        }

        await writeFile(htmlPath, out, 'utf8')
        const kb = (Buffer.byteLength(markup, 'utf8') / 1024).toFixed(1)
        this.info(`prerender: ${kb} kB di HTML dentro #root`)
      },
    },
  }
}
