# Third-party notices

The following open-source components are vendored locally so the app remains usable offline. Runtime assets are pinned to exact versions; no CDN is used.

## Framework7 Core 9.1.2

- Purpose: isolated iOS/Material mobile UI compatibility lab and the reference component contract for the production adapter. The global framework stylesheet/runtime are intentionally not loaded by the production `index.html` until class-name, WebView and back-navigation compatibility gates pass.
- License: MIT (`licenses/framework7-9.1.2-MIT.txt`).
- Source: https://github.com/framework7io/framework7/tree/v9.1.2
- npm integrity: `sha512-XXvIeiRri3imFiz4wZZjBgr0b7mqVosFX1rRABM86iUyaWqj1GQEuQsKzaGXFw1nzEuiX7+r39vtF7Fq5bUiJA==`
- Vendored SHA-256:
  - `framework7-9.1.2.min.css`: `33F77B65CA395FB32B161C676DA60EB7603947C4D93F39661F0E4CFEC70CA5F4`
  - `framework7-9.1.2-bundle.min.css`: `AEDB019F9E6CE8E06997DB46F84C9E4AE13FBFB497ECC2FF61CC8E1DDFFC6C90`
  - `framework7-9.1.2-bundle.min.js`: `9D3C8C660DAACB4855677617F34D294A1BA5AB62A4585B7CCBBBA9403FDD0ACB`

## Driver.js 1.8.0

- Purpose: accessible, keyboard-operable contextual walkthroughs.
- License: MIT (`licenses/driver.js-1.8.0-MIT.txt`).
- Source: https://github.com/nilbuild/driver.js/tree/1.8.0
- npm integrity: `sha512-+8/IO7h1v14IzWh2GP60N7T3PFZweXwdn5e5POuxRSBoCYUojsBxzqawPeXh3YZIibRy7EehYNEyxe7slwwtdg==`
- Vendored SHA-256:
  - `driver-1.8.0.iife.js`: `C6ADE0B831C6C043DAF480861208CD2FA45EA4AAC581CC8BB8E234281C011DDF`
  - `driver-1.8.0.css`: `D095D440021FCF133AD46D37F18A2745FB76440F14F5208D17E203C039F765C9`

## canvas-confetti 1.9.4

- Purpose: restrained game-completion and personal-best feedback.
- License: ISC (`licenses/canvas-confetti-1.9.4-ISC.txt`).
- Source: https://github.com/catdad/canvas-confetti/tree/v1.9.4
- npm integrity: `sha512-yxQbJkAVrFXWNbTUjPqjF7G+g6pDotOUHGbkZq2NELZUMDpiJ85rIEazVb8GTaAptNW2miJAXbs1BtioA251Pw==`
- Vendored SHA-256: `49F4BCBC56E7CEB5C3D25D13DB1D0DA965B6CD1C8A54A707BB055BE0685B0A95`

## Pitchy 4.1.0 and fft.js 4.0.4

- Purpose: on-device fundamental-frequency estimation for the experimental relative pitch-contour mirror.
- Licenses: MIT (`licenses/pitchy-4.1.0-MIT.txt` and `licenses/fft.js-4.0.4-MIT.txt`).
- Sources: https://github.com/ianprime0509/pitchy/tree/v4.1.0 and https://github.com/indutny/fft.js/tree/v4.0.4
- npm integrity:
  - Pitchy: `sha512-E8nQ8svBroGSMcc3qu2KvLHIuRYAIfrSkqDKWhjgj3WizseqWQXjQ+Q5t4g1CU73R5Euk+DAinyNFDK+KZw7zA==`
  - fft.js: `sha512-f9c00hphOgeQTlDyavwTtu6RiK8AIFjD6+jvXkNkpeQ7rirK3uFWVpalkoS4LAwbdX7mfZ8aoBfFVQX1Re/8aw==`
- The browser bundle was produced with esbuild 0.25.9 from the pinned npm packages.
- Vendored bundle SHA-256: `F3C4A0127FFD63675F7D8A6A1BD6E88F0D5418C1A5EFF2442E6F58E485096981`

The pitch-contour result is a learning aid, not a pronunciation certification. It compares relative voiced-pitch movement and does not independently determine Thai or Mandarin lexical tones.

## Open Multilingual Wordnet 2.0 review sources

- Purpose: create a source-traceable editorial candidate queue for replacing duplicate vocabulary cards. These records are not imported into the learner-facing corpus until second-source and native-speaker review pass.
- Sources: Chinese Open WordNet, Thai WordNet and Princeton WordNet data packaged by [Open Multilingual Wordnet 2.0](https://github.com/omwn/omw-data/releases/tag/v2.0).
- Licenses: source-specific WordNet-style grants in `licenses/chinese-open-wordnet-2.0.txt`, `licenses/thai-wordnet-2.0.txt`, and `licenses/princeton-wordnet-3.0.txt`.
- Required boundary: NICT and Princeton names must not be used as advertising or endorsement. Shared synset alignment is candidate evidence, not a language-quality approval.
- Citation: Francis Bond and Ryan Foster (2013), “Linking and Extending an Open Multilingual Wordnet,” ACL 2013.
