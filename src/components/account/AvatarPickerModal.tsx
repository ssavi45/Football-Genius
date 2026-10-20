'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Check, Crown, Flame, RefreshCw, Search, Sparkles, User, X } from 'lucide-react';
import { FOOTBALLER_AVATARS, findAvatarByUrl, type FootballerAvatar } from '@/data/avatar-catalog';

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl?: string;
  onSaveAvatar: (avatarUrl: string) => Promise<void>;
}

export default function AvatarPickerModal({
  isOpen,
  onClose,
  currentAvatarUrl,
  onSaveAvatar,
}: AvatarPickerModalProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'Legend' | 'Modern'>('all');
  const [selected, setSelected] = useState<FootballerAvatar | null>(() => findAvatarByUrl(currentAvatarUrl) || FOOTBALLER_AVATARS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);

  // Sync selected with current avatar on open
  useEffect(() => {
    if (isOpen) {
      setSelected(findAvatarByUrl(currentAvatarUrl) || FOOTBALLER_AVATARS[0]);
      setSearch('');
      setFilter('all');
      setError('');
    }
  }, [isOpen, currentAvatarUrl]);

  // Handle ESC and Tab trap
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const elements = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input, [tabindex="0"]') || []);
      if (!elements.length) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', handleKeyDown);
      previous?.focus();
    };
  }, [isOpen, onClose]);

  const filteredAvatars = useMemo(() => {
    const q = search.trim().toLowerCase();
    return FOOTBALLER_AVATARS.filter(avatar => {
      const matchesEra = filter === 'all' || avatar.era === filter;
      const matchesSearch = !q || avatar.name.toLowerCase().includes(q) || avatar.role.toLowerCase().includes(q);
      return matchesEra && matchesSearch;
    });
  }, [search, filter]);

  if (!isOpen) return null;

  async function handleApply() {
    if (!selected) return;
    setSaving(true);
    setError('');
    try {
      await onSaveAvatar(selected.avatarUrl);
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save your avatar.');
    } finally {
      setSaving(false);
    }
  }

  const isCurrentActive = selected?.avatarUrl === currentAvatarUrl;

  return (
    <div
      className="avatar-picker-backdrop"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="avatar-picker-title"
    >
      <div ref={dialogRef} className="avatar-picker-modal">
        {/* Header */}
        <header className="avatar-picker-header">
          <div>
            <span className="avatar-picker-eyebrow">
              <Sparkles size={14} /> 50 FOOTBALL LEGENDS &amp; STARS
            </span>
            <h2 id="avatar-picker-title">Choose Your Footballer Avatar</h2>
            <p>Pick your football icon. This will represent you on the navbar, leaderboards, and game rooms.</p>
          </div>
          <button
            type="button"
            className="avatar-picker-close"
            onClick={onClose}
            aria-label="Close avatar picker"
          >
            <X size={18} />
          </button>
        </header>

        {/* Search & Filter Toolbar */}
        <div className="avatar-picker-toolbar">
          <div className="avatar-picker-search">
            <Search size={16} />
            <input
              type="search"
              placeholder="Search by footballer name or position..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
              aria-label="Search footballer avatars"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="avatar-search-clear"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="avatar-picker-tabs" role="tablist" aria-label="Avatar categories">
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'all'}
              className={`avatar-tab ${filter === 'all' ? 'is-active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All (50)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'Legend'}
              className={`avatar-tab ${filter === 'Legend' ? 'is-active' : ''}`}
              onClick={() => setFilter('Legend')}
            >
              <Crown size={13} /> Legends (25)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'Modern'}
              className={`avatar-tab ${filter === 'Modern' ? 'is-active' : ''}`}
              onClick={() => setFilter('Modern')}
            >
              <Flame size={13} /> Modern (25)
            </button>
          </div>
        </div>

        {/* Avatars Grid */}
        <div className="avatar-picker-grid-wrap" tabIndex={0} aria-label="Available footballer avatars">
          {filteredAvatars.length === 0 ? (
            <div className="avatar-picker-empty">
              <Search size={28} />
              <p>No footballers match &ldquo;{search}&rdquo;</p>
              <span>Try a different name like &ldquo;Messi&rdquo;, &ldquo;Zidane&rdquo;, or &ldquo;Haaland&rdquo;.</span>
            </div>
          ) : (
            <div className="avatar-picker-grid">
              {filteredAvatars.map(avatar => {
                const isSelected = selected?.id === avatar.id;
                const isCurrent = currentAvatarUrl === avatar.avatarUrl;

                return (
                  <button
                    key={avatar.id}
                    type="button"
                    className={`avatar-card ${isSelected ? 'is-selected' : ''} ${isCurrent ? 'is-current' : ''}`}
                    onClick={() => setSelected(avatar)}
                    aria-label={`Select ${avatar.name} (${avatar.role})`}
                    aria-pressed={isSelected}
                  >
                    <div className="avatar-card-image-wrap">
                      <Image
                        src={avatar.avatarUrl}
                        alt=""
                        width={64}
                        height={64}
                        className="avatar-card-image"
                      />
                      {isSelected && (
                        <span className="avatar-check-badge">
                          <Check size={13} strokeWidth={3} />
                        </span>
                      )}
                      {isCurrent && !isSelected && (
                        <span className="avatar-current-dot" title="Current avatar" />
                      )}
                    </div>
                    <span className="avatar-card-name">{avatar.name}</span>
                    <span className="avatar-card-meta">{avatar.role}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Error notice if saving fails */}
        {error && (
          <div className="avatar-picker-error" role="alert">
            <p>{error}</p>
          </div>
        )}

        {/* Footer / Selection Preview */}
        <footer className="avatar-picker-footer">
          {selected ? (
            <div className="avatar-preview-selected">
              <div className="avatar-preview-image">
                <Image
                  src={selected.avatarUrl}
                  alt={selected.name}
                  width={42}
                  height={42}
                />
              </div>
              <div className="avatar-preview-info">
                <strong>{selected.name}</strong>
                <span>{selected.era} · {selected.role}</span>
              </div>
            </div>
          ) : (
            <div className="avatar-preview-selected">
              <User size={20} />
              <span>Select an avatar</span>
            </div>
          )}

          <div className="avatar-picker-actions">
            <button
              type="button"
              className="account-secondary-button"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              className="account-primary-button avatar-save-button"
              onClick={handleApply}
              disabled={saving || !selected || isCurrentActive}
            >
              {saving ? (
                <>
                  <RefreshCw className="account-spinning" size={15} /> Saving...
                </>
              ) : isCurrentActive ? (
                <>
                  <Check size={15} /> Already Set
                </>
              ) : (
                <>
                  <Check size={15} /> Set Avatar
                </>
              )}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

