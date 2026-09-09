# Locally bundled reading and character fonts

These WOFF2 files load from the app, not Google Fonts/CDN. `font-display: swap` keeps native fallback text available during loading or when a font is unavailable.

| File | Role | Original source | License |
| --- | --- | --- | --- |
| LXGW-WenKai.woff2 | Xiao Ai's short Chinese thoughts and select headings | [LXGW WenKai Lite Regular](https://github.com/lxgw/LxgwWenKai-Lite) | LXGW-OFL.txt |
| Mali-Medium.woff2 | CHANINDA's short Thai thoughts, expressive handwriting | [Google Fonts: Mali](https://github.com/google/fonts/tree/main/ofl/mali) | Mali-OFL.txt |
| Noto-Thai-Reading.woff2 | Longer Thai reading, preserving looped letterforms and combining marks | [Google Fonts: Noto Sans Thai Looped](https://github.com/google/fonts/tree/main/ofl/notosansthailooped) | NotoThai-OFL.txt |

Fetched 2026-09-09 from the respective official repositories. Complete copyright notices and SIL OFL 1.1 licenses accompany the fonts. The LXGW notice also includes permission for non-installable WOFF/WOFF2 web delivery with unchanged outlines. These are embedded web fonts, not separately sold or installed desktop fonts.

`adventure/scripts/build-thought-fonts.py` performs lossless WOFF2 delivery conversion with fontTools/Brotli, without subsetting or editing glyphs. Original TTFs are kept in `output/font-sources/`; build tools in `output/font-tools/`. No global Python install is changed. The runtime contains full source glyph sets (25,985 / 773 / 477 glyphs respectively), approximately 5.17 MiB total. CSS picks role-appropriate fallbacks for characters absent from a given face.

SHA-256:

- LXGW-WenKai.woff2: `ad518c8e87daa2616af2331e19b8947e1cbcd1d37f7162670fb1457ea75626ff`
- Mali-Medium.woff2: `f01b48a2269cb87e052b1b8deff153c1046b2ae4fa4e7c2875f643c73defef58`
- Noto-Thai-Reading.woff2: `c5a71ee446b0d8672287e71b4a70b0013a06fffdae9949962fee32ccba4f1456`

Native text is never baked into decorative art. Font tests establish delivery, glyph coverage and viewport bounds, not linguistic or phonetic correctness.
