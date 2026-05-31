// ── Portal definitions ─────────────────────────────────────────────────────────
const PORTALS = [
  // ── LinkedIn ──────────────────────────────────────────────────────────────────
  {
    name: 'LinkedIn',
    hostname: 'linkedin.com',
    isDetailPage: () => /\/jobs\/view\//.test(location.pathname),
    extractDetail() {
      return {
        title:    text(['h1.t-24', 'h1[class*="job-title"]', 'h1']),
        company:  text(['.job-details-jobs-unified-top-card__company-name a', 'a[class*="company"]']),
        location: text(['.job-details-jobs-unified-top-card__bullet', '[class*="location"]']),
        jobType:  text(['[class*="job-insight"] span']),
        description: html(['#job-details', '.jobs-description-content__text']),
        portal: 'LinkedIn', url: location.href,
      };
    },
    cardSelector: 'li.occludable-update, .jobs-search-results__list-item, .base-card',
    extractCard(card) {
      const link = card.querySelector('a.base-card__full-link, a[class*="job-card"], a[href*="/jobs/view/"]');
      return {
        title:    textIn(card, ['h3.base-search-card__title', 'h3', '[class*="title"]']),
        company:  textIn(card, ['h4.base-search-card__subtitle', '[class*="company"]']),
        location: textIn(card, ['.job-search-card__location', '[class*="location"]']),
        portal: 'LinkedIn',
        url: link?.href || location.href,
      };
    },
  },

  // ── Indeed ────────────────────────────────────────────────────────────────────
  {
    name: 'Indeed',
    hostname: 'indeed.com',
    isDetailPage: () => /viewjob/.test(location.href),
    extractDetail() {
      return {
        title:    text(['[data-testid="jobsearch-JobInfoHeader-title"] span', 'h1']),
        company:  text(['[data-testid="inlineHeader-companyName"] a', '[class*="companyName"]']),
        location: text(['[data-testid="job-location"]']),
        salary:   text(['[data-testid="attribute_snippet_testid"]', '[class*="salary"]']),
        description: html(['#jobDescriptionText']),
        portal: 'Indeed', url: location.href,
      };
    },
    cardSelector: '[class*="job_seen_beacon"], [class*="cardOutline"], .resultContent',
    extractCard(card) {
      const link = card.querySelector('h2 a, [data-testid="job-title"] a, a[id^="job_"]');
      return {
        title:    textIn(card, ['h2 span[title]', 'h2 a span', 'h2 span', '[data-testid="job-title"]']),
        company:  textIn(card, ['[data-testid="company-name"]', '[class*="companyName"]']),
        location: textIn(card, ['[data-testid="text-location"]', '[class*="location"]']),
        salary:   textIn(card, ['[class*="salary"]', '[data-testid="attribute_snippet"]']),
        portal: 'Indeed',
        url: link?.href ? (link.href.startsWith('http') ? link.href : 'https://www.indeed.com' + link.href) : location.href,
      };
    },
  },

  // ── Naukri ────────────────────────────────────────────────────────────────────
  {
    name: 'Naukri',
    hostname: 'naukri.com',
    isDetailPage: () => /job-listings/.test(location.pathname),
    extractDetail() {
      return {
        title:    text(['.jd-header-title', 'h1.title', 'h1[class*="title"]']),
        company:  text(['.jd-header-comp-name a', '.companyInfo a']),
        location: text(['.location a', '[class*="location"] a']),
        salary:   text(['.salary', '[class*="salary"]']),
        jobType:  text(['[class*="emptype"]', '[class*="type"]']),
        description: html(['.job-desc', '#job-desc']),
        portal: 'Naukri', url: location.href,
      };
    },
    cardSelector: 'article.jobTuple, div.jobTuple, [class*="srp-jobtuple"], [class*="JobTuple"]',
    extractCard(card) {
      const link = card.querySelector('a.title, a[class*="title"], h2 a, .row1 a');
      return {
        title:    textIn(card, ['a.title', 'h2 a', '.row1 a', '[class*="title"] a', 'a[title]']),
        company:  textIn(card, ['a.comp-name', '.comp-name', '[class*="comp-name"]']),
        location: textIn(card, ['.locWdth', '[class*="loc"] span', '[class*="location"] a']),
        salary:   textIn(card, ['[class*="salary"] span', '.sal span', '[class*="salary"]']),
        jobType:  textIn(card, ['[class*="emptype"]', '[class*="type"]']),
        portal: 'Naukri',
        url: link?.href || location.href,
      };
    },
  },

  // ── Glassdoor ─────────────────────────────────────────────────────────────────
  {
    name: 'Glassdoor',
    hostname: 'glassdoor.',
    isDetailPage: () => /job-listing/.test(location.href),
    extractDetail() {
      return {
        title:    text(['[data-test="job-title"]', 'h1']),
        company:  text(['[data-test="employer-name"]']),
        location: text(['[data-test="location"]']),
        salary:   text(['[data-test="salary-estimate"]']),
        description: html(['[class*="JobDesc"]', '.jobDescriptionContent']),
        portal: 'Glassdoor', url: location.href,
      };
    },
    cardSelector: 'li[data-test="jobListing"], [class*="JobCard"], article[class*="job"]',
    extractCard(card) {
      const link = card.querySelector('a[data-test="job-title"], a[class*="jobLink"], a');
      return {
        title:    textIn(card, ['[data-test="job-title"]', 'h3', 'h2']),
        company:  textIn(card, ['[data-test="employer-name"]', '[class*="employer"]']),
        location: textIn(card, ['[data-test="location"]', '[class*="location"]']),
        salary:   textIn(card, ['[data-test="salary-estimate"]', '[class*="salary"]']),
        portal: 'Glassdoor',
        url: link?.href || location.href,
      };
    },
  },

  // ── Wellfound ─────────────────────────────────────────────────────────────────
  {
    name: 'Wellfound',
    hostname: 'wellfound.com',
    isDetailPage: () => /\/jobs\/|\/l\//.test(location.pathname),
    extractDetail() {
      return {
        title:    text(['h1[class*="title"]', 'h1']),
        company:  text(['a[class*="startup"]', '[class*="company"] a', 'h2']),
        location: text(['[class*="location"]', '[class*="remote"]']),
        description: html(['[class*="description"]']),
        portal: 'Wellfound', url: location.href,
      };
    },
    cardSelector: '[class*="JobListing"], [class*="job-listing"], [data-test="StartupResult"]',
    extractCard(card) {
      const link = card.querySelector('a[class*="job"], a[href*="/jobs/"]');
      return {
        title:    textIn(card, ['[class*="title"]', 'h2', 'h3']),
        company:  textIn(card, ['[class*="startup"], [class*="company"]']),
        location: textIn(card, ['[class*="location"]', '[class*="remote"]']),
        portal: 'Wellfound',
        url: link?.href || location.href,
      };
    },
  },

  // ── Internshala ───────────────────────────────────────────────────────────────
  {
    name: 'Internshala',
    hostname: 'internshala.com',
    isDetailPage: () => /\/internship\/detail|\/job\/detail/.test(location.pathname),
    extractDetail() {
      return {
        title:    text(['.profile h1', 'h1.profile-title']),
        company:  text(['.company-name a', '.companyName']),
        location: text(['.location_link', '.other_detail_item span']),
        salary:   text(['.stipend', '.salary']),
        description: html(['.internship_details', '.job_description']),
        portal: 'Internshala', url: location.href,
      };
    },
    cardSelector: '.internship_meta, [class*="individual_internship"], .container.internship',
    extractCard(card) {
      const link = card.querySelector('a.view_detail_button, a[href*="/internship/"], a[href*="/job/"]');
      return {
        title:    textIn(card, ['.profile a', 'h3 a', '.heading_4_5 a']),
        company:  textIn(card, ['.company-name', '[class*="company"]']),
        location: textIn(card, ['.location_link span', '[class*="location"]']),
        salary:   textIn(card, ['.stipend', '[class*="salary"]']),
        portal: 'Internshala',
        url: link?.href || location.href,
      };
    },
  },

  // ── Remotive ──────────────────────────────────────────────────────────────────
  {
    name: 'Remotive',
    hostname: 'remotive.com',
    isDetailPage: () => /\/remote-jobs\//.test(location.pathname) && !/\/$/.test(location.pathname),
    extractDetail() {
      return {
        title:    text(['h1']),
        company:  text(['[class*="company"]', 'h2']),
        description: html(['[class*="description"]', '#job-description']),
        portal: 'Remotive', url: location.href,
      };
    },
    cardSelector: 'li[class*="job"], [class*="job-tile"], [class*="JobTile"]',
    extractCard(card) {
      const link = card.querySelector('a');
      return {
        title:    textIn(card, ['h2', 'h3', '[class*="title"]']),
        company:  textIn(card, ['[class*="company"]']),
        location: textIn(card, ['[class*="location"]', '[class*="region"]']),
        portal: 'Remotive',
        url: link?.href || location.href,
      };
    },
  },

  // ── Dice ──────────────────────────────────────────────────────────────────────
  {
    name: 'Dice',
    hostname: 'dice.com',
    isDetailPage: () => /job-detail/.test(location.href),
    extractDetail() {
      return {
        title:    text(['h1[data-cy="jobTitle"]', 'h1']),
        company:  text(['a[data-cy="employer"]']),
        location: text(['[data-cy="location"]']),
        salary:   text(['[data-cy="salaryRange"]']),
        description: html(['[data-cy="jobDescription"]']),
        portal: 'Dice', url: location.href,
      };
    },
    cardSelector: 'dhi-search-card, [data-testid="job-card"], [class*="card-title-link"]',
    extractCard(card) {
      const link = card.querySelector('a[data-cy="card-title-link"], a[href*="job-detail"]');
      return {
        title:    textIn(card, ['[data-cy="card-title-link"]', 'h5', 'h3']),
        company:  textIn(card, ['[class*="company"]']),
        location: textIn(card, ['[class*="location"]']),
        portal: 'Dice',
        url: link?.href || location.href,
      };
    },
  },

  // ── Seek ──────────────────────────────────────────────────────────────────────
  {
    name: 'Seek',
    hostname: 'seek.com.au',
    isDetailPage: () => /\/job\/\d+/.test(location.pathname),
    extractDetail() {
      return {
        title:    text(['[data-automation="job-detail-title"]', 'h1']),
        company:  text(['[data-automation="advertiser-name"]']),
        location: text(['[data-automation="job-detail-location"]']),
        salary:   text(['[data-automation="job-detail-salary"]']),
        description: html(['[data-automation="jobAdDetails"]']),
        portal: 'Seek', url: location.href,
      };
    },
    cardSelector: 'article[data-card-type="JobCard"], [class*="jobCard"]',
    extractCard(card) {
      const link = card.querySelector('a[data-automation="job-list-item-link-overlay"], a');
      return {
        title:    textIn(card, ['[data-automation="job-list-view-title"]', 'h3']),
        company:  textIn(card, ['[class*="company"]', '[data-automation="job-card-employer-name"]']),
        location: textIn(card, ['[data-automation="job-card-location"]', '[class*="location"]']),
        salary:   textIn(card, ['[data-automation="job-card-salary"]']),
        portal: 'Seek',
        url: link?.href || location.href,
      };
    },
  },
];

