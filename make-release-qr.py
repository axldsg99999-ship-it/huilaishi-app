from __future__ import annotations

from pathlib import Path

import qrcode
from PIL import Image, ImageDraw, ImageFont


INK = "#241d19"
PAPER = "#f1e4c7"
SURFACE = "#fff8e7"
LINE = "#241d19"
LIME = "#d6aa43"
TEAL = "#b63c32"
MUTED = "#62574c"
OUTPUT = Path(__file__).resolve().parent / "output"
WEB_URL = "https://axldsg99999-ship-it.github.io/huilaishi-app/?install=android"
ANDROID_URL = "https://github.com/axldsg99999-ship-it/huilaishi-app/releases/download/v12.6.0-samsung.1/huilaishi-samsung-12.6.0-r1-release.apk"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = ["msyhbd.ttc" if bold else "msyh.ttc", "segoeuib.ttf" if bold else "segoeui.ttf"]
    for name in candidates:
        path = Path("C:/Windows/Fonts") / name
        if path.exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def qr_image(url: str) -> Image.Image:
    qr = qrcode.QRCode(box_size=12, border=4, error_correction=qrcode.constants.ERROR_CORRECT_M)
    qr.add_data(url)
    qr.make(fit=True)
    return qr.make_image(fill_color=INK, back_color=PAPER).convert("RGB")


def save_qr(url: str, name: str) -> Image.Image:
    image = qr_image(url)
    OUTPUT.mkdir(parents=True, exist_ok=True)
    image.save(OUTPUT / name)
    return image


def make_board(web: Image.Image, android: Image.Image) -> None:
    width, height = 1_280, 920
    board = Image.new("RGB", (width, height), PAPER)
    draw = ImageDraw.Draw(board)
    draw.rounded_rectangle((34, 32, width - 34, height - 32), radius=46, fill=SURFACE, outline=LINE, width=2)
    draw.text((82, 70), "萨瓦迪卡 12.6 · 三星 A57 专用入口", fill=INK, font=font(42, True))
    draw.text((82, 130), "中国人学泰语 · 泰国人学中文 · 双向互动", fill=MUTED, font=font(22))

    cards = [
        (70, "网页 · 立即打开", "公网网页版", "Chrome / 三星浏览器直接打开", web, TEAL),
        (650, "SAMSUNG · 12.6-R1", "下载签名 APK", "下载后允许安装未知应用", android, LIME),
    ]
    for x, kicker, title, subtitle, qr, accent in cards:
        draw.rounded_rectangle((x, 198, x + 560, 790), radius=28, fill=SURFACE, outline=LINE, width=2)
        draw.rounded_rectangle((x + 24, 222, x + 270, 263), radius=20, fill=accent)
        draw.text((x + 41, 230), kicker, fill=SURFACE if accent == TEAL else INK, font=font(18, True))
        draw.text((x + 28, 290), title, fill=INK, font=font(31, True))
        draw.text((x + 28, 337), subtitle, fill="#697083", font=font(19))
        board.paste(qr.resize((390, 390), Image.Resampling.NEAREST), (x + 85, 377))

    draw.text((82, 823), "公网入口 · 不需要同一 Wi‑Fi · 不依赖电脑服务", fill=MUTED, font=font(20))
    draw.text((82, 858), "若网页仍打不开，请暂时关闭 VPN / 私人 DNS 后重试", fill=MUTED, font=font(17))
    board.save(OUTPUT / "萨瓦迪卡12.6-三星A57双码.png")


def main() -> None:
    web = save_qr(WEB_URL, "萨瓦迪卡12.6-网页体验二维码.png")
    android = save_qr(ANDROID_URL, "萨瓦迪卡12.6-三星APK二维码.png")
    make_board(web, android)
    print(WEB_URL)
    print(ANDROID_URL)


if __name__ == "__main__":
    main()
