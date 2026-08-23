#!/usr/bin/env python3
"""Dependency-free PNG comparison for Android interaction smoke tests."""

from __future__ import annotations

import struct
import sys
import zlib
from pathlib import Path


def paeth(left: int, above: int, upper_left: int) -> int:
    prediction = left + above - upper_left
    distance_left = abs(prediction - left)
    distance_above = abs(prediction - above)
    distance_upper_left = abs(prediction - upper_left)
    if distance_left <= distance_above and distance_left <= distance_upper_left:
        return left
    if distance_above <= distance_upper_left:
        return above
    return upper_left


def read_png(path: Path) -> tuple[int, int, int, bytes]:
    data = path.read_bytes()
    if not data.startswith(b"\x89PNG\r\n\x1a\n"):
        raise ValueError(f"{path} is not a PNG")

    offset = 8
    width = height = bit_depth = color_type = interlace = None
    compressed = bytearray()
    while offset < len(data):
        length = struct.unpack(">I", data[offset : offset + 4])[0]
        chunk_type = data[offset + 4 : offset + 8]
        chunk_data = data[offset + 8 : offset + 8 + length]
        offset += length + 12
        if chunk_type == b"IHDR":
            width, height, bit_depth, color_type, _, _, interlace = struct.unpack(
                ">IIBBBBB", chunk_data
            )
        elif chunk_type == b"IDAT":
            compressed.extend(chunk_data)
        elif chunk_type == b"IEND":
            break

    channels = {0: 1, 2: 3, 4: 2, 6: 4}.get(color_type)
    if not width or not height or bit_depth != 8 or channels is None or interlace != 0:
        raise ValueError(f"unsupported PNG layout in {path}")

    raw = zlib.decompress(bytes(compressed))
    stride = width * channels
    rows = bytearray(height * stride)
    source_offset = 0
    previous = bytearray(stride)
    for row_index in range(height):
        filter_type = raw[source_offset]
        source_offset += 1
        scanline = bytearray(raw[source_offset : source_offset + stride])
        source_offset += stride
        reconstructed = bytearray(stride)
        for byte_index, value in enumerate(scanline):
            left = reconstructed[byte_index - channels] if byte_index >= channels else 0
            above = previous[byte_index]
            upper_left = previous[byte_index - channels] if byte_index >= channels else 0
            if filter_type == 0:
                predictor = 0
            elif filter_type == 1:
                predictor = left
            elif filter_type == 2:
                predictor = above
            elif filter_type == 3:
                predictor = (left + above) // 2
            elif filter_type == 4:
                predictor = paeth(left, above, upper_left)
            else:
                raise ValueError(f"unsupported PNG filter {filter_type} in {path}")
            reconstructed[byte_index] = (value + predictor) & 0xFF
        start = row_index * stride
        rows[start : start + stride] = reconstructed
        previous = reconstructed
    return width, height, channels, bytes(rows)


def changed_ratio(before_path: Path, after_path: Path) -> float:
    before_width, before_height, before_channels, before = read_png(before_path)
    after_width, after_height, after_channels, after = read_png(after_path)
    if (before_width, before_height, before_channels) != (
        after_width,
        after_height,
        after_channels,
    ):
        raise ValueError("screenshots have different dimensions or color layouts")

    top = before_height // 12
    bottom = before_height * 11 // 12
    stride = before_width * before_channels
    changed = total = 0
    for y in range(top, bottom):
        row = y * stride
        for x in range(before_width):
            offset = row + x * before_channels
            channel_delta = sum(
                abs(before[offset + channel] - after[offset + channel])
                for channel in range(min(3, before_channels))
            )
            changed += channel_delta >= 45
            total += 1
    return changed / max(total, 1)


def main() -> int:
    if len(sys.argv) != 3:
        print("usage: compare-android-screens.py BEFORE.png AFTER.png", file=sys.stderr)
        return 2
    ratio = changed_ratio(Path(sys.argv[1]), Path(sys.argv[2]))
    print(f"Changed content pixels after tap: {ratio:.2%}")
    return 0 if ratio >= 0.08 else 1


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, ValueError, zlib.error) as error:
        print(f"screen comparison failed: {error}", file=sys.stderr)
        raise SystemExit(2)
