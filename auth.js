import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://deojsgulvlyvskztfgfc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlb2pzZ3Vsdmx5dnNrenRmZ2ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MTg4MzgsImV4cCI6MjA4OTI5NDgzOH0.owPzJWrabPU_Jm_W_I2mJ6BkOIodFKUFe6J6kUKfDJ4';
const supabase = createClient(supabaseUrl, supabaseKey);

/* ── Helpers ──────────────────────────────────────────────────────── */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const truncate = (s, n = 22) => (s && s.length > n ? s.slice(0, n - 1) + '…' : s);

/* ── Inject Auth Modal HTML ──────────────────────────────────────── */
function injectModal() {
  if ($('#authOverlay')) return;

  const html = `
  <div id="authOverlay" class="auth-overlay" role="dialog" aria-modal="true" aria-label="Login or Sign Up">
    <div class="auth-card">
      <button class="auth-close" id="authClose" aria-label="Close">✕</button>
      <h2 class="auth-title">Welcome Back</h2>

      <!-- Tabs -->
      <div class="auth-tabs">
        <button class="auth-tab active" data-tab="login">Login</button>
        <button class="auth-tab" data-tab="signup">Sign Up</button>
      </div>

      <!-- ====== LOGIN VIEW ====== -->
      <div class="auth-view active" id="authLogin">
        <div class="auth-field">
          <label for="loginEmail">Email</label>
          <input id="loginEmail" type="email" placeholder="you@example.com" autocomplete="email" />
        </div>
        <div class="auth-field">
          <label for="loginPassword">Password</label>
          <div class="auth-password-wrap">
            <input id="loginPassword" type="password" placeholder="Your password" autocomplete="current-password" />
            <button type="button" class="auth-password-toggle" data-target="loginPassword" aria-label="Toggle password visibility">👁</button>
          </div>
        </div>
        <button class="auth-submit" id="loginBtn">Log In</button>
        <div class="auth-divider">or</div>
        <button class="auth-google" id="googleLoginBtn">
          <svg viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.0 24.0 0 0 0 0 21.56l7.98-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          Continue with Google
        </button>
        <div class="auth-msg" id="loginMsg"></div>
      </div>

      <!-- ====== SIGNUP VIEW ====== -->
      <div class="auth-view" id="authSignup">
        <div class="auth-field">
          <label for="signupEmail">Email</label>
          <input id="signupEmail" type="email" placeholder="you@example.com" autocomplete="email" />
        </div>
        <div class="auth-field">
          <label for="signupPassword">Password</label>
          <div class="auth-password-wrap">
            <input id="signupPassword" type="password" placeholder="At least 6 characters" autocomplete="new-password" />
            <button type="button" class="auth-password-toggle" data-target="signupPassword" aria-label="Toggle password visibility">👁</button>
          </div>
        </div>
        <button class="auth-submit" id="signupBtn">Create Account</button>
        <div class="auth-divider">or</div>
        <button class="auth-google" id="googleSignupBtn">
          <svg viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.0 24.0 0 0 0 0 21.56l7.98-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          Sign up with Google
        </button>
        <div class="auth-msg" id="signupMsg"></div>
      </div>

      <!-- ====== OTP VERIFICATION VIEW ====== -->
      <div class="auth-view" id="authOtp">
        <div class="auth-otp-section">
          <p class="auth-otp-info">
            We just sent a 6-digit code to<br/>
            <strong id="otpEmailDisplay">your email</strong>
          </p>
          <input class="auth-otp-input" id="otpCode" type="text" maxlength="6"
                 placeholder="000000" inputmode="numeric" autocomplete="one-time-code" />
          <br/>
          <button class="auth-submit" id="verifyOtpBtn">Verify Email</button>
          <div class="auth-msg" id="otpMsg"></div>
          <button class="auth-resend" id="resendOtpBtn">Resend code</button>
          <br/>
          <button class="auth-back" id="otpBackBtn">← Back to Sign Up</button>
        </div>
      </div>
    </div>
  </div>`;

  document.body.insertAdjacentHTML('beforeend', html);
  wireModal();
}

/* ── Wire Modal Events ───────────────────────────────────────────── */
function wireModal() {
  const overlay = $('#authOverlay');
  const card = overlay.querySelector('.auth-card');

  // Close button
  $('#authClose').addEventListener('click', closeAuth);

  // Click outside card closes
  overlay.addEventListener('click', (e) => {
    if (!card.contains(e.target)) closeAuth();
  });

  // Escape key closes
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeAuth();
  });

  // Tab switching
  $$('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Password visibility toggles
  $$('.auth-password-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = $(`#${btn.dataset.target}`);
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.textContent = isPassword ? '🙈' : '👁';
    });
  });

  // Login form
  $('#loginBtn').addEventListener('click', handleLogin);
  $('#loginPassword').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleLogin();
  });

  // Signup form
  $('#signupBtn').addEventListener('click', handleSignup);
  $('#signupPassword').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSignup();
  });

  // Google OAuth (same handler for both tabs)
  $('#googleLoginBtn').addEventListener('click', handleGoogleAuth);
  $('#googleSignupBtn').addEventListener('click', handleGoogleAuth);

  // OTP verification
  $('#verifyOtpBtn').addEventListener('click', handleVerifyOtp);
  $('#otpCode').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleVerifyOtp();
  });
  $('#resendOtpBtn').addEventListener('click', handleResendOtp);
  $('#otpBackBtn').addEventListener('click', () => switchTab('signup'));
}

/* ── Tab Switching ───────────────────────────────────────────────── */
function switchTab(tab) {
  // Update tab buttons
  $$('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));

  // Update title
  const title = $('.auth-title');
  if (tab === 'login') title.textContent = 'Welcome Back';
  if (tab === 'signup') title.textContent = 'Create Account';
  if (tab === 'otp') title.textContent = 'Verify Email';

  // Show/hide views
  const views = { login: '#authLogin', signup: '#authSignup', otp: '#authOtp' };
  Object.entries(views).forEach(([key, sel]) => {
    $(sel).classList.toggle('active', key === tab);
  });

  // Hide tabs when in OTP view but show them otherwise
  $('.auth-tabs').style.display = tab === 'otp' ? 'none' : 'flex';

  // Clear messages
  clearMessages();
}

/* ── Open / Close ────────────────────────────────────────────────── */
function openAuth() {
  injectModal();
  switchTab('login');
  const overlay = $('#authOverlay');
  // Force reflow before adding class so transition fires
  void overlay.offsetWidth;
  overlay.classList.add('open');
  setTimeout(() => $('#loginEmail')?.focus(), 200);
}

function closeAuth() {
  const overlay = $('#authOverlay');
  if (overlay) overlay.classList.remove('open');
}

/* ── Message helpers ─────────────────────────────────────────────── */
function showMsg(id, text, type = 'error') {
  const el = $(`#${id}`);
  if (!el) return;
  el.textContent = text;
  el.className = 'auth-msg ' + type;
}

function clearMessages() {
  $$('.auth-msg').forEach(el => { el.textContent = ''; el.className = 'auth-msg'; });
}

function setLoading(btnId, loading) {
  const btn = $(`#${btnId}`);
  if (!btn) return;
  btn.disabled = loading;
  if (loading) {
    btn._savedText = btn.textContent;
    btn.innerHTML = '<span class="auth-spinner"></span> Please wait…';
  } else {
    btn.innerHTML = btn._savedText || btn.textContent;
  }
}

/* ── Auth Handlers ───────────────────────────────────────────────── */

// Pending signup email (used by OTP flow)
let _pendingEmail = '';
let _pendingPassword = '';

async function handleLogin() {
  clearMessages();
  const email = $('#loginEmail').value.trim();
  const password = $('#loginPassword').value;

  if (!email || !password) {
    showMsg('loginMsg', 'Please enter both email and password.');
    return;
  }

  setLoading('loginBtn', true);
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  setLoading('loginBtn', false);

  if (error) {
    showMsg('loginMsg', error.message);
  } else {
    showMsg('loginMsg', 'Logged in successfully!', 'success');
    setTimeout(closeAuth, 600);
    updateAuthUI();
  }
}

async function handleSignup() {
  clearMessages();
  const email = $('#signupEmail').value.trim();
  const password = $('#signupPassword').value;

  if (!email) {
    showMsg('signupMsg', 'Please enter your email.');
    return;
  }
  if (password.length < 6) {
    showMsg('signupMsg', 'Password must be at least 6 characters.');
    return;
  }

  setLoading('signupBtn', true);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin
    }
  });
  setLoading('signupBtn', false);

  if (error) {
    showMsg('signupMsg', error.message);
    return;
  }

  // If email confirmations are enabled, the user needs to verify via OTP
  // Supabase sends the OTP automatically on signUp
  _pendingEmail = email;
  _pendingPassword = password;

  // Check if user was auto-confirmed (email confirmations disabled in Supabase)
  if (data?.session) {
    // User was auto-confirmed — no OTP needed
    showMsg('signupMsg', 'Account created! You are now logged in.', 'success');
    setTimeout(closeAuth, 600);
    updateAuthUI();
    await ensureProfile(data.session.user);
  } else {
    // Switch to OTP view
    $('#otpEmailDisplay').textContent = email;
    switchTab('otp');
    showMsg('otpMsg', 'Check your email for a 6-digit verification code.', 'info');
    setTimeout(() => $('#otpCode')?.focus(), 200);
  }
}

