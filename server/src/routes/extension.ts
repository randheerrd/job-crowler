import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// ── Shared: resolve userId from JWT Bearer or x-extension-token ──────────────
async function resolveUserId(req: Request): Promise<string | null> {
  // 1. JWT Bearer token
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.slice(7);
      if (token === 'dev-token' && process.env.NODE_ENV !== 'production') {
        const user = await prisma.user.findFirst();
        return user?.id ?? null;
      }
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string };
      return payload.userId;
    } catch { return null; }
  }

  // 2. Extension token header
  const extToken = req.headers['x-extension-token'] as string;
  if (extToken) {
    const users = await prisma.user.findMany({ select: { id: true, profileData: true } });
    for (const u of users) {
      const p = JSON.parse(u.profileData || '{}');
      if (p.extensionToken === extToken) return u.id;
    }
  }

  return null;
}

// ── Auth: login and return JWT (for extension login) ─────────────────────────
import bcrypt from 'bcryptjs';

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) { res.status(400).json({ error: 'Email and password required' }); return; }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) { res.status(401).json({ error: 'Invalid email or password' }); return; }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) { res.status(401).json({ error: 'Invalid email or password' }); return; }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
    const profile = JSON.parse(user.profileData || '{}');

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        skills: profile.skills || [],
        location: profile.location || '',
        jobTitle: profile.jobTitle || '',
        keywords: profile.extensionKeywords || [],
      },
    });
  } catch {
    res.status(500).json({ error: 'Login failed' });
  }
});

// ── Profile: get user's job-search preferences ───────────────────────────────
router.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const profile = JSON.parse(user.profileData || '{}');
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      skills: profile.skills || [],
      location: profile.location || '',
      jobTitle: profile.jobTitle || '',
      keywords: profile.extensionKeywords || profile.skills || [],
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ── Save extension keywords (user can customise search terms) ─────────────────
router.put('/keywords', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const { keywords } = req.body;
    if (!Array.isArray(keywords)) { res.status(400).json({ error: 'keywords must be an array' }); return; }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const profile = JSON.parse(user.profileData || '{}');
    profile.extensionKeywords = keywords;
    await prisma.user.update({ where: { id: userId }, data: { profileData: JSON.stringify(profile) } });

    res.json({ ok: true, keywords });
  } catch {
    res.status(500).json({ error: 'Failed to save keywords' });
  }
});

// ── Ingest: save a single job (JWT or extension token) ───────────────────────
router.post('/ingest', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const { title, company, location, salary, jobType, url, portal, description } = req.body;
    if (!title || !company || !url) {
      res.status(400).json({ error: 'title, company, and url are required' }); return;
    }

    let job = await prisma.job.findFirst({ where: { url } });
    if (!job) {
      job = await prisma.job.create({
        data: {
          portal: portal || 'Extension',
          title, company,
          location: location || 'Not specified',
          salary: salary || null,
          jobType: jobType || 'Full-time',
          description: description || '',
          url, postedAt: new Date(),
        },
      });
    }

    await prisma.savedJob.upsert({
      where: { userId_jobId: { userId, jobId: job.id } },
      create: { userId, jobId: job.id },
      update: {},
    });

    res.json({ success: true, jobId: job.id });
  } catch {
    res.status(500).json({ error: 'Failed to ingest job' });
  }
});

// ── Batch ingest: save many jobs at once (auto-sync) ─────────────────────────
router.post('/batch-ingest', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const { jobs, portal } = req.body;
    if (!Array.isArray(jobs)) { res.status(400).json({ error: 'jobs must be an array' }); return; }

    let saved = 0, skipped = 0;

    for (const j of jobs) {
      if (!j.title || !j.url) { skipped++; continue; }
      try {
        let job = await prisma.job.findFirst({ where: { url: j.url } });
        if (!job) {
          job = await prisma.job.create({
            data: {
              portal: j.portal || portal || 'Extension',
              title: j.title,
              company: j.company || 'Unknown',
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
          where: { userId_jobId: { userId, jobId: job.id } },
          create: { userId, jobId: job.id },
          update: {},
        });
        saved++;
      } catch { skipped++; }
    }

    res.json({ saved, skipped, total: jobs.length });
  } catch {
    res.status(500).json({ error: 'Batch ingest failed' });
  }
});

// ── Autofill profile: get all fields the extension needs ─────────────────────
router.get('/autofill-profile', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) { res.status(404).json({ error: 'Not found' }); return; }

    const p = JSON.parse(user.profileData || '{}');
    res.json({
      fullName:         user.name || '',
      firstName:        user.name?.split(' ')[0] || '',
      lastName:         user.name?.split(' ').slice(1).join(' ') || '',
      email:            user.email || '',
      phone:            p.phone || '',
      city:             p.city || '',
      country:          p.country || '',
      linkedinUrl:      p.linkedinUrl || '',
      portfolioUrl:     p.portfolioUrl || '',
      currentTitle:     p.currentTitle || '',
      currentCompany:   p.currentCompany || '',
      yearsExperience:  p.yearsExperience || '',
      summary:          p.summary || '',
      skills:           p.skills || [],
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch autofill profile' });
  }
});

// ── Autofill profile: save from app settings ──────────────────────────────────
router.put('/autofill-profile', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) { res.status(404).json({ error: 'Not found' }); return; }

    const p = JSON.parse(user.profileData || '{}');
    const fields = ['phone','city','country','linkedinUrl','portfolioUrl','currentTitle','currentCompany','yearsExperience','summary'];
    fields.forEach(f => { if (req.body[f] !== undefined) p[f] = req.body[f]; });

    await prisma.user.update({ where: { id: req.userId }, data: { profileData: JSON.stringify(p) } });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Failed to save autofill profile' });
  }
});

// ── Legacy token management (kept for backwards compat) ──────────────────────
router.get('/token', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) { res.status(404).json({ error: 'Not found' }); return; }
    const profile = JSON.parse(user.profileData || '{}');
    res.json({ token: profile.extensionToken || null });
  } catch { res.status(500).json({ error: 'Failed' }); }
});

export default router;
