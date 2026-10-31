# Portfolio roadmap

The design phase is done: a working single-page design (`index.html`, `style.css`, `main.js`, `eggs.js`) with two layers of easter eggs. This file lists the next phase, planned for a later date, so it can be picked up without re-deriving anything.

## Where things stand (2026-10-30)

- Base design: cyberpunk/anime HUD look, CV mapped to game metaphors (character sheet, stat bars, perks, quest log), cursor-reactive dot field, target-lock reticle, password lab demo.
- Easter eggs, 7 secrets with achievement toasts, a "Secrets n/7" HUD counter and a level-up splash at 7/7:
  - Layer 1: Konami code → OVERDRIVE, typing `sudo` → terminal (with `cd`, Tab completion, history), reticle charge shot, DevTools console `hack()`.
  - Layer 2: LEET mode (13:37, five clicks on the clock, or `1337` in the terminal), Ctrl+S save point, tab-away title and icon.
- Egg ideas not picked so far: idle standby screen, password-lab secret replies, gacha pull on the emblem, speedrun timer.
- Visual work is verified with the `my-frontend-design` skill's `scripts/shoot.mjs`. The per-egg Playwright scripts from the design sessions lived in a temporary scratchpad and are gone, so they need rebuilding as a proper test suite (see step 1).

## 1. Turn the design into an actual portfolio app

Decisions to make first:

- Stack: keep plain HTML/CSS/JS, or rebuild in Vue (with Vite). Vue would double as a showcase of the main skill on the CV; plain files keep it simple and fast.
- Hosting and domain: GitHub Pages, Netlify or Vercel, and whether to buy a domain.
- Repository: publish the source under github.com/SudoThijn, which also adds a real project to a GitHub profile that currently has one public repo.

Work items:

- Project structure, build and deploy pipeline.
- Automated Playwright tests for the eggs and the screenshot pass, so later changes can't silently break them.
- SEO and sharing: page description, Open Graph image and tags, favicon set.
- Accessibility pass: keyboard paths, screen-reader labels, focus handling in the terminal and dialogs, contrast in all three palettes (normal, OVERDRIVE, LEET).
- Performance pass: font loading, canvas cost on low-end phones.

## 2. Language switching (EN/NL)

- A language toggle in the HUD. Default from the browser language, remember the choice, and set `<html lang>`.
- Every visitor-facing string needs both languages, including the egg texts: toasts, hints, terminal replies and files, save box, away titles, level-up splash and the console greeting.
- Check that LEET mode still reads as leetspeak on Dutch text, and that the terminal's Tab completion and commands keep working.
- The katakana stay as they are in both languages.
- If the site gets a URL per language (for example `/nl/`), add `hreflang` links.

## 3. Revisit the content for accuracy

Claude wrote some of the copy, so all of it needs a read, starting with:

- Bio wording. The Keepiq description in Builds is now taken from the extension README, with the role "Lead frontend developer" and status "Work in progress". The hero, quest log and Browser extensions stat say the same.
- Stat hover texts ("Eight-plus years of it…", "Production interfaces at Conduction…", "The basics from MBO: PHP and databases").
- How the HBO year is framed in the quest log ("Found out that I do my best work by building, not by studying theory").
- Footer line "Hand-built in Dronten, no templates".
- Egg copy: the level-up line, terminal replies and `about.txt`, toast titles and texts, hints, save box text, away titles and the console message.

Facts to confirm or decide:

- "8+ years" of coding, 2.5 professional, and "available from January 2027".
- LV.23 is the current age. It could be calculated from the birth date, so it ticks up to LV.24 on 7 October 2027 by itself.
- Dronten coordinates in the hero (52.52°N 5.72°E).
- A photo, or an avatar replacing the TD emblem.
- Builds shows the Keepiq extension plus the SudoThijn profile card, and that is deliberate: repos from the RalkeyOfficial account stay off the site so the two identities are not linked. More projects can come once they live under SudoThijn.
- Phone number and birth date stay off the public site unless decided otherwise.

## 4. Sound effects

The hardest part, because the right sounds are hard to find. Ground rules:

- Sound is off by default, with a mute/unmute toggle in the HUD. Browsers only allow audio after a visitor interaction anyway. Remember the choice.
- Keep sounds short and quiet, and never loop.

Where sounds can come from:

- Synthesised in the browser with the Web Audio API, sfxr/jsfxr style. No licensing, tiny, and easy to tweak towards the retro-arcade feel.
- CC0 sound packs, such as Kenney's UI and sci-fi audio packs or CC0 sounds on Freesound. Check every licence; avoid anything that needs attribution unless it gets credited.

Suggested approach: build a small "sound board" page that plays candidate sounds for every event side by side, pick them together, then wire up the winners.

Events that need a sound:

- UI: hover tick on lockable elements, click, copy confirmation.
- Achievement toast chime, and the level-up fanfare.
- OVERDRIVE: cut-in whoosh plus a heavy hit, and a power-down when exiting.
- LEET: glitch or modem burst on entry.
- Terminal: open/close, keystrokes, error buzz.
- Charge shot: rising charge tone, release blast.
- Save point jingle, and the reconnect blip after a tab-away.

## 5. Easter egg hints

Not every egg is obvious, and right now the only hints are behind other secrets: `secrets` and the `.locked` files in the terminal, which itself has to be found first. The "Secrets n/7" counter also stays hidden until the first find, so most visitors never learn there is anything to look for. Hints inside the page itself would help.

Ideas to choose from:

- Show the secrets counter from the start ("Secrets 0/7"), with the unfound hints on hover or click.
- A small, skippable hint line somewhere on the page, such as the footer or the tickers ("Some things here only respond to the right input").
- Progressive hints: after a visitor has spent a while on the page, nudge them towards one unfound secret at a time.
- Make the existing entry points more visible, such as the "ID//SudoThijn" button and the clickable HUD clock.

The balance to find: obvious enough that recruiters discover at least one egg, hidden enough that finding them still feels like a reward.

## Open questions

- Vue rebuild or plain files?
- Hosting and domain?
- Which language should be the default for visitors whose browser is neither Dutch nor English?
- Photo or avatar?
- How obvious should the egg hints be?
