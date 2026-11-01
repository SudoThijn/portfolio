from lib import *

W, H, CUT = 1280, 568, 22


def hud():
    out = [f'<rect width="{W}" height="52" fill="#0b0912"/>', f'<rect y="51" width="{W}" height="1" fill="{LINE}"/>']
    # Progress meter under the bar, sweeping like the page's scroll meter.
    out.append(f'<rect class="meter" y="50" width="{W}" height="2" fill="url(#hudgrad)"/>')
    # Logo block.
    out.append(para(28, 9, 56, 34, YEL))
    out.append(text(TEKTUR, 'TD', 19, 28 + 28 + 4, 33, INK, 0.5, 'middle'))
    # Navigation with the profile tab lit.
    x = 118
    for i, label in enumerate(['PROFILE', 'QUESTS', 'BUILDS', 'CONTACT']):
        w = CHAKRA_SEMI.width(label, 13.5, 1.6)
        if i == 0:
            out.append(para(x - 14, 14, w + 28, 25, YEL))
            out.append(text(CHAKRA_SEMI, label, 13.5, x, 32, INK, 1.6))
        else:
            out.append(text(CHAKRA_SEMI, label, 13.5, x, 32, DIM, 1.6))
        x += w + 40
    # Right side, placed from the right edge: place, language switch, sound.
    rx = W - 28
    place_w = MONO.width('DRONTEN', 12, 1.5)
    out.append(text(MONO, 'DRONTEN', 12, rx, 31, DIM, 1.5, 'end'))
    out.append(f'<rect class="pulse" x="{num(rx - place_w - 20)}" y="21" width="8" height="8" fill="{YEL}"/>')
    lx = rx - place_w - 20 - 30 - 68
    out.append(lang_switch(lx, 13, 68, 26))
    sound_w = 112
    sx = lx - 16 - sound_w
    out.append(f'<rect x="{num(sx)}" y="13" width="{sound_w}" height="26" fill="none" stroke="{YEL}"/>')
    for i in range(3):
        out.append(f'<rect class="bar b{i}" x="{num(sx + 11 + i * 5)}" y="22" width="3" height="8" fill="{YEL}"/>')
    out.append(text(MONO, 'SOUND: ON', 10.5, sx + 32, 30.5, YEL, 1.1))
    return ''.join(out)


def ident():
    return runs(
        MONO,
        [('> IDENT CONFIRMED', CYAN), (' // ', MAG), ('52.52°N 5.72°E', CYAN), (' // ', MAG), ('DRONTEN, NL', CYAN)],
        16,
        68,
        110,
        1.6,
    )


def name():
    size = 150
    thijn = TEKTUR.path('THIJN', size, 1)
    douwma = TEKTUR.path('DOUWMA', size, 1)
    return (
        # Colour-split glitch layers behind the solid first name.
        f'<g transform="translate(66 252) skewX(-9)">'
        f'<path class="gm" fill="{MAG}" d="{thijn}"/>'
        f'<path class="gc" fill="{CYAN}" d="{thijn}"/>'
        f'<path fill="{TEXT}" d="{thijn}"/></g>'
        f'<g transform="translate(62 384) skewX(-9)">'
        f'<path fill="{INK}" stroke="{YEL}" stroke-width="2.6" stroke-linejoin="miter" d="{douwma}"/></g>'
    )


def tags():
    y, h = 410, 34
    out = []
    label = 'FRONTEND DEVELOPER'
    w1 = TEKTUR_BOLD.width(label, 17, 1) + 44
    out.append(para(68, y, w1, h, YEL))
    out.append(text(TEKTUR_BOLD, label, 17, 68 + w1 / 2 + 4, y + 23.5, INK, 1, 'middle'))
    x2 = 68 + w1 + 22 + 16
    label2 = 'ID//SUDOTHIJN'
    w2 = TEKTUR_BOLD.width(label2, 17, 1) + 44
    out.append(para(x2, y, w2, h, MAG))
    out.append(text(TEKTUR_BOLD, label2, 17, x2 + w2 / 2 + 4, y + 23.5, INK, 1, 'middle'))
    out.append(text(KANA, 'フロントエンド開発者', 17, x2 + w2 + 38, y + 23, DIM, 4))
    return ''.join(out)


