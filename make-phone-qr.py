from __future__ import annotations

import sys
from pathlib import Path

import qrcode
from PIL import Image, ImageDraw, ImageFont


INK = "#253330"
PAPER = "#f3ecdb"
SURFACE = "#fbf8ef"
LINE = "#c8c7b9"
LIME = "#b89142"
TEAL = "#9f392f"
MUTED = "#68716b"
SKY = "#dfeae3"
LEAF = "#24334f"
SAFFRON = "#2b7167"


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
    image = qr.make_image(fill_color=INK, back_color=SURFACE).convert("RGB")
    output.parent.mkdir(parents=True, exist_ok=True)
    image.save(output)
    return image


def make_board(preview: Image.Image, download: Image.Image, output: Path) -> None:
    width, height = 1_280, 900
    board = Image.new("RGB", (width, height), PAPER)
    draw = ImageDraw.Draw(board)

    # Quiet paper grain: enough tactility to feel printed, never enough to
    # interfere with either QR code.
    for y in range(22, height, 32):
        for x in range(22, width, 32):
            draw.ellipse((x, y, x + 2, y + 2), fill="#ded7c6")

    # Seal-led bilingual masthead.
    draw.rounded_rectangle((58, 47, 124, 113), radius=13, fill=TEAL)
    draw.text((74, 57), "萨", fill=SURFACE, font=font(34, True))
    draw.text((146, 49), "萨瓦迪卡", fill=INK, font=font(39, True))
    draw.text((149, 95), "SAWASDEE · 中泰双向学习", fill=SAFFRON, font=font(15, True))
    draw.rounded_rectangle((922, 57, 1_221, 105), radius=24, fill=SURFACE, outline=LINE, width=2)
    draw.text((955, 69), "同一 Wi‑Fi · 保持电脑服务开启", fill=LEAF, font=font(16, True))

    # One continuous Sino-Thai frieze: Chinese lattice rhythm, Thai jewel centre.
    draw.line((58, 143, 1_221, 143), fill=LIME, width=3)
    for x in range(78, 1_190, 64):
        draw.line([(x, 143), (x + 14, 132), (x + 28, 143), (x + 42, 132), (x + 56, 143)], fill=SAFFRON, width=2)
    draw.polygon([(633, 134), (642, 143), (633, 152), (624, 143)], fill=TEAL)

    # A restrained lotus/Kranok watermark balances the masthead.
    lotus = [(1_154, 174), (1_132, 147), (1_139, 120), (1_154, 100), (1_169, 120), (1_176, 147), (1_154, 174)]
    draw.line(lotus, fill=LIME, width=3, joint="curve")
    draw.line([(1_154, 170), (1_154, 111)], fill=SAFFRON, width=2)

    cards = [
        (54, 187, "01 · 扫码试玩", "手机浏览器直接打开", preview, SAFFRON, SKY),
        (662, 187, "02 · 安装到手机", "iPhone / Android · 安装指引", download, TEAL, SURFACE),
    ]
    for x, y, title, subtitle, qr_image, accent, panel in cards:
        draw.rounded_rectangle((x + 7, y + 9, x + 571, y + 596), radius=29, fill="#d8d0bf")
        draw.rounded_rectangle((x, y, x + 564, y + 587), radius=29, fill=panel, outline=LINE, width=2)
        draw.rounded_rectangle((x + 26, y + 24, x + 236, y + 66), radius=21, fill=accent)
        draw.text((x + 43, y + 31), title, fill=SURFACE, font=font(18, True))
        draw.text((x + 28, y + 84), subtitle, fill=INK, font=font(21, True))
        draw.line((x + 28, y + 121, x + 536, y + 121), fill=LINE, width=2)
        resized = qr_image.resize((394, 394), Image.Resampling.NEAREST)
        qr_x, qr_y = x + 85, y + 147
        draw.rounded_rectangle((qr_x - 12, qr_y - 12, qr_x + 406, qr_y + 406), radius=18, fill=SURFACE, outline=LINE, width=2)
        board.paste(resized, (qr_x, qr_y))
        draw.ellipse((x + 510, y + 37, x + 523, y + 50), fill=LIME if panel == SKY else SAFFRON)

    draw.rounded_rectangle((58, 810, 892, 856), radius=23, fill=SURFACE, outline=LINE, width=2)
    draw.text((81, 821), "临时局域网地址 · 换 Wi‑Fi 后需要重新生成二维码", fill=MUTED, font=font(17, True))
    draw.text((1_074, 818), "中  ×  TH", fill=SAFFRON, font=font(20, True))
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
