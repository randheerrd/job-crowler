const DEFAULT_API = 'https://job-crowler.onrender.com/api';

const SUPPORTED_PORTALS = [
  'LinkedIn', 'Indeed', 'Naukri', 'Glassdoor', 'Wellfound', 'Internshala',
  'Remotive', 'Dice', 'ZipRecruiter', 'Monster', 'Shine', 'TimesJobs',
  'Stepstone', 'Reed', 'Seek', 'JobStreet', 'Himalayas', 'We Work Remotely',
];

// ── DOM refs ──────────────────────────────────────────────────────────────────
const tokenInput    = document.getElementById('tokenInput');
const saveTokenBtn  = document.getElementById('saveToken');
const testConnBtn   = document.getElementById('testConnection');
const tokenStatus   = document.getElementById('tokenStatus');
const connDot       = document.getElementById('connDot');
const connStatus    = document.getElementById('connStatus');
const apiUrlInput   = document.getElementById('apiUrlInput');
const saveUrlBtn    = document.getElementById('saveUrl');
const resetUrlBtn   = document.getElementById('resetUrl');
const urlStatus     = document.getElementById('urlStatus');
const dashLink      = document.getElementById('dashLink');
const portalsGrid   = document.getElementById('portalsGrid');

// ── Load saved values ─────────────────────────────────────────────────────────
async function load() {
  const { extensionToken, apiUrl } = await browser.storage.sync.get(['extensionToken', 'apiUrl']);

  tokenInput.value  = extensionToken || '';
  apiUrlInput.value = apiUrl || DEFAULT_API;

  const dashboard = (apiUrl || DEFAULT_API).replace('/api', '');
  dashLink.href = dashboard;

  if (extensionToken) await checkConnection(extensionToken, apiUrl || DEFAULT_API);

  // Render supported portals
  SUPPORTED_PORTALS.forEach(name => {
    const chip = document.createElement('span');
    chip.className = 'portal-chip';
    chip.textContent = name;
    portalsGrid.appendChild(chip);
  });
}

// ── Save token ────────────────────────────────────────────────────────────────
saveTokenBtn.addEventListener('click', async () => {
  const token = tokenInput.value.trim();
  if (!token) { showStatus(tokenStatus, 'Please paste a token first.', 'error'); return; }

  await browser.storage.sync.set({ extensionToken: token });
  showStatus(tokenStatus, 'Token saved.', 'success');

  const { apiUrl } = await browser.storage.sync.get(['apiUrl']);
  await checkConnection(token, apiUrl || DEFAULT_API);
});

// ── Test connection ───────────────────────────────────────────────────────────
testConnBtn.addEventListener('click', async () => {
  const token = tokenInput.value.trim();
  if (!token) { showStatus(tokenStatus, 'Save a token first.', 'error'); return; }
  const { apiUrl } = await browser.storage.sync.get(['apiUrl']);
  testConnBtn.textContent = 'Testing…';
  testConnBtn.disabled = true;
  await checkConnection(token, apiUrl || DEFAULT_API);
  testConnBtn.textContent = 'Test connection';
  testConnBtn.disabled = false;
});

async function checkConnection(token, apiUrl) {
  const base = apiUrl.replace(/\/$/, '');
  setConnStatus('testing');
  try {
    const res = await fetch(`${base}/health`);
    if (res.ok) {
      setConnStatus('connected');
      showStatus(tokenStatus, 'Connected to JobCrawler.', 'success');
    } else {
      setConnStatus('error');
      showStatus(tokenStatus, `Server returned ${res.status}. Check your API URL.`, 'error');
    }
  } catch {
    setConnStatus('error');
    showStatus(tokenStatus, 'Could not reach the server. Check your API URL.', 'error');
  }
}

function setConnStatus(state) {
  connDot.className = 'conn-dot' + (state === 'connected' ? ' connected' : state === 'error' ? ' error' : '');
  connStatus.textContent =
    state === 'connected' ? 'Connected to JobCrawler' :
    state === 'error'     ? 'Connection failed' :
    state === 'testing'   ? 'Checking…' :
    'Not connected';
}

// ── Save URL ──────────────────────────────────────────────────────────────────
saveUrlBtn.addEventListener('click', async () => {
  const url = apiUrlInput.value.trim();
  if (!url) { showStatus(urlStatus, 'URL cannot be empty.', 'error'); return; }
  await browser.storage.sync.set({ apiUrl: url });
  dashLink.href = url.replace('/api', '');
  showStatus(urlStatus, 'API URL saved.', 'success');
});

resetUrlBtn.addEventListener('click', async () => {
  apiUrlInput.value = DEFAULT_API;
  await browser.storage.sync.set({ apiUrl: DEFAULT_API });
  dashLink.href = DEFAULT_API.replace('/api', '');
  showStatus(urlStatus, 'Reset to default.', 'info');
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function showStatus(el, msg, type) {
  el.textContent = msg;
  el.className = `status-msg visible ${type}`;
  setTimeout(() => el.classList.remove('visible'), 4000);
}

load();