def emblem():
    cx, cy, s = 970, 262, 0.8
    local = []
    local.append(
        f'<g class="spin a"><circle cx="200" cy="200" r="186" fill="none" stroke="{CYAN}" stroke-width="1" stroke-dasharray="3 9" opacity=".7"/></g>'
    )
    local.append(
        f'<g class="spin b"><circle cx="200" cy="200" r="166" fill="none" stroke="{MAG}" stroke-width="6" stroke-dasharray="120 40 30 40 200 613"/></g>'
    )
    local.append(
        f'<g class="spin c"><circle cx="200" cy="200" r="146" fill="none" stroke="{LINE_B}" stroke-width="1"/>'
        f'<circle cx="200" cy="200" r="146" fill="none" stroke="{YEL}" stroke-width="2" stroke-dasharray="40 877"/>'
        f'<rect x="196" y="50" width="8" height="8" fill="{YEL}"/></g>'
    )
    local.append(
        f'<polygon points="200,82 302,141 302,259 200,318 98,259 98,141" fill="{PANEL}" stroke="{LINE_B}" stroke-width="1.5"/>'
    )
    local.append(
        f'<polygon filter="url(#glow)" points="200,100 286,150 286,250 200,300 114,250 114,150" fill="none" stroke="{YEL}" stroke-width="3"/>'
        f'<polygon points="200,100 286,150 286,250 200,300 114,250 114,150" fill="none" stroke="{YEL}" stroke-width="3"/>'
    )
    local.append(text(TEKTUR, 'TD', 96, 200, 236, TEXT, 0, 'middle'))
    local.append(text(MONO, 'SUDOTHIJN', 13, 200, 268, CYAN, 5.5, 'middle'))
    return f'<g transform="translate({num(cx - 200 * s)} {num(cy - 200 * s)}) scale({s})">{"".join(local)}</g>'


def labels():
    def chip(x, y, label, color):
        w = MONO.width(label, 12.5, 1.4) + 38
        return (
            f'<rect x="{x}" y="{y}" width="{num(w)}" height="26" fill="{PANEL}" stroke="{LINE_B}"/>'
            f'<rect x="{x + 10}" y="{y + 10}" width="6" height="6" fill="{color}"/>'
            + text(MONO, label, 12.5, x + 26, y + 18, DIM, 1.4)
        )

    # The hexagon's right point is at x=1052, so the VUE / REACT label starts clear of it, on the rings only.
    return chip(806, 112, 'SYNC 100%', CYAN) + chip(1076, 246, 'VUE / REACT', YEL) + chip(836, 388, 'EXT. BUILD', MAG)


def kana():
    out = []
    y = 104
    for ch in 'テイン・ダウマ':
        out.append(
            text(KANA, ch, 40, 1244, y, 'none', 0, 'middle', f'stroke="{LINE_B}" stroke-width="1.3" opacity=".75"')
        )
        y += 46
    return ''.join(out)


def accents():
    # A few lit dots in the field, like the cursor-reactive dot field near the emblem.
    pts = [(850, 330, CYAN), (870, 350, MAG), (1068, 360, YEL), (1014, 410, CYAN), (898, 150, MAG), (1128, 178, CYAN), (936, 386, YEL)]
    return ''.join(f'<rect class="blink k{i % 3}" x="{x}" y="{y}" width="3" height="3" fill="{c}"/>' for i, (x, y, c) in enumerate(pts))


def ticker(words, face, size, color, y, span):
    """One repeating run of words with diamonds between them. Returns (markup, width of one run)."""
    out, x = [], 0.0
    for word in words:
        out.append(text(face, word, size, x, y, color, 1.2))
        x += face.width(word, size, 1.2) + 26
        out.append(f'<polygon points="{num(x)},{num(y - size * 0.36 - 6)} {num(x + 6)},{num(y - size * 0.36)} {num(x)},{num(y - size * 0.36 + 6)} {num(x - 6)},{num(y - size * 0.36)}" fill="{color}"/>')
        x += 26
    return ''.join(out), x


def bands():
    front_words = ['VUE', 'REACT', 'JAVASCRIPT', 'BROWSER EXTENSIONS', 'OPEN SOURCE', 'AI-ASSISTED']
    back_words = ['OPEN SOURCE', 'BROWSER EXTENSIONS', 'INTERFACES', 'SECURITY', 'USABILITY']
    out = []
    # Back band, dim and slanted the other way.
    run, width_b = ticker(back_words, TEKTUR_BOLD, 24, '#4a4370', 0, 0)
    copies = math.ceil((W + 400) / width_b) + 1
    inner = ''.join(f'<g transform="translate({num(i * width_b)} 0)">{run}</g>' for i in range(copies))
    out.append(
        f'<g transform="rotate(1.3 {W / 2} 518)"><rect x="-120" y="494" width="{W + 240}" height="44" fill="#14111f"/>'
        f'<g transform="translate(0 525)"><g class="tick back">{inner}</g></g></g>'
    )
    # Front band, yellow.
    run, width_f = ticker(front_words, TEKTUR, 26, INK, 0, 0)
    copies = math.ceil((W + 400) / width_f) + 1
    inner = ''.join(f'<g transform="translate({num(i * width_f)} 0)">{run}</g>' for i in range(copies))
    out.append(
        f'<g transform="rotate(-1.7 {W / 2} 540)"><rect x="-120" y="516" width="{W + 240}" height="48" fill="{YEL}"/>'
        f'<g transform="translate(0 550)"><g class="tick front">{inner}</g></g></g>'
    )
    return ''.join(out), width_b, width_f


