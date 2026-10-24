# FootyGen branding

FootyGen is short for Footy Genius. Tagline: **Know Football. Prove It.**

- `footygen-logo.webp`: the supplied **FootyGen Forward Motion Logo (1).png**, resized proportionally for the full desktop and mobile lockup.
- `footygen-mark.webp`: the supplied **Glossy FG Soccer App Icon.png**, resized proportionally for the compact sidebar.
- `favicon-16x16.png`, `favicon-32x32.png`, `/favicon.ico` and `apple-touch-icon.png`: browser and touch sizes of the same supplied icon. No extra crop, recoloring or corner mask is applied.
- `logo-assets.json` and `favicon-assets.json` record source names, SHA-256 hashes and delivered sizes. The icon version and social-image version change with their respective artwork so caches can refresh.

Regenerate from the original supplied files:

```powershell
node scripts/branding/build-logo.cjs 'C:\Users\ssavi\Downloads\FootyGen Forward Motion Logo (1).png' 'C:\Users\ssavi\Downloads\Glossy FG Soccer App Icon.png'
node scripts/branding/build-favicon.cjs 'C:\Users\ssavi\Downloads\Glossy FG Soccer App Icon.png'
npm run seo:assets
npm run images:build
```

Database identifiers, existing browser-storage keys and repository URLs retain their historical names to preserve compatibility. The support inbox remains `football.genius.site@gmail.com`.
