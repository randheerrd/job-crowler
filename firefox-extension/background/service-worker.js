const API = 'https://job-crowler.onrender.com/api';

// ── Portal search URL templates ───────────────────────────────────────────────
const PORTAL_SEARCH = {
  Naukri:   (kw, loc) => `https://www.naukri.com/${encodeURIComponent(kw.toLowerCase().replace(/\s+/g,'-'))}-jobs${loc ? `?location=${encodeURIComponent(loc)}` : ''}`,
  LinkedIn: (kw, loc) => `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(kw)}&location=${encodeURIComponent(loc || '')}&f_TPR=r604800`,
  Indeed:   (kw, loc) => `https://www.indeed.com/jobs?q=${encodeURIComponent(kw)}&l=${encodeURIComponent(loc || '')}&fromage=7`,
  Glassdoor:(kw, loc) => `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodeURIComponent(kw)}`,
  Wellfound:(kw)      => `https://wellfound.com/jobs?role=${encodeURIComponent(kw)}`,
  Internshala:(kw)    => `https://internshala.com/jobs/${encodeURIComponent(kw.toLowerCase().replace(/\s+/g,'-'))}-jobs`,
  Remotive: (kw)      => `https://remotive.com/remote-jobs?search=${encodeURIComponent(kw)}`,
};

// ── Auth helpers ──────────────────────────────────────────────────────────────
async function getToken() {
  const { jwtToken } = await browser.storage.local.get('jwtToken');
  return jwtToken || null;
}

async function apiFetch(path, opts = {}) {
  const token = await getToken();
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
  return res;
}

// ── Sync state ────────────────────────────────────────────────────────────────
let syncState = {
  running: false,
  portals: [],      // [{ name, status: 'pending'|'running'|'done'|'error', count: 0 }]
  totalSaved: 0,
  startedAt: null,
};
let syncTabId = null;

function broadcastSync() {
  browser.runtime.sendMessage({ action: 'syncUpdate', state: syncState }).catch(() => {});
}

// ── Message handler ───────────────────────────────────────────────────────────
browser.runtime.onMessage.addListener((msg, _sender) => {
  switch (msg.action) {
    case 'login':          return handleLogin(msg.email, msg.password);
    case 'logout':         return handleLogout();
    case 'getMe':          return handleGetMe();
    case 'saveJob':        return handleSaveJob(msg.job);
    case 'startSync':      return handleStartSync(msg.portals);
    case 'getSyncState':   return Promise.resolve(syncState);
    case 'saveKeywords':   return handleSaveKeywords(msg.keywords, msg.location);
    case 'getAutofillProfile': return handleGetAutofillProfile();
    case 'checkWebAppAuth':   return handleCheckWebAppAuth();
    case 'getSources':        return apiFetch('/sources').then(r => r.ok ? r.json() : []);
    case 'previewSource':     return handlePreviewSource(msg.url);
    case 'saveSourceJobs':    return handleSaveSourceJobs(msg.jobs, msg.sourceUrl, msg.sourceName);
    case 'syncSource':        return handleSyncSource(msg.sourceId);
    case 'deleteSource':      return apiFetch(`/sources/${msg.sourceId}`, { method: 'DELETE' }).then(r => r.ok ? { ok: true } : { ok: false });
  }
});