def build():
    band_markup, wb, wf = bands()
    defs = (
        dot_pattern('dots', 30, 1.3, '#3a3460', 1)
        + scanlines()
        + f'<clipPath id="panel"><path d="{cut_panel(W, H, CUT)}"/></clipPath>'
        + f'<linearGradient id="hudgrad" x1="0" x2="1"><stop offset="0" stop-color="{YEL}"/><stop offset="1" stop-color="{MAG}"/></linearGradient>'
        + '<filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7"/></filter>'
        + f'<radialGradient id="vig" cx=".72" cy=".48" r=".75"><stop offset="0" stop-color="#1c1730" stop-opacity=".55"/><stop offset="1" stop-color="{INK}" stop-opacity="0"/></radialGradient>'
        + f'<linearGradient id="sweep" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="{CYAN}" stop-opacity="0"/><stop offset=".5" stop-color="{CYAN}" stop-opacity=".07"/><stop offset="1" stop-color="{CYAN}" stop-opacity="0"/></linearGradient>'
    )
    style = f"""
.spin {{ transform-box: fill-box; transform-origin: center; }}
.spin.a {{ animation: turn 60s linear infinite; }}
.spin.b {{ animation: turn 18s linear infinite reverse; }}
.spin.c {{ animation: turn 24s linear infinite; }}
@keyframes turn {{ to {{ transform: rotate(360deg); }} }}
.tick.front {{ animation: slide-f 38s linear infinite; }}
.tick.back {{ animation: slide-b 52s linear infinite reverse; }}
@keyframes slide-f {{ to {{ transform: translateX({num(-wf)}px); }} }}
@keyframes slide-b {{ to {{ transform: translateX({num(-wb)}px); }} }}
.gm {{ animation: gm 7s steps(1) infinite; transform: translate(7px, 4px); }}
.gc {{ animation: gc 7s steps(1) infinite; transform: translate(-5px, -3px); }}
@keyframes gm {{ 0%,90%,100% {{ transform: translate(7px,4px); }} 91% {{ transform: translate(18px,1px); }} 93% {{ transform: translate(-3px,7px); }} 95% {{ transform: translate(11px,3px); }} }}
@keyframes gc {{ 0%,90%,100% {{ transform: translate(-5px,-3px); }} 91% {{ transform: translate(-16px,-6px); }} 93% {{ transform: translate(4px,-1px); }} 95% {{ transform: translate(-9px,-4px); }} }}
.meter {{ transform-box: fill-box; transform-origin: left; animation: fill 9s ease-in-out infinite alternate; }}
@keyframes fill {{ from {{ transform: scaleX(.08); }} to {{ transform: scaleX(1); }} }}
.pulse {{ animation: pulse 1.6s steps(2, jump-none) infinite; }}
@keyframes pulse {{ 50% {{ opacity: .25; }} }}
.bar {{ transform-box: fill-box; transform-origin: bottom; animation: eq .8s ease-in-out infinite alternate; }}
.bar.b1 {{ animation-delay: -.3s; }} .bar.b2 {{ animation-delay: -.55s; }}
@keyframes eq {{ from {{ transform: scaleY(.3); }} to {{ transform: scaleY(1.3); }} }}
.blink {{ animation: blink 3.2s steps(2, jump-none) infinite; }}
.blink.k1 {{ animation-delay: -1.1s; }} .blink.k2 {{ animation-delay: -2.1s; }}
@keyframes blink {{ 50% {{ opacity: .15; }} }}
.sweep {{ animation: sweep 7s linear infinite; }}
@keyframes sweep {{ from {{ transform: translateY(-120px); }} to {{ transform: translateY({H}px); }} }}
"""
    body = (
        f'<g clip-path="url(#panel)">'
        f'<rect width="{W}" height="{H}" fill="{INK}"/>'
        f'<rect width="{W}" height="{H}" fill="url(#dots)"/>'
        f'<rect width="{W}" height="{H}" fill="url(#vig)"/>'
        f'<rect class="sweep" y="0" width="{W}" height="120" fill="url(#sweep)"/>'
        + accents()
        + kana()
        + hud()
        + ident()
        + name()
        + tags()
        + emblem()
        + labels()
        + band_markup
        + f'<rect width="{W}" height="{H}" fill="url(#scan)" opacity=".28"/></g>'
        + f'<path d="{cut_panel(W - 1, H - 1, CUT)}" transform="translate(.5 .5)" fill="none" stroke="{LINE}"/>'
    )
    return svg(
        W,
        H,
        'Thijn Douwma, frontend developer',
        'A cyberpunk HUD banner: a bar with navigation, the name THIJN DOUWMA in large type, a hexagon emblem with turning rings, katakana, and two scrolling ticker bands.',
        body,
        defs,
        style,
    )


if __name__ == '__main__':
    write('banner.svg', build())
