# FootyGen branding

FootyGen is short for Footy Genius. Tagline: **Know Football. Prove It.**

- `footygen-logo.webp`: the supplied **FootyGen Forward Motion Logo (1).png**, resized proportionally for the full desktop and mobile lockup.
- `footygen-fg.png`: a lossless extraction of the FG pixels from the same approved lockup, with only the connected outside backing removed. No tracing, repainting or replacement lettering. The compact sidebar uses this asset.
- Both sidebar images bypass responsive thumbnail generation and load at their full available resolution. A raster image still has a finite zoom limit; true resolution independence requires an original vector master.
- `footygen-mark.webp`: the previous glossy compact icon, retained for provenance; navigation no longer uses this app-icon tile.
- `favicon-16x16.png`, `favicon-32x32.png`, `/favicon.ico` and `apple-touch-icon.png`: browser and touch sizes of the same supplied icon. No extra crop, recoloring or corner mask is applied.
- `logo-assets.json` and `favicon-assets.json` record source names, SHA-256 hashes and delivered sizes. The icon version and social-image version change with their respective artwork so caches can refresh.

Regenerate from the original supplied files:

```powershell
node scripts/branding/build-logo.cjs
node scripts/branding/build-favicon.cjs 'C:\Users\ssavi\Downloads\Glossy FG Soccer App Icon.png'
npm run seo:assets
npm run images:build
```

An optional single input to `build-logo.cjs` replaces the master with a higher-resolution version of the same approved lockup. It preserves the supplied resolution and uses lossless encoding. The command without an input keeps the master file byte-for-byte unchanged.

Database identifiers, existing browser-storage keys and repository URLs retain their historical names to preserve compatibility. The support inbox remains `football.genius.site@gmail.com`.