async function handleVerifyOtp() {
  clearMessages();
  const token = $('#otpCode').value.trim();

  if (!token || token.length < 6) {
    showMsg('otpMsg', 'Please enter the 6-digit code from your email.');
    return;
  }

  setLoading('verifyOtpBtn', true);
  const { data, error } = await supabase.auth.verifyOtp({
    email: _pendingEmail,
    token,
    type: 'signup'
  });
  setLoading('verifyOtpBtn', false);

  if (error) {
    showMsg('otpMsg', error.message);
    return;
  }

  showMsg('otpMsg', 'Email verified! You are now logged in.', 'success');
  if (data?.user) await ensureProfile(data.user);
  updateAuthUI();
  setTimeout(closeAuth, 800);
}

async function handleResendOtp() {
  clearMessages();
  if (!_pendingEmail) {
    showMsg('otpMsg', 'No pending signup. Please go back and sign up again.');
    return;
  }

  const btn = $('#resendOtpBtn');
  btn.disabled = true;
  btn.textContent = 'Sending…';

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: _pendingEmail
  });

  if (error) {
    showMsg('otpMsg', error.message);
  } else {
    showMsg('otpMsg', 'New code sent! Check your email.', 'success');
  }

  // Cooldown: disable for 30 seconds
  let countdown = 30;
  btn.textContent = `Resend in ${countdown}s`;
  const timer = setInterval(() => {
    countdown--;
    btn.textContent = `Resend in ${countdown}s`;
    if (countdown <= 0) {
      clearInterval(timer);
      btn.disabled = false;
      btn.textContent = 'Resend code';
    }
  }, 1000);
}

async function handleGoogleAuth() {
  clearMessages();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.href
    }
  });
  if (error) {
    showMsg('loginMsg', error.message);
    showMsg('signupMsg', error.message);
  }
}

/* ══════════════════════════════════════════════════════════════════
   DASHBOARD PANEL
   ══════════════════════════════════════════════════════════════════ */

function injectDashboard() {
  if ($('#dashOverlay')) return;

  const html = `
  <div id="dashOverlay" class="dash-overlay"></div>
  <aside id="dashPanel" class="dash-panel" role="dialog" aria-label="Dashboard">
    <div class="dash-header">
      <h2>My Dashboard</h2>
      <button class="dash-close" id="dashClose" aria-label="Close">✕</button>
    </div>
    <div class="dash-body">
      <!-- Profile -->
      <div class="dash-profile" id="dashProfile">
        <div class="dash-avatar-initials" id="dashAvatar">?</div>
        <div class="dash-profile-info">
          <div class="dash-profile-name" id="dashName">—</div>
          <div class="dash-profile-email" id="dashEmail">—</div>
          <div class="dash-profile-since" id="dashSince"></div>
        </div>
      </div>

      <!-- Stats -->
      <div class="dash-section">Stats Overview</div>
      <div class="dash-stats">
        <div class="dash-stat">
          <div class="dash-stat-label">Games Played</div>
          <div class="dash-stat-value accent" id="dashGames">0</div>
        </div>
        <div class="dash-stat">
          <div class="dash-stat-label">Total Points</div>
          <div class="dash-stat-value" id="dashPoints">0</div>
        </div>
        <div class="dash-stat">
          <div class="dash-stat-label">Best Score</div>
          <div class="dash-stat-value" id="dashBest">0</div>
        </div>
        <div class="dash-stat">
          <div class="dash-stat-label">Avg Score</div>
          <div class="dash-stat-value" id="dashAvg">0</div>
        </div>
      </div>

      <!-- Score History -->
      <div class="dash-section">Recent Games</div>
      <div class="dash-history" id="dashHistory">
        <div class="dash-loading">Loading…</div>
      </div>

      <!-- Edit Name -->
      <div class="dash-section">Display Name</div>
      <div class="dash-edit-row">
        <input class="dash-edit-input" id="dashEditName" type="text" placeholder="Your display name" />
        <button class="dash-edit-save" id="dashEditSave">Save</button>
      </div>
      <div class="dash-edit-msg" id="dashEditMsg"></div>

      <!-- Logout -->
      <button class="dash-logout" id="dashLogout">Sign Out</button>
    </div>
  </aside>`;

  document.body.insertAdjacentHTML('beforeend', html);
  wireDashboard();
}

function wireDashboard() {
  $('#dashClose').addEventListener('click', closeDashboard);
  $('#dashOverlay').addEventListener('click', closeDashboard);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && $('#dashPanel')?.classList.contains('open')) closeDashboard();
  });
  $('#dashLogout').addEventListener('click', async () => {
    await supabase.auth.signOut();
    closeDashboard();
    updateAuthUI();
  });
  $('#dashEditSave').addEventListener('click', handleEditName);
  $('#dashEditName').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleEditName();
  });
}

function resetDashboardDOM() {
  // Reset avatar container to initial state (fixes reopen bug)
  const profileEl = $('#dashProfile');
  if (profileEl) {
    const existingAvatar = profileEl.querySelector('.dash-avatar, .dash-avatar-initials');
    if (existingAvatar) existingAvatar.remove();
    const fresh = document.createElement('div');
    fresh.className = 'dash-avatar-initials';
    fresh.id = 'dashAvatar';
    fresh.textContent = '?';
    profileEl.prepend(fresh);
  }
  // Clear stale messages
  const editMsg = $('#dashEditMsg');
  if (editMsg) { editMsg.textContent = ''; editMsg.className = 'dash-edit-msg'; }
}

