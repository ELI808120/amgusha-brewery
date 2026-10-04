# AMGU'SHA BREWERY — אמגושא

Landing page for the Amgu'sha Brewery craft beer brand. Static site — plain
HTML, hand-written CSS, one SVG. No framework, no build step, no template.

## Run locally

```bash
python3 -m http.server 8080   # then open http://localhost:8080
```

## Files

| Path              | Purpose                                            |
|-------------------|----------------------------------------------------|
| `index.html`      | Full page markup (hero, lineup, taproom, folklore, footer) |
| `styles.css`      | All styling — neo-brutalist system, palette, motion |
| `script.js`       | Age-verification gate + footer year                |
| `assets/mascot.svg` | Witch-lynx mascot (original placeholder art)     |

## Design system

- Borders: `4px solid #000`, hard shadows `5px 5px 0 #000`
- Palette: yellow `#FFE600`, purple `#5B21B6`, pink `#FF2D8D`, orange `#FF6A00`,
  emerald `#00C46A`, charcoal `#141414`, bone `#F4EDDF`
- Type: Archivo Black (display) / Space Mono (UI) / Special Elite (body)
- Layout: asymmetric grid, tilted cards, overlapping tape labels, running tickers,
  SVG grain + scanline overlays
- Accessibility: skip-to-content is handled by semantic landmarks, `prefers-reduced-motion`
  disables all animation, focus rings are visible, alt text on all images

## Replace the mascot

`assets/mascot.svg` is original placeholder art. Swap in the real logo by
replacing that file (keep it square, ~512px).

## Deploy

Any static host works. On Vercel:

```bash
npx vercel --prod
```

No build command needed — Vercel serves the directory as static output.
