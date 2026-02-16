import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function setupSocketHandlers(io: Server) {
  const userSockets = new Map<string, string>();

  io.on('connection', (socket) => {
    socket.on('register', (userId: string) => {
      userSockets.set(userId, socket.id);
    });

    socket.on('sendMessage', async (data: { senderId: string; receiverId: string; content: string }) => {
      try {
        const message = await prisma.message.create({
          data: { content: data.content, senderId: data.senderId, receiverId: data.receiverId }
        });
        const receiverSocket = userSockets.get(data.receiverId);
        if (receiverSocket) {
          io.to(receiverSocket).emit('newMessage', message);
        }
        socket.emit('messageSent', message);
      } catch (e) {
        socket.emit('error', 'Failed to send message');
      }
    });

    socket.on('disconnect', () => {
      for (const [userId, sid] of userSockets.entries()) {
        if (sid === socket.id) { userSockets.delete(userId); break; }
      }
    });
  });
}
