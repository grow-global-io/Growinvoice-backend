import { Body, Controller, Post } from '@nestjs/common';
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
}