function openDashboard() {
  injectDashboard();
  resetDashboardDOM();
  const overlay = $('#dashOverlay');
  const panel = $('#dashPanel');
  void panel.offsetWidth;
  overlay.classList.add('open');
  panel.classList.add('open');
  loadDashboardData();
}

function closeDashboard() {
  $('#dashOverlay')?.classList.remove('open');
  $('#dashPanel')?.classList.remove('open');
}

const MODE_META = {
  scoreline: {
    key: 'scoreline',
    label: 'Scoreline Hero',
    shortLabel: 'Scoreline',
    href: 'index.html',
    iconImg: 'img/icons/scoreline_hero.png'
  },
  unscramble: {
    key: 'unscramble',
    label: 'Bootroom Scramble',
    shortLabel: 'Scramble',
    href: 'unscramble.html',
    iconImg: 'img/icons/unscramble.png'
  },
  whosaidit: {
    key: 'whosaidit',
    label: 'Tunnel Talk',
    shortLabel: 'Quotes',
    href: 'who.html',
    iconImg: 'img/icons/tunnel_talk.png'
  },
  higherlower: {
    key: 'higherlower',
    label: 'Higher / Lower',
    shortLabel: 'Higher/Lower',
    href: 'higherLower.html',
    iconImg: 'img/icons/higher_lower.png'
  },
  grid: {
    key: 'grid',
    label: 'Football Matrix',
    shortLabel: 'Matrix',
    href: 'grid.html',
    iconImg: 'img/icons/football_matrix.png'
  },
  transfer: {
    key: 'transfer',
    label: 'JourneyMan',
    shortLabel: 'JourneyMan',
    href: 'transfer.html',
    iconImg: 'img/icons/journeyman.png'
  },
  guess: {
    key: 'guess',
    label: 'Pixel Pitch',
    shortLabel: 'Pixel Pitch',
    href: 'guess.html',
    iconImg: 'img/icons/pixel_pitch.png'
  },
  scoutsduel: {
    key: 'scoutsduel',
    label: "Scout's Duel",
    shortLabel: 'Scout Duel',
    href: 'scouts-duel.html',
    iconImg: 'img/icons/scouts_duel.png'
  }
};

const MODE_LABELS = Object.fromEntries(
  Object.values(MODE_META).map(mode => [mode.key, mode.label])
);

function formatRelativeDate(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function normalizeDisplayName(name, fallback = '') {
  const normalized = String(name || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 32);
  return normalized || fallback;
}

function toSafeImageUrl(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url, window.location.href);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
  } catch (_err) {
    return null;
  }
  return null;
}

function clearChildren(el) {
  if (el) el.replaceChildren();
}

function createInitialsAvatar(name, cls = '') {
  const initials = _getInitials(name);
  const avatar = document.createElement('div');
  avatar.className = cls;
  avatar.textContent = initials;
  return avatar;
}

function createLeaderboardAvatar(name, url, cls = '') {
  const safeUrl = toSafeImageUrl(url);
  const initialsClass = cls.replace('avatar', 'avatar-initials');
  if (!safeUrl) return createInitialsAvatar(name, initialsClass);

  const img = document.createElement('img');
  img.className = cls;
  img.src = safeUrl;
  img.alt = `${name || 'Player'} avatar`;
  img.onerror = () => {
    img.replaceWith(createInitialsAvatar(name, initialsClass));
  };
  return img;
}

function setSimpleState(container, className, text, iconText = '') {
  clearChildren(container);
  const stateEl = document.createElement('div');
  stateEl.className = className;

  if (iconText) {
    const icon = document.createElement('div');
    icon.className = 'lb-empty-icon';
    icon.textContent = iconText;
    stateEl.appendChild(icon);
  }

  stateEl.appendChild(document.createTextNode(text));
  container.appendChild(stateEl);
}

async function loadDashboardData() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const user = session.user;

    // Profile
    const name = normalizeDisplayName(
      user.user_metadata?.full_name || user.user_metadata?.name,
      user.email || 'Player'
    );
    const email = user.email || '';
    const avatarUrl = toSafeImageUrl(user.user_metadata?.avatar_url);
    const createdAt = user.created_at;

    $('#dashName').textContent = name;
    $('#dashEmail').textContent = email;
    $('#dashEditName').value = name;

    if (createdAt) {
      const d = new Date(createdAt);
      $('#dashSince').textContent = `Member since ${d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}`;
    }

    // Avatar — use the freshly-reset #dashAvatar element
    const avatarEl = $('#dashAvatar');
    if (avatarEl && avatarUrl) {
      const img = document.createElement('img');
      img.src = avatarUrl;
      img.alt = name;
      img.className = 'dash-avatar';
      img.id = 'dashAvatar'; // preserve the ID so future resets can find it
      img.onerror = () => {
        // On error, swap back to initials
        const fallback = document.createElement('div');
        fallback.className = 'dash-avatar-initials';
        fallback.id = 'dashAvatar';
        fallback.textContent = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
        img.replaceWith(fallback);
      };
      avatarEl.replaceWith(img);
    } else if (avatarEl) {
      const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      avatarEl.textContent = initials || '?';
    }

  // Scores
  const { data: scores, error } = await supabase
    .from('scores')
    .select('mode, score, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  const historyEl = $('#dashHistory');

  if (error || !scores) {
    setSimpleState(historyEl, 'dash-history-empty', 'Could not load scores.');
    return;
  }

  // Stats
  const totalGames = scores.length;
  const totalPoints = scores.reduce((s, r) => s + r.score, 0);
  const bestScore = scores.length ? Math.max(...scores.map(r => r.score)) : 0;
  const avgScore = totalGames ? Math.round(totalPoints / totalGames) : 0;

  $('#dashGames').textContent = totalGames;
  $('#dashPoints').textContent = totalPoints.toLocaleString();
  $('#dashBest').textContent = bestScore;
  $('#dashAvg').textContent = avgScore;

  // History list
  if (scores.length === 0) {
    setSimpleState(historyEl, 'dash-history-empty', 'No games played yet. Go play!');
    return;
  }

  const list = document.createElement('div');
  list.className = 'dash-history-list';

  scores.forEach(r => {
    const modeLabel = MODE_LABELS[r.mode] || r.mode;
    const modeClass = MODE_LABELS[r.mode] ? r.mode : 'scoreline';

    const row = document.createElement('div');
    row.className = 'dash-history-row';

    const modeWrap = document.createElement('div');
    modeWrap.className = 'dash-history-mode';

    const badge = document.createElement('span');
    badge.className = `mode-badge ${modeClass}`;
    badge.textContent = modeLabel;
    modeWrap.appendChild(badge);

    const scoreEl = document.createElement('div');
    scoreEl.className = 'dash-history-score';
    scoreEl.textContent = `${r.score} pts`;

    const dateEl = document.createElement('div');
    dateEl.className = 'dash-history-date';
    dateEl.textContent = formatRelativeDate(r.created_at);

    row.appendChild(modeWrap);
    row.appendChild(scoreEl);
    row.appendChild(dateEl);
    list.appendChild(row);
  });
  historyEl.replaceChildren(list);
  } catch (err) {
    console.warn('Dashboard data error:', err);
  }
}
async function handleEditName() {
  const input = $('#dashEditName');
  const newName = normalizeDisplayName(input.value);
  const msgEl = $('#dashEditMsg');
  input.value = newName;
  if (!newName) {
    msgEl.textContent = 'Name cannot be empty.';
    msgEl.className = 'dash-edit-msg error';
    return;
  }

  const btn = $('#dashEditSave');
  btn.disabled = true;
  btn.textContent = 'Saving…';

  const { error } = await supabase.auth.updateUser({
    data: { full_name: newName, name: newName }
  });

  if (error) {
    msgEl.textContent = error.message;
    msgEl.className = 'dash-edit-msg error';
  } else {
    // Also update profiles table
    const session = await getSession();
    if (session?.user) {
      await supabase.from('profiles').update({ username: newName }).eq('id', session.user.id);
    }
    msgEl.textContent = 'Name updated!';
    msgEl.className = 'dash-edit-msg success';
    $('#dashName').textContent = newName;
    updateAuthUI();
  }

  btn.disabled = false;
  btn.textContent = 'Save';
  setTimeout(() => { msgEl.textContent = ''; }, 3000);
}

