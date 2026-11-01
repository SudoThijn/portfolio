import { t } from '@/i18n'
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
  console.log(`%c${t('egg.consoleGreeting')}`, 'color:#2de2ff;font:600 13px monospace')
  console.log(`%c${t('egg.consoleHint')}`, 'color:#ff2d7a;font:12px monospace')
  window.hack = () => {
    unlock('console')
    return t('egg.consoleGranted', { title: t('secret.console.title') })
  }
}