// ── DOM helpers ────────────────────────────────────────────────────────────────
function text(selectors) {
  for (const sel of selectors) {
    try {
      const el = document.querySelector(sel);
      if (el?.innerText?.trim()) return el.innerText.trim();
    } catch {}
  }
  return '';
}
function textIn(root, selectors) {
  for (const sel of selectors) {
    try {
      const el = root.querySelector(sel);
      if (el?.innerText?.trim()) return el.innerText.trim();
      const title = el?.getAttribute?.('title');
      if (title?.trim()) return title.trim();
    } catch {}
  }
  return '';
}
function html(selectors) {
  for (const sel of selectors) {
    try {
      const el = document.querySelector(sel);
      if (el?.innerHTML?.trim()) return el.innerHTML.trim();
    } catch {}
  }
  return '';
}

// ── Detect active portal ───────────────────────────────────────────────────────
function detectPortal() {
  return PORTALS.find(p => location.hostname.includes(p.hostname)) || null;
}

// ── Send job to background ─────────────────────────────────────────────────────
function saveJobData(job, onResult) {
  if (!job.jobType) job.jobType = 'Full-time';
  browser.runtime.sendMessage({ action: 'saveJob', job })
    .then(onResult)
    .catch(() => onResult({ ok: false, error: 'Extension error' }));
}

