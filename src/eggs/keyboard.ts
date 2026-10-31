import { dialogOpen, isTyping } from '@/lib/dom'
import { exitLeet, feedKonami, isLeet, overdrive, setOverdrive } from './modes'
import { savePoint } from './savepoint'
import { isTerminalOpen, openTerminal, run } from './terminal'

// Ctrl/Cmd+S, Escape, the Konami code and typing "sudo", all from anywhere on the page.
export function initKeyboard() {
  let typed = ''
  addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault()
      if (isTerminalOpen()) run('save')
      else if (!dialogOpen()) savePoint()
      return
    }
    if (e.key === 'Escape' && !dialogOpen() && (overdrive.value || isLeet())) {
      if (overdrive.value) setOverdrive(false)
      else exitLeet()
      return
    }
    if (isTyping(e.target) || dialogOpen() || e.ctrlKey || e.metaKey || e.altKey) return
    const key = e.key.toLowerCase()
    // Holding Shift for a capital B shouldn't break the code.
    if (key === 'shift' || key === 'capslock') return
    feedKonami(key)
    if (key.length !== 1) return
    typed = (typed + key).slice(-4)
    if (typed === 'sudo') {
      typed = ''
      // Without this, the final "o" lands in the freshly focused terminal input.
      e.preventDefault()
      openTerminal()
    }
  })
}
