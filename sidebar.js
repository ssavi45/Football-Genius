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
      iconImg: 'img/icons/unscramble.png'
    },
    {
      id: 'who',
      label: 'Tunnel Talk',
      href: 'who.html',
      iconImg: 'img/icons/tunnel_talk.png'
    },
    {
      id: 'higherLower',
      label: 'Higher or Lower',
      href: 'higherLower.html',
      iconImg: 'img/icons/higher_lower.png'
    },
    {
      id: 'grid',
      label: 'Football Matrix',
      href: 'grid.html',
      iconImg: 'img/icons/football_matrix.png'
    },
    {
      id: 'transfer',
      label: 'JourneyMan',
      href: 'transfer.html',
      iconImg: 'img/icons/journeyman.png'
    },
    {
      id: 'guess',
      label: 'Pixel Pitch',
      href: 'guess.html',
      iconImg: 'img/icons/pixel_pitch.png'
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


