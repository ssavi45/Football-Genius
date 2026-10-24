import Link from 'next/link';
import InfoPage from '@/components/support/InfoPage';
import { CONTACT_EMAIL, pageMetadata } from '@/lib/seo/metadata';

export const metadata = pageMetadata('/privacy');

export default function PrivacyPage() {
  return <InfoPage eyebrow="YOUR PRIVACY" title="Privacy policy" description="What we collect, why we use it, and the choices you have when you play FootyGen.">
    <article className="info-body"><p className="info-date">Last updated: 21 October 2026</p>
      <p>This policy covers FootyGen at <a href="https://www.footygen.online">www.footygen.online</a>. For privacy questions or requests, use our <Link href="/contact">contact form</Link> or email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
      <h2>1. Information you provide</h2>
      <ul><li><strong>Guest play:</strong> a generated guest identifier, display name, chosen avatar, preferences and progress are stored in your browser.</li><li><strong>Signed-in play:</strong> when you sign in with Google, our authentication service receives your account identifier and the profile information supplied during sign-in, such as your name, email address and profile picture. You can choose a different display name and footballer avatar.</li><li><strong>Game activity:</strong> saved rounds, submitted answers, scores, XP, achievements and multiplayer room activity are used to run games and maintain progress and rankings.</li><li><strong>Contact requests:</strong> we receive the name, email address, topic and message you submit, together with the information needed to process the request.</li></ul>
      <h2>2. How we use information</h2>
      <p>We use this information to provide games, authenticate accounts, restore progress, calculate rankings, support multiplayer matches, remember preferences, respond to messages and investigate errors or misuse. We do not sell your personal information or use contact messages to enrol you in marketing emails.</p>
      <h2>3. Information other players can see</h2>
      <p>Your display name, avatar and recorded ranking information can appear on public leaderboards. Multiplayer opponents can see your display name and the match information shared by the game. Secret player selections are kept hidden from opponents until the game rules reveal them. Your sign-in email address is not included in leaderboard responses.</p>
      <div className="info-callout"><p>Choose a display name you are comfortable sharing publicly. Avoid putting sensitive personal information in your name, multiplayer interactions or custom questions.</p></div>
      <h2>4. Browser storage and cookies</h2>
      <p>We use local storage for guest progress, saved rounds, navigation preferences and sound settings. Authentication cookies and related session information keep signed-in accounts connected. Clearing your browser storage can remove guest progress and preferences, and clearing authentication cookies can sign you out. The current application does not include advertising cookies or third-party analytics tags.</p>
      <h2>5. Services that help us operate</h2>
      <ul><li><a href="https://supabase.com/privacy" rel="noreferrer" target="_blank">Supabase</a> provides authentication and database services for accounts, saved results and multiplayer game state.</li><li><a href="https://vercel.com/legal/privacy-notice" rel="noreferrer" target="_blank">Vercel</a> hosts and delivers the website. Infrastructure services can process technical request information, including IP addresses and error or security logs.</li><li><a href="https://policies.google.com/privacy" rel="noreferrer" target="_blank">Google</a> provides the optional Google sign-in service. If AI question interpretation is enabled for Scout’s Duel, custom question text and the supported question catalogue can be sent to Google Gemini; secret player selections are not sent with that request.</li><li><a href="https://resend.com/legal/privacy-policy" rel="noreferrer" target="_blank">Resend</a> is used for contact-form email delivery when configured. Submitted messages are sent to our support inbox at {CONTACT_EMAIL}. Our email provider also processes those messages.</li></ul>
      <p>These providers may process information in countries other than your own. Their linked policies describe their own handling of information. Our application loads font files through Next.js font optimisation rather than requesting Google Fonts from your browser.</p>
      <h2>6. Security and abuse prevention</h2>
      <p>We use account access controls and server-side validation to protect saved progress and multiplayer secrets. The contact form validates submissions and uses anti-spam checks, including temporary rate-limit identifiers derived from technical request information. No system can guarantee complete security; do not submit passwords, payment details or other sensitive information through the contact form.</p>
      <h2>7. Retention and deletion</h2>
      <p>Guest information remains in your browser until it is cleared or replaced. Signed-in account information and recorded results are retained to provide your account and game history. Contact messages are retained while handling your request and related follow-up. You can ask us to delete your account, game records or messages; we may need to retain information where required for security, dispute handling or legal obligations. Service-provider logs and backups follow their applicable retention arrangements.</p>
      <h2>8. Your choices and requests</h2>
      <p>You can play as a guest, edit your display name and avatar in <Link href="/profile#settings">profile settings</Link>, change sound preferences, or sign out. To request access, correction or deletion of account information, contact us using the email associated with your account where possible. Depending on your location, additional privacy rights may apply. We may ask for information needed to verify that a request relates to your account.</p>
      <h2>9. Children and policy updates</h2>
      <p>If you believe a child has supplied personal information unintentionally, contact us so we can investigate and address it. We will update this page when the way the website handles information changes, with the latest revision date shown above.</p>
      <nav className="info-links" aria-label="Related information"><Link href="/contact">Contact us about privacy</Link><Link href="/licences">Licences & credits</Link><Link href="/game-modes">Explore game modes</Link></nav>
    </article>
  </InfoPage>;
}
