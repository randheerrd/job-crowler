import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

const VALID_STATUSES = ['Saved', 'Applied', 'Interview Scheduled', 'Offer Received', 'Rejected', 'Withdrawn'];

function formatApplication(app: {
  id: string; userId: string; jobId: string | null; manualJob: string | null;
  status: string; dateApplied: Date; notes: string | null; createdAt: Date; updatedAt: Date;
  job?: {
    id: string; portal: string; title: string; company: string; salary: string | null;
    location: string; jobType: string; description: string; url: string;
    postedAt: Date; rawData: string | null; createdAt: Date;
  } | null;
}) {
  return {
    id: app.id,
    userId: app.userId,
    jobId: app.jobId,
    job: app.job ? { ...app.job, postedAt: app.job.postedAt.toISOString() } : null,
    manualJob: app.manualJob ? JSON.parse(app.manualJob) : null,
    status: app.status,
    dateApplied: app.dateApplied.toISOString(),
    notes: app.notes,
    createdAt: app.createdAt.toISOString(),
    updatedAt: app.updatedAt.toISOString(),
  };
}

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query as { status?: string };
    const where: Record<string, unknown> = { userId: req.userId };
    if (status) where.status = status;

    const apps = await prisma.application.findMany({
      where,
      include: { job: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(apps.map(formatApplication));
  } catch {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { jobId, manualJob, status = 'Applied', dateApplied, notes } = req.body;

    if (!jobId && !manualJob) {
      res.status(400).json({ error: 'Either jobId or manualJob is required' });
      return;
    }

    if (status && !VALID_STATUSES.includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    if (jobId) {
      const job = await prisma.job.findUnique({ where: { id: jobId } });
      if (!job) { res.status(404).json({ error: 'Job not found' }); return; }

      const existing = await prisma.application.findFirst({
        where: { userId: req.userId, jobId },
      });
      if (existing) {
        res.status(409).json({ error: 'Already tracking this job' });
        return;
      }
    }

    const app = await prisma.application.create({
      data: {
        userId: req.userId!,
        jobId: jobId || null,
        manualJob: manualJob ? JSON.stringify(manualJob) : null,
        status,
        dateApplied: dateApplied ? new Date(dateApplied) : new Date(),
        notes: notes || null,
      },
      include: { job: true },
    });

    res.status(201).json(formatApplication(app));
  } catch {
    res.status(500).json({ error: 'Failed to create application' });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, notes, dateApplied } = req.body;

    const existing = await prisma.application.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!existing) { res.status(404).json({ error: 'Application not found' }); return; }

    if (status && !VALID_STATUSES.includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (dateApplied !== undefined) updateData.dateApplied = new Date(dateApplied);

    const app = await prisma.application.update({
      where: { id: req.params.id },
      data: updateData,
      include: { job: true },
    });

    res.json(formatApplication(app));
  } catch {
    res.status(500).json({ error: 'Failed to update application' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await prisma.application.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!existing) { res.status(404).json({ error: 'Application not found' }); return; }

    await prisma.application.delete({ where: { id: req.params.id } });
    res.json({ message: 'Application deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

export default router;
