from lib import *

W = 1280

# ---------------------------------------------------------------- section plates

SECTIONS = [
    ('01', 'BRIEFING', 'ブリーフィング', 'sec-01-briefing.svg'),
    ('02', 'LOADOUT', 'ロードアウト', 'sec-02-loadout.svg'),
    ('03', 'STACK', 'スタック', 'sec-03-stack.svg'),
    ('04', 'BOOT SEQUENCE', 'ブート', 'sec-04-boot.svg'),
    ('05', 'MAP', 'マップ', 'sec-05-map.svg'),
    ('06', 'LANGUAGES', '言語', 'sec-06-languages.svg'),
    ('07', 'DEPLOY', 'デプロイ', 'sec-07-deploy.svg'),
    ('08', 'CREDITS', 'クレジット', 'sec-08-credits.svg'),
    ('09', 'LICENCE', 'ライセンス', 'sec-09-licence.svg'),
]


def section_plate(num_, title, kana, filename):
    h, cut = 156, 20
    tag = f'SEC.{num_}'
    tag_w = MONO.width(tag, 17, 1.8) + 36
    body = (
        f'<g clip-path="url(#panel)"><rect width="{W}" height="{h}" fill="{INK}"/>'
        f'<rect width="{W}" height="{h}" fill="url(#dots)"/>'
        # Katakana, outlined and dim, on the right like the site's section heads.
        + text(KANA, kana, 92, W - 48, 118, 'none', 4, 'end', f'stroke="{LINE_B}" stroke-width="1.4" opacity=".7"')
        # Tag with the magenta edge.
        + f'<rect x="56" y="24" width="{num(tag_w)}" height="34" fill="{PANEL2}"/>'
        f'<rect x="56" y="24" width="3" height="34" fill="{MAG}"/>'
        + text(MONO, tag, 17, 56 + 18, 47.5, CYAN, 1.8)
        + f'<rect class="pulse" x="{num(56 + tag_w + 16)}" y="37" width="8" height="8" fill="{YEL}"/>'
        # Title.
        + f'<g transform="translate(54 120) skewX(-8)"><path fill="{TEXT}" d="{TEKTUR.path(title, 72, 1)}"/></g>'
        # Yellow and magenta underline.
        + f'<rect x="56" y="134" width="72" height="5" fill="{YEL}"/><rect x="128" y="134" width="32" height="5" fill="{MAG}"/>'
        + bracket(12, 12, 16, CYAN, 'tl')
        + bracket(W - 12, h - 12, 16, CYAN, 'br')
        + '</g>'
        + f'<path d="{cut_panel(W - 1, h - 1, cut)}" transform="translate(.5 .5)" fill="none" stroke="{LINE}"/>'
    )
    defs = (
        dot_pattern('dots', 30, 1.3, '#3a3460', 1)
        + f'<clipPath id="panel"><path d="{cut_panel(W, h, cut)}"/></clipPath>'
    )
    style = '.pulse { animation: pulse 1.6s steps(2, jump-none) infinite; } @keyframes pulse { 50% { opacity: .25; } }'
    write(filename, svg(W, h, f'Section {num_}: {title.title()}', f'A title plate for the {title.lower()} section.', body, defs, style))


# ---------------------------------------------------------------- loadout cards


