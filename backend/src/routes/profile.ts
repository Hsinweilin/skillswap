import { Router, Response } from 'express';
import { prisma } from '../index';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { skills: true, certificates: true, receivedReviews: true }
    });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    const { password, ...safe } = user;
    res.json(safe);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.put('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, bio, avatar } = req.body;
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { ...(name && { name }), ...(bio !== undefined && { bio }), ...(avatar && { avatar }) }
    });
    const { password, ...safe } = user;
    res.json(safe);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id as string },
      include: { skills: true, certificates: true, receivedReviews: true }
    });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    const { password, ...safe } = user;
    res.json(safe);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
