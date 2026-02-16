import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../index';
import { generateToken } from '../middleware/auth';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) { res.status(400).json({ error: 'Missing fields' }); return; }
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) { res.status(400).json({ error: 'Email already registered' }); return; }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, password: hashed, name } });
    await prisma.creditTransaction.create({
      data: { amount: 5, type: 'bonus', description: 'Welcome bonus - 5 starter credits', userId: user.id }
    });
    const token = generateToken(user.id);
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, creditBalance: user.creditBalance } });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: 'Invalid credentials' }); return;
    }
    const token = generateToken(user.id);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, creditBalance: user.creditBalance } });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
