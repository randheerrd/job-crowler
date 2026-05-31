import { Router, Response } from 'express';
import * as cheerio from 'cheerio';
import crypto from 'crypto';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// ── Types ─────────────────────────────────────────────────────────────────────
interface ScrapedJob {
  title: string;
  company: string;
  location: string;
  jobType: string;
  url: string;
  description?: string;
  salary?: string;
  portal: string;
}

interface CustomSource {
  id: string;
  url: string;
  name: string;
  type: string;
  lastSync: string | null;
  jobCount: number;
}

// ── ATS detectors ─────────────────────────────────────────────────────────────
function detectATS(url: string): string {
  if (/boards\.greenhouse\.io|job-boards\.greenhouse\.io/.test(url)) return 'greenhouse';
  if (/jobs\.lever\.co/.test(url))      return 'lever';
  if (/jobs\.ashbyhq\.com/.test(url))   return 'ashby';
  if (/workatastartup\.com/.test(url))  return 'workatastartup';
  if (/ycombinator\.com/.test(url))     return 'workatastartup';
  if (/myworkdayjobs\.com/.test(url))   return 'workday';
  if (/careers\.smartrecruiters\.com/.test(url)) return 'smartrecruiters';
  if (/bamboohr\.com\/jobs/.test(url))  return 'bamboohr';
  if (/jobs\.ashby\.com/.test(url))     return 'ashby';
  return 'generic';
}

function extractSlug(url: string): string {
  return new URL(url).pathname.split('/').filter(Boolean).pop() || '';
}

// ── Greenhouse (public JSON API) ───────────────────────────────────────────────
async function scrapeGreenhouse(url: string): Promise<ScrapedJob[]> {
  const slug = extractSlug(url);
  const apiUrl = `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=true`;
  const res = await fetch(apiUrl, { headers: { 'User-Agent': 'JobCrawler/1.0' } });
  if (!res.ok) throw new Error(`Greenhouse API error: ${res.status}`);
  const data = await res.json() as { jobs: Array<{
    title: string; absolute_url: string;
    location: { name: string };
    metadata?: Array<{ value: string; value_type: string }>;
    content?: string;
    departments?: Array<{ name: string }>;
  }> };

  return (data.jobs || []).map(j => ({
    title: j.title,
    company: slug.charAt(0).toUpperCase() + slug.slice(1),
    location: j.location?.name || 'Not specified',
    jobType: j.metadata?.find(m => m.value_type === 'text')?.value || 'Full-time',
    url: j.absolute_url,
    description: j.content?.replace(/<[^>]+>/g, ' ').trim().slice(0, 500),
    portal: 'Greenhouse',
  }));
}

// ── Lever (public JSON API) ───────────────────────────────────────────────────
async function scrapeLever(url: string): Promise<ScrapedJob[]> {
  const slug = new URL(url).pathname.split('/')[1];
  const apiUrl = `https://api.lever.co/v0/postings/${slug}?mode=json`;
  const res = await fetch(apiUrl, { headers: { 'User-Agent': 'JobCrawler/1.0' } });
  if (!res.ok) throw new Error(`Lever API error: ${res.status}`);
  const data = await res.json() as Array<{
    text: string; hostedUrl: string;
    categories: { location: string; commitment: string; department: string };
    descriptionPlain?: string;
  }>;

  return (data || []).map(j => ({
    title: j.text,
    company: slug.charAt(0).toUpperCase() + slug.slice(1),
    location: j.categories?.location || 'Not specified',
    jobType: j.categories?.commitment || 'Full-time',
    url: j.hostedUrl,
    description: j.descriptionPlain?.trim().slice(0, 500),
    portal: 'Lever',
  }));
}

// ── Ashby (public GraphQL API) ────────────────────────────────────────────────
async function scrapeAshby(url: string): Promise<ScrapedJob[]> {
  const slug = new URL(url).pathname.split('/')[1];
  const res = await fetch('https://jobs.ashbyhq.com/api/non-user-graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': 'JobCrawler/1.0' },
    body: JSON.stringify({
      operationName: 'ApiJobBoardWithTeams',
      variables: { organizationHostedJobsPageName: slug },
      query: `query ApiJobBoardWithTeams($organizationHostedJobsPageName: String!) {
        jobBoard: jobBoardWithTeams(organizationHostedJobsPageName: $organizationHostedJobsPageName) {
          jobPostings { title locationName employmentType externalLink isRemote }
        }
      }`,
    }),
  });
  const data = await res.json() as {
    data?: { jobBoard?: { jobPostings: Array<{
      title: string; locationName: string; employmentType: string;
      externalLink: string; isRemote: boolean;
    }> } }
  };
  const jobs = data?.data?.jobBoard?.jobPostings || [];
  return jobs.map(j => ({
    title: j.title,
    company: slug.charAt(0).toUpperCase() + slug.slice(1),
    location: j.isRemote ? 'Remote' : (j.locationName || 'Not specified'),
    jobType: j.employmentType || 'Full-time',
    url: j.externalLink || url,
    portal: 'Ashby',
  }));
}