/* ── Auth UI Update (header button) ──────────────────────────────── */
async function updateAuthUI() {
  const btn = $('#btnAuth');
  if (!btn) return;

  const { data: { session } } = await supabase.auth.getSession();
  _cachedSession = session;
  const label = btn.querySelector('.user-profile-inner p') || btn;

  if (session?.user) {
    const name = session.user.user_metadata?.full_name
      || session.user.user_metadata?.name
      || session.user.email;
    label.textContent = truncate(name, 22);
    btn.setAttribute('title', 'Open Dashboard');
    await ensureProfile(session.user);
  } else {
    label.textContent = 'Login / Register';
    btn.setAttribute('title', 'Login / Register');
  }
}

/* ── Auth Click Handler ──────────────────────────────────────────── */
// Cache auth state so clicks respond instantly
let _cachedSession = null;

async function handleAuthClick() {
  try {
    // Use cached session for instant response, then verify in background
    if (_cachedSession?.user) {
      openDashboard();
    } else {
      const { data: { session } } = await supabase.auth.getSession();
      _cachedSession = session;
      if (session?.user) {
        openDashboard();
      } else {
        openAuth();
      }
    }
  } catch (err) {
    console.warn('Auth click error:', err);
    // Fallback: open auth modal
    openAuth();
  }
}

/* ── Profile ─────────────────────────────────────────────────────── */
async function ensureProfile(user) {
  if (!user) return;
  const username = normalizeDisplayName(
    user.user_metadata?.user_name
      || user.user_metadata?.full_name
      || user.user_metadata?.name
  );
  const avatarUrl = toSafeImageUrl(user.user_metadata?.avatar_url);
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      username: username || null,
      avatar_url: avatarUrl || null
    }, { onConflict: 'id' });
  if (error) console.warn('ensureProfile error:', error.message);
}

/* ── Public API ──────────────────────────────────────────────────── */
async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

async function saveScore(mode, score) {
  const session = await getSession();
  if (!session?.user) return { error: new Error('Not signed in') };
  return await supabase.from('scores').insert({
    user_id: session.user.id,
    mode,
    score
  });
}

async function getLeaderboard(mode = null, period = 'all', limit = 50) {
  try {
    const { data, error } = await supabase.rpc('get_leaderboard', {
      p_mode: mode,
      p_period: period,
      p_limit: limit
    });
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.warn('getLeaderboard RPC error, falling back to client query:', err.message);
    // Fallback: client-side query if RPC not yet created
    let query = supabase
      .from('scores')
      .select('user_id, score, created_at, mode')
      .order('score', { ascending: false })
      .limit(10000);
    if (mode) query = query.eq('mode', mode);
    if (period === 'daily') {
      const dayAgo = new Date(Date.now() - 86400000).toISOString();
      query = query.gte('created_at', dayAgo);
    } else if (period === 'weekly') {
      const weekAgo = new Date(Date.now() - 604800000).toISOString();
      query = query.gte('created_at', weekAgo);
    }
    const { data: scores, error: qErr } = await query;
    if (qErr || !scores) return { data: [], error: qErr };

    // Client-side aggregation: best score per user
    const byUser = {};
    scores.forEach(s => {
      if (!byUser[s.user_id] || s.score > byUser[s.user_id].best_score) {
        byUser[s.user_id] = { user_id: s.user_id, best_score: s.score, games_played: 0 };
      }
      byUser[s.user_id].games_played++;
    });
    // Fetch profiles for these users
    const userIds = Object.keys(byUser);
    let profiles = {};
    if (userIds.length) {
      const { data: pData } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);
      (pData || []).forEach(p => { profiles[p.id] = p; });
    }
    const ranked = Object.values(byUser)
      .sort((a, b) => b.best_score - a.best_score)
      .slice(0, limit)
      .map((entry, i) => ({
        rank: i + 1,
        user_id: entry.user_id,
        username: profiles[entry.user_id]?.username || null,
        avatar_url: profiles[entry.user_id]?.avatar_url || null,
        best_score: entry.best_score,
        games_played: entry.games_played
      }));
    return { data: ranked, error: null };
  }
}

/* ══════════════════════════════════════════════════════════════════
   LEADERBOARD (Stadium Podium)
   ══════════════════════════════════════════════════════════════════ */

let _lbState = { mode: null, period: 'weekly', updatedAt: null };

const LEADERBOARD_MODES = [
  ...Object.values(MODE_META),
  {
    key: null,
    label: 'Overall',
    shortLabel: 'Overall',
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 20h10"/><path d="M9 18v-3"/><path d="M15 18v-3"/><path d="M7 4h10v2a5 5 0 0 1-5 5 5 5 0 0 1-5-5Z"/><path d="M7 5H4a2 2 0 0 0 2 3h1"/><path d="M17 5h3a2 2 0 0 1-2 3h-1"/></svg>`
  }
];

function getCurrentLeaderboardMode() {
  const file = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const pageMode = {
    '': 'scoreline',
    'index.html': 'scoreline',
    'unscramble.html': 'unscramble',
    'who.html': 'whosaidit',
    'higherlower.html': 'higherlower',
    'grid.html': 'grid',
    'transfer.html': 'transfer',
    'guess.html': 'guess',
    'scouts-duel.html': 'scoutsduel'
  };
  return pageMode[file] || 'scoreline';
}

function getLeaderboardModeMeta(mode) {
  if (mode === null) return LEADERBOARD_MODES[LEADERBOARD_MODES.length - 1];
  return MODE_META[mode] || MODE_META.scoreline;
}

function getLeaderboardModeValue(value) {
  return value === '__overall' ? null : value;
}

function getLeaderboardPeriodLabel(period) {
  const labels = {
    daily: 'Today',
    weekly: 'This Week',
    all: 'All-Time'
  };
  return labels[period] || 'All-Time';
}

function getLeaderboardContextLabel(mode, period) {
  return `${getLeaderboardModeMeta(mode).label} | ${getLeaderboardPeriodLabel(period)} | Best Score`;
}

function formatLeaderboardScore(value) {
  return `${Number(value || 0).toLocaleString()} pts`;
}

function formatGameCount(value) {
  const games = Number(value || 0);
  return `${games.toLocaleString()} game${games === 1 ? '' : 's'}`;
}

function formatLeaderboardUpdated(iso) {
  if (!iso) return 'Waiting for the first score';
  return `Updated ${formatRelativeDate(iso)}`;
}

function formatRecentForm(scores = []) {
  if (!scores.length) return 'No recent form yet';
  return scores.slice(0, 3).map(score => Number(score || 0)).join(' • ');
}

