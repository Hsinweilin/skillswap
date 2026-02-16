import { Router, Response } from 'express';
import { prisma } from '../index';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/conversations', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const messages = await prisma.message.findMany({
      where: { OR: [{ senderId: req.userId }, { receiverId: req.userId }] },
      include: { sender: { select: { id: true, name: true, avatar: true } }, receiver: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' }
    });
    // Group by conversation partner
    const convos = new Map<string, any>();
    messages.forEach(m => {
      const partnerId = m.senderId === req.userId ? m.receiverId : m.senderId;
      if (!convos.has(partnerId)) {
        const partner = m.senderId === req.userId ? m.receiver : m.sender;
        convos.set(partnerId, { partner, lastMessage: m, unreadCount: 0 });
      }
      if (m.receiverId === req.userId && !m.read) {
        const c = convos.get(partnerId)!;
        c.unreadCount++;
      }
    });
    res.json(Array.from(convos.values()));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get('/:userId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.userId, receiverId: req.params.userId },
          { senderId: req.params.userId, receiverId: req.userId }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });
    // Mark as read
    await prisma.message.updateMany({
      where: { senderId: req.params.userId, receiverId: req.userId, read: false },
      data: { read: true }
    });
    res.json(messages);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/:userId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const message = await prisma.message.create({
      data: { content: req.body.content, senderId: req.userId!, receiverId: req.params.userId }
    });
    res.status(201).json(message);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