// ── Toast ──────────────────────────────────────────────────────────────────────
function showToast(message, type) {
  const existing = document.getElementById('jc-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'jc-toast';
  toast.className = `jc-toast jc-toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ══════════════════════════════════════════════════════════════════════════════
// SIDEBAR — full-height right-side panel (like Claude.ai)
// ══════════════════════════════════════════════════════════════════════════════

const jcState = {
  sidebarOpen: false,
  user: null,
  keywords: [],
  location: '',
  portals: { Naukri: false, LinkedIn: true, Indeed: false, Glassdoor: false, Wellfound: false, Internshala: false, Remotive: false },
  syncing: false,
  syncProgress: null,
};

let sidebarEl = null;
let toggleTabEl = null;

function injectSidebar() {
  if (document.getElementById('jc-sidebar')) return;

  sidebarEl = document.createElement('div');
  sidebarEl.id = 'jc-sidebar';
  sidebarEl.innerHTML = `
    <div id="jc-header">
      <div id="jc-logo">
        <svg width="16" height="16" viewBox="0 0 60 60" fill="none">
          <defs><clipPath id="sb-clip"><circle cx="28" cy="30" r="23.5"/></clipPath></defs>
          <circle cx="28" cy="30" r="25.5" stroke="white" stroke-width="4"/>
          <circle cx="37" cy="30" r="18.5" stroke="white" stroke-width="4" clip-path="url(#sb-clip)"/>
          <circle cx="46" cy="30" r="10.5" stroke="white" stroke-width="4" clip-path="url(#sb-clip)"/>
        </svg>
      </div>
      <span id="jc-brand">Calos</span>
      <button class="jc-icon-btn" id="jc-close-btn" title="Close">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor">
          <path d="M1 1l11 11M12 1 1 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>
        </svg>
      </button>
    </div>
    <div id="jc-account-row" style="display:none">
      <div id="jc-avatar"></div>
      <span id="jc-account-name"></span>
    </div>
    <div id="jc-body"></div>
    <div id="jc-footer" style="display:none">
      <button id="jc-sync-btn">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
          <path d="M13.5 2.5A7 7 0 0 0 2 8H0l3 3 3-3H4a5 5 0 1 1 1.5 3.54L4.08 9.96A7 7 0 1 0 13.5 2.5Z"/>
        </svg>
        Sync Jobs Now
      </button>
      <div class="jc-footer-row">
        <a class="jc-dash-link" href="https://job-crowler.onrender.com" target="_blank">Open Dashboard ↗</a>
        <button class="jc-logout-btn" id="jc-logout-btn">Sign out</button>
      </div>
      <div class="jc-last-sync-text" id="jc-last-sync-text"></div>
      <div class="jc-disclaimer">Auto-syncs every 4 hours</div>
    </div>
  `;
  document.body.appendChild(sidebarEl);

  toggleTabEl = document.createElement('div');
  toggleTabEl.id = 'jc-toggle-tab';
  toggleTabEl.title = 'Open Calos';
  toggleTabEl.innerHTML = `<svg width="18" height="18" viewBox="0 0 60 60" fill="none">
    <defs><clipPath id="tab-clip"><circle cx="28" cy="30" r="23.5"/></clipPath></defs>
    <circle cx="28" cy="30" r="25.5" stroke="#c8894a" stroke-width="4"/>
    <circle cx="37" cy="30" r="18.5" stroke="#c8894a" stroke-width="4" clip-path="url(#tab-clip)"/>
    <circle cx="46" cy="30" r="10.5" stroke="#c8894a" stroke-width="4" clip-path="url(#tab-clip)"/>
  </svg>`;
  document.body.appendChild(toggleTabEl);

  // Static header button listeners
  document.getElementById('jc-close-btn').addEventListener('click', () => toggleSidebar(false));
  toggleTabEl.addEventListener('click', () => toggleSidebar(true));
}

function toggleSidebar(show) {
  if (show === undefined) show = !jcState.sidebarOpen;
  jcState.sidebarOpen = show;
  sidebarEl?.classList.toggle('jc-open', show);
  if (toggleTabEl) toggleTabEl.style.display = show ? 'none' : '';
}

function setAccountRow(user) {
  const row = document.getElementById('jc-account-row');
  if (!row) return;
  const initials = (user.name || user.email || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  document.getElementById('jc-avatar').textContent = initials;
  document.getElementById('jc-account-name').textContent = user.name || user.email;
  row.style.display = 'flex';
}

// ── View rendering ─────────────────────────────────────────────────────────────

function renderView() {
  const body = document.getElementById('jc-body');
  if (!body) return;
  if (jcState.syncing) { renderSyncView(body); return; }
  if (!jcState.user)   { renderLoginView(body); return; }
  const portal = detectPortal();
  if (portal?.isDetailPage()) {
    const job = portal.extractDetail();
    if (job.title) { renderJobView(body, job); return; }
  }
  renderDashboardView(body);
}

// ── Login view ─────────────────────────────────────────────────────────────────
function renderLoginView(body) {
  body.innerHTML = `
    <p class="jc-login-title">Sign in to JobCrawler</p>
    <p class="jc-login-sub">Auto-fetch matching jobs from LinkedIn, Naukri, Indeed and 20+ portals based on your profile.</p>
    <div class="jc-error-msg" id="jc-err"></div>
    <div class="jc-field"><label>Email</label><input type="email" id="jc-email" placeholder="you@example.com"></div>
    <div class="jc-field" style="margin-bottom:16px"><label>Password</label><input type="password" id="jc-pw" placeholder="••••••••"></div>
    <button class="jc-login-btn" id="jc-login-submit">Sign in</button>
  `;

  const doLogin = async () => {
    const email = document.getElementById('jc-email').value.trim();
    const pw    = document.getElementById('jc-pw').value;
    const err   = document.getElementById('jc-err');
    const btn   = document.getElementById('jc-login-submit');
    if (!email || !pw) { err.textContent = 'Enter email and password.'; err.classList.add('visible'); return; }
    btn.disabled = true; btn.textContent = 'Signing in…';
    const result = await browser.runtime.sendMessage({ action: 'login', email, password: pw });
    if (result?.ok) {
      jcState.user = result.user;
      jcState.keywords = result.user?.keywords || result.user?.skills || [];
      setAccountRow(jcState.user);
      document.getElementById('jc-footer').style.display = '';
      document.getElementById('jc-logout-btn').onclick = handleLogout;
      document.getElementById('jc-sync-btn').onclick = handleSync;
      loadLastSync();
      renderView();
    } else {
      err.textContent = result?.error || 'Login failed.';
      err.classList.add('visible');
      btn.disabled = false; btn.textContent = 'Sign in';
    }
  };

  document.getElementById('jc-login-submit').addEventListener('click', doLogin);
  document.getElementById('jc-pw').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
}

// ── Dashboard view ─────────────────────────────────────────────────────────────
function renderDashboardView(body) {
  const kw = jcState.keywords.length
    ? jcState.keywords.map(k => `<span class="jc-chip">${escHtml(k)}</span>`).join('')
    : `<span class="jc-chip" style="color:#3a3630">No keywords set</span>`;

  const portalGrid = Object.entries(jcState.portals).map(([name, on]) => `
    <div class="jc-portal-toggle${on ? ' on' : ''}" data-portal="${name}">
      <div class="jc-portal-dot"></div>
      <span class="jc-portal-name">${name}</span>
    </div>`).join('');

  body.innerHTML = `
    <div class="jc-kw-row">
      <svg width="13" height="13" viewBox="0 0 16 16" fill="#55504a" style="flex-shrink:0;margin-top:1px">
        <path d="M6 1a5 5 0 1 0 4.09 7.88l3.26 3.26 1.06-1.06-3.26-3.26A5 5 0 0 0 6 1Zm0 1.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z"/>
      </svg>
      <div class="jc-kw-content">
        <div class="jc-kw-title">Searching for</div>
        <div class="jc-kw-chips">${kw}</div>
      </div>
      <button class="jc-kw-edit" id="jc-kw-edit">Edit</button>
    </div>
    <div class="jc-section-label">Portals to sync</div>
    <div class="jc-portals-grid">${portalGrid}</div>
  `;

  body.querySelectorAll('.jc-portal-toggle').forEach(el => {
    el.addEventListener('click', () => {
      const name = el.dataset.portal;
      jcState.portals[name] = !jcState.portals[name];
      el.classList.toggle('on', jcState.portals[name]);
      browser.storage.local.set({ syncPortals: Object.entries(jcState.portals).filter(([,v])=>v).map(([k])=>k) });
    });
  });

  document.getElementById('jc-kw-edit').addEventListener('click', () => renderKeywordEdit(body));
}

// ── Keyword edit ───────────────────────────────────────────────────────────────
function renderKeywordEdit(body) {
  body.innerHTML = `
    <div class="jc-section-label">Search keywords</div>
    <p style="font-size:11px;color:#55504a;margin-bottom:12px;line-height:1.6">Comma-separated skills or job titles to search across portals.</p>
    <div class="jc-field"><label>Keywords</label><input type="text" id="jc-kw-inp" value="${escHtml(jcState.keywords.join(', '))}" placeholder="e.g. product designer, UI/UX, Figma"></div>
    <div class="jc-field" style="margin-bottom:16px"><label>Location <span style="color:#3a3630">(optional)</span></label><input type="text" id="jc-loc-inp" value="${escHtml(jcState.location)}" placeholder="e.g. Bangalore, Remote"></div>
    <div style="display:flex;gap:8px">
      <button class="jc-btn-secondary" id="jc-kw-cancel" style="border-radius:5px">Cancel</button>
      <button class="jc-btn-primary" id="jc-kw-save" style="border-radius:5px">Save keywords</button>
    </div>
  `;
  document.getElementById('jc-kw-cancel').addEventListener('click', () => renderView());
  document.getElementById('jc-kw-save').addEventListener('click', async () => {
    const kws = document.getElementById('jc-kw-inp').value.split(',').map(s=>s.trim()).filter(Boolean);
    const loc  = document.getElementById('jc-loc-inp').value.trim();
    jcState.keywords = kws; jcState.location = loc;
    await browser.runtime.sendMessage({ action: 'saveKeywords', keywords: kws, location: loc });
    showToast('Keywords saved!', 'success');
    renderView();
  });
}

// ── Job detail view ────────────────────────────────────────────────────────────
function renderJobView(body, job) {
  const hasForm = isApplicationPage();
  body.innerHTML = `
    <div class="jc-section-label">Job on this page</div>
    <div class="jc-job-card">
      <div class="jc-job-title">${escHtml(job.title)}</div>
      <div class="jc-job-meta">${escHtml([job.company, job.location].filter(Boolean).join(' · '))}</div>
      ${job.jobType ? `<div class="jc-job-badge">${escHtml(job.jobType)}</div>` : ''}
      <div class="jc-job-actions">
        <button class="jc-btn-primary" id="jc-save-job">
          <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor"><path d="M3 2h10a1 1 0 0 1 1 1v10.586l-4-4-4 4V3a1 1 0 0 1 1-1z"/></svg>
          Save Job
        </button>
        ${hasForm ? `
        <button class="jc-btn-secondary" id="jc-autofill-btn">
          <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor"><path d="M13 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Zm-4 9H7V7h2v4Zm0-6H7V3h2v2Z"/></svg>
          Autofill
        </button>` : ''}
      </div>
    </div>
    <div class="jc-section-label" style="margin-top:4px">Dashboard</div>
    <div class="jc-kw-row" style="cursor:pointer" id="jc-goto-dash">
      <svg width="12" height="12" viewBox="0 0 16 16" fill="#55504a"><path d="M6 1a5 5 0 1 0 4.09 7.88l3.26 3.26 1.06-1.06-3.26-3.26A5 5 0 0 0 6 1Zm0 1.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z"/></svg>
      <div class="jc-kw-content"><div class="jc-kw-title" style="margin-bottom:0;line-height:1.6">View all saved jobs & manage portals</div></div>
      <svg width="10" height="10" viewBox="0 0 16 16" fill="#3a3630"><path d="M6 3l5 5-5 5"/></svg>
    </div>
  `;

  const saveBtn = document.getElementById('jc-save-job');
  saveBtn?.addEventListener('click', () => {
    saveBtn.disabled = true; saveBtn.textContent = 'Saving…';
    saveJobData(job, res => {
      if (res?.ok) { saveBtn.textContent = '✓ Saved'; showToast('Saved to JobCrawler!', 'success'); }
      else {
        saveBtn.disabled = false;
        saveBtn.innerHTML = `<svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor"><path d="M3 2h10a1 1 0 0 1 1 1v10.586l-4-4-4 4V3a1 1 0 0 1 1-1z"/></svg> Save Job`;
        showToast(res?.error || 'Failed to save.', 'error');
      }
    });
  });

  document.getElementById('jc-autofill-btn')?.addEventListener('click', () => runAutofill());
  document.getElementById('jc-goto-dash')?.addEventListener('click', () => renderView());
}

