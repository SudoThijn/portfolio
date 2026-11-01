import { computed, ref, watch } from 'vue'
import { list, locale, t } from '@/i18n'
import { currentAge, formatDate } from '@/lib/env'
import { enterLeet, isLeet } from './modes'
import { SECRETS, found, resetSecrets, secretField, unlock } from './secrets'

type LineKind = '' | 'in' | 'err' | 'dim'
interface Line {
  text: string
  kind: LineKind
}
interface Folder {
  dir: true
  entries: string[]
  list?: boolean
}
interface File {
  dir?: false
  lines?: string[]
  locked?: boolean
  hint?: string
}

export const lines = ref<Line[]>([])

// File names are the same in every language, so commands and Tab completion keep working.
// Each file is a function so only the one being read gets translated.
const FILES: Record<string, () => string[]> = {
  'about.txt': () => list('term.about', { age: currentAge() }),
  'quests.log': () => list('term.quests'),
  'contact.txt': () => [
    'email     thijn.douwma@outlook.com',
    'linkedin  linkedin.com/in/thijn-douwma',
    'github    github.com/SudoThijn',
  ],
}

let dialog: HTMLDialogElement | null = null
let input: HTMLInputElement | null = null

export function registerTerminal(dialogEl: HTMLDialogElement, inputEl: HTMLInputElement) {
  dialog = dialogEl
  input = inputEl
}

export const isTerminalOpen = () => !!dialog?.open
export const closeTerminal = () => dialog?.close()

function print(text: string, kind: LineKind = '') {
  lines.value.push({ text, kind })
}

/* ---------- A tiny file system: the home folder holds FILES plus a secrets/ folder ---------- */

const cwd = ref<string[]>([])
export const promptText = computed(
  () => `guest@td-os:${cwd.value.length ? `~/${cwd.value.join('/')}` : '~'}$`,
)

type Secret = (typeof SECRETS)[number]

// Listing the folder only needs the names, so a secret is translated when its file is opened.
const secretFileName = (s: Secret, i: number) =>
  found.has(s.id) ? `${s.file}.txt` : `classified-${i + 1}.locked`

const secretFile = (s: Secret): File =>
  found.has(s.id)
    ? { lines: [`◆ ${secretField(s.id, 'title')}`, secretField(s.id, 'text')] }
    : { locked: true, hint: secretField(s.id, 'hint') }

function resolvePath(path: string) {
  const parts = path.startsWith('~') ? [] : [...cwd.value]
  for (const segment of path.replace(/^~\/?/, '').split('/')) {
    if (!segment || segment === '.') continue
    if (segment === '..') parts.pop()
    else parts.push(segment)
  }
  return parts
}

function lookup(parts: string[]): Folder | File | null {
  if (!parts.length) return { dir: true, entries: [...Object.keys(FILES), 'secrets/'] }
  if (parts[0] === 'secrets') {
    if (parts.length === 1) return { dir: true, entries: SECRETS.map(secretFileName), list: true }
    const secret =
      parts.length === 2 ? SECRETS.find((s, i) => secretFileName(s, i) === parts[1]) : undefined
    return secret ? secretFile(secret) : null
  }
  const name = parts[0] ?? ''
  return parts.length === 1 && Object.hasOwn(FILES, name) ? { lines: FILES[name]?.() } : null
}

const isFolder = (node: Folder | File): node is Folder => node.dir === true

/* ---------- Commands ---------- */

type Command = (args: string[]) => string[]

