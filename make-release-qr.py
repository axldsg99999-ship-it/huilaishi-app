from __future__ import annotations

from pathlib import Path

import qrcode
from PIL import Image, ImageDraw, ImageFont


INK = "#0b1020"
PAPER = "#f7f2e8"
LIME = "#c8ff4a"
TEAL = "#25d7c5"
MUTED = "#8f99ad"
OUTPUT = Path(__file__).resolve().parent / "output"
APPLE_URL = "https://axldsg99999-ship-it.github.io/huilaishi-app/?install=ios"
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


def make_board(apple: Image.Image, android: Image.Image) -> None:
    width, height = 1_280, 920
    board = Image.new("RGB", (width, height), PAPER)
    draw = ImageDraw.Draw(board)
    draw.rounded_rectangle((34, 32, width - 34, height - 32), radius=46, fill=INK)
    draw.text((82, 70), "会来事 12.6 · 手机安装", fill=PAPER, font=font(42, True))
    draw.text((82, 130), "中国人学泰语 · 泰国人学中文 · 双向互动", fill=MUTED, font=font(22))

    cards = [
        (70, "APPLE · 现在可用", "Safari 安装 PWA", "分享 → 添加到主屏幕", apple, TEAL),
        (650, "SAMSUNG · 12.6-R1", "下载签名 APK", "支持从 12.5 覆盖升级", android, LIME),
    ]
    for x, kicker, title, subtitle, qr, accent in cards:
        draw.rounded_rectangle((x, 198, x + 560, 790), radius=32, fill="#ffffff")
        draw.rounded_rectangle((x + 24, 222, x + 270, 263), radius=20, fill=accent)
        draw.text((x + 41, 230), kicker, fill=INK, font=font(18, True))
        draw.text((x + 28, 290), title, fill=INK, font=font(31, True))
        draw.text((x + 28, 337), subtitle, fill="#697083", font=font(19))
        board.paste(qr.resize((390, 390), Image.Resampling.NEAREST), (x + 85, 377))

    draw.text((82, 823), "公开测试版 · 3,000 核心训练卡 · 8 款游戏 · 3 种对战", fill="#a5aec2", font=font(20))
    draw.text((82, 858), "中泰文本与发音仍待项目方安排母语教师逐条终审", fill="#69758a", font=font(17))
    board.save(OUTPUT / "会来事12.6-双平台安装二维码.png")


def main() -> None:
    apple = save_qr(APPLE_URL, "会来事12.6-苹果安装二维码.png")
    android = save_qr(ANDROID_URL, "会来事12.6-三星APK二维码.png")
    make_board(apple, android)
    print(APPLE_URL)
    print(ANDROID_URL)


if __name__ == "__main__":
    main()
