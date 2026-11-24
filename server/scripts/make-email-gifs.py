"""Draws the animated order-progress strips used in the order emails.

One GIF per order step (placed, confirmed, printing & framing, shipped,
delivered): the route with the steps done so far, a gold glint running along
it, a pulsing ring and a bobbing icon at the current step, and a few sparkles.
Shown 560 × 100 in the email (drawn at 2×, from a 3× sketch for smooth edges).

    python server/scripts/make-email-gifs.py

Writes client/public/images/email/route-<step>.gif (served by the site).
"""

import math
from pathlib import Path

from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parents[2] / 'client' / 'public' / 'images' / 'email'
W, H = 1120, 200          # the GIF (2× its size in the email)
S = 3                     # sketch scale
FRAMES = 24
FRAME_MS = 70

BG = (255, 255, 255)
OLIVE = (62, 74, 31)
OLIVE_LIGHT = (159, 179, 106)
LINE = (221, 220, 212)
GOLD = (232, 179, 58)
KRAFT = (199, 159, 108)
KRAFT_DARK = (169, 131, 83)
TERRACOTTA = (200, 100, 59)
CREAM = (244, 239, 225)
INK = (28, 31, 23)

# Station centres: the middles of five equal columns (the labels sit under them in the email).
XS = [112 + i * 224 for i in range(5)]
Y = 150


