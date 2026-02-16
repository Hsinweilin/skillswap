import { Router, Response } from 'express';
import { prisma } from '../index';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const swaps = await prisma.swapRequest.findMany({
      where: { OR: [{ requesterId: req.userId }, { providerId: req.userId }] },
      include: { skill: true, requester: { select: { id: true, name: true } }, provider: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(swaps);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { skillId, providerId, hours, message } = req.body;
    const skill = await prisma.skill.findUnique({ where: { id: skillId } });
    if (!skill) { res.status(404).json({ error: 'Skill not found' }); return; }
    const creditAmount = hours * skill.creditRate;
    const requester = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!requester || requester.creditBalance < creditAmount) {
      res.status(400).json({ error: 'Insufficient credits' }); return;
    }
    await prisma.user.update({ where: { id: req.userId }, data: { creditBalance: { decrement: creditAmount } } });
    await prisma.creditTransaction.create({
      data: { amount: -creditAmount, type: 'escrow', description: 'Escrow for swap request', userId: req.userId! }
    });
    const swap = await prisma.swapRequest.create({
      data: { skillId, requesterId: req.userId!, providerId, hours, creditAmount, message, escrowHeld: true }
    });
    res.status(201).json(swap);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.patch('/:id/accept', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const swap = await prisma.swapRequest.findFirst({ where: { id, providerId: req.userId, status: 'pending' } });
    if (!swap) { res.status(404).json({ error: 'Swap not found' }); return; }
    const updated = await prisma.swapRequest.update({ where: { id }, data: { status: 'accepted' } });
    res.json(updated);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.patch('/:id/decline', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const swap = await prisma.swapRequest.findFirst({ where: { id, providerId: req.userId, status: 'pending' } });
    if (!swap) { res.status(404).json({ error: 'Swap not found' }); return; }
    await prisma.user.update({ where: { id: swap.requesterId }, data: { creditBalance: { increment: swap.creditAmount } } });
    await prisma.creditTransaction.create({
      data: { amount: swap.creditAmount, type: 'refund', description: 'Escrow refund - swap declined', userId: swap.requesterId }
    });
    const updated = await prisma.swapRequest.update({ where: { id }, data: { status: 'declined', escrowHeld: false } });
    res.json(updated);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.patch('/:id/complete', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const swap = await prisma.swapRequest.findFirst({ where: { id, status: 'accepted', OR: [{ requesterId: req.userId }, { providerId: req.userId }] } });
    if (!swap) { res.status(404).json({ error: 'Swap not found' }); return; }
    await prisma.user.update({ where: { id: swap.providerId }, data: { creditBalance: { increment: swap.creditAmount } } });
    await prisma.creditTransaction.create({
      data: { amount: swap.creditAmount, type: 'earned', description: 'Payment for completed swap', userId: swap.providerId, relatedSwapId: swap.id }
    });
    const updated = await prisma.swapRequest.update({ where: { id }, data: { status: 'completed', escrowHeld: false } });
    res.json(updated);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