const COMMANDS: Record<string, Command> = {
  help: () => list('term.help'),
  whoami: () => list('term.whoami'),
  ls: ([path = '.']) => {
    const node = lookup(resolvePath(path))
    if (!node) return [t('term.lsMissing', { path })]
    if (!isFolder(node)) return [path]
    return node.list ? node.entries : [node.entries.join('  ')]
  },
  cd: ([path = '~']) => {
    if (path.startsWith('/')) return [t('term.cdRoot', { path })]
    const parts = resolvePath(path)
    const node = lookup(parts)
    if (!node) return [t('term.cdMissing', { path })]
    if (!isFolder(node)) return [t('term.cdFile', { path })]
    cwd.value = parts
    return []
  },
  pwd: () => [`/home/guest${cwd.value.length ? `/${cwd.value.join('/')}` : ''}`],
  cat: ([path]) => {
    if (!path) return [t('term.catNoArg')]
    const node = lookup(resolvePath(path))
    if (!node) return [t('term.catMissing', { path })]
    if (isFolder(node)) return [t('term.catFolder', { path })]
    if (node.locked)
      return [t('term.catLocked', { path }), t('term.catHint', { hint: node.hint ?? '' })]
    return node.lines ?? []
  },
  secrets: ([arg]) => {
    if (arg === 'reset') {
      resetSecrets()
      return [t('term.secretsReset')]
    }
    return [
      t('term.secretsFound', { found: found.size, total: SECRETS.length }),
      ...SECRETS.map(({ id }) =>
        found.has(id)
          ? `[x] ${secretField(id, 'title')}: ${secretField(id, 'text')}`
          : `[ ] ???: ${secretField(id, 'hint')}`,
      ),
    ]
  },
  hire: () => list('term.hire'),
  sudo: () => [t('term.sudo')],
  rm: () => [t('term.rm')],
  1337: () => {
    if (isLeet()) return [t('term.alreadyLeet')]
    setTimeout(() => {
      closeTerminal()
      enterLeet()
    }, 700)
    return ['3l173 m0d3 3n6463d…']
  },
  save: () => {
    unlock('save')
    return [t('egg.saving'), t('egg.saved')]
  },
  overdrive: () => [t('term.overdrive')],
  date: () => [formatDate(new Date())],
  echo: (args) => [args.join(' ')],
  clear: () => {
    lines.value = []
    return []
  },
  exit: () => {
    closeTerminal()
    return []
  },
}

export function run(line: string) {
  print(`${promptText.value} ${line}`, 'in')
  const [name, ...args] = line.trim().split(/\s+/)
  if (!name) return
  const key = name.toLowerCase()
  const command = Object.hasOwn(COMMANDS, key) ? COMMANDS[key] : undefined
  if (!command) {
    print(t('term.notFound', { name }), 'err')
    return
  }
  command(args).forEach((text) => print(text))
}

/* ---------- Input: history and Tab completion ---------- */

const history: string[] = []
let historyPos = 0

export function submit(line: string) {
  if (line.trim()) history.push(line)
  historyPos = history.length
  run(line)
}

export function historyPrevious() {
  return historyPos > 0 ? (history[--historyPos] ?? '') : null
}

export function historyNext() {
  return historyPos < history.length ? (history[++historyPos] ?? '') : null
}

// Tab completes the word under the cursor: a command name first, a path after that.
// Several matches complete to their shared prefix, and list themselves when that adds nothing.
export function complete(value: string) {
  const words = value.split(' ')
  const current = words.pop() ?? ''
  let base = ''
  let options: string[]
  if (!words.length) {
    options = Object.keys(COMMANDS).map((name) => `${name} `)
  } else {
    base = current.slice(0, current.lastIndexOf('/') + 1)
    const folder = lookup(resolvePath(base || '.'))
    if (!folder || !isFolder(folder)) return value
    options = folder.entries.map((entry) => base + (entry.endsWith('/') ? entry : `${entry} `))
  }
  const matches = options.filter((option) => option.startsWith(current))
  const first = matches[0]
  if (!first) return value
  let shared = first
  for (const match of matches) while (!match.startsWith(shared)) shared = shared.slice(0, -1)
  if (shared.length > current.length) return [...words, shared].join(' ')
  if (matches.length > 1) {
    print(`${promptText.value} ${value}`, 'in')
    print(matches.map((match) => match.slice(base.length).trim()).join('  '))
  }
  return value
}

function printBanner() {
  print(t('term.banner'), 'dim')
  print(t('term.bannerHelp'), 'dim')
}

// Printed lines keep the language they were written in, so a language change starts a fresh screen.
watch(locale, () => {
  if (!lines.value.length) return
  lines.value = []
  printBanner()
})

export function openTerminal() {
  if (!dialog || dialog.open) return
  if (!lines.value.length) printBanner()
  dialog.showModal()
  input?.focus()
  unlock('root')
}
