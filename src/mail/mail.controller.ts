import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MailService } from './mail.service';
import { SendMailDto } from './dto/send-mail.dto';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';

@ApiTags('mail')
@Controller('mail')
export class MailController {
  constructor(private mailService: MailService) {}

  @Post('send')
  @ApiSuccessResponse()
  async sendMail(@Body() sendMailDto: SendMailDto) {
    await this.mailService.sendMail(sendMailDto);
    return {
      message: 'Mail sent successfully',
    };
  }
}
