import { initCharge } from './charge'
import { initConsole } from './consoleEgg'
import { initKeyboard } from './keyboard'
import { initModes } from './modes'
import { initTabAway } from './tabAway'

// Wires the document-level behaviour. Call it once, after the app has mounted.
export function initEggs() {
  initModes()
  initKeyboard()
  initCharge()
  initTabAway()
  initConsole()
}
