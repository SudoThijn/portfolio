<script setup lang="ts">
import { nextTick, onMounted, ref, useTemplateRef, watch } from 'vue'
import {
  closeTerminal,
  complete,
  historyNext,
  historyPrevious,
  lines,
  promptText,
  registerTerminal,
  submit,
} from '@/eggs/terminal'
import { finePointer } from '@/lib/env'
import { playKey } from '@/lib/sound'

const dialog = useTemplateRef<HTMLDialogElement>('dialog')
const input = useTemplateRef<HTMLInputElement>('input')
const log = useTemplateRef<HTMLElement>('log')
const command = ref('')

onMounted(() => {
  if (dialog.value && input.value) registerTerminal(dialog.value, input.value)
})

watch(
  lines,
  async () => {
    await nextTick()
    if (log.value) log.value.scrollTop = log.value.scrollHeight
  },
  { deep: true },
)

function onSubmit() {
  const line = command.value
  command.value = ''
  submit(line)
}

function onKeydown(e: KeyboardEvent) {
  const typing = (e.key.length === 1 && !e.ctrlKey && !e.metaKey) || e.key === 'Backspace'
  if (typing) void playKey()
  if (e.key === 'ArrowUp') {
    const previous = historyPrevious()
    if (previous === null) return
    command.value = previous
  } else if (e.key === 'ArrowDown') {
    const next = historyNext()
    if (next === null) return
    command.value = next
  } else if (e.key === 'Tab' && !e.shiftKey) {
    command.value = complete(command.value)
  } else {
    return
  }
  e.preventDefault()
}
</script>

<template>
  <dialog class="term" ref="dialog" aria-label="Terminal" @click.self="input?.focus()">
    <div class="term__bar">
      <span>td-os // terminal</span>
      <button class="term__close" type="button" @click="closeTerminal">
        {{ finePointer ? 'Esc · close' : 'Close' }}
      </button>
    </div>
    <div class="term__log" id="term-log" ref="log">
      <div v-for="(line, i) in lines" :key="i" :class="line.kind">{{ line.text }}</div>
    </div>
    <form class="term__form" method="dialog" @submit.prevent="onSubmit">
      <label class="term__prompt" for="term-input">{{ promptText }}</label>
      <input
        class="term__input"
        id="term-input"
        ref="input"
        v-model="command"
        type="text"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        @keydown="onKeydown"
      />
    </form>
  </dialog>
</template>