// ── Sync progress view ─────────────────────────────────────────────────────────
function renderSyncView(body) {
  const prog = jcState.syncProgress;
  if (!prog) return;
  const total = prog.portals.length;
  const done  = prog.portals.filter(p => p.status === 'done' || p.status === 'error').length;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

  const rows = prog.portals.map(p => `
    <div class="jc-portal-row">
      <div class="jc-pr-icon">
        ${p.status === 'running' ? '<div class="jc-spin"></div>'
          : p.status === 'done'  ? '<svg width="12" height="12" viewBox="0 0 16 16" fill="#4ade80"><path d="M6.5 11.5 3 8l1-1 2.5 2.5 6-6 1 1z"/></svg>'
          : p.status === 'error' ? '<svg width="12" height="12" viewBox="0 0 16 16" fill="#f87171"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm-.75 4h1.5v4h-1.5V5Zm.75 6.5a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"/></svg>'
          : '<div style="width:12px;height:12px;border-radius:50%;background:#2e2b27"></div>'}
      </div>
      <span class="jc-pr-name ${p.status}">${p.name}</span>
      <span class="jc-pr-count ${p.count > 0 ? 'has' : ''}">${p.status === 'done' ? (p.count > 0 ? `+${p.count}` : '—') : ''}</span>
    </div>`).join('');

  body.innerHTML = `
    <div class="jc-sync-header">
      <div class="jc-spin"></div>
      <div class="jc-sync-title">Syncing jobs across portals…</div>
    </div>
    <div class="jc-progress-wrap"><div class="jc-progress-bar" style="width:${pct}%"></div></div>
    ${rows}
    ${prog.totalSaved > 0 ? `<div class="jc-sync-total">Found <strong>${prog.totalSaved}</strong> new jobs so far</div>` : ''}
  `;
}

