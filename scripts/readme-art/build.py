"""Builds every SVG in docs/art. Run it from anywhere: python3 scripts/readme-art/build.py"""

import banner
import pieces

banner.write('banner.svg', banner.build())
pieces.build_all()