def mix(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def circle(d, x, y, r, fill=None, outline=None, width=0):
    d.ellipse([(x - r) * S, (y - r) * S, (x + r) * S, (y + r) * S], fill=fill, outline=outline, width=width * S)


def line(d, points, fill, width):
    d.line([(x * S, y * S) for x, y in points], fill=fill, width=width * S, joint='curve')
    for x, y in (points[0], points[-1]):
        circle(d, x, y, width / 2, fill=fill)


def rect(d, x0, y0, x1, y1, fill, radius=0, outline=None, width=0):
    d.rounded_rectangle([x0 * S, y0 * S, x1 * S, y1 * S], radius=radius * S, fill=fill, outline=outline, width=width * S)


def star(d, x, y, r, fill):
    pts = []
    for i in range(8):
        a = math.pi / 4 * i - math.pi / 2
        rr = r if i % 2 == 0 else r * 0.34
        pts.append(((x + math.cos(a) * rr) * S, (y + math.sin(a) * rr) * S))
    d.polygon(pts, fill=fill)


def tick(d, x, y, size, fill, width=4):
    d.line([((x - size * 0.5) * S, (y + size * 0.02) * S), ((x - size * 0.12) * S, (y + size * 0.4) * S), ((x + size * 0.55) * S, (y - size * 0.38) * S)], fill=fill, width=width * S, joint='curve')


# ---------- The icons over the current step ----------

def icon_bag(d, x, y):
    rect(d, x - 26, y - 18, x + 26, y + 26, KRAFT, radius=6)
    d.arc([(x - 13) * S, (y - 36) * S, (x + 13) * S, (y - 4) * S], 180, 360, fill=KRAFT_DARK, width=5 * S)
    rect(d, x - 26, y - 2, x + 26, y + 6, CREAM)
    star(d, x, y + 16, 7, OLIVE)


def icon_chat(d, x, y):
    rect(d, x - 32, y - 26, x + 32, y + 18, OLIVE, radius=14)
    d.polygon([((x - 14) * S, (y + 16) * S), ((x - 24) * S, (y + 32) * S), ((x - 2) * S, (y + 16) * S)], fill=OLIVE)
    tick(d, x, y - 4, 26, CREAM, 5)


def icon_frame(d, x, y):
    rect(d, x - 30, y - 30, x + 30, y + 30, INK, radius=2)
    rect(d, x - 23, y - 23, x + 23, y + 23, (251, 250, 246))
    rect(d, x - 16, y - 16, x + 16, y + 16, TERRACOTTA)
    d.polygon([((x - 16) * S, (y + 16) * S), ((x - 3) * S, (y - 2) * S), ((x + 5) * S, (y + 8) * S), ((x + 10) * S, (y + 2) * S), ((x + 16) * S, (y + 16) * S)], fill=OLIVE)
    circle(d, x + 8, y - 8, 4, fill=GOLD)


def icon_van(d, x, y):
    rect(d, x - 40, y - 24, x + 14, y + 16, OLIVE, radius=5)
    d.polygon([((x + 14) * S, (y - 12) * S), ((x + 30) * S, (y - 12) * S), ((x + 40) * S, (y + 2) * S), ((x + 40) * S, (y + 16) * S), ((x + 14) * S, (y + 16) * S)], fill=OLIVE)
    d.polygon([((x + 18) * S, (y - 8) * S), ((x + 28) * S, (y - 8) * S), ((x + 35) * S, (y + 2) * S), ((x + 18) * S, (y + 2) * S)], fill=(207, 224, 232))
    rect(d, x - 40, y + 4, x + 40, y + 9, CREAM)
    for wx in (x - 24, x + 26):
        circle(d, wx, y + 18, 9, fill=INK)
        circle(d, wx, y + 18, 4, fill=(200, 200, 200))


def icon_home(d, x, y):
    d.polygon([((x - 36) * S, (y - 4) * S), ((x) * S, (y - 34) * S), ((x + 36) * S, (y - 4) * S)], fill=TERRACOTTA)
    rect(d, x - 28, y - 6, x + 28, y + 28, CREAM)
    rect(d, x - 8, y + 6, x + 8, y + 28, OLIVE, radius=2)
    rect(d, x - 23, y + 2, x - 13, y + 12, (207, 224, 232))
    rect(d, x + 13, y + 2, x + 23, y + 12, (207, 224, 232))


ICONS = [icon_bag, icon_chat, icon_frame, icon_van, icon_home]


def draw_frame(step, f, cancelled=False):
    t = f / FRAMES
    img = Image.new('RGB', (W * S, H * S), BG)
    d = ImageDraw.Draw(img)

    # The route: dotted ahead, solid olive up to the current step.
    for x in range(XS[0], XS[-1], 18):
        circle(d, x, Y, 2.6, fill=LINE)
    if step > 0:
        line(d, [(XS[0], Y), (XS[step], Y)], OLIVE, 8)
        # A gold glint running along the finished part.
        span = XS[step] - XS[0]
        gx = XS[0] + (t * 1.4 % 1.4) * span - 40
        for k in range(14):
            px = gx + k * 6
            if XS[0] <= px <= XS[step]:
                fade = math.sin(k / 13 * math.pi)
                circle(d, px, Y, 3.2, fill=mix(OLIVE, GOLD, fade))

    # The steps: done (olive with a tick), current (bigger, pulsing), still to come.
    for i, x in enumerate(XS):
        if i < step:
            circle(d, x, Y, 16, fill=OLIVE)
            tick(d, x, Y, 15, CREAM, 3)
        elif i == step:
            colour = TERRACOTTA if cancelled else OLIVE
            for ring in range(2):
                p = (t + ring * 0.5) % 1
                circle(d, x, Y, 22 + p * 24, outline=mix(colour, BG, 0.35 + p * 0.65), width=3)
            circle(d, x, Y, 22, fill=colour)
            circle(d, x, Y, 9, fill=CREAM)
        else:
            circle(d, x, Y, 13, fill=BG, outline=LINE, width=4)

    # The icon over the current step, bobbing, with sparkles twinkling round it.
    x = XS[step]
    bob = math.sin(t * 2 * math.pi) * 5
    ICONS[step](d, x, 66 + bob)
    for k, (dx, dy, r) in enumerate([(-58, -24, 9), (54, -40, 7), (60, 6, 6), (-50, 18, 5)]):
        p = (t * 2 + k * 0.27) % 1
        size = r * max(0, math.sin(p * math.pi))
        if size > 0.6:
            star(d, x + dx, 66 + dy, size, GOLD)

    return img.resize((W, H), Image.LANCZOS)


def save(step, name, cancelled=False):
    frames = [draw_frame(step, f, cancelled) for f in range(FRAMES)]
    # One palette for every frame (so colours don't shimmer): quantise them all as
    # one tall image, then cut the frames back out — the background stays exactly white.
    sheet = Image.new('RGB', (W, H * len(frames)), BG)
    for index, frame in enumerate(frames):
        sheet.paste(frame, (0, index * H))
    sheet = sheet.quantize(colors=128, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    gif = [sheet.crop((0, index * H, W, (index + 1) * H)) for index in range(len(frames))]
    path = OUT / name
    gif[0].save(path, save_all=True, append_images=gif[1:], duration=FRAME_MS, loop=0, optimize=True, disposal=1)
    print(path.name, f'{path.stat().st_size // 1024} KB')


if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    for step, name in enumerate(['placed', 'confirmed', 'framing', 'shipped', 'delivered']):
        save(step, f'route-{name}.gif')
    save(0, 'route-cancelled.gif', cancelled=True)
