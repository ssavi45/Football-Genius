# Journeyman answer cards

`src/data/journeyman-profiles.json` maps stable career IDs to nationality,
national flag, portrait path, and whether the portrait is a transparent cutout.
The server adds these fields to the question pool. The answer card displays
them only after the question has been answered.

Rebuild after adding career identities or updating the search directory:

```sh
node scripts/journeyman/build-answer-profiles.cjs
npm run test:journeyman
```

The builder first reuses reviewed Higher or Lower headshots through exact
identity matches. Missing portraits come from the player's Wikipedia biography,
are saved locally as WebP images no larger than 320 × 400, and retain their
article/image URLs and SHA-256 hashes in
`public/img/journeyman/portrait-sources.json`. Existing downloads are cached.
The builder reports unresolved portraits and exits unsuccessfully if any remain.
It does not change club histories, question eligibility, or scores.

The gameplay suite checks that every enabled question has a local portrait and
national flag, preventing empty answer cards when the question pool expands.
