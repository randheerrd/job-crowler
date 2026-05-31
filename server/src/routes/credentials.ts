import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { encrypt, decrypt } from '../lib/crypto';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const credentials = await prisma.credential.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'asc' },
    });

    res.json(credentials.map(c => ({
      id: c.id,
      portal: c.portal,
      username: c.username,
      status: c.status,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    })));
  } catch {
    res.status(500).json({ error: 'Failed to fetch credentials' });
  }
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { portal, username, password } = req.body;
    if (!portal || !username || !password) {
      res.status(400).json({ error: 'Portal, username and password are required' });
      return;
    }

    const PORTALS = ['LinkedIn', 'Naukri', 'Indeed', 'Internshala', 'Wellfound'];
    if (!PORTALS.includes(portal)) {
      res.status(400).json({ error: 'Invalid portal' });
      return;
    }

    const existing = await prisma.credential.findFirst({
      where: { userId: req.userId, portal },
    });
    if (existing) {
      res.status(409).json({ error: `Credential for ${portal} already exists` });
      return;
    }

    const encryptedPassword = encrypt(password);
    const credential = await prisma.credential.create({
      data: {
        userId: req.userId!,
        portal,
        username,
        encryptedPassword,
        status: 'pending',
      },
    });

    res.status(201).json({
      id: credential.id,
      portal: credential.portal,
      username: credential.username,
      status: credential.status,
      createdAt: credential.createdAt,
      updatedAt: credential.updatedAt,
    });
  } catch {
    res.status(500).json({ error: 'Failed to create credential' });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    const existing = await prisma.credential.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!existing) {
      res.status(404).json({ error: 'Credential not found' });
      return;
    }

    const updateData: Record<string, string> = {};
    if (username) updateData.username = username;
    if (password) updateData.encryptedPassword = encrypt(password);
    updateData.status = 'pending';

    const credential = await prisma.credential.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({
      id: credential.id,
      portal: credential.portal,
      username: credential.username,
      status: credential.status,
      createdAt: credential.createdAt,
      updatedAt: credential.updatedAt,
    });
  } catch {
    res.status(500).json({ error: 'Failed to update credential' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await prisma.credential.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!existing) {
      res.status(404).json({ error: 'Credential not found' });
      return;
    }

    await prisma.credential.delete({ where: { id: req.params.id } });
    res.json({ message: 'Credential deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete credential' });
  }
});

router.post('/:id/test', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const credential = await prisma.credential.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!credential) {
      res.status(404).json({ error: 'Credential not found' });
      return;
    }

    // Simulate connection test with a delay
    await new Promise(r => setTimeout(r, 1500));
    const success = Math.random() > 0.2; // 80% success rate mock
    const status = success ? 'connected' : 'failed';

    await prisma.credential.update({
      where: { id: credential.id },
      data: { status },
    });

    res.json({ status, message: success ? 'Connection successful' : 'Connection failed' });
  } catch {
    res.status(500).json({ error: 'Test failed' });
  }
});

export default router;
