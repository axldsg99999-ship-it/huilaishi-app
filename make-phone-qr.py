from __future__ import annotations

import sys
from pathlib import Path

import qrcode
from PIL import Image, ImageDraw, ImageFont


INK = "#0b1020"
PAPER = "#f7f2e8"
LIME = "#c8ff4a"
TEAL = "#25d7c5"
MUTED = "#697083"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    names = ["msyhbd.ttc" if bold else "msyh.ttc", "segoeuib.ttf" if bold else "segoeui.ttf"]
    for name in names:
        candidate = Path("C:/Windows/Fonts") / name
        if candidate.exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


def make_qr(url: str, output: Path) -> Image.Image:
    qr = qrcode.QRCode(version=None, box_size=10, border=4, error_correction=qrcode.constants.ERROR_CORRECT_M)
    qr.add_data(url)
    qr.make(fit=True)
    image = qr.make_image(fill_color=INK, back_color=PAPER).convert("RGB")
    output.parent.mkdir(parents=True, exist_ok=True)
    image.save(output)
    return image


def make_board(preview: Image.Image, download: Image.Image, output: Path) -> None:
    width, height = 1_280, 900
    board = Image.new("RGB", (width, height), PAPER)
    draw = ImageDraw.Draw(board)
    draw.rounded_rectangle((38, 36, width - 38, height - 36), radius=42, fill=INK)
    draw.text((82, 72), "会来事 · 手机双码", fill=PAPER, font=font(42, True))
    draw.text((82, 128), "同一 Wi‑Fi · 黑色服务窗口需保持开启", fill="#9ba3b6", font=font(23))

    cards = [
        (70, 192, "01  扫码试玩", "手机浏览器直接打开", preview, TEAL),
        (650, 192, "02  下载离线版", "Android HTML · 六级 3000 条", download, LIME),
    ]
    for x, y, title, subtitle, qr_image, accent in cards:
        draw.rounded_rectangle((x, y, x + 560, y + 586), radius=32, fill="#ffffff")
        draw.rounded_rectangle((x + 24, y + 23, x + 171, y + 62), radius=19, fill=accent)
        draw.text((x + 39, y + 30), title, fill=INK, font=font(20, True))
        draw.text((x + 25, y + 80), subtitle, fill=MUTED, font=font(21))
        resized = qr_image.resize((440, 440), Image.Resampling.NEAREST)
        board.paste(resized, (x + 60, y + 125))

    draw.text((82, 822), "下载码是临时局域网地址；换 Wi‑Fi 后请重新启动生成。", fill="#7e8799", font=font(20))
    output.parent.mkdir(parents=True, exist_ok=True)
    board.save(output)


def main() -> None:
    if len(sys.argv) != 6:
        raise SystemExit("usage: make-phone-qr.py PREVIEW_URL PREVIEW_PNG DOWNLOAD_URL DOWNLOAD_PNG BOARD_PNG")
    preview_url, preview_path, download_url, download_path, board_path = sys.argv[1:]
    preview = make_qr(preview_url, Path(preview_path))
    download = make_qr(download_url, Path(download_path))
    make_board(preview, download, Path(board_path))


if __name__ == "__main__":
    main()
