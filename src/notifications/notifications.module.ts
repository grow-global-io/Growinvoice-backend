import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { PrismaService } from '@/prisma/prisma.service';
import { NotificationsController } from './notifications.controller';

@Module({
  providers: [NotificationsGateway, NotificationsService, PrismaService],
  exports: [NotificationsService],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
