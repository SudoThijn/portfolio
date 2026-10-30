const root = document.documentElement;
root.classList.add('js');

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const pointer = { x: -9999, y: -9999 };

addEventListener('pointermove', (e) => {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
}, { passive: true });
document.addEventListener('pointerleave', () => {
  pointer.x = pointer.y = -9999;
});

/* ---------- Text scramble ---------- */

const SCRAMBLE_GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&/<>=+';

function scramble(el, duration = 900) {
  const target = el.dataset.text ?? el.textContent;
  el.dataset.text = target;
  if (reduceMotion) return;
  const start = performance.now();
  cancelAnimationFrame(el._scrambleFrame);
  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const settled = Math.floor(progress * target.length);
    let out = target.slice(0, settled);
    for (let i = settled; i < target.length; i++) {
      out += SCRAMBLE_GLYPHS[(Math.random() * SCRAMBLE_GLYPHS.length) | 0];
    }
    el.textContent = out;
    if (progress < 1) el._scrambleFrame = requestAnimationFrame(tick);
  };
  el._scrambleFrame = requestAnimationFrame(tick);
}

const nameLines = document.querySelectorAll('[data-scramble]');
nameLines.forEach((el, i) => setTimeout(() => scramble(el, 700 + i * 250), 150 + i * 120));
document.querySelector('.hero__name')?.addEventListener('pointerenter', () => {
  nameLines.forEach((el, i) => scramble(el, 450 + i * 150));
});

/* ---------- Dot field ---------- */

function initField() {
  const canvas = document.getElementById('field');
  const ctx = canvas.getContext('2d');
  const GAP = 30;
  const RADIUS = 170;
  let width = 0;
  let height = 0;
  let dots = [];

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    width = innerWidth;
    height = innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dots = [];
    for (let y = GAP / 2; y < height; y += GAP) {
      for (let x = GAP / 2; x < width; x += GAP) dots.push({ x, y });
    }
  }

  function draw(time) {
    ctx.clearRect(0, 0, width, height);
    // A slow scan line sweeps down the screen, lighting the dots it passes.
    const scanY = ((time / 7000) % 1.3) * height * 1.3 - height * 0.15;
    for (const d of dots) {
      const dx = d.x - pointer.x;
      const dy = d.y - pointer.y;
      const dist = Math.hypot(dx, dy);
      let x = d.x;
      let y = d.y;
      let size = 1.2;
      let color = '#2a2542';
      if (dist < RADIUS) {
        const f = 1 - dist / RADIUS;
        const push = f * f * 16;
        x += (dx / (dist || 1)) * push;
        y += (dy / (dist || 1)) * push;
        size = 1.2 + f * 1.8;
        color = f > 0.72 ? '#ff2d7a' : f > 0.3 ? '#2de2ff' : '#4a4370';
      } else if (Math.abs(d.y - scanY) < GAP * 0.6) {
        color = '#5b5320';
        size = 1.6;
      }
      ctx.fillStyle = color;
      ctx.fillRect(x - size / 2, y - size / 2, size, size);
    }
  }

  let frame = 0;
  function loop(time) {
    draw(time);
    frame = requestAnimationFrame(loop);
  }

  resize();
  addEventListener('resize', () => {
    resize();
    if (reduceMotion) draw(0);
  });

  if (reduceMotion) {
    draw(0);
    return;
  }
  frame = requestAnimationFrame(loop);
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(frame);
    if (!document.hidden) frame = requestAnimationFrame(loop);
  });
}
initField();

/* ---------- Target-lock reticle ---------- */

