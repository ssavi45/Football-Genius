# Responsive image assets

`npm run images:build` creates WebP variants and copies SVGs to content-addressed URLs under `public/img/optimized/`. It runs automatically before development and production builds. Originals and their provenance manifests are preserved.

The generated source manifest (`src/data/image-assets.json`) drives the shared Next Image loader. Generated CSS handles decorative backgrounds. Widths match portrait, badge, or artwork use, preserve aspect ratio and alpha, and never enlarge the source. Animated files and external avatar URLs keep their original delivery.

Generated images are ignored by Git and reproduced on deployment. The build reuses `.next/cache/responsive-images` on later builds; source/recipe hashes invalidate changed files. Increment the recipe version when changing encoding behavior. Keep the generated manifest and CSS with source changes so tests and editor resolution work before building.

Hashed image URLs receive a one-year immutable cache policy. Unversioned original paths retain their normal cache rules. Scoreline preloads only the next match's images. Higher or Lower reserves one replacement card ahead, preloads the same responsive candidate used by the visible card, and waits for decoding before switching cards. The API returns only the reserved card's media URLs. Older saved streaks prepare their queue after the next correct pick. Optional preloads respect reduced data use; the next playable portrait still loads.

Run `npm run test:images` after generating assets. The checks cover output existence, responsive selection, external URL handling, alpha/aspect ratio, transfer budgets, cache configuration, decoding, request reuse, and retry behavior.
