"""Render the existing CSS house mark as crawlable square brand icons.

Run from the repository root with Python 3 and Pillow installed.
Palette and roof/door motif follow styles.css; no external artwork is used.
"""
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SCALE = 4
image = Image.new('RGB', (512 * SCALE, 512 * SCALE), '#f8f3e9')
draw = ImageDraw.Draw(image)

def points(coords):
    return [(x * SCALE, y * SCALE) for x, y in coords]

draw.line(points([(108, 238), (108, 412), (404, 412), (404, 238)]),
          fill='#25483d', width=20 * SCALE, joint='curve')
draw.line(points([(76, 244), (256, 78), (436, 244)]),
          fill='#25483d', width=20 * SCALE, joint='curve')
draw.rounded_rectangle((220 * SCALE, 304 * SCALE, 292 * SCALE, 411 * SCALE),
                       radius=9 * SCALE, fill='#d2a85f')
for size, name in [(512, 'brand-mark.png'), (96, 'favicon.png')]:
    image.resize((size, size), Image.Resampling.LANCZOS).save(ROOT / name, optimize=True)
image.resize((96, 96), Image.Resampling.LANCZOS).save(
    ROOT / 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48), (96, 96)])
