/* ═══════════════════════════════════════════════════════════════════
   Football Genius — Sidebar Controller
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // Game modes configuration
  const GAME_MODES = [
    {
      id: 'scoutsduel',
      label: "Scout's Duel",
      href: 'scouts-duel.html',
      iconImg: 'img/icons/scouts_duel.png'
    },
    {
      id: 'scoreline',
      label: 'Scoreline Hero',
      href: 'index.html',
      iconImg: 'img/icons/scoreline_hero.png'
    },
    {
      id: 'unscramble',
      label: 'Bootroom Scramble',
      href: 'unscramble.html',
      icon: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="6" width="6" height="6" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="15" y="12" width="6" height="6" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="9" y="3" width="6" height="6" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="9" y="15" width="6" height="6" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="5" y="11" font-size="5" fill="currentColor" font-weight="bold" text-anchor="middle">A</text><text x="12" y="7.5" font-size="5" fill="currentColor" font-weight="bold" text-anchor="middle">B</text><text x="18" y="17" font-size="5" fill="currentColor" font-weight="bold" text-anchor="middle">C</text><text x="12" y="20" font-size="5" fill="currentColor" font-weight="bold" text-anchor="middle">?</text></svg>`
    },
    {
      id: 'who',
      label: 'Tunnel Talk',
      href: 'who.html',
      icon: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7l-4 4V6a2 2 0 0 1 1-1.73z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><text x="12" y="14" font-size="10" fill="currentColor" font-weight="bold" text-anchor="middle">❝</text></svg>`
    },
    {
      id: 'higherLower',
      label: 'Higher or Lower',
      href: 'higherLower.html',
      icon: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7 14l5-5 5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 19l5-5 5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.4"/><line x1="4" y1="4" x2="20" y2="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.3"/></svg>`
    },
    {
      id: 'grid',
      label: 'Football Matrix',
      href: 'grid.html',
      icon: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="6.5" cy="6.5" r="1.5" fill="currentColor" opacity="0.5"/><circle cx="17.5" cy="17.5" r="1.5" fill="currentColor" opacity="0.5"/></svg>`
    },
    {
      id: 'transfer',
      label: 'JourneyMan',
      href: 'transfer.html',
      icon: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 17c3.2 0 3.8-10 8-10 2.2 0 2.8 3 5 3 1.3 0 2.1-.8 3-2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="4" cy="17" r="2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="7" r="2" fill="currentColor" opacity="0.55"/><circle cx="17" cy="10" r="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M19.5 6.5l1.8 1.8-1.8 1.8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    },
    {
      id: 'guess',
      label: 'Pixel Pitch',
      href: 'guess.html',
      icon: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><text x="12" y="11" font-size="6" fill="currentColor" font-weight="bold" text-anchor="middle">?</text></svg>`
    }
  ];

  // Detect current page
  function getCurrentPage() {
    const path = window.location.pathname;
    const file = path.split('/').pop() || 'index.html';
    return file;
  }

  // Build sidebar HTML
  function buildSidebar() {
    const currentPage = getCurrentPage();
    
    const nav = GAME_MODES.map(mode => {
      const isActive = currentPage === mode.href || 
                       (currentPage === '' && mode.href === 'index.html');
      const iconHTML = mode.iconImg
        ? `<img src="${mode.iconImg}" alt="${mode.label}" class="sidebar-icon-img" />`
        : mode.icon;
      return `
        <a href="${mode.href}" 
           class="sidebar-link${isActive ? ' active' : ''}${mode.iconImg ? ' has-img-icon' : ''}" 
           data-tooltip="${mode.label}"
           data-game="${mode.id}">
          <span class="sidebar-icon">${iconHTML}</span>
          <span class="sidebar-label">${mode.label}</span>
        </a>`;
    }).join('');

    const sidebarHTML = `
      <aside class="sidebar" id="gameSidebar">
        <div class="sidebar-header">
          <button class="sidebar-toggle" id="sidebarToggle" aria-label="Toggle sidebar">
            <svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
        <nav class="sidebar-nav" aria-label="Game modes">
          ${nav}
        </nav>
        <div class="sidebar-footer">
          <small>⚽ Game Hub</small>
        </div>
      </aside>
      <div class="sidebar-overlay" id="sidebarOverlay"></div>
      <button class="sidebar-hamburger" id="sidebarHamburger" aria-label="Open menu">☰</button>`;

    return sidebarHTML;
  }

  // Initialize sidebar
  function init() {
    // Don't double-init
    if (document.getElementById('gameSidebar')) return;

    // Add sidebar class to body
    document.body.classList.add('has-sidebar');

    // Insert sidebar at the start of body
    document.body.insertAdjacentHTML('afterbegin', buildSidebar());

    const sidebar  = document.getElementById('gameSidebar');
    const toggle   = document.getElementById('sidebarToggle');
    const overlay  = document.getElementById('sidebarOverlay');
    const hamburger = document.getElementById('sidebarHamburger');

    // Restore collapsed state from localStorage
    const wasExpanded = localStorage.getItem('fg-sidebar-expanded') === 'true';
    if (wasExpanded && window.innerWidth > 768) {
      sidebar.classList.add('expanded');
      document.body.classList.add('sidebar-expanded');
    }

    // Toggle expand/collapse (desktop)
    toggle.addEventListener('click', () => {
      const isExpanded = sidebar.classList.toggle('expanded');
      document.body.classList.toggle('sidebar-expanded', isExpanded);
      localStorage.setItem('fg-sidebar-expanded', isExpanded);
    });

    // Mobile hamburger
    hamburger.addEventListener('click', () => {
      sidebar.classList.add('mobile-open', 'expanded');
      overlay.classList.add('visible');
    });

    // Close on overlay click
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
      overlay.classList.remove('visible');
    });

    // Global smooth page transition for all internal links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      // Ignore external links, anchors, or new tabs
      if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('#') || link.target === '_blank') return;
      
      // If it's a sidebar link and it's active, do nothing
      if (link.classList.contains('sidebar-link') && link.classList.contains('active')) {
        e.preventDefault();
        return;
      }
      
      if (!e.ctrlKey && !e.metaKey) {
        e.preventDefault();

        // Close mobile sidebar if needed
        if (window.innerWidth <= 768 && sidebar.classList.contains('mobile-open')) {
          sidebar.classList.remove('mobile-open');
          overlay.classList.remove('visible');
        }

        // Highlight sidebar link if applicable
        if (link.classList.contains('sidebar-link')) {
          sidebar.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        }

        // Slide out main wrapper slightly without reducing opacity (prevent background bleed!)
        const wrapper = document.querySelector('.main-wrapper');
        if (wrapper) {
          wrapper.style.transition = 'transform 0.25s ease';
          wrapper.style.transform = 'scale(0.99) translateY(6px)';
        }

        // Add a global dark overlay to hide browser's white flash during navigation
        const fadeOverlay = document.createElement('div');
        fadeOverlay.style.position = 'fixed';
        fadeOverlay.style.inset = '0';
        fadeOverlay.style.backgroundColor = '#060e08'; 
        fadeOverlay.style.opacity = '0';
        fadeOverlay.style.transition = 'opacity 0.3s ease';
        fadeOverlay.style.zIndex = '999999';
        fadeOverlay.style.pointerEvents = 'none';
        document.body.appendChild(fadeOverlay);

        // Force reflow
        fadeOverlay.offsetHeight;
        fadeOverlay.style.opacity = '1';

        setTimeout(() => {
          window.location.href = href;
        }, 300);
      }
    });

    // Handle resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('visible');
      }
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
