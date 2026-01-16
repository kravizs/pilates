import { Server } from 'socket.io';
import { logger } from '@/utils/logger';

export function setupSocketIO(io: Server) {
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Join user-specific room for notifications
    socket.on('join', (userId: string) => {
      socket.join(`user_${userId}`);
      logger.info(`User ${userId} joined socket room`);
    });

    // Handle booking events
    socket.on('booking_created', (data) => {
      io.emit('booking_created', data);
    });

    socket.on('booking_cancelled', (data) => {
      io.emit('booking_cancelled', data);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

// Helper functions to emit events
export function emitBookingCreated(io: Server, data: any) {
  io.emit('booking_created', data);
}

export function emitBookingCancelled(io: Server, data: any) {
  io.emit('booking_cancelled', data);
}

export function emitWaitlistPromotion(io: Server, userId: string, data: any) {
  io.to(`user_${userId}`).emit('waitlist_promotion', data);
}