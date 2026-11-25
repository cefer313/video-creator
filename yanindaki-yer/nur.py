#!/usr/bin/env python3
"""İmamın üzündəki nurun içində üz cizgisi (çənə, burun xətti) bilinməsin deyə hər kadrda
üzü izləyib üstünə dəyirmi, mərkəzi tam qeyri-şəffaf isti nur çəkir.
İstifadə: python3 nur.py giriş.mp4 çıxış.mp4 X Y   (X,Y — ilk kadrda üzün təxmini mərkəzi, 1080×1920)"""
import sys, subprocess, numpy as np, cv2
from scipy import ndimage

src, dst, x0, y0 = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4])
cap = cv2.VideoCapture(src)
W, H = int(cap.get(3)), int(cap.get(4)); fps = cap.get(5)
enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}',
                        '-r', str(fps), '-i', '-', '-c:v', 'libx264', '-crf', '14', '-preset', 'fast',
                        '-pix_fmt', 'yuv420p', dst], stdin=subprocess.PIPE)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
cx, cy, R, alpha = x0, y0, 45.0, 0.0
area = None
core = np.array([228, 246, 255], np.float32)   # BGR: isti ağ
edge = np.array([150, 215, 255], np.float32)   # BGR: qızılı
i = 0
while True:
    ok, f = cap.read()
    if not ok: break
    fl = f.astype(np.float32)
    win = max(110, 2.4 * R)
    xa, xb = int(max(0, cx - win)), int(min(W, cx + win))
    ya, yb = int(max(0, cy - win)), int(min(H, cy + win))
    sub = fl[ya:yb, xa:xb]
    L = sub.mean(2)
    m = (L > 226) & (sub[..., 0] > 150)          # çox parlaq, mavi kanal da yüksək → ağımtıl nur
    lab, n = ndimage.label(m)
    found = False
    if n:
        sizes = ndimage.sum(m, lab, range(1, n + 1))
        k = int(np.argmax(sizes)) + 1
        ys, xs = np.nonzero(lab == k)
        ncx, ncy = (xs.mean() + xa, ys.mean() + ya) if len(xs) else (cx, cy)
        jump = np.hypot(ncx - cx, ncy - cy)
        okA = sizes[k - 1] > 250 and (area is None or sizes[k - 1] > 0.35 * area)
        okJ = i == 0 or jump < max(30, 0.6 * R)          # başqa işığa (lampa, əks) sıçramasın
        if okA and okJ:
            area = sizes[k - 1] if area is None else 0.7 * area + 0.3 * sizes[k - 1]
            ext = max(np.ptp(xs), np.ptp(ys)) / 2
            nR = ext * 0.8 + 8
            a = 0.5 if i else 1.0
            cx += a * (ncx - cx); cy += a * (ncy - cy); R += a * (nR - R)
            found = True
    alpha = min(1.0, alpha + 0.25) if found else max(0.0, alpha - 0.12)
    if alpha > 0:
        d = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / R
        a_map = np.clip(1.0 - (d - 0.95) / 0.9, 0, 1) ** 1.8          # d<0.95: tam örtük, sonra yumşaq keçid
        col_t = np.clip(d - 0.6, 0, 1.2)[..., None] / 1.2
        col = core * (1 - col_t) + edge * col_t
        a3 = (a_map * alpha)[..., None]
        fl = fl * (1 - a3) + col * a3
        f = np.clip(fl, 0, 255).astype(np.uint8)
    enc.stdin.write(f.tobytes()); i += 1
enc.stdin.close(); enc.wait()
print(src, 'kadr:', i)
