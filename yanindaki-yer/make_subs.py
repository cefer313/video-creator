#!/usr/bin/env python3
"""Altyazı və başlıq PNG-ləri (1080×1920, şəffaf). Şrift: Inter (Azərbaycan hərfləri, böyük Ə daxil)."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
os.makedirs('subs', exist_ok=True)
BOLD = '/usr/share/fonts/opentype/inter/Inter-Bold.otf'
W, H = 1080, 1920

def sub(name, text, y=1480, size=62):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    f = ImageFont.truetype(BOLD, size)
    lines = text.split('\n')
    boxes = [d.textbbox((0, 0), l, font=f) for l in lines]
    lh = size * 1.3; tot = lh * len(lines)
    bw = max(b[2]-b[0] for b in boxes) + 70
    x0 = (W - bw) / 2; y0 = y - 30
    d.rounded_rectangle([x0, y0, x0 + bw, y0 + tot + 40], 28, fill=(0, 0, 0, 140))
    for i, (l, b) in enumerate(zip(lines, boxes)):
        d.text(((W - (b[2]-b[0])) / 2, y + i*lh), l, font=f, fill=(255, 255, 255, 255))
    im.save(f'subs/{name}.png')

def title(name, text, sub_text):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ds = ImageDraw.Draw(sh); d = ImageDraw.Draw(im)
    f = ImageFont.truetype(BOLD, 104); f2 = ImageFont.truetype('/usr/share/fonts/opentype/inter/Inter-Medium.otf', 40)
    b = d.textbbox((0, 0), text, font=f); b2 = d.textbbox((0, 0), sub_text, font=f2)
    for dd, ff, bb, yy in [(ds, f, b, 300), (ds, f2, b2, 430)]:
        pass
    ds.text(((W-(b[2]-b[0]))/2, 300), text, font=f, fill=(0, 0, 0, 200))
    ds.text(((W-(b2[2]-b2[0]))/2, 432), sub_text, font=f2, fill=(0, 0, 0, 200))
    sh = sh.filter(ImageFilter.GaussianBlur(10))
    im = Image.alpha_composite(sh, im); d = ImageDraw.Draw(im)
    d.text(((W-(b[2]-b[0]))/2, 300), text, font=f, fill=(255, 244, 220, 255))
    d.text(((W-(b2[2]-b2[0]))/2, 432), sub_text, font=f2, fill=(255, 236, 200, 235))
    im.save(f'subs/{name}.png')

title('title', 'Yanındakı yer', 'bədii təsəvvür')
sub('s1', '«Qardaş, bir az tez!»')
sub('s2', '«Bağışla, qardaş...»')
sub('s3', '«Ay qızım, çatdın?»')
sub('s4', '«Baba!»')
sub('s5', '«Allahım...\nİslam ümmətini xilas elə.»', y=1400)
print('ok')