// ── Sync / logout handlers ─────────────────────────────────────────────────────
function handleSync() {
  if (jcState.syncing) return;
  const enabled = Object.entries(jcState.portals).filter(([,on]) => on).map(([name]) => name);
  if (!enabled.length) { showToast('Enable at least one portal first.', 'error'); return; }
  jcState.syncing = true;
  jcState.syncProgress = { portals: enabled.map(name => ({ name, status: 'pending', count: 0 })), totalSaved: 0 };
  renderView();
  browser.runtime.sendMessage({ action: 'startSync', portals: enabled })
    .then(() => { jcState.syncing = false; jcState.syncProgress = null; loadLastSync(); renderView(); })
    .catch(() => { jcState.syncing = false; jcState.syncProgress = null; renderView(); });
}

async function handleLogout() {
  await browser.runtime.sendMessage({ action: 'logout' });
  jcState.user = null; jcState.keywords = []; jcState.syncing = false;
  document.getElementById('jc-account-row').style.display = 'none';
  document.getElementById('jc-footer').style.display = 'none';
  renderView();
}

async function loadLastSync() {
  const { lastSync } = await browser.storage.local.get('lastSync');
  const el = document.getElementById('jc-last-sync-text');
  if (!el || !lastSync) return;
  const min = Math.floor((Date.now() - lastSync.at) / 60000);
  const ago = min < 1 ? 'just now' : min < 60 ? `${min}m ago` : `${Math.floor(min/60)}h ago`;
  el.innerHTML = `Last sync: <span>${ago}</span> · ${lastSync.total || 0} jobs`;
}

