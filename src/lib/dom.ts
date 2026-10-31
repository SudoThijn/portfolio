export const dialogOpen = () => !!document.querySelector('dialog[open]')

export const isTyping = (target: EventTarget | null) =>
  target instanceof Element && !!target.closest('input, textarea, select, [contenteditable="true"]')
