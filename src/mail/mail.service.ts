import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

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
    const url = `http://localhost:3000/auth/reset-password?token=${token}`;
    await this.transporter.sendMail({
      to: email,
      subject: 'Password Reset',
      html: `Click <a href="${url}">here</a> to reset your password`,
    });
  }
}