// ── Bootstrap sidebar ──────────────────────────────────────────────────────────
async function initSidebar() {
  injectSidebar();

  // Re-attach footer buttons (static elements)
  const syncBtn   = document.getElementById('jc-sync-btn');
  const logoutBtn = document.getElementById('jc-logout-btn');
  if (syncBtn)   syncBtn.onclick   = handleSync;
  if (logoutBtn) logoutBtn.onclick = handleLogout;

  // Load persisted portal/keyword state
  const stored = await browser.storage.local.get(['syncPortals', 'syncKeywords', 'syncLocation']);
  if (stored.syncPortals?.length) {
    Object.keys(jcState.portals).forEach(k => { jcState.portals[k] = false; });
    stored.syncPortals.forEach(p => { if (p in jcState.portals) jcState.portals[p] = true; });
  }
  if (stored.syncKeywords) jcState.keywords = stored.syncKeywords;
  if (stored.syncLocation) jcState.location = stored.syncLocation;

  // Check auth
  const result = await browser.runtime.sendMessage({ action: 'getMe' }).catch(() => null);
  if (result?.ok && result.user) {
    jcState.user = result.user;
    jcState.keywords = result.user?.keywords || result.user?.skills || jcState.keywords;
    setAccountRow(jcState.user);
    document.getElementById('jc-footer').style.display = '';
    loadLastSync();
  }

  renderView();
}

