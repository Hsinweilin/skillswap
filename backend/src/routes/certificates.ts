import { Router, Response } from 'express';
import multer from 'multer';
import { prisma } from '../index';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const upload = multer({ dest: 'uploads/certificates/' });
const router = Router();

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const certs = await prisma.certificate.findMany({ where: { userId: req.userId } });
    res.json(certs);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/', authMiddleware, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, issuer } = req.body;
    if (!title || !req.file) { res.status(400).json({ error: 'Title and file required' }); return; }
    const cert = await prisma.certificate.create({
      data: { title, issuer, filePath: req.file.path, userId: req.userId! }
    });
    // Recalculate trust score
    const certCount = await prisma.certificate.count({ where: { userId: req.userId, verified: true } });
    const reviews = await prisma.review.findMany({ where: { revieweeId: req.userId } });
    const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    const trustScore = Math.min(100, certCount * 10 + avgRating * 10);
    await prisma.user.update({ where: { id: req.userId }, data: { trustScore } });
    res.status(201).json(cert);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.patch('/:id/verify', async (req, res) => {
  try {
    const cert = await prisma.certificate.update({
      where: { id: req.params.id },
      data: { verified: true }
    });
    // Recalculate trust score
    const certCount = await prisma.certificate.count({ where: { userId: cert.userId, verified: true } });
    const reviews = await prisma.review.findMany({ where: { revieweeId: cert.userId } });
    const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    const trustScore = Math.min(100, certCount * 10 + avgRating * 10);
    await prisma.user.update({ where: { id: cert.userId }, data: { trustScore } });
    res.json(cert);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
