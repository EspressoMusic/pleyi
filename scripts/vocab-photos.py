"""Turn picture files into vocab images: public/images/english/vocab/<id>.svg.

The site loads every vocab picture as <id>.svg, so a picture is cleaned
(faint background haze and loose specks removed), trimmed, shrunk and
embedded as WebP inside an SVG with the same 120x120 viewBox as the drawings.

    python scripts/vocab-photos.py path/to/1.png=dog path/to/2.png=cat ...
"""
import base64
import io
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

OUT_DIR = Path(__file__).resolve().parent.parent / "public" / "images" / "english" / "vocab"
SIZE = 400          # px, square output
MARGIN = 0.05       # empty border around the picture, part of SIZE
ALPHA_CUT = 64      # alpha below this is background haze
SPECK_PART = 0.01   # blobs smaller than this part of the biggest one are dropped


def clean(img):
    rgba = np.array(img.convert("RGBA"))
    alpha = rgba[:, :, 3]
    alpha[alpha < ALPHA_CUT] = 0
    labels, count = ndimage.label(alpha > 0)
    if count:
        areas = ndimage.sum(np.ones_like(alpha), labels, range(1, count + 1))
        keep = np.isin(labels, 1 + np.flatnonzero(areas >= areas.max() * SPECK_PART))
        alpha[~keep] = 0
    # one pixel in from the edge, softly, so leftover colour fringes vanish
    inner = ndimage.binary_erosion(alpha > 0, iterations=1)
    alpha[(alpha > 0) & ~inner] //= 3
    rgba[:, :, 3] = alpha
    return Image.fromarray(rgba)


def fit_square(img):
    img = img.crop(img.getbbox())
    inner = round(SIZE * (1 - 2 * MARGIN))
    img.thumbnail((inner, inner), Image.LANCZOS)
    canvas = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    canvas.paste(img, ((SIZE - img.width) // 2, (SIZE - img.height) // 2), img)
    return canvas


def to_svg(img):
    buf = io.BytesIO()
    img.save(buf, "WEBP", quality=82, method=6)
    data = base64.b64encode(buf.getvalue()).decode("ascii")
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">'
        f'<image width="120" height="120" href="data:image/webp;base64,{data}"/></svg>\n'
    )


def main(pairs):
    for pair in pairs:
        src, word_id = pair.rsplit("=", 1)
        out = OUT_DIR / f"{word_id}.svg"
        out.write_text(to_svg(fit_square(clean(Image.open(src)))), encoding="utf-8")
        print(f"{word_id}.svg  {out.stat().st_size // 1024} KB")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1:])
