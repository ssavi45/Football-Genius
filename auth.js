import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://mwkpczipzfstafygwuui.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13a3BjemlwemZzdGFmeWd3dXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MTMzODEsImV4cCI6MjA3MzA4OTM4MX0.alxT7EwFuvAR9zjrSf--Ni1xCEV671ZTFG1XEAI0be0'; // not process.env and not service role
const supabase = createClient(supabaseUrl, supabaseKey);


// --- UI helpers ---
function $(sel) { return document.querySelector(sel); }
function truncate(str, n = 18) { return str.length > n ? str.slice(0, n - 1) + '…' : str; }

async function updateAuthUI() {
  const btn = $('#btnAuth');
  if (!btn) return;

  const { data: { session } } = await supabase.auth.getSession();
  const label = btn.querySelector('.user-profile-inner p') || btn;

  if (session?.user) {
    const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email;
    label.textContent = truncate(name, 22);
    btn.setAttribute('title', 'Sign out');
    await ensureProfile(session.user);
  } else {
    label.textContent = 'Login / Register';
    btn.setAttribute('title', 'Login / Register');
  }
}

async function promptEmailSignIn() {
  const email = window.prompt('Enter your email to sign in (magic link):');
  if (!email) return;
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin }
  });
  if (error) {
    alert('Sign-in failed: ' + error.message);
  } else {
    alert('Check your email for a login link.');
  }
}

async function handleAuthClick() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    await supabase.auth.signOut();
  } else {
    // Simple email magic-link flow; you can add OAuth later
    await promptEmailSignIn();
  }
  updateAuthUI();
}

function wireHeaderButtons() {
  const authBtn = $('#btnAuth');
  if (authBtn) authBtn.addEventListener('click', handleAuthClick);

  const lbBtn = $('#btnLeaderboard');
  if (lbBtn) lbBtn.addEventListener('click', async () => {
    // Placeholder for now
    alert('Leaderboard coming soon. Scores will appear once saved.');
  });
}

// Ensure a profile row exists for this user
async function ensureProfile(user) {
  if (!user) return;
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      username: user.user_metadata?.user_name || user.user_metadata?.full_name || null,
      avatar_url: user.user_metadata?.avatar_url || null
    }, { onConflict: 'id' });
  if (error) console.warn('ensureProfile error:', error.message);
}

// Public API for other scripts
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

// Expose a tiny global so non-module scripts can call it
window.auth = { supabase, updateAuthUI, saveScore, getLeaderboard, getSession };

// Init
wireHeaderButtons();
updateAuthUI();

// React to auth state changes
supabase.auth.onAuthStateChange((_event, _session) => updateAuthUI());