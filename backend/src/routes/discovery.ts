import { Router } from 'express';
import { prisma } from '../index';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { skill, minRate, maxRate, verified } = req.query;
    const users = await prisma.user.findMany({
      where: {
        ...(verified === 'true' && { trustScore: { gt: 0 } }),
        skills: {
          some: {
            ...(skill && { name: { contains: skill as string } }),
            ...(minRate && { creditRate: { gte: parseFloat(minRate as string) } }),
            ...(maxRate && { creditRate: { lte: parseFloat(maxRate as string) } }),
          }
        }
      },
      include: { skills: true, certificates: { where: { verified: true } } },
      orderBy: { trustScore: 'desc' }
    });
    res.json(users.map(({ password, ...u }) => u));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
