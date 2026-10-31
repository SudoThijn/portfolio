import { computed, reactive, ref } from 'vue'

export const SECRETS = [
  {
    id: 'overdrive',
    title: 'Limit break',
    text: 'Entered the Konami code',
    hint: 'An old cheat code still works here. ↑ ↑ ↓ ↓ …',
  },
  {
    id: 'root',
    title: 'Root access',
    text: 'Opened the hidden terminal',
    hint: 'You are looking at it.',
  },
  {
    id: 'charge',
    title: 'Full charge',
    text: 'Fired a charged shot',
    hint: 'Hold your fire on an empty spot, then let go.',
  },
  {
    id: 'console',
    title: 'Source diver',
    text: 'Ran a command from the dev console',
    hint: 'Some messages only show up for developers.',
  },
  {
    id: 'leet',
    title: 'Elite',
    text: 'Went 1337 for 13.37 seconds',
    hint: 'Some minutes are more elite than others. Impatient? Poke the clock five times, or type 1337 in here.',
  },
  {
    id: 'save',
    title: 'Save point',
    text: 'Saved the game',
    hint: 'Old habits: save often. Ctrl+S, or type save in here.',
  },
  {
    id: 'signal',
    title: 'Signal restored',
    text: 'Wandered off and came back',
    hint: 'Visit another tab for a moment, then come back.',
  },
] as const

export type SecretId = (typeof SECRETS)[number]['id']

interface Toast {
  key: number
  secret: (typeof SECRETS)[number]
  count: number
  out: boolean
}

const STORE_KEY = 'td-secrets'
const isSecretId = (value: unknown): value is SecretId => SECRETS.some((s) => s.id === value)

function readStore(): SecretId[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(STORE_KEY) ?? 'null')
    return Array.isArray(stored) ? stored.filter(isSecretId) : []
  } catch {
    return []
  }
}

function writeStore() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify([...found]))
  } catch {
    // Storage can be unavailable, in which case secrets only last for this visit.
  }
}

export const found = reactive(new Set<SecretId>(readStore()))
export const toasts = ref<Toast[]>([])
export const levelUpOpen = ref(false)
export const foundCount = computed(() => found.size)

let toastKey = 0

function showToast(secret: (typeof SECRETS)[number]) {
  const toast = reactive<Toast>({ key: toastKey++, secret, count: found.size, out: false })
  toasts.value.push(toast)
  setTimeout(() => {
    toast.out = true
  }, 4200)
  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t !== toast)
  }, 4800)
}

export function unlock(id: SecretId) {
  if (found.has(id)) return
  found.add(id)
  writeStore()
  const secret = SECRETS.find((s) => s.id === id)
  if (secret) showToast(secret)
  if (found.size === SECRETS.length) setTimeout(() => (levelUpOpen.value = true), 1400)
}

export function resetSecrets() {
  found.clear()
  writeStore()
}