function initReticle() {
  if (!finePointer || reduceMotion) return;
  const reticle = document.querySelector('.reticle');
  const LOCKABLE = 'a, button, input, .stat, .block--chip';
  const IDLE = 28;
  const box = { x: -100, y: -100, w: IDLE, h: IDLE };
  let lockTarget = null;

  document.addEventListener('pointerover', (e) => {
    lockTarget = e.target.closest(LOCKABLE);
    reticle.classList.toggle('is-locked', !!lockTarget);
  });
  document.addEventListener('pointerleave', () => reticle.classList.remove('is-on'));
  addEventListener('pointermove', () => reticle.classList.add('is-on'), { passive: true });

  const lerp = (a, b, t) => a + (b - a) * t;
  function follow() {
    let tx = pointer.x - IDLE / 2;
    let ty = pointer.y - IDLE / 2;
    let tw = IDLE;
    let th = IDLE;
    if (lockTarget) {
      const r = lockTarget.getBoundingClientRect();
      tx = r.left - 6;
      ty = r.top - 6;
      tw = r.width + 12;
      th = r.height + 12;
    }
    box.x = lerp(box.x, tx, 0.25);
    box.y = lerp(box.y, ty, 0.25);
    box.w = lerp(box.w, tw, 0.25);
    box.h = lerp(box.h, th, 0.25);
    reticle.style.transform = `translate(${box.x}px, ${box.y}px)`;
    reticle.style.width = `${box.w}px`;
    reticle.style.height = `${box.h}px`;
    requestAnimationFrame(follow);
  }
  requestAnimationFrame(follow);
}
initReticle();

/* ---------- Hero emblem tilt ---------- */

const emblem = document.getElementById('emblem');
if (emblem && finePointer && !reduceMotion) {
  addEventListener('pointermove', (e) => {
    const nx = e.clientX / innerWidth - 0.5;
    const ny = e.clientY / innerHeight - 0.5;
    emblem.style.setProperty('--ry', `${nx * 22}deg`);
    emblem.style.setProperty('--rx', `${ny * -22}deg`);
  }, { passive: true });
}

/* ---------- Ticker ---------- */

document.querySelectorAll('[data-ticker]').forEach((track) => {
  const unit = track.innerHTML;
  const band = track.parentElement;
  let copies = 1;
  while (track.scrollWidth < band.clientWidth && copies < 20) {
    track.innerHTML += unit;
    copies++;
  }
  // Doubled so the -50% keyframe lands exactly on a repeat.
  track.innerHTML += track.innerHTML;
});

/* ---------- HUD: clock, progress, scrollspy ---------- */

const clock = document.getElementById('clock');
const timeFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Amsterdam', hour: '2-digit', minute: '2-digit', second: '2-digit',
});
const updateClock = () => { clock.textContent = timeFormat.format(new Date()); };
updateClock();
setInterval(updateClock, 1000);

const progress = document.getElementById('progress');
const updateProgress = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
};
addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

const navLinks = [...document.querySelectorAll('.hud__nav a')];
const spy = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    // The hero has no id, so reaching it clears the active tab.
    navLinks.forEach((a) => a.setAttribute('aria-current', String(a.hash === `#${entry.target.id}`)));
  }
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('main > section').forEach((s) => spy.observe(s));

/* ---------- Scroll reveal ---------- */

const revealed = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add('in');
    revealed.unobserve(entry.target);
  }
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('[data-reveal]').forEach((el) => revealed.observe(el));

/* ---------- Stats ---------- */

const statInfo = document.getElementById('stat-info-text');
const stats = document.querySelectorAll('.stat');
stats.forEach((stat) => {
  const segs = stat.querySelector('.segs');
  const level = Number(stat.dataset.level);
  for (let i = 0; i < 10; i++) {
    const seg = document.createElement('i');
    if (i < level) seg.className = 'on';
    seg.style.setProperty('--i', i);
    segs.append(seg);
  }
  const activate = () => {
    stats.forEach((s) => s.classList.toggle('is-active', s === stat));
    statInfo.textContent = `${stat.querySelector('.stat__name').textContent}: ${stat.dataset.info}`;
  };
  stat.addEventListener('pointerenter', activate);
  stat.addEventListener('focus', activate);
});

/* ---------- Password lab ---------- */

