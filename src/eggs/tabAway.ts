import { reduceMotion } from '@/lib/env'
import { unlock } from './secrets'

const LOST_ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cpath d='M14 4h48L50 60H2z' fill='%23ff2a3d'/%3E%3Ctext x='31' y='47' font-family='Arial Black,Arial' font-weight='900' font-size='38' text-anchor='middle' fill='%2307060c'%3E!%3C/text%3E%3C/svg%3E"

// The title and icon call the visitor back after they wander off to another tab.
export function initTabAway() {
  const root = document.documentElement
  const originalTitle = document.title
  const favicon = document.querySelector('link[rel="icon"]')
  const originalIcon = favicon?.getAttribute('href') ?? ''
  let seenVisible = !document.hidden
  let wentAway = false
  let awayTimer = 0

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (!seenVisible) return
      wentAway = true
      let flip = false
      const blink = () => {
        flip = !flip
        document.title = flip ? '⚠ Signal lost…' : 'Come back?'
      }
      blink()
      awayTimer = window.setInterval(blink, 1000)
      favicon?.setAttribute('href', LOST_ICON)
      return
    }
    seenVisible = true
    if (!wentAway) return
    wentAway = false
    clearInterval(awayTimer)
    document.title = originalTitle
    favicon?.setAttribute('href', originalIcon)
    if (!reduceMotion) {
      root.classList.add('reconnect')
      setTimeout(() => root.classList.remove('reconnect'), 700)
    }
    unlock('signal')
  })
}
