import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { decrypt } from '../lib/crypto';
import { fetchJSearch, fetchAdzuna, fetchRemotive, type FetchedJob } from '../lib/jobFetchers';
import { scrapeNaukri, scrapeInternshala, scrapeWellfound } from '../lib/portalScrapers';

const router = Router();
router.use(authMiddleware);

router.get('/saved', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const saved = await prisma.savedJob.findMany({
      where: { userId: req.userId },
      include: { job: true },
      orderBy: { savedAt: 'desc' },
    });

    res.json(saved.map(s => ({ ...s.job, isSaved: true })));
  } catch {
    res.status(500).json({ error: 'Failed to fetch saved jobs' });
  }
});

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      portal, location, jobType,
      salaryMin, salaryMax,
      datePosted, search,
      page = '1', limit = '12',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};

    if (portal) where.portal = portal;
    if (location) where.location = { contains: location };
    if (jobType) where.jobType = jobType;

    if (datePosted) {
      const now = new Date();
      if (datePosted === 'today') {
        const start = new Date(now.setHours(0, 0, 0, 0));
        where.postedAt = { gte: start };
      } else if (datePosted === 'week') {
        const start = new Date(now.setDate(now.getDate() - 7));
        where.postedAt = { gte: start };
      } else if (datePosted === 'month') {
        const start = new Date(now.setMonth(now.getMonth() - 1));
        where.postedAt = { gte: start };
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { company: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { postedAt: 'desc' },
      }),
      prisma.job.count({ where }),
    ]);

    const savedJobIds = new Set(
      (await prisma.savedJob.findMany({
        where: { userId: req.userId, jobId: { in: jobs.map(j => j.id) } },
        select: { jobId: true },
      })).map(s => s.jobId)
    );

    res.json({
      jobs: jobs.map(j => ({
        ...j,
        postedAt: j.postedAt.toISOString(),
        isSaved: savedJobIds.has(j.id),
      })),
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    const saved = await prisma.savedJob.findUnique({
      where: { userId_jobId: { userId: req.userId!, jobId: job.id } },
    });

    res.json({ ...job, postedAt: job.postedAt.toISOString(), isSaved: !!saved });
  } catch {
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

router.post('/refresh', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    const profileData = user?.profileData ? JSON.parse(user.profileData) : {};
    const preferredRoles: string[] = profileData.currentRole
      ? [profileData.currentRole]
      : ['software engineer'];
    const preferredLocations: string[] = profileData.preferredLocations?.length
      ? profileData.preferredLocations
      : ['India'];

    const query = preferredRoles[0];
    const location = preferredLocations[0];

    const credentials = await prisma.credential.findMany({
      where: { userId: req.userId, status: 'connected' },
    });

    const fetches: Promise<FetchedJob[]>[] = [];

    // Public API fetchers (run regardless of credentials)
    fetches.push(fetchJSearch(query, location));
    fetches.push(fetchAdzuna(query, location));
    fetches.push(fetchRemotive(query));

    // Credential-based portal scrapers
    for (const cred of credentials) {
      let password = '';
      try { password = decrypt(cred.encryptedPassword); } catch { continue; }

      if (cred.portal === 'Naukri') {
        fetches.push(scrapeNaukri(cred.username, password, query, location));
      } else if (cred.portal === 'Internshala') {
        fetches.push(scrapeInternshala(cred.username, password, query));
      } else if (cred.portal === 'Wellfound') {
        fetches.push(scrapeWellfound(cred.username, password, query));
      }
      // LinkedIn and Indeed → covered by JSearch API
    }

    const results = await Promise.allSettled(fetches);
    const allJobs: FetchedJob[] = results
      .filter((r): r is PromiseFulfilledResult<FetchedJob[]> => r.status === 'fulfilled')
      .flatMap(r => r.value);

    if (allJobs.length === 0) {
      const count = await prisma.job.count();
      res.json({ message: 'No new jobs fetched. Add API keys in .env to pull live data.', count });
      return;
    }

    // Deduplicate against existing URLs
    const existingUrls = new Set(
      (await prisma.job.findMany({ select: { url: true } })).map(j => j.url)
    );

    const newJobs = allJobs.filter(j => j.url && !existingUrls.has(j.url));

    if (newJobs.length > 0) {
      await prisma.job.createMany({
        data: newJobs.map(j => ({
          portal: j.portal,
          title: j.title,
          company: j.company,
          location: j.location,
          jobType: j.jobType,
          description: j.description,
          url: j.url,
          salary: j.salary || null,
          postedAt: j.postedAt,
          rawData: JSON.stringify({}),
        })),
      });
    }

    const total = await prisma.job.count();
    res.json({
      message: `Fetched ${allJobs.length} jobs, added ${newJobs.length} new listings`,
      count: total,
      added: newJobs.length,
    });
  } catch (err) {
    console.error('Refresh error:', err);
    res.status(500).json({ error: 'Refresh failed' });
  }
});

router.post('/save/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!job) { res.status(404).json({ error: 'Job not found' }); return; }

    await prisma.savedJob.upsert({
      where: { userId_jobId: { userId: req.userId!, jobId: req.params.id } },
      create: { userId: req.userId!, jobId: req.params.id },
      update: {},
    });

    res.json({ message: 'Job saved' });
  } catch {
    res.status(500).json({ error: 'Failed to save job' });
  }
});

router.delete('/save/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.savedJob.deleteMany({
      where: { userId: req.userId, jobId: req.params.id },
    });
    res.json({ message: 'Job unsaved' });
  } catch {
    res.status(500).json({ error: 'Failed to unsave job' });
  }
});

export default router;
