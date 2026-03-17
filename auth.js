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

/* ── Auth UI Update (header button) ──────────────────────────────── */
async function updateAuthUI() {
  const btn = $('#btnAuth');
  if (!btn) return;

  const { data: { session } } = await supabase.auth.getSession();
  const label = btn.querySelector('.user-profile-inner p') || btn;

  if (session?.user) {
    const name = session.user.user_metadata?.full_name
      || session.user.user_metadata?.name
      || session.user.email;
    label.textContent = truncate(name, 22);
    btn.setAttribute('title', 'Click to sign out');
    await ensureProfile(session.user);
  } else {
    label.textContent = 'Login / Register';
    btn.setAttribute('title', 'Login / Register');
  }
}

/* ── Auth Click Handler ──────────────────────────────────────────── */
async function handleAuthClick() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    // Sign out
    if (confirm('Sign out of Football Genius?')) {
      await supabase.auth.signOut();
      updateAuthUI();
    }
  } else {
    openAuth();
  }
}

/* ── Profile ─────────────────────────────────────────────────────── */
async function ensureProfile(user) {
  if (!user) return;
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      username: user.user_metadata?.user_name
        || user.user_metadata?.full_name
        || user.user_metadata?.name
        || null,
      avatar_url: user.user_metadata?.avatar_url || null
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

async function getLeaderboard(mode, limit = 10) {
  return await supabase
    .from('scores')
    .select('score, created_at, profiles!inner(username, avatar_url)')
    .eq('mode', mode)
    .order('score', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(limit);
}

// Expose to non-module scripts
window.auth = { supabase, updateAuthUI, saveScore, getLeaderboard, getSession, openAuth };

/* ── Wire Header Buttons ─────────────────────────────────────────── */
function wireHeaderButtons() {
  const authBtn = $('#btnAuth');
  if (authBtn) authBtn.addEventListener('click', handleAuthClick);

  const lbBtn = $('#btnLeaderboard');
  if (lbBtn) lbBtn.addEventListener('click', () => {
    alert('Leaderboard coming soon. Scores will appear once saved.');
  });
}

/* ── Init ─────────────────────────────────────────────────────────── */
wireHeaderButtons();
updateAuthUI();

// React to auth state changes (e.g. after Google OAuth redirect)
supabase.auth.onAuthStateChange((_event, _session) => updateAuthUI());