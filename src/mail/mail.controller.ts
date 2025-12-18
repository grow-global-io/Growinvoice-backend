import { Body, Controller, Post, ForbiddenException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MailService } from './mail.service';
import { SendMailDto } from './dto/send-mail.dto';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { GetUser, User } from '@shared/decorators/user.decorator';

@ApiTags('mail')
@Controller('mail')
export class MailController {
  constructor(private mailService: MailService) {}

  @Post('send')
  @ApiSuccessResponse()
  async sendMail(@Body() sendMailDto: SendMailDto, @GetUser() user: User) {
    await this.mailService.sendMail(sendMailDto, user?.sub);
    return {
      message: 'Mail sent successfully',
    };
  }

  @Post('promotional')
  @ApiSuccessResponse()
  async sendPromotionalMail(
    @Body()
    dto: import('./dto/send-promotional-mail.dto').SendPromotionalMailDto,
    @GetUser() user: User,
  ) {
    if (user.email !== 'admin@growinvoice.com') {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }
    const result = await this.mailService.sendPromotionalMail(
      dto.subject,
      dto.html,
      dto.customerIds,
      dto.sendToAllCustomers,
      dto.isTest,
      user?.sub,
      dto.attachments,
    );
    return {
      message: 'Promotional process initiated',
      details: result,
    };
  }
}
