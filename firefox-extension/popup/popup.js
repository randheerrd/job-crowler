const PORTALS_LIST = ['Naukri', 'LinkedIn', 'Indeed', 'Glassdoor', 'Wellfound', 'Internshala', 'Remotive'];
const DASHBOARD = 'https://job-crowler.onrender.com';

// ── DOM ───────────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const loginView     = $('loginView');
const dashboardView = $('dashboardView');
const syncView      = $('syncView');
const userChip      = $('userChip');
const userAvatar    = $('userAvatar');
const userName      = $('userName');
const settingsBtn   = $('settingsBtn');

function showView(v) {
  [loginView, dashboardView, syncView].forEach(el => el.classList.remove('active'));
  v.classList.add('active');
}

// ── Init ──────────────────────────────────────────────────────────────────────
async function init() {
  const { jwtToken, user, syncPortals, lastSync, syncKeywords, syncLocation } =
    await browser.storage.local.get(['jwtToken', 'user', 'syncPortals', 'lastSync', 'syncKeywords', 'syncLocation']);

  if (!jwtToken || !user) {
    const webAuth = await browser.runtime.sendMessage({ action: 'checkWebAppAuth' }).catch(() => null);
    if (webAuth?.ok) { init(); return; }
    showView(loginView); return;
  }

  // Show user chip
  userChip.style.display = 'flex';
  settingsBtn.style.display = 'flex';
  userAvatar.textContent = user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  userName.textContent = user.name?.split(' ')[0] || user.email;

  // Keywords
  const kws = syncKeywords?.length ? syncKeywords : (user.keywords || user.skills || []);
  renderKeywords(kws);
  if (syncLocation) $('dashLink').href = DASHBOARD;

  // Portal toggles
  const enabled = syncPortals || ['Naukri', 'LinkedIn', 'Indeed'];
  renderPortals(enabled);

  // Last sync
  if (lastSync) {
    const ago = timeSince(lastSync.at);
    $('lastSyncInfo').innerHTML = `Last synced <span>${ago}</span> · <span>${lastSync.total} jobs</span>`;
  }

  showView(dashboardView);

  // Check if sync is already running
  const state = await browser.runtime.sendMessage({ action: 'getSyncState' });
  if (state?.running) renderSyncProgress(state);
}

// ── Login ─────────────────────────────────────────────────────────────────────
$('loginBtn').addEventListener('click', async () => {
  const email = $('emailInput').value.trim();
  const password = $('passwordInput').value;
  if (!email || !password) return;

  $('loginBtn').disabled = true;
  $('loginBtn').textContent = 'Signing in…';
  $('loginError').classList.remove('visible');

  const res = await browser.runtime.sendMessage({ action: 'login', email, password });
  if (res?.ok) {
    init();
  } else {
    $('loginError').textContent = res?.error || 'Login failed';
    $('loginError').classList.add('visible');
    $('loginBtn').disabled = false;
    $('loginBtn').textContent = 'Sign in';
  }
});
$('passwordInput').addEventListener('keydown', e => { if (e.key === 'Enter') $('loginBtn').click(); });

// ── Logout ────────────────────────────────────────────────────────────────────
$('logoutBtn').addEventListener('click', async () => {
  await browser.runtime.sendMessage({ action: 'logout' });
  userChip.style.display = 'none';
  settingsBtn.style.display = 'none';
  $('emailInput').value = '';
  $('passwordInput').value = '';
  showView(loginView);
});

// ── Keywords ──────────────────────────────────────────────────────────────────
function renderKeywords(kws) {
  const chips = $('kwChips');
  if (!kws?.length) {
    chips.innerHTML = '<span class="kw-chip" style="color:#3a3630">No keywords — click Edit</span>';
    return;
  }
  chips.innerHTML = kws.map(k => `<span class="kw-chip">${k}</span>`).join('');
}

$('editKwBtn').addEventListener('click', async () => {
  const { syncKeywords, user, syncLocation } = await browser.storage.local.get(['syncKeywords', 'user', 'syncLocation']);
  const current = syncKeywords || user?.keywords || user?.skills || [];
  const loc = syncLocation || user?.location || '';

  const raw = prompt('Edit keywords (comma separated):', current.join(', '));
  if (raw === null) return;
  const keywords = raw.split(',').map(k => k.trim()).filter(Boolean);
  const location = prompt('Location (e.g. Bangalore, Remote):', loc) ?? loc;

  await browser.runtime.sendMessage({ action: 'saveKeywords', keywords, location });
  await browser.storage.local.set({ syncKeywords: keywords, syncLocation: location });
  renderKeywords(keywords);
});

