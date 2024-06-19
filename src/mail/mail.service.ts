import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SendMailDto } from './dto/send-mail.dto';

@Injectable()
export class MailService {
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendEmail(email: string, token: string) {
    const url = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${token}`;
    await this.transporter.sendMail({
      to: email,
      subject: 'Password Reset',
      html: `Click <a href="${url}">here</a> to reset your password`,
    });
  }

  async sendMail(sendMailDto: SendMailDto) {
    await this.transporter.sendMail({
      to: sendMailDto.email,
      subject: sendMailDto.subject,
      html: sendMailDto.body,
    });
  }
}
