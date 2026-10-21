# Search, sharing and contact setup

## Search Console

After deployment, submit `https://www.footygen.online/sitemap.xml` under **Sitemaps** in the Google Search Console property for this domain. Verify ownership there first if needed. `https://www.footygen.online/robots.txt` advertises the same sitemap. Private profile screens and unfinished game modes are deliberately noindex and omitted from the sitemap; API and authentication endpoints are excluded from crawling.

Page titles, descriptions, canonical URLs and social card definitions live in `src/data/page-seo.json`. Change that catalogue when a mode launches. Use real content revision dates in `src/app/sitemap.ts`; do not replace them with the current time on every request.

## Social previews

`npm run seo:assets` creates 1200 x 630 static JPEG previews in `public/social` and software notices in `public/legal`. This also runs before a production build. Metadata uses absolute HTTPS Open Graph and Twitter image URLs. Social networks may cache an old preview; use their sharing inspector to refresh an already-shared URL after deploying.

## Contact email activation

The endpoint is `POST /api/contact`. It always sends to **football.genius.site@gmail.com**. No email is sent during automated tests.

1. Create or use a Resend account: https://resend.com
2. Add a domain you own, such as `footygen.online` or a mail subdomain, and verify the DNS records Resend supplies. The From address must belong to that verified domain. A Gmail address cannot be used as a Resend-verified sending domain.
3. Create a sending API key. Configure these **server-only** environment variables in `.env.local` for local development and in Vercel **Production** and **Preview**:
   - `RESEND_API_KEY`: the sending API key.
   - `CONTACT_FROM_EMAIL`: e.g. `Football Genius <contact@footygen.online>`, adjusted to your verified domain.
4. Redeploy after updating Vercel environment variables.
5. Submit a contact request yourself and check both the Resend activity log and the Gmail inbox/spam folder.

The visitor's validated email is used as Reply-To. The public form never receives the API key or controls the recipient or From address. Submission IDs deduplicate provider retries, input and body lengths are bounded, cross-origin browser requests are rejected, and a honeypot and bounded per-instance throttle limit abuse. The throttle is best-effort within one server instance; it is not a global distributed rate limiter.

Until email is configured, real submissions return an unavailable response and preserve the form contents. The page also offers a direct email link. The app does not claim the message was sent when configuration is missing or the provider fails.

Resend references: https://resend.com/docs/api-reference/emails/send-email and https://resend.com/docs/dashboard/domains/introduction

## Images and notices

Informative player portraits, crests, flags and game-card illustrations have descriptive alt text. Decorative stadium/background art and avatars next to an accessible name intentionally use empty alt text to avoid repetitive announcements.

`/licences` links package notices and recorded asset provenance. It does not claim that source records grant rights to third-party football imagery. Existing provenance is incomplete for some older assets; individual image attribution and reuse terms remain a separate rights review.

The privacy policy describes the currently implemented data flows and service providers. Update it whenever analytics, advertising, providers, retention practices or contact processing change.

## Checks

- `npm run test:site`
- `npm run test:account`
- `npx tsc --noEmit --incremental false --noUncheckedSideEffectImports`
- `npm run build`
