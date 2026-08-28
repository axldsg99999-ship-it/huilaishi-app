from __future__ import annotations

from pathlib import Path

import qrcode
from PIL import Image, ImageDraw, ImageFont


INK = "#172a25"
PAPER = "#e9e1d1"
SURFACE = "#fffdf8"
LINE = "#d3cdc1"
GOLD = "#c9a758"
JADE = "#28695f"
CINNABAR = "#b84b39"
INDIGO = "#213352"
MUTED = "#68736e"
OUTPUT = Path(__file__).resolve().parent / "output"
WEB_URL = "https://axldsg99999-ship-it.github.io/huilaishi-app/samsung-v60.html"
ANDROID_URL = "https://github.com/axldsg99999-ship-it/huilaishi-app/releases/download/v12.6.3-samsung.1/huilaishi-samsung-12.6.3-r1-release.apk"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = ["msyhbd.ttc" if bold else "msyh.ttc", "segoeuib.ttf" if bold else "segoeui.ttf"]
    for name in candidates:
        path = Path("C:/Windows/Fonts") / name
        if path.exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def thai_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = ["LeelaUIb.ttf" if bold else "LeelawUI.ttf", "tahomabd.ttf" if bold else "tahoma.ttf"]
    for name in candidates:
        path = Path("C:/Windows/Fonts") / name
        if path.exists():
            return ImageFont.truetype(path, size)
    return font(size, bold)


def qr_image(url: str) -> Image.Image:
    qr = qrcode.QRCode(box_size=12, border=4, error_correction=qrcode.constants.ERROR_CORRECT_M)
    qr.add_data(url)
    qr.make(fit=True)
    return qr.make_image(fill_color=INK, back_color=SURFACE).convert("RGB")


def save_qr(url: str, name: str) -> Image.Image:
    image = qr_image(url)
    OUTPUT.mkdir(parents=True, exist_ok=True)
    image.save(OUTPUT / name)
    return image


def make_board(web: Image.Image, android: Image.Image) -> None:
    width, height = 1_280, 920
    board = Image.new("RGB", (width, height), PAPER)
    draw = ImageDraw.Draw(board)
    draw.rounded_rectangle((34, 32, width - 34, height - 32), radius=42, fill=SURFACE, outline=LINE, width=2)
    draw.rounded_rectangle((82, 69, 132, 119), radius=10, fill=CINNABAR)
    draw.text((93, 75), "萨", fill=SURFACE, font=font(28, True))
    draw.text((151, 67), "萨瓦迪卡 12.6.3", fill=INK, font=font(40, True))
    draw.text((151, 120), "中国人学泰语 · 泰国人学中文 · 中泰编辑风", fill=MUTED, font=font(21))
    draw.text((1008, 82), "สวัสดีค่ะ", fill=JADE, font=thai_font(25, True))
    draw.line((82, 170, 1198, 170), fill=LINE, width=2)
    draw.line((82, 170, 372, 170), fill=CINNABAR, width=4)
    draw.line((372, 170, 739, 170), fill=GOLD, width=4)
    draw.line((739, 170, 1198, 170), fill=JADE, width=4)

    cards = [
        (70, "网页 · 稳定入口", "直接打开主菜单", "不依赖电脑 · 支持苹果与安卓浏览器", web, JADE),
        (650, "SAMSUNG · 12.6.3-R1", "下载签名 APK", "固定签名 · 可覆盖升级 · 完整离线内容", android, INDIGO),
    ]
    for x, kicker, title, subtitle, qr, accent in cards:
        draw.rounded_rectangle((x + 5, 204, x + 565, 796), radius=28, fill="#ded8cb")
        draw.rounded_rectangle((x, 198, x + 560, 790), radius=28, fill=SURFACE, outline=LINE, width=2)
        draw.rounded_rectangle((x + 24, 222, x + 285, 263), radius=20, fill=accent)
        draw.text((x + 41, 230), kicker, fill=SURFACE, font=font(18, True))
        draw.text((x + 28, 290), title, fill=INK, font=font(31, True))
        draw.text((x + 28, 337), subtitle, fill=MUTED, font=font(18))
        board.paste(qr.resize((390, 390), Image.Resampling.NEAREST), (x + 85, 377))

    draw.text((82, 823), "左码：网页体验与苹果主屏安装　　右码：三星签名 APK", fill=INK, font=font(20, True))
    draw.text((82, 858), "发布前已通过短屏、离线壳、安卓原生与 iOS 模拟器检查", fill=MUTED, font=font(17))
    board.save(OUTPUT / "萨瓦迪卡12.6.3-三星A57双码.png")


def main() -> None:
    web = save_qr(WEB_URL, "萨瓦迪卡12.6.3-网页体验二维码.png")
    android = save_qr(ANDROID_URL, "萨瓦迪卡12.6.3-三星APK二维码.png")
    make_board(web, android)
    print(WEB_URL)
    print(ANDROID_URL)


if __name__ == "__main__":
    main()