function getLeaderboardPeriodCutoff(period) {
  const now = Date.now();
  if (period === 'daily') return new Date(now - 86400000).toISOString();
  if (period === 'weekly') return new Date(now - 604800000).toISOString();
  return null;
}

function buildModeTabMarkup(mode, isActive) {
  const iconMarkup = mode.iconImg
    ? `<img src="${mode.iconImg}" alt="" class="lb-mode-icon-img" />`
    : `<span class="lb-mode-icon-svg">${mode.icon || ''}</span>`;
  return `
    <button class="lb-mode-tab${isActive ? ' active' : ''}" data-mode="${mode.key === null ? '__overall' : mode.key}">
      <span class="lb-mode-icon">${iconMarkup}</span>
      <span class="lb-mode-label">${mode.shortLabel || mode.label}</span>
    </button>
  `;
}

function legacyInjectLeaderboard() {
  if ($('#lbOverlay')) return;

  const currentMode = _lbState.mode ?? getCurrentLeaderboardMode();
  const modeTabs = LEADERBOARD_MODES
    .map(mode => buildModeTabMarkup(mode, mode.key === currentMode))
    .join('');

  const html = `
  <div id="lbOverlay" class="lb-overlay" role="dialog" aria-modal="true" aria-label="Leaderboard">
    <div class="lb-panel">
      <div class="lb-header">
        <h2 class="lb-title">🏆 Leaderboard</h2>
        <button class="lb-close" id="lbClose" aria-label="Close">✕</button>
      </div>

      <div class="lb-filters">
        <div class="lb-mode-tabs" id="lbModeTabs">${modeTabs}</div>
        <div class="lb-period-pills" id="lbPeriodPills">
          <button class="lb-period-pill" data-period="daily">Today</button>
          <button class="lb-period-pill" data-period="weekly">This Week</button>
          <button class="lb-period-pill active" data-period="all">All Time</button>
        </div>
      </div>

      <div id="lbPodium" class="lb-podium"></div>

      <div class="lb-list-wrap">
        <div id="lbList" class="lb-list"></div>
      </div>

      <div id="lbYourRank" class="lb-your-rank" hidden>
        <span class="lb-your-rank-label">Your Rank</span>
        <span class="lb-your-rank-value" id="lbYourRankVal">#—</span>
        <span class="lb-your-rank-score" id="lbYourRankScore"></span>
      </div>
    </div>
  </div>`;

  document.body.insertAdjacentHTML('beforeend', html);
  legacyWireLeaderboard();
}

function legacyWireLeaderboard() {
  const overlay = $('#lbOverlay');
  const panel = overlay.querySelector('.lb-panel');

  // Close
  $('#lbClose').addEventListener('click', legacyCloseLeaderboard);
  overlay.addEventListener('click', (e) => {
    if (!panel.contains(e.target)) legacyCloseLeaderboard();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) legacyCloseLeaderboard();
  });

  // Mode tabs
  $$('#lbModeTabs .lb-mode-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('#lbModeTabs .lb-mode-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      _lbState.mode = tab.dataset.mode === 'null' ? null : tab.dataset.mode;
      legacyLoadLeaderboardData();
    });
  });

  // Period pills
  $$('#lbPeriodPills .lb-period-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      $$('#lbPeriodPills .lb-period-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      _lbState.period = pill.dataset.period;
      legacyLoadLeaderboardData();
    });
  });
}

function legacyOpenLeaderboard() {
  legacyInjectLeaderboard();
  const overlay = $('#lbOverlay');
  void overlay.offsetWidth;
  overlay.classList.add('open');
  legacyLoadLeaderboardData();
}

function legacyCloseLeaderboard() {
  const overlay = $('#lbOverlay');
  if (overlay) overlay.classList.remove('open');
}

function _getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

async function legacyLoadLeaderboardData() {
  const podiumEl = $('#lbPodium');
  const listEl = $('#lbList');
  const yourRankEl = $('#lbYourRank');

  if (!podiumEl || !listEl) return;

  // Show loading
  clearChildren(podiumEl);
  setSimpleState(listEl, 'lb-loading', 'Loading rankings...');
  yourRankEl.hidden = true;

  // Fetch data
  const { data, error } = await getLeaderboard(_lbState.mode, _lbState.period);

  if (error || !data) {
    setSimpleState(listEl, 'lb-empty', 'Could not load leaderboard.', '😕');
    return;
  }

  if (data.length === 0) {
    clearChildren(podiumEl);
    setSimpleState(listEl, 'lb-empty', 'No scores yet. Be the first to play!', '🏟️');
    return;
  }

  // Current user ID
  const session = _cachedSession || (await supabase.auth.getSession()).data?.session;
  const myId = session?.user?.id || null;

  // Render Podium (top 3)
  const top3 = data.slice(0, 3);
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
  const rankLabels = { 1: '1st', 2: '2nd', 3: '3rd' };

  podiumOrder.forEach(entry => {
    const r = Number(entry.rank);
    const name = normalizeDisplayName(entry.username, 'Player');

    const card = document.createElement('div');
    card.className = 'lb-podium-card';
    card.dataset.rank = String(r);

    if (r === 1) {
      const crown = document.createElement('span');
      crown.className = 'lb-crown';
      crown.textContent = '👑';
      card.appendChild(crown);
    }

    const avatarWrap = document.createElement('div');
    avatarWrap.className = 'lb-podium-avatar-wrap';
    avatarWrap.appendChild(createLeaderboardAvatar(name, entry.avatar_url, 'lb-podium-avatar'));

    const ring = document.createElement('div');
    ring.className = 'lb-podium-avatar-ring';
    avatarWrap.appendChild(ring);

    const nameEl = document.createElement('div');
    nameEl.className = 'lb-podium-name';
    nameEl.textContent = name;

    const scoreEl = document.createElement('div');
    scoreEl.className = 'lb-podium-score';
    scoreEl.textContent = `${entry.best_score} pts`;

    const badgeEl = document.createElement('div');
    badgeEl.className = 'lb-podium-badge';
    badgeEl.textContent = rankLabels[r] || `#${r}`;

    const gamesEl = document.createElement('div');
    gamesEl.className = 'lb-podium-games';
    gamesEl.textContent = `${entry.games_played} game${entry.games_played === 1 ? '' : 's'}`;

    card.appendChild(avatarWrap);
    card.appendChild(nameEl);
    card.appendChild(scoreEl);
    card.appendChild(badgeEl);
    card.appendChild(gamesEl);
    podiumEl.appendChild(card);
  });

  // Render ranked list (#4 onwards)
  const rest = data.slice(3);
  if (rest.length === 0) {
    clearChildren(listEl);
  } else {
    const fragment = document.createDocumentFragment();
    rest.forEach(entry => {
      const isMe = entry.user_id === myId;
      const name = normalizeDisplayName(entry.username, 'Player');

      const row = document.createElement('div');
      row.className = `lb-row${isMe ? ' lb-me' : ''}`;

      const rankEl = document.createElement('div');
      rankEl.className = 'lb-row-rank';
      rankEl.textContent = `#${entry.rank}`;

      const infoEl = document.createElement('div');
      infoEl.className = 'lb-row-info';

      const nameEl = document.createElement('div');
      nameEl.className = 'lb-row-name';
      nameEl.textContent = isMe ? `${name} (You)` : name;

      const gamesEl = document.createElement('div');
      gamesEl.className = 'lb-row-games';
      gamesEl.textContent = `${entry.games_played} game${entry.games_played === 1 ? '' : 's'}`;

      const scoreEl = document.createElement('div');
      scoreEl.className = 'lb-row-score';
      scoreEl.textContent = `${entry.best_score} pts`;

      infoEl.appendChild(nameEl);
      infoEl.appendChild(gamesEl);

      row.appendChild(rankEl);
      row.appendChild(createLeaderboardAvatar(name, entry.avatar_url, 'lb-row-avatar'));
      row.appendChild(infoEl);
      row.appendChild(scoreEl);
      fragment.appendChild(row);
    });
    listEl.replaceChildren(fragment);
  }

  // Your rank banner
  if (myId) {
    const myEntry = data.find(e => e.user_id === myId);
    if (myEntry) {
      yourRankEl.hidden = false;
      $('#lbYourRankVal').textContent = `#${myEntry.rank}`;
      $('#lbYourRankScore').textContent = `${myEntry.best_score} pts`;
    } else {
      yourRankEl.hidden = true;
    }
  }
}

