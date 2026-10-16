# Football Matrix assets

No asset was cropped, extracted, traced or reused from the supplied reference screenshot. The three original raster assets were generated separately with the built-in imagegen tool, then copied into the project. WebP delivery copies preserve the logo's alpha channel and reduce the stadium artwork's download size. The original generated PNG masters remain in the tool's generated-images directory.

Project assets:

- `football-matrix-logo.webp`: original transparent blue/gold wordmark, served losslessly. Native selectable screen-reader text remains in the page heading.
- `puzzle-hero.webp`: original floating puzzle tiles in a bright blue stadium.
- `stadium-board.webp`: original light stadium, crystalline blue perimeter and translucent football, with a readable open centre.
- `world-cup.png`: independently sourced trophy image from the Transfermarkt achievement record: https://img.a.transfermarkt.technology/erfolge/medium/101.png .

Existing verified player portraits, club crests and national flags are reused from the application's asset collection. The tactical corner is an independently authored SVG; other interface controls use Lucide. The artwork does not supply interactive tiles, text labels, hit targets or player answers: those are actual React components.

## Criterion icon collection

`criteria/` contains 16 original transparent milestone and trophy icons generated independently with the **built-in image_gen tool**, one generation per icon. Their shared style is glossy cobalt enamel, silver and gold metal, restrained cyan highlights and clear dimensional football symbols. Every stat/trophy criterion in `src/lib/matrix/criteria.ts` has its own `artUrl`, used in both the grid headers and the player-search criterion chips. Club crests and national flags retain their existing assets.

The new icons cover 400+ career goals, 3+ UCL titles, World Cup winner, Ballon d'Or winner, 50+ goals in a season, UCL top 15, national captain, 5+ league titles, 3+ top-five-league clubs, 200+ career assists, UCL winner, Copa America winner, 100+ career goals, 100+ senior caps, 100+ Premier League goals and 50+ UCL goals. Icons for criteria awaiting verified data are ready without enabling those criteria prematurely.

Each delivery file is a **256 x 256 lossless WebP with real alpha**, normalized to consistent transparent padding and object fit. Only the generated image's transparent margins and delivery dimensions were normalized. No screenshot assets were extracted, and no existing files under `public/img/icons/` were replaced. Full-resolution generated masters remain in the generated-images directory.

- Exact per-icon prompts: [`criteria/prompts.json`](criteria/prompts.json).
- File inventory, alpha/dimension metadata, byte sizes and SHA-256 hashes: [`criteria/generated-assets.json`](criteria/generated-assets.json).
- Collection preview: [`criteria/preview.webp`](criteria/preview.webp).

## Built-in imagegen prompts

### Transparent wordmark

Create a standalone original premium football trivia videogame wordmark on genuinely transparent background. Exact text: FootballMatrix, one single horizontal line. Wide panoramic composition about 4.5:1 text proportion, tightly fitted with moderate transparent padding. The word Football in bold slanted forward athletic esports typography, glossy metallic deep navy and electric blue with bright cyan rim edges, the letter o incorporating a realistic black and white football. The word Matrix immediately follows in rich metallic gold yellow gradient with deep navy outline. Finish on the far right with a small 2 by 2 square tile mark, two cobalt squares and two gold squares. Strong substantial heavy bespoke lettering, subtle dimensional beveled highlights and dark navy outline, crisp polished finish. No rectangle, no backdrop, no stadium, no extra words, no watermark, no tagline. Designed to remain legible displayed 620px wide and 95px tall on an icy white football game dashboard. Independently design this wordmark; do not extract or trace any screenshot assets.

### Header illustration

Create an original ultra wide panoramic 3:1 premium football puzzle game illustration, no words or captions. Bright white icy sky blue stadium with electric royal blue glass and paint streak energy. Left half must be very airy almost white, uncluttered negative space that dissolves into a vivid blue floodlit stadium on right half. On the far right, a polished floating three by three arrangement of thick white and cobalt square puzzle tiles seen in slight perspective, several contain large white question marks, other tiles contain a simple navy silhouette of a footballer head and shoulders. Some foreground tiles are brushed metallic gold. Tiny blue confetti and light shards, premium realistic 3D sports advertising, stadium roof bright floodlights and atmosphere behind. Important all puzzle graphics concentrated rightmost 40 percent, left 60 percent pale near white for text overlay. No actual player photos, no logos, no club crests, no text apart from question marks. Clean luminous premium aesthetic cobalt #0967ff, navy #071f57, white and gold #ffcb42. Independently create this artwork, not a screenshot or UI mockup.

### Board stadium

Original premium light blue football stadium background artwork for an interactive puzzle board, 3:2 landscape composition. View from inside a huge modern football stadium, sweeping tiered stands on far left and right edges and bright floodlights. Soft crystalline white and powder blue paint streaks along the perimeter. A large softly translucent black-and-white football partially visible on far left edge at midheight. The CENTER 70 PERCENT is clean very pale icy white negative space, almost white, with no objects, to hold a readable 3x3 game grid. Airy beautiful daylight, subtle royal blue accents, very low contrast soft atmospheric detail, luminous white floor at bottom. Not dark, no green grass, no people, no text, no logos, no grid or UI controls. Independently created original background, no reference screenshot extraction.
