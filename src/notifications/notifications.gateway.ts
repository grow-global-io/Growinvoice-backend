import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { OnModuleInit } from '@nestjs/common';
import { Server } from 'socket.io';
import { NotificationDto } from '@shared/models';

@WebSocketGateway({
  cors: {
    origin: '*', // Allow all origins for development. Use a specific origin in production.
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization'],
    credentials: true,
  },
})
export class NotificationsGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log('Client connected', socket.id);

      socket.on('authenticate', (userId: string) => {
        if (userId) {
          socket.join(userId);
          socket.data.userId = userId;
          console.log(`User ${userId} authenticated`);
        }
      });

      socket.on('disconnect', () => {
        console.log(`User ${socket.data.userId} disconnected`);
      });
    });
  }

  notifyUser(userId: string, notification: NotificationDto) {
    this.server.to(userId).emit('newMessage', notification);
  }
}