// ── WorkAtAStartup / YC ───────────────────────────────────────────────────────
async function scrapeWorkAtAStartup(query?: string): Promise<ScrapedJob[]> {
  const role = query ? encodeURIComponent(query) : '';
  const apiUrl = `https://www.workatastartup.com/jobs?role=${role}&remote=yes&limit=50`;
  const res = await fetch(apiUrl, { headers: { 'User-Agent': 'JobCrawler/1.0', Accept: 'application/json' } });

  // Fallback: scrape the HTML page
  const html = await res.text();
  const $ = cheerio.load(html);
  const jobs: ScrapedJob[] = [];

  $('[class*="job-name"], [class*="listing-title"], h2 a').each((_, el) => {
    const title = $(el).text().trim();
    const href  = $(el).attr('href') || '';
    const link  = href.startsWith('http') ? href : 'https://www.workatastartup.com' + href;
    const card  = $(el).closest('[class*="job"], [class*="listing"], article');
    const company = card.find('[class*="company"], [class*="startup"]').first().text().trim();
    const loc     = card.find('[class*="location"]').first().text().trim();
    if (title && link) {
      jobs.push({ title, company: company || 'YC Company', location: loc || 'Remote', jobType: 'Full-time', url: link, portal: 'YC / Work at a Startup' });
    }
  });

  return jobs;
}