function syncLeaderboardControls() {
  const contextEl = $('#lbContextLine');
  if (contextEl) contextEl.textContent = getLeaderboardContextLabel(_lbState.mode, _lbState.period);

  $$('#lbModeTabs .lb-mode-tab').forEach(tab => {
    const mode = getLeaderboardModeValue(tab.dataset.mode);
    tab.classList.toggle('active', mode === _lbState.mode);
  });

  $$('#lbPeriodPills .lb-period-pill').forEach(pill => {
    pill.classList.toggle('active', pill.dataset.period === _lbState.period);
  });
}

function injectLeaderboard() {
  if ($('#lbOverlay')) return;

  const currentMode = _lbState.mode ?? getCurrentLeaderboardMode();
  const modeTabs = LEADERBOARD_MODES
    .map(mode => buildModeTabMarkup(mode, mode.key === currentMode))
    .join('');

  const html = `
  <div id="lbOverlay" class="lb-overlay" role="dialog" aria-modal="true" aria-label="Leaderboard">
    <section class="lb-screen">
      <header class="lb-header">
        <div class="lb-header-main">
          <button class="lb-close" id="lbClose" aria-label="Close leaderboard">
            <span aria-hidden="true">&larr;</span>
          </button>
          <div>
            <p class="lb-eyebrow">Competition Table</p>
            <h2 class="lb-title">Leaderboard</h2>
            <p class="lb-subtitle">See who is dominating each mode.</p>
          </div>
        </div>
        <div class="lb-context-line" id="lbContextLine">${getLeaderboardContextLabel(currentMode, _lbState.period)}</div>
      </header>

      <div class="lb-controls">
        <div class="lb-mode-tabs" id="lbModeTabs">${modeTabs}</div>
        <div class="lb-period-pills" id="lbPeriodPills" aria-label="Timeframe">
          <button class="lb-period-pill${_lbState.period === 'daily' ? ' active' : ''}" data-period="daily">Today</button>
          <button class="lb-period-pill${_lbState.period === 'weekly' ? ' active' : ''}" data-period="weekly">This Week</button>
          <button class="lb-period-pill${_lbState.period === 'all' ? ' active' : ''}" data-period="all">All-Time</button>
        </div>
      </div>

      <div class="lb-content">
        <section class="lb-summary" id="lbSummary"></section>

        <section class="lb-section">
          <div class="lb-section-head">
            <div>
              <p class="lb-section-kicker">Your Standing</p>
              <h3>Chase the next spot</h3>
            </div>
          </div>
          <div id="lbYourStanding" class="lb-standing-card"></div>
        </section>

        <section class="lb-section">
          <div class="lb-section-head">
            <div>
              <p class="lb-section-kicker">Table Leaders</p>
              <h3>Top three in this pool</h3>
            </div>
          </div>
          <div id="lbPodium" class="lb-podium"></div>
        </section>

        <section class="lb-section">
          <div class="lb-section-head lb-table-head">
            <div>
              <p class="lb-section-kicker">Full Table</p>
              <h3>Official standings</h3>
            </div>
            <span class="lb-table-metric">Best single-round score</span>
          </div>
          <div class="lb-table-shell">
            <div class="lb-table-columns" aria-hidden="true">
              <span>Rank</span>
              <span>Player</span>
              <span>Best</span>
              <span>Played</span>
              <span>Updated</span>
            </div>
            <div id="lbList" class="lb-list"></div>
          </div>
        </section>
      </div>
    </section>
  </div>`;

  document.body.insertAdjacentHTML('beforeend', html);
  wireLeaderboard();
}

function wireLeaderboard() {
  $('#lbClose')?.addEventListener('click', closeLeaderboard);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && $('#lbOverlay')?.classList.contains('open')) closeLeaderboard();
  });

  $$('#lbModeTabs .lb-mode-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      _lbState.mode = getLeaderboardModeValue(tab.dataset.mode);
      syncLeaderboardControls();
      loadLeaderboardData();
    });
  });

  $$('#lbPeriodPills .lb-period-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      _lbState.period = pill.dataset.period;
      syncLeaderboardControls();
      loadLeaderboardData();
    });
  });
}

function openLeaderboard() {
  _lbState.mode = getCurrentLeaderboardMode();
  _lbState.period = 'weekly';
  injectLeaderboard();
  syncLeaderboardControls();

  const overlay = $('#lbOverlay');
  if (!overlay) return;
  void overlay.offsetWidth;
  overlay.classList.add('open');
  document.body.classList.add('lb-open');
  loadLeaderboardData();
}

function closeLeaderboard() {
  $('#lbOverlay')?.classList.remove('open');
  document.body.classList.remove('lb-open');
}

