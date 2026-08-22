# Third-party notices

The following open-source components are vendored locally so the app remains usable offline. Runtime assets are pinned to exact versions; no CDN is used.

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
