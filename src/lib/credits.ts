import { ref } from 'vue'

export const creditsOpen = ref(false)

const CC_BY_4 = { licence: 'CC BY 4.0', licenceUrl: 'https://creativecommons.org/licenses/by/4.0/' }
const CC_BY_3 = { licence: 'CC BY 3.0', licenceUrl: 'https://creativecommons.org/licenses/by/3.0/' }
const CC0 = { licence: 'CC0', licenceUrl: 'https://creativecommons.org/publicdomain/zero/1.0/' }

export const CREDITS = [
  {
    work: 'Sci-Fi Pack Vol 1',
    by: 'JC Sounds',
    use: 'Charge shot and the background hum',
    url: 'https://opengameart.org/content/jc-sounds-sci-fi-pack-vol-1',
    ...CC_BY_4,
  },
  {
    work: 'SFX sampler',
    by: 'Packsmithy (packsmithy.com)',
    use: 'Level up',
    url: 'https://opengameart.org/content/packsmithy-sfx-sampler-30-synthesised-sound-effects-ui-retro-horror-sci-fi-glitch',
    ...CC_BY_4,
  },
  {
    work: 'Sci-Fi Sound Library',
    by: 'Little Robot Sound Factory (www.littlerobotsoundfactory.com)',
    use: '1337 mode',
    url: 'https://opengameart.org/content/sci-fi-sound-effects-library',
    ...CC_BY_3,
  },
  {
    work: 'UI Menu Open and Close',
    by: 'FiveBrosStopMosYT',
    use: 'Popups',
    url: 'https://opengameart.org/content/ui-menu-open-and-close',
    ...CC_BY_4,
  },
  {
    work: 'Hard Boss Battle 1',
    use: 'Overdrive music',
    url: 'https://opengameart.org/content/hard-boss-battle-1',
    ...CC0,
  },
  {
    work: 'Hi-Tech Button Sound Pack I',
    by: 'Circlerun',
    use: 'Cursor lock-on',
    url: 'https://opengameart.org/content/hi-tech-button-sound-pack-i-non-themed',
    ...CC0,
  },
  {
    work: 'UI Sounds',
    by: 'HaelDB',
    use: 'Achievement toast',
    url: 'https://opengameart.org/content/ui-sounds-0',
    ...CC0,
  },
  {
    work: 'Single Key Press Sounds',
    by: 'eklee, extracted by qubodup',
    use: 'Terminal keystrokes',
    url: 'https://opengameart.org/content/single-key-press-sounds',
    ...CC_BY_3,
  },
] as const
