import Lenis from 'lenis'
import { useEffect } from 'react'

/* ---------------------------------------------------------------------------
   Movimento
   Lo scorrimento morbido della pagina e gli aiuti che fanno muovere il sito
   mentre si scorre. Il resto (come si muove) è in motion.css.
   --------------------------------------------------------------------------- */

/** Un'unica istanza per la pagina; resta null con il movimento ridotto. */
let lenis = null

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Parte piano, accelera, si posa: per i salti lunghi da un'ancora all'altra. */
const easeInOutQuart = (t) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2)

/** Lo stesso scarto dell'header che usa scroll-padding-top in index.css. */
const HEADER_OFFSET = 88

/**
 * Scorrimento con inerzia (Lenis). La rotella non salta più a scatti di
 * cento pixel: la pagina scivola e si ferma morbida, e con lei tutte le
 * animazioni legate allo scroll. Il tocco resta nativo.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return
    const instance = new Lenis({ lerp: 0.09, autoRaf: true })
    lenis = instance
    return () => {
      instance.destroy()
      if (lenis === instance) lenis = null
    }
  }, [])
}

/**
 * Porta la pagina a un punto: l'id di una sezione, un elemento o una quota
 * in pixel. La durata cresce con la distanza, così un salto breve non è
 * lento e uno lungo non è un lampo.
 */
export function scrollToTarget(target, { immediate = false } = {}) {
  const el = typeof target === 'string' ? document.getElementById(target) : target
  const top = typeof el === 'number' ? el : el ? el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET : 0

  if (lenis) {
    const duration = Math.min(2.2, Math.max(0.9, Math.abs(top - window.scrollY) / 2400))
    lenis.scrollTo(Math.max(0, top), { immediate, duration, easing: easeInOutQuart, force: true })
    return
  }
  window.scrollTo({ top, behavior: immediate || prefersReducedMotion() ? 'auto' : 'smooth' })
}

/** Ferma e riprende lo scorrimento morbido (menu aperto). */
export function setScrollLocked(locked) {
  if (!lenis) return
  if (locked) lenis.stop()
  else lenis.start()
}

/**
 * Rivelazione allo scroll. Un solo observer per tutti gli elementi .reveal:
 * la linea di attivazione sta al 14% dal fondo dello schermo, così
 * l'animazione parte quando l'elemento si vede davvero. Arrivati in fondo
 * alla pagina quella linea non si raggiunge più: ciò che è sullo schermo
 * si mostra comunque, e non si perde nulla.
 */
export function useReveal() {
  useEffect(() => {
    const nodes = [...document.querySelectorAll('.reveal:not(.is-visible)')]
    if (!nodes.length) return
    const show = (node) => node.classList.add('is-visible')
    if (typeof IntersectionObserver === 'undefined') {
      nodes.forEach(show)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            show(entry.target)
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -14% 0px', threshold: 0 },
    )
    nodes.forEach((node) => observer.observe(node))

    let frame = 0
    const atBottom = () => {
      frame = 0
      if (window.innerHeight + window.scrollY < document.documentElement.scrollHeight - 8) return
      nodes.forEach((node) => {
        if (node.classList.contains('is-visible')) return
        if (node.getBoundingClientRect().top < window.innerHeight) {
          show(node)
          observer.unobserve(node)
        }
      })
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(atBottom)
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      observer.disconnect()
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])
}

/**
 * Avanzamento di un elemento attraverso lo schermo: 0 quando il suo bordo
 * alto entra dal fondo, 1 quando il bordo basso esce in cima. Fuori da
 * quell'intervallo il valore sfora (<0 o >1). `onProgress` va memorizzato.
 */
export function useScrollProgress(ref, onProgress) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let frame = 0
    const compute = () => {
      frame = 0
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      onProgress((vh - rect.top) / (vh + rect.height))
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(compute)
    }
    compute()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ref, onProgress])
}

/**
 * Nastro che scorre da solo. Il primo gruppo del binario è il periodo:
 * quando è uscito del tutto si riparte da zero, senza scatto, perché i
 * gruppi sono identici. Lo scroll della pagina lo spinge: più veloce si
 * scorre, più corre, e cambia verso quando si torna su.
 */
export function useMarquee(ref) {
  useEffect(() => {
    const track = ref.current
    if (!track || prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return
    const first = track.firstElementChild
    if (!first) return

    const BASE = 32 // px al secondo, a pagina ferma
    let period = first.offsetWidth
    let x = 0
    let speed = BASE
    let dir = 1
    let lastY = window.scrollY
    let last = 0
    let raf = 0

    const tick = (now) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0
      last = now
      const y = window.scrollY
      const dy = y - lastY
      lastY = y
      if (dy) dir = dy > 0 ? 1 : -1
      const push = dt ? Math.min(Math.abs(dy) / dt, 4000) * 0.16 : 0
      speed += (dir * (BASE + push) - speed) * Math.min(1, dt * 4)
      if (period) {
        x = (x + speed * dt) % period
        if (x < 0) x += period
      }
      track.style.transform = `translate3d(${(-x).toFixed(2)}px, 0, 0)`
      raf = window.requestAnimationFrame(tick)
    }

    // Fuori dallo schermo il nastro si ferma: niente lavoro inutile.
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !raf) {
        last = 0
        lastY = window.scrollY
        raf = window.requestAnimationFrame(tick)
      } else if (!entry.isIntersecting && raf) {
        window.cancelAnimationFrame(raf)
        raf = 0
      }
    })
    observer.observe(track)

    const measure = () => {
      period = first.offsetWidth
    }
    window.addEventListener('resize', measure)
    document.fonts?.ready.then(measure)

    return () => {
      observer.disconnect()
      if (raf) window.cancelAnimationFrame(raf)
      window.removeEventListener('resize', measure)
    }
  }, [ref])
}