// ── Generic HTML scraper (fallback) ───────────────────────────────────────────
async function scrapeGeneric(url: string): Promise<ScrapedJob[]> {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; JobCrawler/1.0)' } });
  if (!res.ok) throw new Error(`Could not fetch page: ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  const hostname = new URL(url).hostname.replace('www.', '');
  const company = hostname.split('.')[0];

  const jobs: ScrapedJob[] = [];

  // Try common job listing patterns
  const jobSelectors = [
    'a[href*="/job/"]', 'a[href*="/jobs/"]', 'a[href*="/careers/"]',
    'a[href*="/position"]', 'a[href*="/opening"]', 'a[href*="/role"]',
    '[class*="job-title"] a', '[class*="position-title"] a',
    '[class*="job"] h2 a', '[class*="job"] h3 a',
    'h2 a[href*="job"]', 'h3 a[href*="job"]',
  ];

  const seen = new Set<string>();
  for (const sel of jobSelectors) {
    $(sel).each((_, el) => {
      const title = $(el).text().trim();
      const href = $(el).attr('href') || '';
      const link = href.startsWith('http') ? href : (href.startsWith('/') ? new URL(url).origin + href : url + '/' + href);
      if (!title || title.length < 3 || title.length > 120 || seen.has(link)) return;
      seen.add(link);

      const card = $(el).closest('li, article, div[class*="job"], div[class*="role"], tr');
      const loc  = card.find('[class*="location"], [class*="loc"]').first().text().trim();
      const type = card.find('[class*="type"], [class*="remote"]').first().text().trim();

      jobs.push({
        title,
        company: company.charAt(0).toUpperCase() + company.slice(1),
        location: loc || 'See posting',
        jobType: type || 'Full-time',
        url: link,
        portal: hostname,
      });
    });
    if (jobs.length >= 50) break;
  }

  return jobs;
}

// ── Main scrape dispatcher ────────────────────────────────────────────────────
async function scrapeUrl(url: string): Promise<{ jobs: ScrapedJob[]; type: string; name: string }> {
  let normalizedUrl = url.trim();
  if (!normalizedUrl.startsWith('http')) normalizedUrl = 'https://' + normalizedUrl;

  const type = detectATS(normalizedUrl);
  const slug = extractSlug(normalizedUrl);
  const name = slug.charAt(0).toUpperCase() + slug.slice(1) || new URL(normalizedUrl).hostname.replace('www.', '');

  let jobs: ScrapedJob[] = [];

  switch (type) {
    case 'greenhouse':       jobs = await scrapeGreenhouse(normalizedUrl); break;
    case 'lever':            jobs = await scrapeLever(normalizedUrl); break;
    case 'ashby':            jobs = await scrapeAshby(normalizedUrl); break;
    case 'workatastartup':   jobs = await scrapeWorkAtAStartup(); break;
    default:                 jobs = await scrapeGeneric(normalizedUrl); break;
  }

  return { jobs, type, name };
}

// ── Routes ────────────────────────────────────────────────────────────────────

// Preview: scrape and return jobs without saving
router.post('/preview', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { url } = req.body;
    if (!url) { res.status(400).json({ error: 'URL is required' }); return; }
    const result = await scrapeUrl(url);
    res.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Scraping failed';
    res.status(422).json({ error: msg });
  }
});

// Save all scraped jobs from a URL
router.post('/save', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { jobs, sourceUrl, sourceName } = req.body as {
      jobs: ScrapedJob[]; sourceUrl: string; sourceName: string;
    };
    if (!Array.isArray(jobs) || !jobs.length) {
      res.status(400).json({ error: 'No jobs to save' }); return;
    }

    let saved = 0;
    for (const j of jobs) {
      if (!j.title || !j.url) continue;
      try {
        let job = await prisma.job.findFirst({ where: { url: j.url } });
        if (!job) {
          job = await prisma.job.create({
            data: {
              portal: j.portal || sourceName || 'Custom',
              title: j.title,
              company: j.company || sourceName,
              location: j.location || 'Not specified',
              salary: j.salary || null,
              jobType: j.jobType || 'Full-time',
              description: j.description || '',
              url: j.url,
              postedAt: new Date(),
            },
          });
        }
        await prisma.savedJob.upsert({
          where: { userId_jobId: { userId: req.userId!, jobId: job.id } },
          create: { userId: req.userId!, jobId: job.id },
          update: {},
        });
        saved++;
      } catch { /* skip individual failures */ }
    }

    // Update source record in profileData
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (user) {
      const profile = JSON.parse(user.profileData || '{}');
      const sources: CustomSource[] = profile.customSources || [];
      const existing = sources.find(s => s.url === sourceUrl);
      if (existing) {
        existing.lastSync = new Date().toISOString();
        existing.jobCount = saved;
      } else {
        sources.push({
          id: crypto.randomBytes(8).toString('hex'),
          url: sourceUrl,
          name: sourceName,
          type: detectATS(sourceUrl),
          lastSync: new Date().toISOString(),
          jobCount: saved,
        });
      }
      profile.customSources = sources;
      await prisma.user.update({ where: { id: req.userId }, data: { profileData: JSON.stringify(profile) } });
    }

    res.json({ saved, total: jobs.length });
  } catch {
    res.status(500).json({ error: 'Failed to save jobs' });
  }
});

// List user's saved sources
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) { res.status(404).json({ error: 'Not found' }); return; }
    const profile = JSON.parse(user.profileData || '{}');
    res.json(profile.customSources || []);
  } catch {
    res.status(500).json({ error: 'Failed to fetch sources' });
  }
});

// Delete a source
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) { res.status(404).json({ error: 'Not found' }); return; }
    const profile = JSON.parse(user.profileData || '{}');
    profile.customSources = (profile.customSources || []).filter((s: CustomSource) => s.id !== req.params.id);
    await prisma.user.update({ where: { id: req.userId }, data: { profileData: JSON.stringify(profile) } });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete source' });
  }
});

// Re-sync a source (scrape + save)
router.post('/:id/sync', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) { res.status(404).json({ error: 'Not found' }); return; }
    const profile = JSON.parse(user.profileData || '{}');
    const source = (profile.customSources || []).find((s: CustomSource) => s.id === req.params.id);
    if (!source) { res.status(404).json({ error: 'Source not found' }); return; }

    const { jobs, name } = await scrapeUrl(source.url);

    // Re-use the save logic
    req.body = { jobs, sourceUrl: source.url, sourceName: source.name || name };

    // Pass to save handler inline
    let saved = 0;
    for (const j of jobs) {
      if (!j.title || !j.url) continue;
      try {
        let job = await prisma.job.findFirst({ where: { url: j.url } });
        if (!job) {
          job = await prisma.job.create({
            data: {
              portal: j.portal || source.name,
              title: j.title, company: j.company || source.name,
              location: j.location || 'Not specified', salary: j.salary || null,
              jobType: j.jobType || 'Full-time', description: j.description || '',
              url: j.url, postedAt: new Date(),
            },
          });
        }
        await prisma.savedJob.upsert({
          where: { userId_jobId: { userId: req.userId!, jobId: job.id } },
          create: { userId: req.userId!, jobId: job.id },
          update: {},
        });
        saved++;
      } catch { /* skip */ }
    }

    source.lastSync = new Date().toISOString();
    source.jobCount = saved;
    await prisma.user.update({ where: { id: req.userId }, data: { profileData: JSON.stringify(profile) } });

    res.json({ saved, total: jobs.length, source });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Sync failed';
    res.status(422).json({ error: msg });
  }
});

export default router;
