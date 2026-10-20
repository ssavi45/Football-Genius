'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, RefreshCw, Search, X } from 'lucide-react';
import { FOOTBALLER_AVATARS, findAvatarByUrl } from '@/data/avatar-catalog';
import AccountAvatar from './AccountAvatar';

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl?: string;
  onSaveAvatar: (avatarUrl: string) => Promise<void>;
}

export default function AvatarPickerModal(props: AvatarPickerModalProps) {
  // Mount a fresh selection session each time the picker opens.
  return props.isOpen ? <AvatarPicker {...props} /> : null;
}

function AvatarPicker({ onClose, currentAvatarUrl, onSaveAvatar }: AvatarPickerModalProps) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(() => findAvatarByUrl(currentAvatarUrl));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  const savingRef = useRef(false);
  const mountedRef = useRef(false);
  closeRef.current = onClose;

  useEffect(() => {
    mountedRef.current = true;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const dialog = dialogRef.current!;
    const initialFocus = dialog.querySelector<HTMLElement>('[aria-pressed="true"]') || dialog;
    initialFocus.focus({ preventScroll: true });
    if (initialFocus !== dialog) initialFocus.scrollIntoView({ block: 'nearest' });

    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        if (!savingRef.current) closeRef.current();
      }
      if (event.key !== 'Tab') return;
      const elements = Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled)'));
      const first = elements[0];
      const last = elements.at(-1);
      if (!first || !last) { event.preventDefault(); dialog.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || !elements.includes(document.activeElement as HTMLElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !elements.includes(document.activeElement as HTMLElement))) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener('keydown', keydown);
    return () => {
      mountedRef.current = false;
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', keydown);
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);

  async function apply() {
    if (!selected || savingRef.current || selected.avatarUrl === currentAvatarUrl) return;
    savingRef.current = true;
    setSaving(true); setError('');
    try {
      await onSaveAvatar(selected.avatarUrl);
      if (mountedRef.current) closeRef.current();
    } catch (cause) {
      if (mountedRef.current) setError(cause instanceof Error ? cause.message : 'Could not save your avatar. Please retry.');
    } finally {
      savingRef.current = false;
      if (mountedRef.current) setSaving(false);
    }
  }

  const query = search.trim().toLocaleLowerCase();
  const avatars = FOOTBALLER_AVATARS.filter(avatar => avatar.name.toLocaleLowerCase().includes(query));
  const unchanged = selected?.avatarUrl === currentAvatarUrl;

  return <div className="avatar-picker-backdrop" onMouseDown={event => {
    if (event.target === event.currentTarget && !savingRef.current) closeRef.current();
  }}>
    <div ref={dialogRef} className="avatar-picker-modal" role="dialog" aria-modal="true" aria-labelledby="avatar-picker-title" aria-describedby="avatar-picker-description" aria-busy={saving} tabIndex={-1}>
      <header className="avatar-picker-header">
        <div><h2 id="avatar-picker-title">Choose your avatar</h2><p id="avatar-picker-description">Pick a portrait for your profile.</p></div>
        <button type="button" className="avatar-picker-close" onClick={onClose} disabled={saving} aria-label="Close avatar picker"><X size={18} /></button>
      </header>

      <div className="avatar-picker-toolbar">
        <label className="avatar-picker-search"><Search size={17} aria-hidden="true" /><input type="search" placeholder="Find a portrait..." value={search} onChange={event => setSearch(event.target.value)} disabled={saving} aria-label="Search portraits by footballer name" />{search && <button type="button" onClick={() => setSearch('')} disabled={saving} className="avatar-search-clear" aria-label="Clear search"><X size={14} /></button>}</label>
      </div>

      <div className="avatar-picker-grid-wrap">
        <div className="avatar-picker-grid" role="group" aria-label="Available portraits">
          {avatars.map(avatar => <button key={avatar.id} type="button" className={`avatar-card${selected?.id === avatar.id ? ' is-selected' : ''}`} onClick={() => { setSelected(avatar); setError(''); }} disabled={saving} aria-label={`Select ${avatar.name}`} aria-pressed={selected?.id === avatar.id}>
            <AccountAvatar name={avatar.name} image={avatar.avatarUrl} className="avatar-card-portrait" />
            {selected?.id === avatar.id ? <span className="avatar-check-badge" aria-hidden="true"><Check size={12} strokeWidth={3} /></span> : currentAvatarUrl === avatar.avatarUrl && <span className="avatar-current-dot" aria-hidden="true" />}
          </button>)}
        </div>
        {avatars.length === 0 && <div className="avatar-picker-empty" role="status"><Search size={28} /><p>No portraits found.</p><button type="button" className="account-secondary-button" onClick={() => setSearch('')}>Clear search</button></div>}
      </div>

      {error && <div className="avatar-picker-error" role="alert">{error}</div>}
      <footer className="avatar-picker-footer">
        <div className="avatar-preview-selected" aria-label={selected ? `Selected portrait: ${selected.name}` : 'No portrait selected'}>{selected && <AccountAvatar name={selected.name} image={selected.avatarUrl} className="avatar-preview-image" />}</div>
        <div className="avatar-picker-actions">
          <button type="button" className="account-secondary-button" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="button" className="account-primary-button avatar-save-button" onClick={() => void apply()} disabled={saving || !selected || unchanged}>{saving ? <><RefreshCw className="account-spinning" size={16} />Saving...</> : <><Check size={16} />Save avatar</>}</button>
        </div>
      </footer>
    </div>
  </div>;
}