// ── Portal toggles ────────────────────────────────────────────────────────────
let selectedPortals = ['Naukri', 'LinkedIn', 'Indeed'];

function renderPortals(enabled) {
  selectedPortals = [...enabled];
  const grid = $('portalsGrid');
  grid.innerHTML = '';
  PORTALS_LIST.forEach(name => {
    const on = selectedPortals.includes(name);
    const el = document.createElement('div');
    el.className = `portal-toggle${on ? ' on' : ''}`;
    el.innerHTML = `<div class="portal-dot"></div><span class="portal-name">${name}</span>`;
    el.addEventListener('click', () => {
      if (selectedPortals.includes(name)) {
        selectedPortals = selectedPortals.filter(p => p !== name);
        el.classList.remove('on');
      } else {
        selectedPortals.push(name);
        el.classList.add('on');
      }
      el.querySelector('.portal-dot').style.background = selectedPortals.includes(name) ? '#c8894a' : '';
      browser.storage.local.set({ syncPortals: selectedPortals });
    });
    grid.appendChild(el);
  });
}

// ── Sync ──────────────────────────────────────────────────────────────────────
$('syncBtn').addEventListener('click', async () => {
  if (!selectedPortals.length) { alert('Select at least one portal.'); return; }
  browser.runtime.sendMessage({ action: 'startSync', portals: selectedPortals });
});

// Listen for sync updates from background
browser.runtime.onMessage.addListener(msg => {
  if (msg.action === 'syncUpdate') renderSyncProgress(msg.state);
});

function renderSyncProgress(state) {
  if (!state) return;
  if (!state.running && state.totalSaved !== undefined) {
    // Sync finished — go back to dashboard with updated info
    const { portals, totalSaved } = state;
    const done = portals.filter(p => p.status === 'done').length;
    $('syncTitle').textContent = `Done — ${totalSaved} jobs saved`;
    $('syncTotal').innerHTML = `<strong>${totalSaved} jobs</strong> added to your dashboard`;
    $('progressBar').style.width = '100%';
    setTimeout(() => { showView(dashboardView); init(); }, 2000);
    return;
  }

  showView(syncView);

  const total = state.portals.length;
  const done = state.portals.filter(p => p.status === 'done' || p.status === 'error').length;
  $('progressBar').style.width = `${Math.round((done / total) * 100)}%`;
  $('syncTitle').textContent = `Syncing ${done + 1} of ${total}…`;
  $('syncTotal').innerHTML = state.totalSaved ? `<strong>${state.totalSaved} jobs</strong> saved so far` : '';

  const list = $('syncPortalList');
  list.innerHTML = state.portals.map(p => {
    const icon = p.status === 'running' ? '<div class="spin"></div>'
      : p.status === 'done'    ? '<svg width="12" height="12" viewBox="0 0 16 16" fill="#4ade80"><path d="M13.5 2L6 9.5 2.5 6 1 7.5l5 5 9-9z"/></svg>'
      : p.status === 'error'   ? '<svg width="12" height="12" viewBox="0 0 16 16" fill="#f87171"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm-.75 4h1.5v4.5h-1.5V5Zm.75 7a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"/></svg>'
      : '<svg width="8" height="8" viewBox="0 0 8 8" fill="#3a3630"><circle cx="4" cy="4" r="3"/></svg>';
    const countClass = p.count ? 'pr-count has' : 'pr-count';
    const countText = p.status === 'done' ? `${p.count} jobs` : '';
    return `<div class="portal-row">
      <div class="pr-icon">${icon}</div>
      <div class="pr-name ${p.status}">${p.name}</div>
      <div class="${countClass}">${countText}</div>
    </div>`;
  }).join('');
}

// ── Settings ──────────────────────────────────────────────────────────────────
settingsBtn.addEventListener('click', () => browser.runtime.openOptionsPage());

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeSince(ts) {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

init();