def icon(kind, x, y):
    """A 56 by 56 line icon in the site's colours."""
    o = [f'<g transform="translate({x} {y})">']
    if kind == 'hud':
        o.append(f'<rect x="0" y="4" width="56" height="10" fill="none" stroke="{CYAN}" stroke-width="2"/>')
        o.append(f'<rect x="3" y="7" width="22" height="4" fill="{YEL}"/>')
        for i, w in enumerate([40, 28, 46]):
            o.append(f'<rect x="0" y="{22 + i * 12}" width="{w}" height="6" fill="{CYAN}" opacity="{1 - i * 0.2}"/>')
    elif kind == 'field':
        # The site's reticle: a square of four corner marks, with the dots nearest to it pushed out and lit magenta.
        step, centre = 14, 28
        for r in range(5):
            for c in range(5):
                dx, dy = (c - 2) * step, (r - 2) * step
                if dx == 0 and dy == 0:
                    continue
                near = abs(dx) <= step and abs(dy) <= step
                push = 1 + (4.5 / math.hypot(dx, dy) if near else 0)
                o.append(
                    f'<circle cx="{num(centre + dx * push)}" cy="{num(centre + dy * push)}" r="{1.9 if near else 1.4}" '
                    f'fill="{MAG if near else CYAN}" opacity="{1 if near else 0.55}"/>'
                )
        for corner, (cx, cy) in {'tl': (-11, -11), 'tr': (11, -11), 'bl': (-11, 11), 'br': (11, 11)}.items():
            o.append(bracket(centre + cx, centre + cy, 8, CYAN, corner))
    elif kind == 'lab':
        for i in range(8):
            lit = i < 5
            col = MAG if i < 2 else (YEL if i < 4 else CYAN)
            o.append(para(i * 7 - 2, 18, 5, 20, col if lit else LINE_B))
    elif kind == 'lang':
        o.append(lang_switch(-30, 10, 80, 36, 16))
    elif kind == 'sound':
        for i, hh in enumerate([22, 40, 30, 46, 18]):
            o.append(f'<rect class="bar" style="animation-delay:-{i * 0.23:.2f}s" x="{i * 11}" y="{52 - hh}" width="6" height="{hh}" fill="{CYAN}"/>')
    elif kind == 'motion':
        o.append(f'<circle cx="28" cy="28" r="24" fill="none" stroke="{LINE_B}" stroke-width="2" stroke-dasharray="3 7"/>')
        o.append(f'<rect x="19" y="16" width="6" height="24" fill="{YEL}"/><rect x="31" y="16" width="6" height="24" fill="{YEL}"/>')
    o.append('</g>')
    return ''.join(o)


def card(x, y, w, h, index, title, desc, kind, accent=CYAN, border=LINE):
    cut = 16
    out = [f'<g transform="translate({x} {y})">']
    out.append(f'<path d="{cut_panel(w, h, cut)}" fill="{PANEL}" stroke="{border}" stroke-width="1"/>')
    out.append(bracket(10, 10, 14, accent, 'tl'))
    tag_w = MONO.width(index, 13, 1.5) + 22
    out.append(f'<rect x="32" y="24" width="{num(tag_w)}" height="24" fill="{PANEL2}"/><rect x="32" y="24" width="3" height="24" fill="{accent}"/>')
    out.append(text(MONO, index, 13, 32 + 14, 41, accent, 1.5))
    out.append(f'<g transform="translate(30 88) skewX(-6)"><path fill="{TEXT}" d="{TEKTUR.path(title, 31, 1)}"/></g>')
    lines = wrap(CHAKRA, desc, 20, w - 64 - 96)
    for i, line in enumerate(lines):
        out.append(text(CHAKRA, line, 20, 32, 126 + i * 28, DIM))
    out.append(icon(kind, w - 56 - 32, 28))
    out.append('</g>')
    return ''.join(out)


