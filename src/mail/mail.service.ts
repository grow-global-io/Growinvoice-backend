import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import * as nodemailer from 'nodemailer';
import { SendMailDto } from './dto/send-mail.dto';

@Injectable()
export class MailService {
  // private transporter;

  constructor(private configService: ConfigService) {
    // this.transporter = nodemailer.createTransport({
    //   host: this.configService.get<string>('SMTP_HOST'),
    //   port: this.configService.get<number>('SMTP_PORT'),
    //   auth: {
    //     user: this.configService.get<string>('SMTP_USER'),
    //     pass: this.configService.get<string>('SMTP_PASS'),
    //   },
    // });
  }

  async sendEmail(email: string, token: string) {
    const url = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${token}`;
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': this.configService.get<string>('BREVO_API_KEY'),
      },
      body: JSON.stringify({
        sender: {
          name: 'Grow Global Strategies Pvt Ltd',
          email: 'operations@growglobal.io',
        },
        to: [
          {
            email: email,
            name: email,
          },
        ],
        subject: 'Password Reset',
        htmlContent: `Click <a href="${url}">here</a> to reset your password`,
      }),
    };
    const response = await fetch(
      'https://api.brevo.com/v3/smtp/email',
      options,
    );
    console.log(response);
    // await this.transporter.sendMail({
    //   to: email,
    //   subject: 'Password Reset',
    //   html: `Click <a href="${url}">here</a> to reset your password`,
    // });
  }

  async sendMail(sendMailDto: SendMailDto) {
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': this.configService.get<string>('BREVO_API_KEY'),
      },
      body: JSON.stringify({
        sender: {
          name: 'Grow Global Strategies Pvt Ltd',
          email: 'operations@growglobal.io',
        },
        to: [
          {
            email: sendMailDto?.email,
            name: sendMailDto?.email,
          },
        ],
        subject: sendMailDto.subject,
        htmlContent: sendMailDto.body,
      }),
    };

    const response = await fetch(
      'https://api.brevo.com/v3/smtp/email',
      options,
    );
    console.log(response);

    // await this.transporter.sendMail({
    //   to: sendMailDto.email,
    //   subject: sendMailDto.subject,
    //   html: sendMailDto.body,
    // });
  }
}
