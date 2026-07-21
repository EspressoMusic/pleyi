"""Extract mascot icon only from Pleyi banner."""
from pathlib import Path

from PIL import Image
import numpy as np

SRC = Path(
    r"C:\Users\Nirhdhd\.cursor\projects\c-Users-Nirhdhd-Projects-english-tutor-games\assets\c__Users_Nirhdhd_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image-93d6bda9-6e5d-4a7a-a085-e1b6c093df07.png"
)
OUT = Path(__file__).resolve().parents[1] / "public" / "images" / "pleyi-logo.png"

arr = np.array(Image.open(SRC).convert("RGBA"))
x0, x1, y0, y1 = 18, 56, 1, 58
icon = arr[y0:y1, x0:x1].copy()

rgb = icon[:, :, :3].astype(int)
dark = rgb.max(axis=2) < 95
white = (rgb[:, :, 0] > 235) & (rgb[:, :, 1] > 235) & (rgb[:, :, 2] > 235)
keep = dark | white
icon[:, :, 3] = np.where(keep, 255, 0).astype(np.uint8)

result = Image.fromarray(icon, "RGBA")
result = result.resize((result.width * 8, result.height * 8), Image.Resampling.NEAREST)
result = result.crop(result.getbbox())

OUT.parent.mkdir(parents=True, exist_ok=True)
result.save(OUT, "PNG")
print(f"Saved {OUT} ({result.size[0]}x{result.size[1]})")
