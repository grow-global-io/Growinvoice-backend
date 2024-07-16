import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateNotificationDto, NotificationDto } from '@shared/models';
import { plainToInstance } from 'class-transformer';
import { NotificationsGateway } from './notifications.gateway';
import { CursorPaginatedDto } from '@shared/dto/cursor-paginated.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private prismaService: PrismaService,
    private readonly gateway: NotificationsGateway,
  ) {}
  async create(createNotificationDto: CreateNotificationDto) {
    const notification = await this.prismaService.notification.create({
      data: {
        body: createNotificationDto.body,
        user_id: createNotificationDto.user_id,
        title: createNotificationDto.title,
      },
    });
    this.gateway.notifyUser(createNotificationDto.user_id, notification);
    return plainToInstance(NotificationDto, notification);
  }

  async findAll(
    user_id: string,
    take: string,
    cursor?: string,
  ): Promise<CursorPaginatedDto<NotificationDto>> {
    const notifications = await this.prismaService.notification.findMany({
      where: { user_id },
      take: parseInt(take) ?? 10,
      skip: cursor ? 1 : 0, // Skip the cursor item itself
      cursor: cursor ? { id: cursor } : undefined,
    });
    return {
      results: notifications.map((notification) =>
        plainToInstance(NotificationDto, notification),
      ),
      nextId:
        notifications?.length < parseInt(take)
          ? undefined
          : notifications[notifications.length - 1].id,
    };
  }

  async findOne(id: string) {
    const notification = await this.prismaService.notification.findUnique({
      where: { id },
    });
    return plainToInstance(NotificationDto, notification);
  }
}
