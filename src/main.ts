import { createApp } from 'vue'
import App from './App.vue'
import './assets/style.css'
import { initEggs } from './eggs'
import { trackPointer } from './lib/env'
import { initReveal } from './lib/reveal'

document.documentElement.classList.add('js')
trackPointer()

createApp(App).mount('#app')

// These look up elements by selector, so they run once the app has rendered.
initReveal()
initEggs()
