import { Router, Response } from 'express';
import { prisma } from '../index';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/:userId', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { revieweeId: req.params.userId },
      include: { reviewer: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' }
    });
    const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    const badge = avg >= 4.5 ? 'Gold' : avg >= 3.5 ? 'Silver' : avg >= 2.5 ? 'Bronze' : 'New';
    res.json({ reviews, averageRating: Math.round(avg * 10) / 10, badge, totalReviews: reviews.length });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { revieweeId, rating, comment, swapRequestId } = req.body;
    if (!revieweeId || !rating || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Valid revieweeId and rating (1-5) required' }); return;
    }
    const review = await prisma.review.create({
      data: { reviewerId: req.userId!, revieweeId, rating, comment, swapRequestId }
    });
    // Update trust score
    const reviews = await prisma.review.findMany({ where: { revieweeId } });
    const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    const certCount = await prisma.certificate.count({ where: { userId: revieweeId, verified: true } });
    const trustScore = Math.min(100, certCount * 10 + avgRating * 10);
    await prisma.user.update({ where: { id: revieweeId }, data: { trustScore } });
    res.status(201).json(review);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
