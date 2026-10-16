# Higher or Lower artwork

No assets were cropped, extracted, traced, or reused from the supplied reference screenshot.

## Original stadium background

`player-burst.png` was generated with the built-in OpenAI `imagegen` tool and is used behind both player cards. The second card receives a pink hue through CSS.

Generation prompt:

> Create one original premium sports game background bitmap asset, landscape aspect 3:2, no text and no people. It will sit behind a football player photograph on a comparison card. Bright electric cobalt and sky blue crystalline paint strokes and glass shards sweeping diagonally from lower left to upper right, subtle flooded football stadium lights in the distance, tiny brilliant white sparkles and stadium confetti, energetic photographic sports advertising mixed with polished 3D rendering. Composition: vivid saturated blue on left 45%, softly dissolving into airy icy pale blue and clean white on right 55%, lower 20% fading to near white for overlay UI. Color palette royal blue #0866ff, cyan white silver. High quality crisp premium art, avoid dark black backgrounds, avoid logos letters numbers watermarks, no players, no card frames or UI. Independently created art, not a recreation of any supplied image. Save the generated asset and provide its local filesystem path.

## Player portraits

Every one of the 100 players has a local transparent headshot in `players/`. Ninety-one were independently sourced from EA SPORTS' official ratings image service; nine retired players use transparent historical portraits from FUT.GG's player archive. `asset-sources.json` records each player's source URL, dimensions, transparency and file hash. Example official source: https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/erling-haaland/239085 . Historical example: https://www.fut.gg/players/41236-zlatan-ibrahimovic/ . Archived source resolutions are retained honestly in the manifest.

All cards use the same portrait box, scale, baseline, shadow and fade. Rectangular action-photo fallbacks were removed. New roster identities must receive a reviewed transparent headshot before appearing in comparisons. Frank Lampard's EA portrait ID is 5471; Iker Casillas is 5479. These distinct mappings are covered by the asset regression check.

Roberto Carlos uses the verified 238430 portrait from https://www.fut.gg/players/238430-roberto-carlos/ . The previous 1041 image was Javier Zanetti. All 30 retired/legacy portrait identities were checked against their provider profiles; `identitySource` and `identitySourceName` preserve that verification in the manifest. Portrait URLs include a content hash so corrected assets invalidate cached pictures.

Run `node scripts/higher-lower/cache-portraits.cjs` to restore and verify the reviewed portrait collection. It validates PNG dimensions/transparency and hashes instead of substituting an unrelated or opaque image. All assets are used directly, without generated faces or background-removal edits.

The header uses the application's existing, independently generated `../game-modes/higher-lower.webp` illustration. Club crests and country flags are existing local application assets. Icons use the existing Lucide library plus independently authored coin-stack and football SVGs in `HigherLowerIcons.tsx`. The title is native, selectable text styled with CSS gradients and shadows.

## Data and interaction

Comparisons now use the validated 100-player Transfermarkt snapshot in `src/data/higher-lower-snapshot.json`. Goals, Assists, Market Value and Transfer Value are playable; Caps, UCL and EA Rating visibly remain Coming soon. Market Value includes only active players' current valuations; Transfer Value asks about a single shown club-to-club move. See `scripts/higher-lower/README.md` for coverage, metric definitions and refresh instructions. Club crests in `clubs/` are independently sourced from the current/last clubs and historical transfer endpoints in the source club records and mapped by `club-badges.json`. No statistics are invented. The leaderboard is labelled Preview when the existing backend is unavailable. Each correct pick still earns 15 XP.
