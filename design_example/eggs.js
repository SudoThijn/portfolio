(() => {
  const td = window.__td;
  if (!td) return;
  const root = document.documentElement;
  const { reduceMotion, finePointer } = td;
  // Only mention the Esc key where there is likely a keyboard.
  const escHint = finePointer ? ' · Esc' : '';

  const make = (tag, className, html = '') => {
    const el = document.createElement(tag);
    el.className = className;
    el.innerHTML = html;
    return el;
  };
  const isTyping = (el) => el.closest?.('input, textarea, select, [contenteditable="true"]');
  const dialogOpen = () => !!document.querySelector('dialog[open]');

  /* ---------- Secrets: achievements, toasts and the level-up payoff ---------- */

  const SECRETS = [
    { id: 'overdrive', title: 'Limit break', text: 'Entered the Konami code', hint: 'An old cheat code still works here. ↑ ↑ ↓ ↓ …' },
    { id: 'root', title: 'Root access', text: 'Opened the hidden terminal', hint: 'You are looking at it.' },
    { id: 'charge', title: 'Full charge', text: 'Fired a charged shot', hint: 'Hold your fire on an empty spot, then let go.' },
    { id: 'console', title: 'Source diver', text: 'Ran a command from the dev console', hint: 'Some messages only show up for developers.' },
    { id: 'leet', title: 'Elite', text: 'Went 1337 for 13.37 seconds', hint: 'Some minutes are more elite than others. Impatient? Poke the clock five times, or type 1337 in here.' },
    { id: 'save', title: 'Save point', text: 'Saved the game', hint: 'Old habits: save often. Ctrl+S, or type save in here.' },
    { id: 'signal', title: 'Signal restored', text: 'Wandered off and came back', hint: 'Visit another tab for a moment, then come back.' },
  ];
  const STORE_KEY = 'td-secrets';
  const found = new Set(readStore());

  function readStore() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY)) || [];
    } catch {
      return [];
    }
  }
  function writeStore() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify([...found]));
    } catch {}
  }

  const chip = make('span', 'hud__secrets', '◆ Secrets <b></b>');
  document.querySelector('.hud__meta')?.prepend(chip);
  function renderChip() {
    chip.hidden = found.size === 0;
    chip.querySelector('b').textContent = `${found.size}/${SECRETS.length}`;
  }
  renderChip();

  const toasts = make('div', 'toasts');
  toasts.setAttribute('role', 'status');
  toasts.setAttribute('aria-live', 'polite');
  document.body.append(toasts);

  function toast(secret) {
    const t = make('div', 'toast', `
      <span class="toast__kicker">◆ Achievement unlocked</span>
      <span class="toast__title">${secret.title}</span>
      <span class="toast__text">${secret.text}</span>
      <span class="toast__count">${found.size}/${SECRETS.length}</span>`);
    toasts.append(t);
    setTimeout(() => t.classList.add('is-out'), 4200);
    setTimeout(() => t.remove(), 4800);
  }

  function unlock(id) {
    if (found.has(id)) return;
    found.add(id);
    writeStore();
    renderChip();
    toast(SECRETS.find((s) => s.id === id));
    if (found.size === SECRETS.length) setTimeout(levelUp, 1400);
  }

  function levelUp() {
    const dialog = make('dialog', 'levelup', `
      <div class="levelup__lines" aria-hidden="true"></div>
      <div class="levelup__card">
        <p class="levelup__kicker">◆ All secrets found ${SECRETS.length}/${SECRETS.length}</p>
        <h2 class="levelup__title" id="levelup-title">Level up!</h2>
        <p class="levelup__text">You kept digging until you found everything hidden here. That's how I work too.</p>
        <div class="levelup__actions">
          <a class="btn btn--primary" href="#contact"><span>Get in touch</span></a>
          <button class="btn btn--ghost" type="button"><span>Close</span></button>
        </div>
      </div>`);
    dialog.setAttribute('aria-labelledby', 'levelup-title');
    document.body.append(dialog);
    dialog.querySelectorAll('a, button').forEach((el) => el.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('click', (e) => e.target === dialog && dialog.close());
    dialog.addEventListener('close', () => dialog.remove());
    dialog.showModal();
  }

  /* ---------- Konami code: OVERDRIVE ---------- */

  const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
  let konamiPos = 0;

  function feedKonami(key) {
    if (key === KONAMI[konamiPos]) konamiPos++;
    // A third "up" keeps the sequence alive instead of resetting it.
    else konamiPos = key === 'arrowup' ? (konamiPos === 2 ? 2 : 1) : 0;
    if (konamiPos === KONAMI.length) {
      konamiPos = 0;
      enterOverdrive();
    }
  }

  // On touch screens the code is swipes for the arrows, then two taps for B and A.
  let touchStart = null;
  addEventListener('touchstart', (e) => {
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });
  addEventListener('touchend', (e) => {
    if (!touchStart) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 12) feedKonami(konamiPos >= 8 ? KONAMI[konamiPos] : 'tap');
    else if (Math.abs(dx) > Math.abs(dy)) feedKonami(dx > 0 ? 'arrowright' : 'arrowleft');
    else feedKonami(dy > 0 ? 'arrowdown' : 'arrowup');
  }, { passive: true });

  const cutin = make('div', 'cutin', `
    <div class="cutin__flash"></div>
    <div class="cutin__band">
      <div class="cutin__lines"></div>
      <div class="cutin__content">
        <span class="cutin__kana">オーバードライブ</span>
        <span class="cutin__title">Overdrive</span>
        <span class="cutin__sub">Limit break // all stats maxed</span>
      </div>
    </div>`);
  cutin.setAttribute('aria-hidden', 'true');
  document.body.append(cutin);

  const exitButton = make('button', 'btn btn--small btn--primary od-exit', `<span>Exit overdrive${escHint}</span>`);
  exitButton.type = 'button';
  exitButton.hidden = true;
  exitButton.addEventListener('click', () => setOverdrive(false));
  document.body.append(exitButton);

  const levelLabel = document.querySelector('.hero__tags .block--magenta > span');
  const statusLabel = document.querySelector('.status__text');
  const originals = { level: levelLabel?.textContent, status: statusLabel?.textContent };
  let overdrive = false;

  function setOverdrive(on) {
    overdrive = on;
    root.classList.toggle('overdrive', on);
    td.field.setMode(on ? 'overdrive' : 'normal');
    exitButton.hidden = !on;
    if (statusLabel) statusLabel.textContent = on ? `Overdrive active${finePointer ? ' · Esc to exit' : ''}` : originals.status;
    if (levelLabel) {
      levelLabel.textContent = on ? 'LV.99' : originals.level;
      delete levelLabel.dataset.text;
      td.scramble(levelLabel, 700);
    }
  }

  function enterOverdrive() {
    if (overdrive) return;
    if (leet) exitLeet();
    if (reduceMotion) {
      setOverdrive(true);
      unlock('overdrive');
      return;
    }
    cutin.classList.remove('is-playing');
    void cutin.offsetWidth;
    cutin.classList.add('is-playing');
    root.classList.add('od-shake');
    // The palette swaps while the band covers the screen, so the change lands as a reveal.
    setTimeout(() => setOverdrive(true), 520);
    setTimeout(() => root.classList.remove('od-shake'), 650);
    setTimeout(() => {
      cutin.classList.remove('is-playing');
      unlock('overdrive');
    }, 1900);
  }

  /* ---------- LEET mode: 13:37 in Dronten, five clicks on the clock, or "1337" in the terminal ---------- */

  const LEET_MAP = { a: '4', e: '3', i: '1', o: '0', t: '7', s: '5', g: '6', b: '8', r: '2' };
  const LEET_MS = 13370;
  const LEET_ROOTS = '.hud__nav, .hud__place, main, .footer';
  const LEET_SWEEP_MS = 700;
  const toLeet = (text) => text.replace(/[aeiotsgbr]/gi, (c) => LEET_MAP[c.toLowerCase()]);
  const nameLines = [...document.querySelectorAll('[data-scramble]')];
  let leet = false;
  let leetNodes = [];
  let leetTimer = 0;
  // Pending sweep steps, and the values an unfinished exit sweep still has to put back.
  let sweepTimers = [];
  let restoreList = [];

  function textNodes() {
    const nodes = [];
    for (const root of document.querySelectorAll(LEET_ROOTS)) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => (!node.nodeValue.trim() || node.parentElement.closest('[data-scramble], script, style')
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT),
      });
      while (walker.nextNode()) nodes.push(walker.currentNode);
    }
    return nodes;
  }

  // Applies each change with a delay based on its height on screen, so it reads as a scan wave moving down.
  function sweep(entries) {
    for (const [node, value] of entries) {
      const top = node.parentElement?.getBoundingClientRect().top ?? 0;
      const delay = reduceMotion ? 0 : Math.max(0, Math.min(1, top / innerHeight)) * LEET_SWEEP_MS;
      if (delay === 0) node.nodeValue = value;
      else sweepTimers.push(setTimeout(() => { node.nodeValue = value; }, delay));
    }
  }

  function flushSweep() {
    sweepTimers.forEach(clearTimeout);
    sweepTimers = [];
    for (const [node, value] of restoreList) node.nodeValue = value;
    restoreList = [];
  }

  function enterLeet() {
    if (leet) return;
    if (overdrive) setOverdrive(false);
    flushSweep();
    leet = true;
    leetNodes = textNodes().map((node) => [node, node.nodeValue]);
    sweep(leetNodes.map(([node, value]) => [node, toLeet(value)]));
    nameLines.forEach((el, i) => {
      el.dataset.original ??= el.dataset.text ?? el.textContent;
      el.dataset.text = toLeet(el.dataset.original);
      td.scramble(el, 500 + i * 150);
    });
    root.classList.add('leet');
    if (!reduceMotion) {
      root.classList.add('leet-glitch');
      setTimeout(() => root.classList.remove('leet-glitch'), 500);
    }
    td.field.setMode('leet');
    unlock('leet');
    leetTimer = setTimeout(exitLeet, LEET_MS);
  }

  function exitLeet() {
    if (!leet) return;
    leet = false;
    clearTimeout(leetTimer);
    sweepTimers.forEach(clearTimeout);
    sweepTimers = [];
    restoreList = leetNodes;
    leetNodes = [];
    sweep(restoreList);
    sweepTimers.push(setTimeout(flushSweep, LEET_SWEEP_MS + 50));
    nameLines.forEach((el, i) => {
      el.dataset.text = el.dataset.original;
      td.scramble(el, 500 + i * 150);
    });
    root.classList.remove('leet');
    td.field.setMode('normal');
  }

  let clockClicks = [];
  document.getElementById('clock')?.addEventListener('click', () => {
    const now = Date.now();
    clockClicks = clockClicks.filter((t) => now - t < 2000).concat(now);
    if (clockClicks.length >= 5) {
      clockClicks = [];
      enterLeet();
    }
  });

  const minuteFormat = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', hour: '2-digit', minute: '2-digit' });
  let leetMinuteFired = false;
  setInterval(() => {
    const isLeetMinute = minuteFormat.format(new Date()) === '13:37';
    if (isLeetMinute && !leetMinuteFired) enterLeet();
    leetMinuteFired = isLeetMinute;
  }, 1000);

  /* ---------- Save point: Ctrl+S / Cmd+S ---------- */

  let saveBox = null;
  function savePoint() {
    saveBox?.remove();
    const box = make('div', 'savepoint', `
      <span class="savepoint__crystal" aria-hidden="true"></span>
      <span class="savepoint__body">
        <span class="savepoint__text">Saving… don't turn off the power</span>
        <span class="savepoint__meta"></span>
      </span>`);
    box.setAttribute('role', 'status');
    document.body.append(box);
    saveBox = box;
    setTimeout(() => {
      unlock('save');
      box.querySelector('.savepoint__text').innerHTML = '<b>Game saved.</b>';
      box.querySelector('.savepoint__meta').textContent = `Secrets ${found.size}/${SECRETS.length} · ${minuteFormat.format(new Date())} Dronten`;
    }, 1000);
    setTimeout(() => box.classList.add('is-out'), 2800);
    setTimeout(() => {
      box.remove();
      if (saveBox === box) saveBox = null;
    }, 3200);
  }

  /* ---------- Tab-away: the title and icon call the visitor back ---------- */

  const originalTitle = document.title;
  const favicon = document.querySelector('link[rel="icon"]');
  const originalIcon = favicon?.getAttribute('href');
  const LOST_ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cpath d='M14 4h48L50 60H2z' fill='%23ff2a3d'/%3E%3Ctext x='31' y='47' font-family='Arial Black,Arial' font-weight='900' font-size='38' text-anchor='middle' fill='%2307060c'%3E!%3C/text%3E%3C/svg%3E";
  let seenVisible = !document.hidden;
  let wentAway = false;
  let awayTimer = 0;

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (!seenVisible) return;
      wentAway = true;
      let flip = false;
      const blink = () => {
        flip = !flip;
        document.title = flip ? '⚠ Signal lost…' : 'Come back?';
      };
      blink();
      awayTimer = setInterval(blink, 1000);
      favicon?.setAttribute('href', LOST_ICON);
      return;
    }
    seenVisible = true;
    if (!wentAway) return;
    wentAway = false;
    clearInterval(awayTimer);
    document.title = originalTitle;
    favicon?.setAttribute('href', originalIcon);
    if (!reduceMotion) {
      root.classList.add('reconnect');
      setTimeout(() => root.classList.remove('reconnect'), 700);
    }
    unlock('signal');
  });

  /* ---------- Terminal: type "sudo" ---------- */

  const term = make('dialog', 'term', `
    <div class="term__bar"><span>td-os // terminal</span><button class="term__close" type="button">${finePointer ? 'Esc · close' : 'Close'}</button></div>
    <div class="term__log" id="term-log"></div>
    <form class="term__form" method="dialog">
      <label class="term__prompt" for="term-input">guest@td-os:~$</label>
      <input class="term__input" id="term-input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false">
    </form>`);
  term.setAttribute('aria-label', 'Terminal');
  document.body.append(term);
  const termLog = term.querySelector('.term__log');
  const termInput = term.querySelector('.term__input');
  const termPrompt = term.querySelector('.term__prompt');
  const history = [];
  let historyPos = 0;

  const FILES = {
    'about.txt': [
      'Thijn Douwma, 23. Frontend developer from Dronten, NL.',
      'Vue, React and browser extensions. 8+ years of code, 2.5 of them professional.',
      'Available from January 2027.',
    ],
    'quests.log': [
      '[ACTIVE]    2024 → Jan 2027',
      '  Frontend developer @ Conduction B.V.',
      '[ENDED]     2023 → 2024',
      '  HBO Software Engineering @ Windesheim',
      '[COMPLETED] 2020 → 2023',
      '  MBO 4 Software Development @ ROC van Flevoland',
    ],
    'contact.txt': [
      'email     thijn.douwma@outlook.com',
      'linkedin  linkedin.com/in/thijn-douwma',
      'github    github.com/SudoThijn',
    ],
  };

  // A tiny file system: the home folder holds FILES plus a secrets/ folder with one file per achievement.
  let cwd = [];
  const promptText = () => `guest@td-os:${cwd.length ? `~/${cwd.join('/')}` : '~'}$`;

  function secretFiles() {
    return SECRETS.map((s, i) => (found.has(s.id)
      ? { name: `${s.title.toLowerCase().replace(/\s+/g, '-')}.txt`, lines: [`◆ ${s.title}`, s.text] }
      : { name: `classified-${i + 1}.locked`, locked: true, hint: s.hint }));
  }

  function resolvePath(path) {
    const parts = path.startsWith('~') ? [] : [...cwd];
    for (const segment of path.replace(/^~\/?/, '').split('/')) {
      if (!segment || segment === '.') continue;
      if (segment === '..') parts.pop();
      else parts.push(segment);
    }
    return parts;
  }

  function lookup(parts) {
    if (!parts.length) return { dir: true, entries: [...Object.keys(FILES), 'secrets/'] };
    if (parts[0] === 'secrets') {
      if (parts.length === 1) return { dir: true, entries: secretFiles().map((f) => f.name), list: true };
      return parts.length === 2 ? secretFiles().find((f) => f.name === parts[1]) : null;
    }
    return parts.length === 1 && FILES[parts[0]] ? { lines: FILES[parts[0]] } : null;
  }

  const COMMANDS = {
    help: () => [
      'help             list commands',
      'whoami           who you are',
      'ls [dir]         list files',
      'cd <dir>         change folder',
      'pwd              where you are',
      'cat <file>       print a file',
      'secrets          achievements and hints',
      'secrets reset    forget found secrets',
      'hire             start the hire sequence',
      'date             time in Dronten',
      'clear            clear the screen',
      'exit             close the terminal',
    ],
    whoami: () => ['guest', 'The owner is Thijn Douwma. Try: cat about.txt'],
    ls: ([path = '.']) => {
      const node = lookup(resolvePath(path));
      if (!node) return [`ls: ${path}: no such file or folder`];
      if (!node.dir) return [path];
      return node.list ? node.entries : [node.entries.join('  ')];
    },
    cd: ([path = '~']) => {
      if (path.startsWith('/')) return [`cd: ${path}: permission denied. Guests stay in ~`];
      const parts = resolvePath(path);
      const node = lookup(parts);
      if (!node) return [`cd: ${path}: no such folder`];
      if (!node.dir) return [`cd: ${path}: not a folder`];
      cwd = parts;
      return [];
    },
    pwd: () => [`/home/guest${cwd.length ? `/${cwd.join('/')}` : ''}`],
    cat: ([path]) => {
      if (!path) return ['cat: missing file name. Try: ls'];
      const node = lookup(resolvePath(path));
      if (!node) return [`cat: ${path}: no such file`];
      if (node.dir) return [`cat: ${path}: is a folder. Try: cd ${path}`];
      if (node.locked) return [`cat: ${path}: permission denied`, `hint: ${node.hint}`];
      return node.lines;
    },
    secrets: ([arg]) => {
      if (arg === 'reset') {
        found.clear();
        writeStore();
        renderChip();
        return ['Secrets reset. Happy hunting.'];
      }
      return [
        `${found.size}/${SECRETS.length} found`,
        ...SECRETS.map((s) => (found.has(s.id) ? `[x] ${s.title}: ${s.text}` : `[ ] ???: ${s.hint}`)),
      ];
    },
    hire: () => [
      'Initiating hire sequence…',
      '[████████████████████] 100%',
      'Candidate ready. Send the offer to thijn.douwma@outlook.com',
      'Available from January 2027.',
    ],
    sudo: () => ['guest is not in the sudoers file. This incident will be reported.'],
    rm: () => ['rm: permission denied. Also, rude.'],
    1337: () => {
      if (leet) return ['Already elite.'];
      setTimeout(() => {
        term.close();
        enterLeet();
      }, 700);
      return ['3l173 m0d3 3n6463d…'];
    },
    save: () => {
      unlock('save');
      return ['Saving… don\'t turn off the power', 'Game saved.'];
    },
    overdrive: () => ['Cheats don\'t work from in here. Try the classic one on the page itself.'],
    date: () => [new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', dateStyle: 'full', timeStyle: 'medium' }).format(new Date())],
    echo: (args) => [args.join(' ')],
    clear: () => {
      termLog.textContent = '';
      return [];
    },
    exit: () => {
      term.close();
      return [];
    },
  };

  function print(text, className = '') {
    const line = make('div', className);
    line.textContent = text;
    termLog.append(line);
  }

  function run(line) {
    print(`${promptText()} ${line}`, 'in');
    const [name, ...args] = line.trim().split(/\s+/);
    if (!name) return;
    const command = COMMANDS[name.toLowerCase()];
    if (!command) {
      print(`command not found: ${name}. Type help.`, 'err');
      return;
    }
    command(args).forEach((text) => print(text));
    termPrompt.textContent = promptText();
  }

  term.querySelector('.term__form').addEventListener('submit', (e) => {
    e.preventDefault();
    const line = termInput.value;
    termInput.value = '';
    if (line.trim()) history.push(line);
    historyPos = history.length;
    run(line);
    termLog.scrollTop = termLog.scrollHeight;
  });
  // Tab completes the word under the cursor: a command name first, a path after that.
  // Several matches complete to their shared prefix, and list themselves when that adds nothing.
  function complete() {
    const value = termInput.value;
    const words = value.split(' ');
    const current = words.pop();
    let base = '';
    let options;
    if (!words.length) {
      options = Object.keys(COMMANDS).map((name) => `${name} `);
    } else {
      base = current.slice(0, current.lastIndexOf('/') + 1);
      const folder = lookup(resolvePath(base || '.'));
      if (!folder?.dir) return;
      options = folder.entries.map((entry) => base + (entry.endsWith('/') ? entry : `${entry} `));
    }
    const matches = options.filter((option) => option.startsWith(current));
    if (!matches.length) return;
    let shared = matches[0];
    for (const match of matches) while (!match.startsWith(shared)) shared = shared.slice(0, -1);
    if (shared.length > current.length) {
      termInput.value = [...words, shared].join(' ');
    } else if (matches.length > 1) {
      print(`${promptText()} ${value}`, 'in');
      print(matches.map((match) => match.slice(base.length).trim()).join('  '));
      termLog.scrollTop = termLog.scrollHeight;
    }
  }

  termInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && historyPos > 0) termInput.value = history[--historyPos];
    else if (e.key === 'ArrowDown' && historyPos < history.length) termInput.value = history[++historyPos] ?? '';
    else if (e.key === 'Tab' && !e.shiftKey) complete();
    else return;
    e.preventDefault();
  });
  term.querySelector('.term__close').addEventListener('click', () => term.close());
  term.addEventListener('click', (e) => e.target === term && termInput.focus());

  function openTerminal() {
    if (term.open) return;
    if (!termLog.childElementCount) {
      print('TD-OS v1.0 · root access granted (not really)', 'dim');
      print('Type help to list commands. Tab completes.', 'dim');
    }
    term.showModal();
    termInput.focus();
    unlock('root');
  }
  document.getElementById('open-terminal')?.addEventListener('click', openTerminal);

  /* ---------- Keyboard: sudo, Konami, Esc ---------- */

  let typed = '';
  addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      if (term.open) {
        run('save');
        termLog.scrollTop = termLog.scrollHeight;
      } else if (!dialogOpen()) {
        savePoint();
      }
      return;
    }
    if (e.key === 'Escape' && !dialogOpen() && (overdrive || leet)) {
      if (overdrive) setOverdrive(false);
      else exitLeet();
      return;
    }
    if (isTyping(e.target) || dialogOpen() || e.ctrlKey || e.metaKey || e.altKey) return;
    const key = e.key.toLowerCase();
    // Holding Shift for a capital B shouldn't break the code.
    if (key === 'shift' || key === 'capslock') return;
    feedKonami(key);
    if (key.length !== 1) return;
    typed = (typed + key).slice(-4);
    if (typed === 'sudo') {
      typed = '';
      // Without this, the final "o" lands in the freshly focused terminal input.
      e.preventDefault();
      openTerminal();
    }
  });

  /* ---------- Charge shot: hold on empty space, release when full ---------- */

  const CHARGE_MS = 900;
  const NOT_EMPTY = 'a, button, input, textarea, select, label, dialog, .stat, .lab';
  const charge = make('div', 'charge');
  charge.setAttribute('aria-hidden', 'true');
  document.body.append(charge);
  let charging = false;
  let chargeStart = 0;
  let chargeFrame = 0;
  const at = { x: 0, y: 0 };

  function place(el, x, y) {
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  }

  function chargeTick() {
    const elapsed = performance.now() - chargeStart;
    const level = Math.min(elapsed / CHARGE_MS, 1);
    td.reticle.charge = level;
    charge.style.setProperty('--charge', level);
    // A quick click shouldn't flash the ring, so it only shows once a hold is clearly happening.
    charge.classList.toggle('is-on', elapsed > 140);
    charge.classList.toggle('is-full', level >= 1);
    if (charging) chargeFrame = requestAnimationFrame(chargeTick);
  }

  addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || e.target.closest(NOT_EMPTY) || dialogOpen()) return;
    charging = true;
    chargeStart = performance.now();
    at.x = e.clientX;
    at.y = e.clientY;
    place(charge, at.x, at.y);
    chargeTick();
  });
  addEventListener('pointermove', (e) => {
    if (!charging) return;
    at.x = e.clientX;
    at.y = e.clientY;
    place(charge, at.x, at.y);
  }, { passive: true });

  function release(fire) {
    if (!charging) return;
    charging = false;
    cancelAnimationFrame(chargeFrame);
    const full = td.reticle.charge >= 1;
    td.reticle.charge = 0;
    charge.classList.remove('is-on', 'is-full');
    if (!fire || !full) return;
    td.field.shockwave(at.x, at.y);
    if (!reduceMotion) {
      const burst = make('div', 'burst');
      place(burst, at.x, at.y);
      document.body.append(burst);
      setTimeout(() => burst.remove(), 700);
    }
    unlock('charge');
  }
  addEventListener('pointerup', () => release(true));
  addEventListener('pointercancel', () => release(false));

  /* ---------- DevTools console greeting ---------- */

  console.log(
    '%c████████ ██████ \n   ██    ██   ██\n   ██    ██   ██\n   ██    ██   ██\n   ██    ██████ ',
    'color:#fcee0a;font:700 12px/1.1 monospace',
  );
  console.log('%cLooking at the source? Then we should talk: thijn.douwma@outlook.com', 'color:#2de2ff;font:600 13px monospace');
  console.log('%cThere is a secret for people who read consoles. Run: hack()', 'color:#ff2d7a;font:12px monospace');
  window.hack = () => {
    unlock('console');
    return 'ACCESS GRANTED. Secret unlocked: Source diver.';
  };
})();
