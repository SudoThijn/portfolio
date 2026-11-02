<div align="center">

<img src="docs/art/banner.svg" alt="Thijn Douwma, frontend developer. A cyberpunk HUD banner with the name in large type, a hexagon emblem and a scrolling ticker." width="100%">

<br>

<a href="https://thijn.douwma.me"><img src="docs/art/btn-live.svg" alt="Open thijn.douwma.me" height="48"></a>&nbsp;&nbsp;<a href="https://thijn.douwma.me/?lang=en"><img src="docs/art/btn-en.svg" alt="English" height="48"></a>&nbsp;&nbsp;<a href="https://thijn.douwma.me/?lang=nl"><img src="docs/art/btn-nl.svg" alt="Nederlands" height="48"></a>

<br>

[![Deploy](https://img.shields.io/github/actions/workflow/status/SudoThijn/portfolio/deploy.yml?branch=main&style=flat-square&label=deploy&labelColor=07060c&color=fcee0a)](https://github.com/SudoThijn/portfolio/actions/workflows/deploy.yml)

</div>

<br>

<h2><img src="docs/art/sec-01-briefing.svg" alt="SEC.01 Briefing" width="100%"></h2>

A CV that plays like a game. The profile is a character sheet, the skills are stat bars, the jobs and studies are a quest log, and the projects are builds. Around it sits a HUD with a live clock in Dronten, a scroll meter and a sound switch, over a dot field that reacts to the cursor.

It is built as a Vue 3 and TypeScript app with a single runtime dependency, and it is bilingual: English by default, Dutch one click away.

<h2><img src="docs/art/sec-02-loadout.svg" alt="SEC.02 Loadout" width="100%"></h2>

<img src="docs/art/loadout.svg" width="100%" alt="Loadout. HUD: a fixed bar with section tracking, a scroll meter and the time in Dronten. Dot field and reticle: a canvas field that reacts to the pointer, and a square cursor that locks onto the things you can click. Password lab: type a password and get its entropy, a rank and a crack time, all in the page, nothing sent anywhere. EN and NL: English by default, Dutch one click away, the choice is remembered, and ?lang=nl opens the page in Dutch. Sound: interface sounds and music through the Web Audio API, starting on the first interaction the browser accepts. Motion: animations and effects are cut back or skipped when the visitor prefers reduced motion. Secrets: seven of them are hidden in the page, and this README won't spoil them.">

<h2><img src="docs/art/sec-03-stack.svg" alt="SEC.03 Stack" width="100%"></h2>

<img src="docs/art/stack.svg" width="100%" alt="Stack. App: Vue 3, TypeScript 6, Vite 8. Runtime dependencies: just vue, with no router, no state library, no UI kit and no i18n library. Tests: Vitest, jsdom, Playwright. Quality: ESLint, oxlint, Prettier, vue-tsc. Shipping: GitHub Actions, GitHub Pages, a custom domain.">

<h2><img src="docs/art/sec-04-boot.svg" alt="SEC.04 Boot sequence" width="100%"></h2>

You need Node `^22.18` or `>=24.12`.

```sh
npm ci
npm run dev
```

| Command | What it does |
|---|---|
| `npm run dev` | Starts the dev server with hot reload. |
| `npm run build` | Type-checks, then builds into `dist/`. |
| `npm run preview` | Serves the production build. |
| `npm run test:unit` | Runs the Vitest unit tests. |
| `npm run test:e2e` | Runs the Playwright suite. |
| `npm run lint` | Runs oxlint and ESLint, with fixes. |
| `npm run format` | Runs Prettier over `src/`. |

The first Playwright run needs its browsers: `npx playwright install`.

By default the end-to-end suite runs against `design_example/`, the static reference design that the Vue app was rebuilt from. To test the Vue app itself, start the dev server and point the suite at it. A few specs, such as the language and age ones, only run this way.

```sh
npm run dev
E2E_URL=http://localhost:5173 npm run test:e2e
```

<h2><img src="docs/art/sec-05-map.svg" alt="SEC.05 Map" width="100%"></h2>

```text
src/
├─ components/    The page sections, the HUD and the language switch
│  └─ eggs/       Dialogs and overlays that belong to the secrets
├─ eggs/          The behaviour behind the secrets
├─ i18n/          The typed EN and NL dictionaries, and t()
├─ lib/           Dot field, reticle, sound engine, password analysis, age
├─ assets/        Stylesheet and audio
└─ __tests__/     Unit tests
e2e/              Playwright specs
design_example/   The static reference design
docs/art/         The SVG artwork in this README
scripts/          The generator for that artwork
.github/workflows Deploys to GitHub Pages
```

<h2><img src="docs/art/sec-06-languages.svg" alt="SEC.06 Languages" width="100%"></h2>

Every visitor-facing string lives in `src/i18n/en.ts`, which defines the keys. `src/i18n/nl.ts` is typed against it, so a missing Dutch string fails the type check. Components call `t('some.key')`, and `{name}` placeholders are filled from a second argument.

Some things stay English on purpose: the terminal's commands and file names (so Tab completion works in both languages), proper names, and the katakana. Adding a third language means adding it to `LOCALES`, writing its dictionary, and giving it a locale code for dates in `src/lib/env.ts`.

<h2><img src="docs/art/sec-07-deploy.svg" alt="SEC.07 Deploy" width="100%"></h2>

Every push to `main` builds the site in GitHub Actions and publishes it to GitHub Pages. The site lives at the root of `thijn.douwma.me`, which is a `CNAME` from `thijn` to `sudothijn.github.io`, so the build needs no base path.

<h2><img src="docs/art/sec-08-credits.svg" alt="SEC.08 Credits" width="100%"></h2>

The sounds come from [OpenGameArt](https://opengameart.org). They were converted to OGG, and some were trimmed or changed in volume. The same list is in the page, under the footer's *Sound credits*.

| Work | By | Used for | Licence |
|---|---|---|---|
| [Sci-Fi Pack Vol 1](https://opengameart.org/content/jc-sounds-sci-fi-pack-vol-1) | JC Sounds | Charge shot and the background hum | CC BY 4.0 |
| [SFX sampler](https://opengameart.org/content/packsmithy-sfx-sampler-30-synthesised-sound-effects-ui-retro-horror-sci-fi-glitch) | Packsmithy (packsmithy.com) | Level up | CC BY 4.0 |
| [Sci-Fi Sound Library](https://opengameart.org/content/sci-fi-sound-effects-library) | Little Robot Sound Factory (www.littlerobotsoundfactory.com) | 1337 mode | CC BY 3.0 |
| [UI Menu Open and Close](https://opengameart.org/content/ui-menu-open-and-close) | FiveBrosStopMosYT | Popups | CC BY 4.0 |
| [Hard Boss Battle 1](https://opengameart.org/content/hard-boss-battle-1) | | Overdrive music | CC0 |
| [Hi-Tech Button Sound Pack I](https://opengameart.org/content/hi-tech-button-sound-pack-i-non-themed) | Circlerun | Cursor lock-on | CC0 |
| [UI Sounds](https://opengameart.org/content/ui-sounds-0) | HaelDB | Achievement toast | CC0 |
| [Single Key Press Sounds](https://opengameart.org/content/single-key-press-sounds) | eklee, extracted by qubodup | Terminal keystrokes | CC BY 3.0 |

The fonts are Chakra Petch, JetBrains Mono, Tektur and Zen Kaku Gothic New, loaded from Google Fonts. The same four are drawn as outlines in the SVG artwork of this README.

<h2><img src="docs/art/sec-09-licence.svg" alt="SEC.09 Licence" width="100%"></h2>

There is no licence file yet, so the code is here to read, not to reuse. Ask first.

<br>

<img src="docs/art/footer.svg" alt="Built by hand in Dronten, no templates. Secrets 0 of 7." width="100%">

<div align="center">

[thijn.douwma.me](https://thijn.douwma.me) &nbsp;·&nbsp; [GitHub](https://github.com/SudoThijn) &nbsp;·&nbsp; [LinkedIn](https://www.linkedin.com/in/thijn-douwma/)

</div>
