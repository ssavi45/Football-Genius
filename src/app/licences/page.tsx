import Link from 'next/link';
import InfoPage from '@/components/support/InfoPage';
import packages from '@/data/third-party-packages.json';
import { pageMetadata } from '@/lib/seo/metadata';

export const metadata = pageMetadata('/licences');

export default function LicencesPage() {
  return <InfoPage eyebrow="BUILT WITH THANKS" title="Licences & credits" description="The software, fonts and source records behind Football Genius."><article className="info-body">
    <h2>Third-party software</h2><p>Football Genius uses the following direct production dependencies. Their licences apply to those components, not to every image, mark or piece of site content. The bundled notice file also includes installed production dependencies and their supplied licence and notice text.</p>
    <p><a href="/legal/third-party-notices.txt">Read third-party software notices</a></p>
    <div className="licence-table-wrap"><table className="licence-table"><thead><tr><th scope="col">Package</th><th scope="col">Version</th><th scope="col">Licence</th></tr></thead><tbody>{packages.map(item => <tr key={item.name}><td>{item.name}</td><td>{item.version}</td><td>{item.licence}</td></tr>)}</tbody></table></div>
    <h2>Typography</h2><p>Outfit, Orbitron, Bebas Neue and Caveat are distributed through Google Fonts under the SIL Open Font License. Their upstream font and licence records are available here:</p><ul><li><a href="https://github.com/google/fonts/tree/main/ofl/outfit">Outfit — font files and OFL</a></li><li><a href="https://github.com/google/fonts/tree/main/ofl/orbitron">Orbitron — font files and OFL</a></li><li><a href="https://github.com/google/fonts/tree/main/ofl/bebasneue">Bebas Neue — font files and OFL</a></li><li><a href="https://github.com/google/fonts/tree/main/ofl/caveat">Caveat &mdash; font files and OFL</a></li></ul>
    <h2>Images, player portraits and football marks</h2><p>Football Genius is an independent football quiz project. Player photographs, club crests, competition marks and other third-party material may belong to their respective rights holders. Their inclusion does not imply endorsement or grant visitors permission to reuse them.</p>
    <p>The following source records document asset origins, processing and available provenance. A source record is not itself a copyright licence; the rights and any attribution conditions associated with the original material still apply.</p>
    <ul><li><a href="/img/leaderboard/asset-sources.json">Leaderboard &mdash; original stadium and trophy artwork</a></li><li><a href="/img/higher-lower/asset-sources.json">Higher or Lower — artwork and portrait sources</a></li><li><a href="/img/journeyman/asset-sources.json">The Journeyman — club crest sources</a></li><li><a href="/img/journeyman/portrait-sources.json">The Journeyman — player portrait sources</a></li><li><a href="/img/journeyman/flag-sources.json">The Journeyman — national flag sources</a></li><li><a href="/img/scouts-duel/portrait-sources.json">Scout’s Duel — portrait source records</a></li><li><a href="/img/scouts-duel/asset-sources.json">Scout’s Duel — artwork sources</a></li></ul>
    <h2>Corrections and rights enquiries</h2><p>If you hold rights to material shown on the site, or spot an incorrect credit, please <Link href="/contact">contact us</Link> with the page URL, asset details and relevant ownership or source information so we can review the request.</p>
    <nav className="info-links" aria-label="Related information"><Link href="/privacy">Privacy policy</Link><Link href="/contact">Contact the team</Link><Link href="/game-modes">Back to the games</Link></nav>
  </article></InfoPage>;
}
