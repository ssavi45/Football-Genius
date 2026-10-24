'use client';

import { useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { CircleCheck, CircleAlert, Send } from 'lucide-react';
import { CONTACT_TOPICS } from '@/lib/contact-fields';

export default function ContactForm() {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState('');
  const [failed, setFailed] = useState(false);
  const pending = useRef(false);
  const submissionId = useRef<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    pending.current = true; setSending(true); setNotice(''); setFailed(false);
    try {
      submissionId.current ||= crypto.randomUUID();
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: fields.get('name'), email: fields.get('email'), topic: fields.get('topic'), message, website: fields.get('website'), consent: fields.get('consent') === 'on', submissionId: submissionId.current }) });
      const result = await response.json();
      if (!response.ok || result.ok !== true) throw new Error(typeof result.error === 'string' ? result.error : 'Your message could not be sent. Please try again.');
      setNotice('Your message is on its way. Thank you for getting in touch!');
      form.reset(); setMessage(''); submissionId.current = null;
    } catch (error) {
      setFailed(true); setNotice(error instanceof Error ? error.message : 'Your message could not be sent. Please try again.');
    } finally { pending.current = false; setSending(false); }
  }

  return <form className="contact-form" onSubmit={submit} onChange={() => { submissionId.current = null; setNotice(''); }} aria-label="Contact FootyGen" aria-busy={sending}>
    <div className="contact-row"><div className="contact-field"><label htmlFor="contact-name">Your name</label><input id="contact-name" name="name" autoComplete="name" required maxLength={80} disabled={sending} /></div><div className="contact-field"><label htmlFor="contact-email">Email address</label><input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} disabled={sending} /></div></div>
    <div className="contact-field"><label htmlFor="contact-topic">What’s it about?</label><select id="contact-topic" name="topic" disabled={sending}>{CONTACT_TOPICS.map(topic => <option key={topic}>{topic}</option>)}</select></div>
    <div className="contact-field"><label htmlFor="contact-message">Your message</label><textarea id="contact-message" name="message" required minLength={10} maxLength={4000} value={message} onChange={event => setMessage(event.target.value)} placeholder="Tell us how we can help. For a bug, include the game mode and what happened." disabled={sending} /><small>{message.length.toLocaleString()} / 4,000</small></div>
    <div className="contact-trap" aria-hidden="true"><label htmlFor="contact-website">Leave this field empty</label><input id="contact-website" name="website" tabIndex={-1} autoComplete="off" disabled={sending} /></div>
    <label className="contact-consent"><input type="checkbox" name="consent" required disabled={sending} /><span>I have read the <Link href="/privacy">privacy policy</Link> and understand that my details will be used to respond to this message.</span></label>
    {notice && <p className={`contact-notice${failed ? ' is-error' : ''}`} role={failed ? 'alert' : 'status'}>{failed ? <CircleAlert size={18} /> : <CircleCheck size={18} />}<span>{notice}</span></p>}
    <button type="submit" className="contact-submit" disabled={sending}>{sending ? 'Sending your message...' : 'Send message'}<Send size={17} /></button>
  </form>;
}
