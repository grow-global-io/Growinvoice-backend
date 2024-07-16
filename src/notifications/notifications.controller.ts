import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiExtraModels, ApiQuery, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { GetUser, User } from '@shared/decorators/user.decorator';
import { CreateNotificationDto, NotificationDto } from '@shared/models';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { SuccessResponseDto } from '@shared/dto/success-response.dto';
import { ApiCursorPaginatedResponse } from '@shared/decorators/api-cursor-paginated-response.decorator';
import { CursorPaginatedDto } from '@shared/dto/cursor-paginated.dto';

@ApiExtraModels(NotificationDto)
@ApiExtraModels(CursorPaginatedDto)
@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Post()
  @ApiSuccessResponse(NotificationDto)
  async create(
    @Body() body: CreateNotificationDto,
  ): Promise<SuccessResponseDto<NotificationDto>> {
    const notification = await this.notificationsService.create(body);
    return {
      result: notification,
      message: 'Notification created successfully',
    };
  }

  @Get('all')
  @ApiCursorPaginatedResponse(NotificationDto)
  @ApiQuery({ name: 'take', required: true })
  @ApiQuery({ name: 'skip', required: false })
  async findAll(
    @GetUser() user: User,
    @Query('take') take: string,
    @Query('skip') skip: string,
  ) {
    return await this.notificationsService.findAll(user?.sub, take, skip);
  }
}
