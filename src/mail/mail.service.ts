import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SendMailDto } from './dto/send-mail.dto';
import { PrismaService } from '@/prisma/prisma.service';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import axios from 'axios';
import * as moment from 'moment-timezone';

@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter<
    SMTPTransport.SentMessageInfo,
    SMTPTransport.Options
  >;

  private readonly url: string = 'https://api.zeptomail.eu/v1.1/email/template';
  private readonly zeptoMailApiKey: string;
  private readonly zeptoMailSender: string = 'no-reply@growinvoice.com';

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
    this.zeptoMailApiKey = this.configService.get<string>('ZEPTO_MAIL_API_KEY');
  }

  async sendEmail(email: string, token: string) {
    const url = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${token}`;
    const cutHttps = url.replace('https://', '');
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    const mail = await axios.post(
      this.url,
      {
        template_key:
          '13ef.32ea17bec9bd91a9.k1.9ec0ff80-50b0-11f0-a3d5-66e0c45c7bae.197a01dc778',
        from: {
          address: this.zeptoMailSender,
          name: 'Growinvoice',
        },
        to: [
          {
            email_address: {
              address: email,
              name: `${user?.name}`,
            },
          },
        ],
        merge_info: {
          'product name': `GrowInvoice`,
          product_name: 'GrowInvoice',
          link: cutHttps,
          data_time: moment().add(10, 'minutes').format('DD/MM/YYYY HH:mm'),
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.zeptoMailApiKey,
          Accept: 'application/json',
        },
      },
    );

    return mail.data;
  }

  async sendMail(
    sendMailDto: SendMailDto,
    userId?: string,
    companyName?: string,
  ) {
    let companyNameString = '';
    if (userId) {
      const userDetails = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          company: true,
        },
      });
      companyNameString = userDetails.company[0].name ?? '';
    }
    if (companyName) {
      companyNameString = companyName;
    }

    await this.transporter.sendMail({
      to: sendMailDto.email,
      subject: sendMailDto.subject,
      html: sendMailDto.body,
      sender: {
        name: companyNameString ?? 'Grow Global Strategies Pvt Ltd',
        address: 'no-reply@growinvoice.com',
      },
    });
  }

  async sendWelcomeMail(email: string, name: string) {
    try {
      const mail = await axios.post(
        this.url,
        {
          template_key:
            '13ef.32ea17bec9bd91a9.k1.911711c0-50bb-11f0-a3d5-66e0c45c7bae.197a06584dc',
          from: {
            address: this.zeptoMailSender,
            name: 'Growinvoice',
          },
          to: [
            {
              email_address: {
                address: email,
                name: `${name}`,
              },
            },
          ],
          merge_info: {
            name: `${name}`,
            product_name: 'GrowInvoice',
            login_url_text: `Click Here`,
            login_url_link: `${this.configService.get<string>('FRONTEND_URL')}/login`,
            email: email,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: this.zeptoMailApiKey,
            Accept: 'application/json',
          },
        },
      );

      return mail.data;
    } catch (error) {
      console.error('Error sending welcome mail:', error?.error?.response);
      throw new Error('Failed to send welcome mail');
    }
  }
}
