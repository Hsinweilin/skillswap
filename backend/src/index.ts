import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import skillRoutes from './routes/skills';
import certificateRoutes from './routes/certificates';
import discoveryRoutes from './routes/discovery';
import swapRoutes from './routes/swaps';
import creditRoutes from './routes/credits';
import messageRoutes from './routes/messages';
import reviewRoutes from './routes/reviews';
import { setupSocketHandlers } from './utils/socket';

export const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/discovery', discoveryRoutes);
app.use('/api/swaps', swapRoutes);
app.use('/api/credits', creditRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

setupSocketHandlers(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