// ── Utility ────────────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ══════════════════════════════════════════════════════════════════════════════
// LIST PAGE — inject save buttons on each card
// ══════════════════════════════════════════════════════════════════════════════
function injectCardButtons(portal) {
  document.querySelectorAll(portal.cardSelector).forEach(card => injectCardButton(card, portal));
}

function injectCardButton(card, portal) {
  if (card.querySelector('.jc-card-save')) return;
  const btn = document.createElement('button');
  btn.className = 'jc-card-save';
  btn.innerHTML = `<svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><rect width="16" height="16" rx="3" fill="#c8894a"/><text x="8" y="11.5" text-anchor="middle" fill="white" font-size="7" font-weight="700" font-family="-apple-system,sans-serif">JC</text></svg> Save`;
  btn.title = 'Save to JobCrawler';

  btn.addEventListener('click', e => {
    e.preventDefault(); e.stopPropagation();
    if (btn.classList.contains('jc-saving') || btn.classList.contains('jc-saved')) return;
    const job = portal.extractCard(card);
    if (!job.title) { showToast('Could not read this job.', 'error'); return; }
    btn.classList.add('jc-saving'); btn.textContent = '…';
    saveJobData(job, res => {
      btn.classList.remove('jc-saving');
      if (res?.ok) {
        btn.classList.add('jc-saved'); btn.innerHTML = '✓ Saved';
        showToast(`Saved "${job.title}"`, 'success');
      } else {
        btn.classList.add('jc-error'); btn.textContent = '✗';
        setTimeout(() => {
          btn.classList.remove('jc-error');
          btn.innerHTML = `<svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><rect width="16" height="16" rx="3" fill="#c8894a"/><text x="8" y="11.5" text-anchor="middle" fill="white" font-size="7" font-weight="700" font-family="-apple-system,sans-serif">JC</text></svg> Save`;
        }, 2000);
      }
    });
  });

  const anchor = card.querySelector('a.title, h2 a, h3 a, [class*="title"] a, a[class*="title"]')
               || card.querySelector('h2, h3, [class*="title"]');
  if (anchor?.parentElement) anchor.parentElement.insertAdjacentElement('afterend', btn);
  else card.appendChild(btn);
}

