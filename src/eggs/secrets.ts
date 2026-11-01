import { computed, reactive, ref } from 'vue'
import { t } from '@/i18n'
import { playToast } from '@/lib/sound'

// The texts live in the language files. `file` is the stable terminal file name in every language.
export const SECRETS = [
  { id: 'overdrive', file: 'limit-break' },
  { id: 'root', file: 'root-access' },
  { id: 'charge', file: 'full-charge' },
  { id: 'console', file: 'source-diver' },
  { id: 'leet', file: 'elite' },
  { id: 'save', file: 'save-point' },
  { id: 'signal', file: 'signal-restored' },
] as const

export type SecretId = (typeof SECRETS)[number]['id']

// One field at a time, so only the text that is shown gets translated.
export const secretField = (id: SecretId, field: 'title' | 'text' | 'hint') =>
  t(`secret.${id}.${field}`)

interface Toast {
  key: number
  id: SecretId
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

function showToast(id: SecretId) {
  const toast = reactive<Toast>({ key: toastKey++, id, count: found.size, out: false })
  toasts.value.push(toast)
  void playToast()
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
  showToast(id)
  if (found.size === SECRETS.length) setTimeout(() => (levelUpOpen.value = true), 1400)
}

export function resetSecrets() {
  found.clear()
  writeStore()
}
