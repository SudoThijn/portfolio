import { reactive, ref } from 'vue'
import { minuteFormat } from '@/lib/env'
import { found, unlock } from './secrets'

// The box stores the numbers of the save, and its text is built when it is drawn, in the active language.
interface SaveBox {
  key: number
  saved: boolean
  time: string
  found: number
  out: boolean
}

export const saveBox = ref<SaveBox | null>(null)

let boxKey = 0

export function savePoint() {
  const box = reactive<SaveBox>({ key: boxKey++, saved: false, time: '', found: 0, out: false })
  saveBox.value = box
  setTimeout(() => {
    unlock('save')
    box.time = minuteFormat.format(new Date())
    box.found = found.size
    box.saved = true
  }, 1000)
  setTimeout(() => {
    box.out = true
  }, 2800)
  setTimeout(() => {
    if (saveBox.value === box) saveBox.value = null
  }, 3200)
}
