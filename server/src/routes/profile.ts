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

export default router;
