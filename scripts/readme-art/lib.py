"""Shared toolkit for the README artwork: palette, outlined text and the site's shapes."""

import math
import os

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

HERE = os.path.dirname(os.path.abspath(__file__))
FONT_DIR = os.environ.get('FONT_DIR', os.path.join(HERE, 'fonts'))
OUT = os.environ.get('OUT_DIR', os.path.join(HERE, '..', '..', 'docs', 'art'))

INK = '#07060c'
PANEL = '#110f1b'
PANEL2 = '#191628'
LINE = '#2a2542'
LINE_B = '#4a4370'
TEXT = '#ece9f7'
DIM = '#9a94b8'
YEL = '#fcee0a'
MAG = '#ff2d7a'
CYAN = '#2de2ff'

TAN14 = math.tan(math.radians(14))


def num(v):
    s = f'{v:.1f}'
    return s[:-2] if s.endswith('.0') else s


class Face:
    """A font that turns text into outlined SVG path data."""

    def __init__(self, filename, axes=None):
        font = TTFont(os.path.join(FONT_DIR, filename))
        if axes:
            font = instancer.instantiateVariableFont(font, axes)
        self.font = font
        self.glyphs = font.getGlyphSet()
        self.cmap = font.getBestCmap()
        self.hmtx = font['hmtx']
        self.upm = font['head'].unitsPerEm
        self.cache = {}

    def advance(self, ch):
        name = self.cmap.get(ord(ch))
        return self.hmtx[name][0] if name else self.upm * 0.5

    def width(self, text, size, tracking=0.0):
        scale = size / self.upm
        return sum(self.advance(c) * scale for c in text) + tracking * len(text)

    def path(self, text, size, tracking=0.0):
        """Path data with the baseline at y=0 and the text starting at x=0."""
        scale = size / self.upm
        x = 0.0
        parts = []
        for ch in text:
            name = self.cmap.get(ord(ch))
            if name and ch != ' ':
                pen = SVGPathPen(self.glyphs, ntos=num)
                self.glyphs[name].draw(TransformPen(pen, (scale, 0, 0, -scale, x, 0)))
                parts.append(pen.getCommands())
            x += self.advance(ch) * scale + tracking
        return ''.join(parts)


TEKTUR = Face('Tektur.ttf', {'wght': 900, 'wdth': 80})
TEKTUR_BOLD = Face('Tektur.ttf', {'wght': 800, 'wdth': 90})
CHAKRA = Face('ChakraPetch-Regular.ttf')
CHAKRA_SEMI = Face('ChakraPetch-SemiBold.ttf')
CHAKRA_BOLD = Face('ChakraPetch-Bold.ttf')
MONO = Face('JetBrainsMono.ttf', {'wght': 500})
KANA = Face('ZenKakuGothicNew-Bold.ttf')


def text(face, s, size, x, y, fill, tracking=0.0, anchor='start', extra=''):
    """A positioned text path. anchor is start, middle or end."""
    w = face.width(s, size, tracking) - (tracking if s else 0)
    if anchor == 'middle':
        x -= w / 2
    elif anchor == 'end':
        x -= w
    return f'<path transform="translate({num(x)} {num(y)})" fill="{fill}" {extra} d="{face.path(s, size, tracking)}"/>'


def runs(face, parts, size, x, y, tracking=0.0):
    """Several coloured pieces of text on one line. parts is a list of (text, colour)."""
    out = []
    for s, fill in parts:
        out.append(text(face, s, size, x, y, fill, tracking))
        x += face.width(s, size, tracking)
    return ''.join(out)


def wrap(face, s, size, max_width, tracking=0.0):
    lines, line = [], ''
    for word in s.split(' '):
        trial = f'{line} {word}'.strip()
        if face.width(trial, size, tracking) <= max_width or not line:
            line = trial
        else:
            lines.append(line)
            line = word
    lines.append(line)
    return lines


def para(x, y, w, h, fill, extra=''):
    """A block leaning like the site's skewed blocks. x, y is the bottom-left corner of the top edge."""
    dx = h * TAN14
    pts = f'{num(x + dx)},{num(y)} {num(x + w + dx)},{num(y)} {num(x + w)},{num(y + h)} {num(x)},{num(y + h)}'
    return f'<polygon points="{pts}" fill="{fill}" {extra}/>'


def lang_switch(x, y, w, h, size=12.5):
    """The site's EN/NL switch: one slanted frame with the yellow slab filling the active half."""
    dx = h * TAN14
    frame = f'{num(x + dx)},{num(y)} {num(x + w + dx)},{num(y)} {num(x + w)},{num(y + h)} {num(x)},{num(y + h)}'
    slab = f'{num(x + dx)},{num(y)} {num(x + w / 2 + dx)},{num(y)} {num(x + w / 2)},{num(y + h)} {num(x)},{num(y + h)}'
    base = y + h / 2 + size * 0.36
    return (
        f'<polygon points="{slab}" fill="{YEL}"/>'
        f'<polygon points="{frame}" fill="none" stroke="{LINE_B}" stroke-width="1.5" stroke-linejoin="miter"/>'
        + text(CHAKRA_BOLD, 'EN', size, x + w / 4 + dx / 2, base, INK, 1, 'middle')
        + text(CHAKRA_BOLD, 'NL', size, x + w * 3 / 4 + dx / 2, base, DIM, 1, 'middle')
    )


def cut_panel(w, h, cut):
    """The cut-corner outline the site's cards use."""
    return f'M0 0H{num(w - cut)}L{num(w)} {num(cut)}V{num(h)}H{num(cut)}L0 {num(h - cut)}Z'


def bracket(x, y, size, color, corner):
    """An L-shaped corner bracket. corner is tl, tr, bl or br."""
    d = {
        'tl': f'M{x} {y + size}V{y}H{x + size}',
        'tr': f'M{x - size} {y}H{x}V{y + size}',
        'bl': f'M{x} {y - size}V{y}H{x + size}',
        'br': f'M{x - size} {y}H{x}V{y - size}',
    }[corner]
    return f'<path d="{d}" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="square"/>'


def dot_pattern(pid='dots', step=30, r=1.1, color=LINE, opacity=0.9):
    return (
        f'<pattern id="{pid}" width="{step}" height="{step}" patternUnits="userSpaceOnUse">'
        f'<circle cx="{step / 2}" cy="{step / 2}" r="{r}" fill="{color}" opacity="{opacity}"/></pattern>'
    )


def scanlines(pid='scan'):
    return (
        f'<pattern id="{pid}" width="4" height="4" patternUnits="userSpaceOnUse">'
        f'<rect width="4" height="1" fill="#000" opacity=".22"/></pattern>'
    )


STYLE_COMMON = """
@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
"""


def svg(w, h, title, desc, body, defs='', style=''):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img" aria-labelledby="t d">'
        f'<title id="t">{title}</title><desc id="d">{desc}</desc>'
        f'<defs>{defs}<style>{STYLE_COMMON}{style}</style></defs>{body}</svg>\n'
    )


def write(name, content):
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, name)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'{name}: {len(content) / 1024:.1f} KB')
