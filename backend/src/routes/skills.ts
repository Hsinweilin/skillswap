import { Router, Response } from 'express';
import { prisma } from '../index';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const skills = await prisma.skill.findMany({ where: { userId: req.userId } });
    res.json(skills);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, creditRate, yearsOfExp } = req.body;
    if (!name) { res.status(400).json({ error: 'Skill name required' }); return; }
    const rate = Math.min(10, Math.max(1, creditRate || 1));
    const skill = await prisma.skill.create({
      data: { name, description, creditRate: rate, yearsOfExp: yearsOfExp || 0, userId: req.userId! }
    });
    res.status(201).json(skill);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const skill = await prisma.skill.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!skill) { res.status(404).json({ error: 'Skill not found' }); return; }
    const { name, description, creditRate, yearsOfExp } = req.body;
    const updated = await prisma.skill.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }), ...(description !== undefined && { description }),
        ...(creditRate && { creditRate: Math.min(10, Math.max(1, creditRate)) }),
        ...(yearsOfExp !== undefined && { yearsOfExp })
      }
    });
    res.json(updated);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const skill = await prisma.skill.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!skill) { res.status(404).json({ error: 'Skill not found' }); return; }
    await prisma.skill.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
