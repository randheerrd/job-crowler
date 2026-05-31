import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      profileData: user.profileData ? JSON.parse(user.profileData) : null,
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.put('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, profileData } = req.body;
    const updateData: Record<string, string> = {};

    if (name) updateData.name = name;
    if (profileData !== undefined) updateData.profileData = JSON.stringify(profileData);

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: updateData,
    });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      profileData: user.profileData ? JSON.parse(user.profileData) : null,
    });
  } catch {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Cover letters stored inside profileData.coverLetters[]
router.get('/cover-letters', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    const pd = user?.profileData ? JSON.parse(user.profileData) : {};
    res.json(pd.coverLetters || []);
  } catch { res.status(500).json({ error: 'Failed to fetch cover letters' }); }
});

router.post('/cover-letters', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, content } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    const pd = user?.profileData ? JSON.parse(user.profileData) : {};
    const letters = pd.coverLetters || [];
    const now = new Date().toISOString();
    const entry = { id: Date.now().toString(), title, content, createdAt: now, updatedAt: now };
    letters.unshift(entry);
    await prisma.user.update({ where: { id: req.userId }, data: { profileData: JSON.stringify({ ...pd, coverLetters: letters }) } });
    res.status(201).json(entry);
  } catch { res.status(500).json({ error: 'Failed to save cover letter' }); }
});

router.put('/cover-letters/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, content } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    const pd = user?.profileData ? JSON.parse(user.profileData) : {};
    const letters = pd.coverLetters || [];
    const idx = letters.findIndex((l: { id: string }) => l.id === req.params.id);
    if (idx === -1) { res.status(404).json({ error: 'Not found' }); return; }
    letters[idx] = { ...letters[idx], title, content, updatedAt: new Date().toISOString() };
    await prisma.user.update({ where: { id: req.userId }, data: { profileData: JSON.stringify({ ...pd, coverLetters: letters }) } });
    res.json(letters[idx]);
  } catch { res.status(500).json({ error: 'Failed to update cover letter' }); }
});

router.delete('/cover-letters/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    const pd = user?.profileData ? JSON.parse(user.profileData) : {};
    const letters = (pd.coverLetters || []).filter((l: { id: string }) => l.id !== req.params.id);
    await prisma.user.update({ where: { id: req.userId }, data: { profileData: JSON.stringify({ ...pd, coverLetters: letters }) } });
    res.json({ ok: true });
  } catch { res.status(500).json({ error: 'Failed to delete cover letter' }); }
});

// LinkedIn profile data stored inside profileData.linkedinData
router.put('/linkedin', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { linkedinData } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    const pd = user?.profileData ? JSON.parse(user.profileData) : {};
    await prisma.user.update({ where: { id: req.userId }, data: { profileData: JSON.stringify({ ...pd, linkedinData }) } });
    res.json({ ok: true });
  } catch { res.status(500).json({ error: 'Failed to save LinkedIn profile' }); }
});

export default router;
