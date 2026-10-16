# Higher or Lower artwork

No assets were cropped, extracted, traced, or reused from the supplied reference screenshot.

## Original stadium background

`player-burst.png` was generated with the built-in OpenAI `imagegen` tool and is used behind both player cards. The second card receives a pink hue through CSS.

Generation prompt:

> Create one original premium sports game background bitmap asset, landscape aspect 3:2, no text and no people. It will sit behind a football player photograph on a comparison card. Bright electric cobalt and sky blue crystalline paint strokes and glass shards sweeping diagonally from lower left to upper right, subtle flooded football stadium lights in the distance, tiny brilliant white sparkles and stadium confetti, energetic photographic sports advertising mixed with polished 3D rendering. Composition: vivid saturated blue on left 45%, softly dissolving into airy icy pale blue and clean white on right 55%, lower 20% fading to near white for overlay UI. Color palette royal blue #0866ff, cyan white silver. High quality crisp premium art, avoid dark black backgrounds, avoid logos letters numbers watermarks, no players, no card frames or UI. Independently created art, not a recreation of any supplied image. Save the generated asset and provide its local filesystem path.

## Player portraits

The roster now includes 500 local transparent headshots. All 400 additions were checked against their source identities: EA ratings names and birth dates were matched to the data profiles for 383 additions, and the remaining 17 legacy identities were checked against FUT.GG player pages. The original 100 portrait files were preserved. Three incorrect expansion mappings were corrected: Ruud Gullit is 214100 (not 1075, which resolves to Del Piero), Marco van Basten is 192181 (not 1088, Nesta), and Wesley Sneijder is 274750 (not 185103, Kolarov). Their corrected 512px PNGs come directly from the existing EA portrait service. Source pages and hashes are recorded in the manifest, with regression assertions for these identities.

Expansion identity sources: https://www.ea.com/games/ea-sports-fc/ratings , https://www.fut.gg/players/214100/ , https://www.fut.gg/players/192181/ , https://www.fut.gg/players/274750/ .

The original 100 portraits comprised ninety-one images independently sourced from EA SPORTS' official ratings image service and nine retired players' transparent historical portraits from FUT.GG's player archive. `asset-sources.json` records each player's source URL, dimensions, transparency and file hash. Example official source: https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/erling-haaland/239085 . Historical example: https://www.fut.gg/players/41236-zlatan-ibrahimovic/ . Archived source resolutions are retained honestly in the manifest.

All cards use the same portrait box, scale, baseline, shadow and fade. Rectangular action-photo fallbacks were removed. New roster identities must receive a reviewed transparent headshot before appearing in comparisons. Frank Lampard's EA portrait ID is 5471; Iker Casillas is 5479. These distinct mappings are covered by the asset regression check.

Roberto Carlos uses the verified 238430 portrait from https://www.fut.gg/players/238430-roberto-carlos/ . The previous 1041 image was Javier Zanetti. All 30 retired/legacy portrait identities were checked against their provider profiles; `identitySource` and `identitySourceName` preserve that verification in the manifest. Portrait URLs include a content hash so corrected assets invalidate cached pictures.

Run `node scripts/higher-lower/cache-portraits.cjs` to restore and verify the reviewed portrait collection. It validates PNG dimensions/transparency and hashes instead of substituting an unrelated or opaque image. All assets are used directly, without generated faces or background-removal edits.

The header uses the application's existing, independently generated `../game-modes/higher-lower.webp` illustration. Club crests and country flags are existing local application assets. Icons use the existing Lucide library plus independently authored coin-stack and football SVGs in `HigherLowerIcons.tsx`. The title is native, selectable text styled with CSS gradients and shadows.

## Data and interaction

Comparisons now use the validated 500-player Transfermarkt snapshot in `src/data/higher-lower-snapshot.json`. Goals, Assists, Market Value and Transfer Value are playable; Caps, UCL and EA Rating visibly remain Coming soon. Market Value includes only active players' current valuations; Transfer Value asks about a single shown club-to-club move. See `scripts/higher-lower/README.md` for coverage, metric definitions and refresh instructions. Club crests in `clubs/` are independently sourced from the current/last clubs and historical transfer endpoints in the source club records and mapped by `club-badges.json`. No statistics are invented. The leaderboard is labelled Preview when the existing backend is unavailable. Each correct pick still earns 15 XP.
