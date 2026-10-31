import { reactive, ref } from 'vue'
import { minuteFormat } from '@/lib/env'
import { SECRETS, found, unlock } from './secrets'

interface SaveBox {
  key: number
  saved: boolean
  meta: string
  out: boolean
}

export const saveBox = ref<SaveBox | null>(null)

let boxKey = 0

export function savePoint() {
  const box = reactive<SaveBox>({ key: boxKey++, saved: false, meta: '', out: false })
  saveBox.value = box
  setTimeout(() => {
    unlock('save')
    box.saved = true
    box.meta = `Secrets ${found.size}/${SECRETS.length} · ${minuteFormat.format(new Date())} Dronten`
  }, 1000)
  setTimeout(() => {
    box.out = true
  }, 2800)
  setTimeout(() => {
    if (saveBox.value === box) saveBox.value = null
  }, 3200)
}