function initLab() {
  const lab = document.getElementById('lab');
  const input = document.getElementById('pw');
  const meter = document.getElementById('meter');
  const out = {
    rank: document.querySelector('#pw-rank span'),
    time: document.getElementById('pw-time'),
    len: document.getElementById('pw-len'),
    pool: document.getElementById('pw-pool'),
    bits: document.getElementById('pw-bits'),
  };
  const SEGMENTS = 12;
  const GUESSES_PER_SECOND = 1e10;
  const COMMON = ['password', 'wachtwoord', '123456', '12345678', '123456789', 'qwerty', 'admin', 'welcome', 'welkom', 'letmein', 'iloveyou', 'monkey', 'dragon', 'hunter2', 'abc123', 'football'];

  for (let i = 0; i < SEGMENTS; i++) {
    const seg = document.createElement('i');
    seg.style.setProperty('--i', i);
    meter.append(seg);
  }

  function analyse(pw) {
    let pool = 0;
    if (/[a-z]/.test(pw)) pool += 26;
    if (/[A-Z]/.test(pw)) pool += 26;
    if (/[0-9]/.test(pw)) pool += 10;
    if (/[^a-zA-Z0-9]/.test(pw)) pool += 33;
    let bits = pw.length && pool ? pw.length * Math.log2(pool) : 0;
    const common = COMMON.includes(pw.toLowerCase());
    // Leaked-list passwords and single repeated characters fall to the first guesses.
    if (common || /^(.)\1*$/.test(pw)) bits = Math.min(bits, 4);
    return { pool, bits, common };
  }

  function formatTime(seconds) {
    if (seconds < 1) return 'instantly';
    const units = [
      ['year', 31557600], ['day', 86400], ['hour', 3600], ['minute', 60], ['second', 1],
    ];
    const years = seconds / 31557600;
    if (years > 1.38e10) return 'after the universe ends';
    if (years > 1e6) return `in ${Math.round(years / 1e6).toLocaleString('en')} million years`;
    for (const [name, size] of units) {
      if (seconds >= size) {
        const n = Math.round(seconds / size);
        return `in ${n.toLocaleString('en')} ${name}${n === 1 ? '' : 's'}`;
      }
    }
    return 'instantly';
  }

  function rankFor(bits) {
    if (bits < 40) return ['critical', 'Critical'];
    if (bits < 60) return ['weak', 'Weak'];
    if (bits < 80) return ['decent', 'Decent'];
    if (bits < 110) return ['strong', 'Strong'];
    return ['overkill', 'Overkill'];
  }

  function render() {
    const pw = input.value;
    const { pool, bits, common } = analyse(pw);
    const [rank, label] = rankFor(bits);
    lab.dataset.rank = rank;
    out.rank.textContent = common ? 'Leaked' : label;
    out.time.textContent = formatTime(2 ** bits / 2 / GUESSES_PER_SECOND);
    out.len.textContent = pw.length;
    out.pool.textContent = pool;
    out.bits.textContent = `${Math.round(bits)} bits`;
    const filled = Math.min(SEGMENTS, Math.ceil(bits / 10));
    [...meter.children].forEach((seg, i) => seg.classList.toggle('on', i < filled));
  }

  const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*-_=+?';
  function randomPassword(length = 20) {
    const bytes = new Uint8Array(length * 2);
    let pw = '';
    while (pw.length < length) {
      crypto.getRandomValues(bytes);
      for (const b of bytes) {
        // Rejection sampling keeps every character equally likely.
        if (b < 256 - (256 % CHARSET.length) && pw.length < length) pw += CHARSET[b % CHARSET.length];
      }
    }
    return pw;
  }

  document.getElementById('pw-gen').addEventListener('click', () => {
    const target = randomPassword();
    if (reduceMotion) {
      input.value = target;
      render();
      return;
    }
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / 600, 1);
      const settled = Math.floor(p * target.length);
      let text = target.slice(0, settled);
      for (let i = settled; i < target.length; i++) text += CHARSET[(Math.random() * CHARSET.length) | 0];
      input.value = text;
      if (p < 1) requestAnimationFrame(tick);
      else render();
    };
    requestAnimationFrame(tick);
  });

  input.addEventListener('input', render);
  render();
}
initLab();

/* ---------- Copy email ---------- */

const copyButton = document.getElementById('copy-email');
copyButton?.addEventListener('click', async () => {
  const label = copyButton.querySelector('span');
  try {
    await navigator.clipboard.writeText(copyButton.dataset.copy);
    label.textContent = 'Copied';
  } catch {
    const range = document.createRange();
    range.selectNodeContents(copyButton.previousElementSibling);
    getSelection().removeAllRanges();
    getSelection().addRange(range);
    label.textContent = 'Selected';
  }
  copyButton.classList.add('is-done');
  setTimeout(() => {
    label.textContent = 'Copy';
    copyButton.classList.remove('is-done');
  }, 1800);
});