// ── Login ─────────────────────────────────────────────────────────────────────
async function handleLogin(email, password) {
  const res = await fetch(`${API}/extension/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) return { ok: false, error: data.error || 'Login failed' };

  await browser.storage.local.set({ jwtToken: data.token, user: data.user });
  // Schedule periodic sync every 4 hours
  browser.alarms.create('periodicSync', { periodInMinutes: 240 });
  return { ok: true, user: data.user };
}

async function handleLogout() {
  await browser.storage.local.remove(['jwtToken', 'user']);
  browser.alarms.clear('periodicSync');
  cachedAutofillProfile = null;
  return { ok: true };
}

async function handleGetMe() {
  const res = await apiFetch('/extension/me');
  if (!res.ok) return { ok: false };
  const user = await res.json();
  await browser.storage.local.set({ user });
  return { ok: true, user };
}

// ── Custom sources ────────────────────────────────────────────────────────────
async function handlePreviewSource(url) {
  const res = await apiFetch('/sources/preview', { method: 'POST', body: JSON.stringify({ url }) });
  if (!res.ok) { const d = await res.json().catch(() => ({})); return { ok: false, error: d.error || `Error ${res.status}` }; }
  const data = await res.json();
  return { ok: true, ...data };
}

async function handleSaveSourceJobs(jobs, sourceUrl, sourceName) {
  const res = await apiFetch('/sources/save', { method: 'POST', body: JSON.stringify({ jobs, sourceUrl, sourceName }) });
  if (!res.ok) return { ok: false, error: `Error ${res.status}` };
  const data = await res.json();
  return { ok: true, saved: data.saved };
}

async function handleSyncSource(sourceId) {
  const res = await apiFetch(`/sources/${sourceId}/sync`, { method: 'POST' });
  if (!res.ok) return { ok: false };
  const data = await res.json();
  return { ok: true, saved: data.saved };
}

// ── Auto-login from web app session ──────────────────────────────────────────
async function handleCheckWebAppAuth() {
  try {
    const tabs = await browser.tabs.query({ url: 'https://job-crowler.onrender.com/*' });
    if (!tabs.length) return { ok: false };

    let token = null;
    if (typeof chrome !== 'undefined' && chrome.scripting) {
      // MV3 Chrome
      const results = await chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => {
          try {
            const raw = localStorage.getItem('auth-storage');
            return raw ? JSON.parse(raw)?.state?.token || null : null;
          } catch(e) { return null; }
        },
      });
      token = results?.[0]?.result;
    } else {
      // Firefox MV2 fallback
      const results = await browser.tabs.executeScript(tabs[0].id, {
        code: `(function(){try{const r=localStorage.getItem('auth-storage');return r?JSON.parse(r)?.state?.token||null:null}catch(e){return null}})()`
      });
      token = results?.[0];
    }
    if (!token) return { ok: false };

    await browser.storage.local.set({ jwtToken: token });
    const res = await apiFetch('/extension/me');
    if (!res.ok) { await browser.storage.local.remove('jwtToken'); return { ok: false }; }

    const user = await res.json();
    await browser.storage.local.set({ user });
    browser.alarms.create('periodicSync', { periodInMinutes: 240 });
    return { ok: true, user };
  } catch(e) {
    return { ok: false };
  }
}

// ── Save single job ───────────────────────────────────────────────────────────
async function handleSaveJob(job) {
  const res = await apiFetch('/extension/ingest', {
    method: 'POST',
    body: JSON.stringify(job),
  });
  const data = await res.json().catch(() => ({}));
  return res.ok ? { ok: true, data } : { ok: false, error: data.error || `Error ${res.status}` };
}

// ── Save keywords to server ───────────────────────────────────────────────────
async function handleSaveKeywords(keywords, location) {
  // Save locally
  await browser.storage.local.set({ syncKeywords: keywords, syncLocation: location });
  // Sync to server
  await apiFetch('/extension/keywords', {
    method: 'PUT',
    body: JSON.stringify({ keywords }),
  });
  return { ok: true };
}

// ── Auto-sync orchestration ───────────────────────────────────────────────────
async function handleStartSync(enabledPortals) {
  if (syncState.running) return { ok: false, error: 'Sync already running' };

  const { syncKeywords, syncLocation, user } = await browser.storage.local.get(['syncKeywords', 'syncLocation', 'user']);
  const keywords = syncKeywords?.length ? syncKeywords : (user?.keywords || user?.skills || []);
  const location = syncLocation || user?.location || '';

  if (!keywords.length) return { ok: false, error: 'No keywords set. Add skills in your profile or edit keywords.' };

  const keyword = keywords.slice(0, 3).join(' '); // use top 3 skills as search query

  syncState = {
    running: true,
    portals: enabledPortals.map(name => ({ name, status: 'pending', count: 0 })),
    totalSaved: 0,
    startedAt: Date.now(),
  };
  broadcastSync();

  // Run portals sequentially to avoid opening too many tabs
  for (let i = 0; i < syncState.portals.length; i++) {
    const portal = syncState.portals[i];
    const searchUrl = PORTAL_SEARCH[portal.name]?.(keyword, location);
    if (!searchUrl) { portal.status = 'error'; broadcastSync(); continue; }

    portal.status = 'running';
    broadcastSync();

    try {
      const jobs = await syncPortal(portal.name, searchUrl);
      if (jobs.length > 0) {
        const res = await apiFetch('/extension/batch-ingest', {
          method: 'POST',
          body: JSON.stringify({ jobs, portal: portal.name }),
        });
        const data = await res.json().catch(() => ({}));
        portal.count = data.saved || jobs.length;
        syncState.totalSaved += portal.count;
      }
      portal.status = 'done';
    } catch (e) {
      portal.status = 'error';
    }
    broadcastSync();
  }

  // Save last sync info
  await browser.storage.local.set({
    lastSync: { at: Date.now(), total: syncState.totalSaved },
  });

  syncState.running = false;
  broadcastSync();
  return { ok: true };
}

async function syncPortal(portalName, searchUrl) {
  return new Promise((resolve) => {
    let tabId = null;
    const timeout = setTimeout(() => {
      if (tabId) browser.tabs.remove(tabId).catch(() => {});
      resolve([]);
    }, 25000); // 25s timeout per portal

    browser.tabs.create({ url: searchUrl, active: false }).then(tab => {
      tabId = tab.id;
      syncTabId = tabId;

      const onUpdated = (id, changeInfo) => {
        if (id !== tabId || changeInfo.status !== 'complete') return;
        browser.tabs.onUpdated.removeListener(onUpdated);

        // Give the page JS time to render
        setTimeout(() => {
          browser.tabs.sendMessage(tabId, { action: 'autoSync', portal: portalName })
            .then(response => {
              clearTimeout(timeout);
              browser.tabs.remove(tabId).catch(() => {});
              syncTabId = null;
              resolve(response?.jobs || []);
            })
            .catch(() => {
              clearTimeout(timeout);
              browser.tabs.remove(tabId).catch(() => {});
              syncTabId = null;
              resolve([]);
            });
        }, 2500);
      };

      browser.tabs.onUpdated.addListener(onUpdated);
    }).catch(() => {
      clearTimeout(timeout);
      resolve([]);
    });
  });
}

// ── Autofill profile ──────────────────────────────────────────────────────────
let cachedAutofillProfile = null;

async function handleGetAutofillProfile() {
  // Return cached copy if available (cleared on login/logout)
  if (cachedAutofillProfile) return cachedAutofillProfile;

  const res = await apiFetch('/extension/autofill-profile');
  if (!res.ok) return null;
  cachedAutofillProfile = await res.json();
  return cachedAutofillProfile;
}

// ── Scheduled sync (alarm) ────────────────────────────────────────────────────
browser.alarms.onAlarm.addListener(async alarm => {
  if (alarm.name !== 'periodicSync') return;
  const { user } = await browser.storage.local.get('user');
  if (!user) return;
  const { syncPortals } = await browser.storage.local.get('syncPortals');
  const portals = syncPortals || ['Naukri', 'LinkedIn', 'Indeed'];
  handleStartSync(portals);
});

// ── Toolbar icon click ────────────────────────────────────────────────────────
const _api = (typeof browser !== 'undefined' ? (browser.action || browser.browserAction) : null) || chrome.action;

_api.onClicked.addListener(async (tab) => {
  // Chrome: open native side panel
  if (typeof chrome !== 'undefined' && chrome.sidePanel?.open) {
    try {
      await chrome.sidePanel.open({ tabId: tab.id });
      return;
    } catch(e) { /* fall through to Firefox path */ }
  }
  // Firefox: toggle injected content-script sidebar, or open popup window
  const _b = typeof browser !== 'undefined' ? browser : chrome;
  try {
    await _b.tabs.sendMessage(tab.id, { action: 'toggleSidebar' });
  } catch {
    _b.windows.create({
      url: _b.runtime.getURL('popup/popup.html'),
      type: 'popup', width: 420, height: 640,
    }).catch(() => {});
  }
});

// ── Startup ───────────────────────────────────────────────────────────────────
browser.runtime.onInstalled.addListener(() => {
  browser.storage.local.get('user').then(({ user }) => {
    if (user) browser.alarms.create('periodicSync', { periodInMinutes: 240 });
  });
});
