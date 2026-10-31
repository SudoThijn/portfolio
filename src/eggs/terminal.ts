import { computed, ref } from 'vue'
import { dateFormat } from '@/lib/env'
import { enterLeet, isLeet } from './modes'
import { SECRETS, found, resetSecrets, unlock } from './secrets'

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
  name?: string
  lines?: string[]
  locked?: boolean
  hint?: string
}

export const lines = ref<Line[]>([])

const FILES: Record<string, string[]> = {
  'about.txt': [
    'Thijn Douwma, 23. Frontend developer from Dronten, NL.',
    'Vue, React and browser extensions. 8+ years of code, 2.5 of them professional.',
    'Available from January 2027.',
  ],
  'quests.log': [
    '[ACTIVE]    2024 → Jan 2027',
    '  Frontend developer @ Conduction B.V.',
    '[ENDED]     2023 → 2024',
    '  HBO Software Engineering @ Windesheim',
    '[COMPLETED] 2020 → 2023',
    '  MBO 4 Software Development @ ROC van Flevoland',
  ],
  'contact.txt': [
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

function secretFiles(): File[] {
  return SECRETS.map((s, i) =>
    found.has(s.id)
      ? {
          name: `${s.title.toLowerCase().replace(/\s+/g, '-')}.txt`,
          lines: [`◆ ${s.title}`, s.text],
        }
      : { name: `classified-${i + 1}.locked`, locked: true, hint: s.hint },
  )
}

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
    if (parts.length === 1) {
      return { dir: true, entries: secretFiles().map((f) => f.name ?? ''), list: true }
    }
    return parts.length === 2 ? (secretFiles().find((f) => f.name === parts[1]) ?? null) : null
  }
  const file = parts.length === 1 ? FILES[parts[0] ?? ''] : undefined
  return file ? { lines: file } : null
}

const isFolder = (node: Folder | File): node is Folder => node.dir === true

/* ---------- Commands ---------- */

type Command = (args: string[]) => string[]

const COMMANDS: Record<string, Command> = {
  help: () => [
    'help             list commands',
    'whoami           who you are',
    'ls [dir]         list files',
    'cd <dir>         change folder',
    'pwd              where you are',
    'cat <file>       print a file',
    'secrets          achievements and hints',
    'secrets reset    forget found secrets',
    'hire             start the hire sequence',
    'date             time in Dronten',
    'clear            clear the screen',
    'exit             close the terminal',
  ],
  whoami: () => ['guest', 'The owner is Thijn Douwma. Try: cat about.txt'],
  ls: ([path = '.']) => {
    const node = lookup(resolvePath(path))
    if (!node) return [`ls: ${path}: no such file or folder`]
    if (!isFolder(node)) return [path]
    return node.list ? node.entries : [node.entries.join('  ')]
  },
  cd: ([path = '~']) => {
    if (path.startsWith('/')) return [`cd: ${path}: permission denied. Guests stay in ~`]
    const parts = resolvePath(path)
    const node = lookup(parts)
    if (!node) return [`cd: ${path}: no such folder`]
    if (!isFolder(node)) return [`cd: ${path}: not a folder`]
    cwd.value = parts
    return []
  },
  pwd: () => [`/home/guest${cwd.value.length ? `/${cwd.value.join('/')}` : ''}`],
  cat: ([path]) => {
    if (!path) return ['cat: missing file name. Try: ls']
    const node = lookup(resolvePath(path))
    if (!node) return [`cat: ${path}: no such file`]
    if (isFolder(node)) return [`cat: ${path}: is a folder. Try: cd ${path}`]
    if (node.locked) return [`cat: ${path}: permission denied`, `hint: ${node.hint}`]
    return node.lines ?? []
  },
  secrets: ([arg]) => {
    if (arg === 'reset') {
      resetSecrets()
      return ['Secrets reset. Happy hunting.']
    }
    return [
      `${found.size}/${SECRETS.length} found`,
      ...SECRETS.map((s) => (found.has(s.id) ? `[x] ${s.title}: ${s.text}` : `[ ] ???: ${s.hint}`)),
    ]
  },
  hire: () => [
    'Initiating hire sequence…',
    '[████████████████████] 100%',
    'Candidate ready. Send the offer to thijn.douwma@outlook.com',
    'Available from January 2027.',
  ],
  sudo: () => ['guest is not in the sudoers file. This incident will be reported.'],
  rm: () => ['rm: permission denied. Also, rude.'],
  1337: () => {
    if (isLeet()) return ['Already elite.']
    setTimeout(() => {
      closeTerminal()
      enterLeet()
    }, 700)
    return ['3l173 m0d3 3n6463d…']
  },
  save: () => {
    unlock('save')
    return ["Saving… don't turn off the power", 'Game saved.']
  },
  overdrive: () => ["Cheats don't work from in here. Try the classic one on the page itself."],
  date: () => [dateFormat.format(new Date())],
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
    print(`command not found: ${name}. Type help.`, 'err')
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

export function openTerminal() {
  if (!dialog || dialog.open) return
  if (!lines.value.length) {
    print('TD-OS v1.0 · root access granted (not really)', 'dim')
    print('Type help to list commands. Tab completes.', 'dim')
  }
  dialog.showModal()
  input?.focus()
  unlock('root')
}