function watchForNewCards(portal) {
  const observer = new MutationObserver(() => {
    document.querySelectorAll(`${portal.cardSelector}:not(:has(.jc-card-save))`).forEach(card => {
      injectCardButton(card, portal);
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

// ══════════════════════════════════════════════════════════════════════════════
// AUTOFILL ENGINE
// ══════════════════════════════════════════════════════════════════════════════
const FIELD_PATTERNS = [
  { type: 'firstName',       re: /first[\s_-]?name|fname|given[\s_-]?name|forename/i },
  { type: 'lastName',        re: /last[\s_-]?name|lname|surname|family[\s_-]?name/i },
  { type: 'fullName',        re: /^(full[\s_-]?name|your[\s_-]?name|candidate[\s_-]?name|name)$/i },
  { type: 'email',           re: /e[\s-]?mail/i },
  { type: 'phone',           re: /phone|mobile|tel|cell|contact[\s_-]?no/i },
  { type: 'linkedin',        re: /linkedin/i },
  { type: 'portfolioUrl',    re: /portfolio|github|personal[\s_-]?site|website|url/i },
  { type: 'city',            re: /^city$|city[\s_-]?name/i },
  { type: 'country',         re: /^country$/i },
  { type: 'state',           re: /^state$|province/i },
  { type: 'zipCode',         re: /zip|postal|pin[\s_-]?code/i },
  { type: 'location',        re: /^location$|current[\s_-]?location|address/i },
  { type: 'currentTitle',    re: /current[\s_-]?title|job[\s_-]?title|designation|position|role/i },
  { type: 'currentCompany',  re: /current[\s_-]?company|employer|organization|company[\s_-]?name/i },
  { type: 'yearsExperience', re: /years?[\s_-]?(of[\s_-]?)?exp|experience[\s_-]?years?/i },
  { type: 'summary',         re: /summary|cover[\s_-]?letter|about[\s_-]?(you|me)|bio|intro|message|why[\s_-]?join/i },
];

function getInputLabel(el) {
  if (el.id) {
    const lbl = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
    if (lbl) return lbl.innerText.trim();
  }
  const wrap = el.closest('label');
  if (wrap) return wrap.innerText.replace(el.value, '').trim();
  const prev = el.previousElementSibling;
  if (prev?.tagName === 'LABEL') return prev.innerText.trim();
  const parentText = el.parentElement?.previousElementSibling?.innerText?.trim();
  if (parentText) return parentText;
  return el.getAttribute('aria-label') || el.placeholder || el.name || el.id || '';
}

function identifyField(el) {
  if (el.type === 'submit' || el.type === 'button' || el.type === 'hidden' ||
      el.type === 'file'   || el.type === 'checkbox' || el.type === 'radio') return null;
  if (el.type === 'email') return 'email';
  if (el.type === 'tel')   return 'phone';
  const combined = `${getInputLabel(el)} ${el.name || ''} ${el.id || ''}`.toLowerCase();
  for (const { type, re } of FIELD_PATTERNS) {
    if (re.test(combined)) return type;
  }
  return null;
}

function fillInput(el, value) {
  if (!value && value !== 0) return false;
  const strVal = String(value);
  try {
    const nativeSetter = Object.getOwnPropertyDescriptor(
      el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value'
    )?.set;
    if (nativeSetter) nativeSetter.call(el, strVal);
    else el.value = strVal;
  } catch { el.value = strVal; }
  el.dispatchEvent(new Event('input',  { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  el.dispatchEvent(new Event('blur',   { bubbles: true }));
  return true;
}

function isApplicationPage() {
  const url = location.href.toLowerCase();
  const urlHit = ['apply', 'application', 'careers', 'jobs', 'recruitment', 'hiring', 'talent']
    .some(h => url.includes(h));
  if (!urlHit) return false;
  return document.querySelectorAll('input:not([type=hidden]):not([type=submit]):not([type=button]):not([type=file])').length >= 3;
}

let autofillProfile = null;

async function runAutofill() {
  if (!autofillProfile) {
    autofillProfile = await browser.runtime.sendMessage({ action: 'getAutofillProfile' });
  }
  if (!autofillProfile) { showToast('Sign in to the extension first.', 'error'); return; }

  const DATA = {
    firstName:       autofillProfile.firstName,
    lastName:        autofillProfile.lastName,
    fullName:        autofillProfile.fullName,
    email:           autofillProfile.email,
    phone:           autofillProfile.phone,
    linkedin:        autofillProfile.linkedinUrl,
    portfolioUrl:    autofillProfile.portfolioUrl,
    city:            autofillProfile.city,
    country:         autofillProfile.country,
    state:           '',
    zipCode:         '',
    location:        [autofillProfile.city, autofillProfile.country].filter(Boolean).join(', '),
    currentTitle:    autofillProfile.currentTitle,
    currentCompany:  autofillProfile.currentCompany,
    yearsExperience: autofillProfile.yearsExperience,
    summary:         autofillProfile.summary,
  };

  const allInputs = [...document.querySelectorAll('input, textarea, select')]
    .filter(el => !el.closest('[data-jc-ignore]') && el.offsetParent !== null);

  let filled = 0;
  allInputs.forEach(el => {
    const type = identifyField(el);
    if (!type || !DATA[type]) return;
    if (fillInput(el, DATA[type])) filled++;
  });

  if (filled > 0) showToast(`Autofilled ${filled} field${filled > 1 ? 's' : ''} ✓`, 'success');
  else showToast('No matching fields found on this form.', 'error');
}

// ── Message listener ───────────────────────────────────────────────────────────
browser.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'toggleSidebar') {
    toggleSidebar();
    return Promise.resolve({ ok: true });
  }

  if (msg.action === 'syncUpdate') {
    jcState.syncProgress = msg.state;
    jcState.syncing = msg.state.running;
    if (jcState.sidebarOpen) renderView();
    return Promise.resolve({ ok: true });
  }

  if (msg.action === 'getJobData') {
    const portal = detectPortal();
    if (!portal) return Promise.resolve({ found: false });
    if (portal.isDetailPage()) {
      const job = portal.extractDetail();
      return Promise.resolve({ found: !!job.title, job });
    }
    return Promise.resolve({ found: false, isListPage: true, portal: portal.name });
  }

  if (msg.action === 'checkAutofill') {
    return Promise.resolve({ hasForm: isApplicationPage() });
  }

  if (msg.action === 'runAutofill') {
    runAutofill();
    return Promise.resolve({ ok: true });
  }

  if (msg.action === 'autoSync') {
    const portal = detectPortal();
    if (!portal?.cardSelector) return Promise.resolve({ jobs: [] });
    return new Promise(resolve => {
      const extract = () => {
        const jobs = Array.from(document.querySelectorAll(portal.cardSelector))
          .map(card => portal.extractCard(card))
          .filter(j => j.title && j.url);
        resolve({ jobs, count: jobs.length, portal: portal.name });
      };
      if (document.querySelectorAll(portal.cardSelector).length > 0) extract();
      else setTimeout(extract, 3000);
    });
  }
});

// ── Init ───────────────────────────────────────────────────────────────────────
(function init() {
  const portal = detectPortal();

  initSidebar();

  if (!portal) return;

  const delay = location.hostname.includes('linkedin.com') ? 1500 : 600;

  setTimeout(() => {
    if (!portal.isDetailPage() && portal.cardSelector) {
      injectCardButtons(portal);
      watchForNewCards(portal);
    }
  }, delay);

  // SPA navigation support
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href === lastUrl) return;
    lastUrl = location.href;
    setTimeout(() => {
      const p = detectPortal();
      if (p && !p.isDetailPage() && p.cardSelector) {
        injectCardButtons(p); watchForNewCards(p);
      }
      if (jcState.sidebarOpen) renderView();
    }, delay);
  }).observe(document.body, { childList: true, subtree: true });
})();