def loadout():
    cw, ch, gap = 628, 206, 24
    cards = [
        ('01', 'HUD', 'A fixed bar with section tracking, a scroll meter and the time in Dronten.', 'hud'),
        ('02', 'DOT FIELD + RETICLE', 'A canvas field that reacts to the pointer, and a square cursor that locks onto the things you can click.', 'field'),
        ('03', 'PASSWORD LAB', 'Type a password and get its entropy, a rank and a crack time. It all runs in the page, and nothing is sent anywhere.', 'lab'),
        ('04', 'EN / NL', 'English by default, Dutch one click away. The choice is remembered, and ?lang=nl opens the page in Dutch.', 'lang'),
        ('05', 'SOUND', 'Interface sounds and music through the Web Audio API. It starts on the first interaction the browser accepts.', 'sound'),
        ('06', 'MOTION', 'Animations and effects are cut back or skipped when the visitor prefers reduced motion.', 'motion'),
    ]
    out = []
    for i, (idx, title, desc, kind) in enumerate(cards):
        out.append(card((i % 2) * (cw + gap), (i // 2) * (ch + gap), cw, ch, idx, title, desc, kind))
    # The secrets card spans the full width and stays locked.
    sy = 3 * (ch + gap)
    sh = 150
    out.append(f'<g transform="translate(0 {sy})">')
    out.append(f'<path d="{cut_panel(W, sh, 16)}" fill="{PANEL}" stroke="{MAG}" stroke-width="1"/>')
    out.append(bracket(10, 10, 14, MAG, 'tl') + bracket(W - 10, sh - 10, 14, MAG, 'br'))
    out.append(f'<rect x="32" y="24" width="55" height="24" fill="{PANEL2}"/><rect x="32" y="24" width="3" height="24" fill="{MAG}"/>')
    out.append(text(MONO, '07', 13, 46, 41, MAG, 1.5))
    out.append(f'<g transform="translate(30 90) skewX(-6)"><path fill="{TEXT}" d="{TEKTUR.path("SECRETS", 31, 1)}"/></g>')
    out.append(text(CHAKRA, 'Seven of them are hidden in the page. This README won’t spoil them.', 20, 32, 126, DIM))
    # Seven locked slots and the counter.
    x = 640
    for i in range(7):
        out.append(para(x + i * 74, 46, 58, 48, PANEL2, f'stroke="{LINE_B}" stroke-width="1.5"'))
        out.append(text(MONO, '???', 14, x + i * 74 + 33, 75, LINE_B, 1, 'middle'))
        out.append(f'<rect class="slot s{i}" x="{x + i * 74 + 14}" y="102" width="30" height="3" fill="{MAG}"/>')
    out.append(text(TEKTUR, '0/7', 42, W - 40, 88, MAG, 1, 'end'))
    out.append('</g>')
    height = sy + sh
    style = """
.bar { transform-box: fill-box; transform-origin: bottom; animation: eq .9s ease-in-out infinite alternate; }
@keyframes eq { from { transform: scaleY(.35); } to { transform: scaleY(1); } }
.slot { opacity: .25; animation: slot 3.5s steps(1) infinite; }
.s1 { animation-delay: .5s; } .s2 { animation-delay: 1s; } .s3 { animation-delay: 1.5s; } .s4 { animation-delay: 2s; } .s5 { animation-delay: 2.5s; } .s6 { animation-delay: 3s; }
@keyframes slot { 0% { opacity: 1; } 12% { opacity: .25; } 100% { opacity: .25; } }
"""
    write(
        'loadout.svg',
        svg(
            W,
            height,
            'Loadout',
            'Seven cards: HUD, dot field and reticle, password lab, EN and NL, sound, motion, and a locked card for the seven secrets.',
            ''.join(out),
            '',
            style,
        ),
    )


# ---------------------------------------------------------------- stack panel


def chip(x, y, label, accent=CYAN, h=48):
    w = CHAKRA_SEMI.width(label, 22, 0.6) + 52
    return (
        para(x, y, w, h, PANEL2)
        + para(x, y, 4, h, accent)
        + text(CHAKRA_SEMI, label, 22, x + 30 + h * TAN14 / 2, y + 31.5, TEXT, 0.6)
    ), w + h * TAN14


def stack():
    rows = [
        ('APP', [('Vue 3', YEL), ('TypeScript 6', CYAN), ('Vite 8', MAG)], None),
        ('RUNTIME DEPENDENCIES', [('vue', YEL)], 'No router, no state library, no UI kit and no i18n library.'),
        ('TESTS', [('Vitest', CYAN), ('jsdom', CYAN), ('Playwright', CYAN)], None),
        ('QUALITY', [('ESLint', CYAN), ('oxlint', CYAN), ('Prettier', CYAN), ('vue-tsc', CYAN)], None),
        ('SHIPPING', [('GitHub Actions', CYAN), ('GitHub Pages', CYAN), ('Custom domain', CYAN)], None),
    ]
    row_h, pad_top = 96, 24
    h = pad_top * 2 + row_h * len(rows) - 12
    out = [f'<path d="{cut_panel(W, h, 20)}" fill="{PANEL}" stroke="{LINE}"/>', bracket(12, 12, 16, CYAN, 'tl'), bracket(W - 12, h - 12, 16, CYAN, 'br')]
    for i, (label, chips, note) in enumerate(rows):
        y = pad_top + i * row_h
        if i:
            out.append(f'<line x1="40" x2="{W - 40}" y1="{y - 20}" y2="{y - 20}" stroke="{LINE}" stroke-dasharray="3 5"/>')
        out.append(f'<rect x="40" y="{y + 14}" width="3" height="20" fill="{MAG}"/>')
        out.append(text(MONO, label, 15, 56, y + 31, CYAN, 1.8))
        x = 380
        for name, accent in chips:
            markup, w = chip(x, y + 2, name, accent)
            out.append(markup)
            x += w + 20
        if note:
            # One lit segment out of ten for the single dependency, then the sentence.
            for seg in range(10):
                out.append(para(x + 6 + seg * 17, y + 18, 12, 18, YEL if seg == 0 else LINE_B))
            out.append(text(CHAKRA, note, 19, x + 6 + 10 * 17 + 28, y + 33, DIM))
    write(
        'stack.svg',
        svg(
            W,
            h,
            'Stack',
            'App: Vue 3, TypeScript 6, Vite 8. One runtime dependency, vue. Tests: Vitest, jsdom, Playwright. Quality: ESLint, oxlint, Prettier, vue-tsc. Shipping: GitHub Actions, GitHub Pages, a custom domain.',
            ''.join(out),
        ),
    )


# ---------------------------------------------------------------- footer and divider


def footer():
    h, cut = 214, 24
    stripe_w = 28
    stripes = ''.join(
        f'<polygon points="{i * stripe_w * 2},{h - 16} {i * stripe_w * 2 + stripe_w},{h - 16} {i * stripe_w * 2 + stripe_w - 16},{h} {i * stripe_w * 2 - 16},{h}" fill="{YEL}"/>'
        for i in range(-1, W // (stripe_w * 2) + 3)
    )
    pill = '◆ SECRETS 0/7'
    pw = MONO.width('SECRETS 0/7', 13, 1.6) + 54
    body = (
        f'<g clip-path="url(#panel)"><rect width="{W}" height="{h}" fill="{INK}"/><rect width="{W}" height="{h}" fill="url(#dots)"/>'
        f'<rect y="{h - 16}" width="{W}" height="16" fill="{INK}"/><g class="hazard">{stripes}</g>'
        + text(KANA, 'ドロンテンで手作り', 50, W - 48, 100, 'none', 5, 'end', f'stroke="{LINE_B}" stroke-width="1.3" opacity=".6"')
        + f'<g transform="translate(54 96) skewX(-8)"><path fill="{TEXT}" d="{TEKTUR.path("BUILT BY HAND IN DRONTEN", 54, 1)}"/></g>'
        f'<g transform="translate(52 154) skewX(-8)"><path fill="{INK}" stroke="{YEL}" stroke-width="2" d="{TEKTUR.path("NO TEMPLATES", 54, 1)}"/></g>'
        + f'<rect x="{W - 48 - pw}" y="26" width="{num(pw)}" height="30" fill="none" stroke="{YEL}"/>'
        f'<polygon points="{W - 48 - pw + 20},{34} {W - 48 - pw + 26},{41} {W - 48 - pw + 20},{48} {W - 48 - pw + 14},{41}" fill="{YEL}"/>'
        + text(MONO, 'SECRETS 0/7', 13, W - 48 - pw + 36, 46, YEL, 1.6)
        + bracket(12, 12, 16, CYAN, 'tl')
        + '</g>'
        + f'<path d="{cut_panel(W - 1, h - 1, cut)}" transform="translate(.5 .5)" fill="none" stroke="{LINE}"/>'
    )
    defs = (
        dot_pattern('dots', 30, 1.3, '#3a3460', 1)
        + f'<clipPath id="panel"><path d="{cut_panel(W, h, cut)}"/></clipPath>'
    )
    style = f'.hazard {{ animation: hz 3s linear infinite; }} @keyframes hz {{ to {{ transform: translateX({stripe_w * 2}px); }} }}'
    write('footer.svg', svg(W, h, 'Built by hand in Dronten, no templates', 'A closing plate with a hazard stripe and the secrets counter at zero of seven.', body, defs, style))


# ---------------------------------------------------------------- link buttons


def button(filename, label, primary, play=False):
    h = 64
    tw = TEKTUR_BOLD.width(label, 21, 1.4)
    w = tw + 72 + (34 if play else 0)
    dx = h * TAN14
    total_w = w + dx + 6
    fill = YEL if primary else INK
    extra = '' if primary else f'stroke="{LINE_B}" stroke-width="2"'
    ink = INK if primary else TEXT
    body = para(2, 2, w - 4, h - 4, fill, extra)
    tx = 2 + (w - 4) / 2 + dx / 2 + (14 if play else 0)
    body += text(TEKTUR_BOLD, label, 21, tx, 40, ink, 1.4, 'middle')
    if play:
        px = tx - tw / 2 - 30
        body += f'<polygon points="{num(px)},26 {num(px + 15)},34 {num(px)},42" fill="{INK}"/>'
    write(filename, svg(int(total_w), h, label.title(), f'A link button: {label.title()}.', body))


def build_all():
    for sec in SECTIONS:
        section_plate(*sec)
    loadout()
    stack()
    footer()
    button('btn-live.svg', 'THIJN.DOUWMA.ME', True, True)
    button('btn-en.svg', 'ENGLISH', False)
    button('btn-nl.svg', 'NEDERLANDS', False)


if __name__ == '__main__':
    build_all()
