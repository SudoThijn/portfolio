import { unlock } from './secrets'

declare global {
  interface Window {
    hack: () => string
  }
}

export function initConsole() {
  console.log(
    '%c████████ ██████ \n   ██    ██   ██\n   ██    ██   ██\n   ██    ██   ██\n   ██    ██████ ',
    'color:#fcee0a;font:700 12px/1.1 monospace',
  )
  console.log(
    '%cLooking at the source? Then we should talk: thijn.douwma@outlook.com',
    'color:#2de2ff;font:600 13px monospace',
  )
  console.log(
    '%cThere is a secret for people who read consoles. Run: hack()',
    'color:#ff2d7a;font:12px monospace',
  )
  window.hack = () => {
    unlock('console')
    return 'ACCESS GRANTED. Secret unlocked: Source diver.'
  }
}