async function getLeaderboardSnapshot(mode = null, period = 'weekly') {
  const session = _cachedSession || (await supabase.auth.getSession()).data?.session;
  const myId = session?.user?.id || null;

  let query = supabase
    .from('scores')
    .select('user_id, score, created_at, mode')
    .order('created_at', { ascending: false })
    .limit(10000);

  if (mode) query = query.eq('mode', mode);
  const cutoff = getLeaderboardPeriodCutoff(period);
  if (cutoff) query = query.gte('created_at', cutoff);

  const { data: scores, error } = await query;
  if (error) return { data: null, error };

  const rows = Array.isArray(scores) ? scores : [];
  const byUser = new Map();

  rows.forEach(row => {
    if (!byUser.has(row.user_id)) {
      byUser.set(row.user_id, {
        user_id: row.user_id,
        best_score: Number(row.score || 0),
        games_played: 0,
        last_played: row.created_at,
        recent_scores: []
      });
    }

    const current = byUser.get(row.user_id);
    current.games_played += 1;
    current.best_score = Math.max(current.best_score, Number(row.score || 0));
    if (!current.last_played || new Date(row.created_at) > new Date(current.last_played)) {
      current.last_played = row.created_at;
    }
    if (current.recent_scores.length < 3) current.recent_scores.push(Number(row.score || 0));
  });

  const userIds = [...byUser.keys()];
  const profiles = {};

  if (userIds.length) {
    const { data: profileRows, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', userIds);

    if (profileError) return { data: null, error: profileError };
    (profileRows || []).forEach(profile => {
      profiles[profile.id] = profile;
    });
  }

  const ranked = [...byUser.values()]
    .map(entry => ({
      ...entry,
      username: profiles[entry.user_id]?.username || null,
      avatar_url: profiles[entry.user_id]?.avatar_url || null
    }))
    .sort((a, b) => (
      b.best_score - a.best_score
      || b.games_played - a.games_played
      || new Date(b.last_played || 0) - new Date(a.last_played || 0)
      || String(a.user_id).localeCompare(String(b.user_id))
    ))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  const myEntry = myId ? ranked.find(entry => entry.user_id === myId) || null : null;
  const nextTarget = myEntry && myEntry.rank > 1 ? ranked[myEntry.rank - 2] : null;

  return {
    data: {
      mode,
      period,
      myId,
      rows: ranked,
      top3: ranked.slice(0, 3),
      totalPlayers: ranked.length,
      updatedAt: rows[0]?.created_at || null,
      myEntry,
      nextTarget,
      comparisonNote: mode === null
        ? 'Mixed-mode scores are shown together here until an overall rating system is added.'
        : 'Best score means the highest single round posted in this mode and timeframe.'
    },
    error: null
  };
}

function renderLeaderboardLoading() {
  const summaryEl = $('#lbSummary');
  const standingEl = $('#lbYourStanding');
  const podiumEl = $('#lbPodium');
  const listEl = $('#lbList');

  if (summaryEl) {
    summaryEl.innerHTML = `
      <div class="lb-summary-bar lb-skeleton-grid">
        <div class="lb-skeleton lb-skeleton-pill"></div>
        <div class="lb-skeleton lb-skeleton-pill"></div>
        <div class="lb-skeleton lb-skeleton-pill"></div>
        <div class="lb-skeleton lb-skeleton-pill"></div>
        <div class="lb-skeleton lb-skeleton-pill"></div>
        <div class="lb-skeleton lb-skeleton-pill"></div>
      </div>
    `;
  }

  if (standingEl) {
    standingEl.innerHTML = `
      <div class="lb-standing-layout">
        <div>
          <div class="lb-skeleton lb-skeleton-line"></div>
          <div class="lb-skeleton lb-skeleton-line short"></div>
        </div>
        <div class="lb-skeleton-grid">
          <div class="lb-skeleton lb-skeleton-block"></div>
          <div class="lb-skeleton lb-skeleton-block"></div>
          <div class="lb-skeleton lb-skeleton-block"></div>
          <div class="lb-skeleton lb-skeleton-block"></div>
        </div>
      </div>
    `;
  }

  if (podiumEl) {
    podiumEl.innerHTML = [1, 2, 3].map(rank => `
      <article class="lb-podium-card skeleton" data-rank="${rank}">
        <div class="lb-skeleton lb-skeleton-avatar"></div>
        <div class="lb-skeleton lb-skeleton-line"></div>
        <div class="lb-skeleton lb-skeleton-line short"></div>
      </article>
    `).join('');
  }

  if (listEl) {
    listEl.innerHTML = Array.from({ length: 6 }, () => `
      <div class="lb-row skeleton">
        <div class="lb-skeleton lb-skeleton-line short"></div>
        <div class="lb-skeleton lb-skeleton-line"></div>
        <div class="lb-skeleton lb-skeleton-line short"></div>
        <div class="lb-skeleton lb-skeleton-line short"></div>
        <div class="lb-skeleton lb-skeleton-line short"></div>
      </div>
    `).join('');
  }
}

function renderLeaderboardSummary(snapshot) {
  const summaryEl = $('#lbSummary');
  if (!summaryEl) return;

  const myEntry = snapshot.myEntry;
  const modeMeta = getLeaderboardModeMeta(snapshot.mode);

  summaryEl.innerHTML = `
    <div class="lb-summary-top">
      <div>
        <p class="lb-summary-kicker">Current Pool</p>
        <h3>${getLeaderboardContextLabel(snapshot.mode, snapshot.period)}</h3>
      </div>
      <p class="lb-summary-note">${snapshot.comparisonNote}</p>
    </div>
    <div class="lb-summary-bar">
      <div class="lb-summary-stat">
        <span class="lb-summary-label">Mode</span>
        <strong>${modeMeta.label}</strong>
      </div>
      <div class="lb-summary-stat">
        <span class="lb-summary-label">Timeframe</span>
        <strong>${getLeaderboardPeriodLabel(snapshot.period)}</strong>
      </div>
      <div class="lb-summary-stat">
        <span class="lb-summary-label">Players</span>
        <strong>${Number(snapshot.totalPlayers || 0).toLocaleString()}</strong>
      </div>
      <div class="lb-summary-stat">
        <span class="lb-summary-label">Your Rank</span>
        <strong>${myEntry ? `#${myEntry.rank}` : 'Unranked'}</strong>
      </div>
      <div class="lb-summary-stat">
        <span class="lb-summary-label">Your Best</span>
        <strong>${myEntry ? formatLeaderboardScore(myEntry.best_score) : '—'}</strong>
      </div>
      <div class="lb-summary-stat">
        <span class="lb-summary-label">Last Updated</span>
        <strong>${formatLeaderboardUpdated(snapshot.updatedAt)}</strong>
      </div>
    </div>
  `;
}

function renderLeaderboardStanding(snapshot) {
  const standingEl = $('#lbYourStanding');
  if (!standingEl) return;

  if (!snapshot.myId) {
    standingEl.innerHTML = `
      <div class="lb-standing-layout">
        <div>
          <p class="lb-standing-rank">Sign in to track your rank</p>
          <h4 class="lb-standing-title">Your place in the table will stay pinned here.</h4>
          <p class="lb-standing-gap">Save scores to see your best result, games played, and the gap to the next player.</p>
        </div>
        <button class="lb-standing-cta" id="lbStandingAuth">Sign In</button>
      </div>
    `;
    $('#lbStandingAuth')?.addEventListener('click', openAuth);
    return;
  }

  if (!snapshot.myEntry) {
    standingEl.innerHTML = `
      <div class="lb-standing-layout">
        <div>
          <p class="lb-standing-rank">Unranked in this pool</p>
          <h4 class="lb-standing-title">No score posted for ${getLeaderboardPeriodLabel(snapshot.period).toLowerCase()} yet.</h4>
          <p class="lb-standing-gap">Play this mode and post a result to join the table.</p>
        </div>
        <div class="lb-standing-grid">
          <div class="lb-standing-stat"><span>Rank</span><strong>—</strong></div>
          <div class="lb-standing-stat"><span>Best</span><strong>—</strong></div>
          <div class="lb-standing-stat"><span>Games</span><strong>0</strong></div>
          <div class="lb-standing-stat"><span>Recent form</span><strong>—</strong></div>
        </div>
      </div>
    `;
    return;
  }

  const myEntry = snapshot.myEntry;
  const nextTarget = snapshot.nextTarget;
  const gap = nextTarget ? Math.max(0, Number(nextTarget.best_score || 0) - Number(myEntry.best_score || 0)) : 0;
  const gapText = !nextTarget
    ? 'You are top of this pool.'
    : gap > 0
      ? `You are ${gap} pts behind #${nextTarget.rank}.`
      : `You are level on points with #${nextTarget.rank}; games played is deciding the rank.`;

  standingEl.innerHTML = `
    <div class="lb-standing-layout">
      <div>
        <p class="lb-standing-rank">Rank #${myEntry.rank}</p>
        <h4 class="lb-standing-title">${formatLeaderboardScore(myEntry.best_score)} best score</h4>
        <p class="lb-standing-gap">${gapText}</p>
      </div>
      <div class="lb-standing-grid">
        <div class="lb-standing-stat"><span>Best score</span><strong>${formatLeaderboardScore(myEntry.best_score)}</strong></div>
        <div class="lb-standing-stat"><span>Games played</span><strong>${Number(myEntry.games_played || 0).toLocaleString()}</strong></div>
        <div class="lb-standing-stat"><span>Recent form</span><strong>${formatRecentForm(myEntry.recent_scores)}</strong></div>
        <div class="lb-standing-stat"><span>Last score</span><strong>${formatRelativeDate(myEntry.last_played)}</strong></div>
      </div>
    </div>
  `;
}

function renderLeaderboardPodium(snapshot) {
  const podiumEl = $('#lbPodium');
  if (!podiumEl) return;

  if (!snapshot.top3.length) {
    podiumEl.removeAttribute('data-count');
    podiumEl.innerHTML = `
      <div class="lb-empty">
        <div class="lb-empty-icon">TABLE EMPTY</div>
        No one has posted a score ${getLeaderboardPeriodLabel(snapshot.period).toLowerCase()} yet.
      </div>
    `;
    return;
  }

  const order = snapshot.top3.length >= 3
    ? [snapshot.top3[1], snapshot.top3[0], snapshot.top3[2]]
    : snapshot.top3;
  podiumEl.dataset.count = String(order.length);

  const fragment = document.createDocumentFragment();
  order.forEach(entry => {
    const name = normalizeDisplayName(entry.username, 'Player');
    const card = document.createElement('article');
    card.className = `lb-podium-card${entry.user_id === snapshot.myId ? ' lb-me' : ''}`;
    card.dataset.rank = String(entry.rank);

    const badge = document.createElement('div');
    badge.className = 'lb-podium-badge';
    badge.textContent = entry.rank === 1 ? '1st' : `#${entry.rank}`;

    const avatarWrap = document.createElement('div');
    avatarWrap.className = 'lb-podium-avatar-wrap';
    avatarWrap.appendChild(createLeaderboardAvatar(name, entry.avatar_url, 'lb-podium-avatar'));

    const meta = document.createElement('div');
    meta.className = 'lb-podium-meta';

    const title = document.createElement('div');
    title.className = 'lb-podium-name';
    title.textContent = entry.user_id === snapshot.myId ? `${name} (You)` : name;

    const score = document.createElement('div');
    score.className = 'lb-podium-score';
    score.textContent = formatLeaderboardScore(entry.best_score);

    const detail = document.createElement('div');
    detail.className = 'lb-podium-detail';
    detail.textContent = `${formatGameCount(entry.games_played)} • ${formatRelativeDate(entry.last_played)}`;

    meta.appendChild(title);
    meta.appendChild(score);
    meta.appendChild(detail);

    card.appendChild(badge);
    card.appendChild(avatarWrap);
    card.appendChild(meta);
    fragment.appendChild(card);
  });

  podiumEl.replaceChildren(fragment);
}

function renderLeaderboardRows(snapshot) {
  const listEl = $('#lbList');
  if (!listEl) return;

  if (!snapshot.rows.length) {
    listEl.innerHTML = `
      <div class="lb-empty">
        <div class="lb-empty-icon">NO TABLE YET</div>
        No one has posted a score ${getLeaderboardPeriodLabel(snapshot.period).toLowerCase()} yet.
      </div>
    `;
    return;
  }

  const fragment = document.createDocumentFragment();
  snapshot.rows.forEach(entry => {
    const isMe = entry.user_id === snapshot.myId;
    const name = normalizeDisplayName(entry.username, 'Player');

    const row = document.createElement('div');
    row.className = `lb-row${isMe ? ' lb-me' : ''}`;

    const rank = document.createElement('div');
    rank.className = 'lb-row-rank';
    rank.textContent = `#${entry.rank}`;

    const player = document.createElement('div');
    player.className = 'lb-row-player';
    player.appendChild(createLeaderboardAvatar(name, entry.avatar_url, 'lb-row-avatar'));

    const info = document.createElement('div');
    info.className = 'lb-row-info';

    const infoName = document.createElement('div');
    infoName.className = 'lb-row-name';
    infoName.textContent = isMe ? `${name} (You)` : name;

    const infoMeta = document.createElement('div');
    infoMeta.className = 'lb-row-meta';
    infoMeta.textContent = formatRecentForm(entry.recent_scores);

    info.appendChild(infoName);
    info.appendChild(infoMeta);
    player.appendChild(info);

    const best = document.createElement('div');
    best.className = 'lb-row-score';
    best.dataset.label = 'Best';
    best.textContent = formatLeaderboardScore(entry.best_score);

    const played = document.createElement('div');
    played.className = 'lb-row-played';
    played.dataset.label = 'Played';
    played.textContent = Number(entry.games_played || 0).toLocaleString();

    const updated = document.createElement('div');
    updated.className = 'lb-row-updated';
    updated.dataset.label = 'Updated';
    updated.textContent = formatRelativeDate(entry.last_played);

    row.appendChild(rank);
    row.appendChild(player);
    row.appendChild(best);
    row.appendChild(played);
    row.appendChild(updated);
    fragment.appendChild(row);
  });

  listEl.replaceChildren(fragment);
}

async function loadLeaderboardData() {
  renderLeaderboardLoading();

  const { data: snapshot, error } = await getLeaderboardSnapshot(_lbState.mode, _lbState.period);

  if (error || !snapshot) {
    const summaryEl = $('#lbSummary');
    const standingEl = $('#lbYourStanding');
    const podiumEl = $('#lbPodium');
    const listEl = $('#lbList');

    if (summaryEl) {
      summaryEl.innerHTML = `
        <div class="lb-summary-top">
          <div>
            <p class="lb-summary-kicker">Current Pool</p>
            <h3>${getLeaderboardContextLabel(_lbState.mode, _lbState.period)}</h3>
          </div>
          <p class="lb-summary-note">We could not load the latest standings right now.</p>
        </div>
      `;
    }
    if (standingEl) {
      standingEl.innerHTML = `
        <div class="lb-empty">
          <div class="lb-empty-icon">OFFLINE</div>
          Try refreshing the leaderboard in a moment.
        </div>
      `;
    }
    if (podiumEl) clearChildren(podiumEl);
    if (listEl) {
      listEl.innerHTML = `
        <div class="lb-empty">
          <div class="lb-empty-icon">ERROR</div>
          Could not load leaderboard data.
        </div>
      `;
    }
    return;
  }

  _lbState.updatedAt = snapshot.updatedAt;
  renderLeaderboardSummary(snapshot);
  renderLeaderboardStanding(snapshot);
  renderLeaderboardPodium(snapshot);
  renderLeaderboardRows(snapshot);
}

// Expose to non-module scripts
window.auth = { supabase, updateAuthUI, saveScore, getLeaderboard, getSession, openAuth, openDashboard, openLeaderboard };

/* ── Wire Header Buttons ─────────────────────────────────────────── */
function wireHeaderButtons() {
  const authBtn = $('#btnAuth');
  if (authBtn) {
    authBtn.addEventListener('click', handleAuthClick);
    // Keyboard accessibility: Enter/Space should trigger the auth button
    authBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleAuthClick();
      }
    });
  }

  const lbBtn = $('#btnLeaderboard');
  if (lbBtn) lbBtn.addEventListener('click', openLeaderboard);
}

/* ── Init ─────────────────────────────────────────────────────────── */
wireHeaderButtons();
updateAuthUI();

// React to auth state changes (e.g. after Google OAuth redirect)
supabase.auth.onAuthStateChange((_event, session) => {
  _cachedSession = session;
  updateAuthUI();
});


