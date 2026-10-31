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

- Sound is on by default (decided 2026-10-31), with a mute/unmute toggle in the HUD. Browsers only allow audio after a visitor interaction, so it starts on the first click, tap or key press, and the toggle shows animated bars only once audio is really playing. The choice is remembered.
- Effects stay short and quiet. Music loops are wanted for the background, OVERDRIVE (meltdown) and LEET, and they only play while sound is on.
- Anything under CC-BY is allowed as long as it is credited, for example in a credits popup from the footer. Keep a credit line per file.

Built (2026-10-31): `src/lib/sound.ts` is a Web Audio engine that is only created, fetched and decoded after sound is switched on. The HUD has a "Sound: on/off" toggle, left of the secrets counter (on by default, saved in `td-sound`, and it starts on the first gesture of a visit). Wired so far: the quiet hum (18%), the Hard Boss Battle 1 song while OVERDRIVE is active, the charge shot (starts with the ring, fires on a full release, fizzles out on an early one), Warp Drive when LEET starts, "Arcade bonus" on the level up, and the Menu open/close sounds for the credits popup. The footer "Sound credits" button opens that popup, which CC-BY requires. Levels are constants at the top of `sound.ts`. Tested only in Chromium; Safari's support for OGG Vorbis was not checked, so check it before launch. `e2e/sound.spec.ts` records every buffer the page starts and asserts which sound plays for each event.

Decisions so far (2026-10-31):

- Taken: "Friendly Talk On A Robotic Battlefield (looped)" from OpenGameArt, CC0, as music.
- Rejected: Kenney's Sci-Fi Sounds and Interface Sounds. They sound too 8-bit for the theme and many of them are horror-game material. `explosionCrunch_000` (charge shot release) and `spaceEngine_000` (meltdown) were only kept as references for what those slots should feel like; better replacements are wanted.
- Locked in, charge shot: JC Sounds Sci-Fi Pack Vol 1 (CC-BY 4.0, credit "JC Sounds"). While the visitor holds, play "Energy BuildUp to LOOP Short Start" and schedule "Energy BuildUp LOOP" to begin exactly when it ends, on the Web Audio clock (an `onended` handoff leaves a gap). On release, start "Heavy Plasma Shot 02" immediately and fade the charge out over 0.5 s underneath it.
- Rejected: the sounds Claude synthesised in the browser (charge sweep, power down, chime, tick, glitch, boom). Do not synthesise replacements unless asked.
- Rejected: slowing Synthetic Whisper down with ffmpeg's rubberband filter ("awful"). Use the original.
- Music shortlist: Friendly Talk (CC0), Synthetic Whisper (CC-BY 4.0, DavidKBD; the file ends in 0.43 s of silence, so it leaves a gap when looped), Orbital Colossus (Space Boss Battle Theme, Matthew Pablo, CC-BY 3.0, credit "Music by Matthew Pablo www.matthewpablo.com"; does not loop as released) and Hard Boss Battle 1 (CC0). Which one goes where (background, OVERDRIVE, LEET) is still open.
- Locked in, level up: "Arcade Bonus" from the Packsmithy sampler (CC-BY 4.0, credit "Packsmithy (packsmithy.com)").
- Locked in, OVERDRIVE: "Hard Boss Battle 1" (CC0, 80 s, loops cleanly) plays as the full song for as long as OVERDRIVE lasts. There is no separate entry or exit sound. The horror hits and stingers tried for an entry were rejected: they lack intensity and do not fit the cyberpunk vibe. "Jumpscare" in the brief meant intense cyberpunk music, not horror.
- Locked in, under-layer: "Futuristic Machine Hum" (JC pack, CC-BY 4.0, credit "JC Sounds", loops seamlessly) at 18% volume. An under-layer is a very quiet looping room tone that sits below everything else.
- Leaning towards, LEET entry: "WarpDrive" from the Little Robot Sound Factory Sci-Fi Sound Library (CC-BY 3.0, credit "Little Robot Sound Factory, www.littlerobotsoundfactory.com"). Three variants exist (00 is 4.4 s, 01 is 7.3 s, 02 is 4.1 s), and 00 and 01 start with 0.13 to 0.24 s of silence to trim.
- Parked: "Menu open 1" and "Menu close 1" (UI Menu Open and Close, FiveBrosStopMosYT, CC-BY 4.0) for popups. There are none yet, and the footer credits popup would be the first.
- Not liked: the Achievement jingle, Victory and the synth win jingles. The pack names are not descriptive, so audition by ear.
- Level matching is needed when wiring: Friendly Talk is much louder than Hard Boss Battle 1 (RMS 0.50 against 0.28), and Friendly Talk's loop wrap is a slightly bigger jump than its normal steps.
- Still open: which of Friendly Talk, Synthetic Whisper and Orbital Colossus is the background music and which (if any) is for LEET, and all UI, toast and terminal sounds. Nothing heard so far was liked for the UI sounds.
- OVERDRIVE has no timer and lasts until the visitor exits, so its music has to loop or end gracefully. LEET lasts 13.37 s, so it only needs a cue of that length.

Where sounds can come from:

- Synthesised in the browser with the Web Audio API. No licensing, tiny, and the length can follow the visitor, which suits the charge shot.
- CC0 or CC-BY sound from OpenGameArt, whose pages can be downloaded with `curl` (the Freesound downloads need a login). Check every licence on its own page.

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
