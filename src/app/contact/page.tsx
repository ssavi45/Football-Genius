import Link from 'next/link';
import { Mail } from 'lucide-react';
import InfoPage from '@/components/support/InfoPage';
import ContactForm from '@/components/support/ContactForm';
import { CONTACT_EMAIL, pageMetadata } from '@/lib/seo/metadata';

export const metadata = pageMetadata('/contact');

export default function ContactPage() {
  return <InfoPage eyebrow="LET’S TALK" title="A message for the team?" description="A bug, a bright idea, or a football question. We’d love to hear from you."><div className="contact-layout"><ContactForm /><aside className="contact-details"><Mail aria-hidden="true" /><h2>Contact FootyGen</h2><p>Messages from this form go to our support inbox. You can also email us directly.</p><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a><p>Please don’t include passwords or other sensitive information.</p><p>Looking for a new challenge? <Link href="/game-modes">Explore the game modes</Link> or check the <Link href="/leaderboard">leaderboard</Link>.</p></aside></div></InfoPage>;
}
