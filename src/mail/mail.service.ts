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

  async bulkSendMail({
    body,
    userId,
    companyName,
  }: {
    body: {
      to: string;
      subject: string;
      html: string;
      userId?: string;
      companyName?: string;
      attachments?: Array<{
        filename: string;
        content: Buffer;
        contentType?: string;
      }>;
    }[];
    userId?: string;
    companyName?: string;
  }) {
    const bulkTransporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
      pool: true, // Enable connection pooling
      maxMessages: Infinity, // Keep connections in the pool
      maxConnections: 5, // Adjust as needed
    });
    if (companyName) {
      companyName = companyName;
    }
    if (userId) {
      const userDetails = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          company: true,
        },
      });
      if (
        userDetails &&
        userDetails.company &&
        userDetails.company.length > 0
      ) {
        companyName = userDetails.company[0].name;
      }
    }
    const emailPromises = body.map(async (mail) => {
      const companyNameString = companyName;

      const mailOptions: any = {
        to: mail.to,
        subject: mail.subject,
        html: mail.html,
        sender: {
          name: companyNameString ?? 'Grow Global Strategies Pvt Ltd',
          address: 'no-reply@growinvoice.com',
        },
      };

      // Add attachments if provided
      if (mail.attachments && mail.attachments.length > 0) {
        mailOptions.attachments = mail.attachments.map((att) => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType || 'application/pdf',
          cid: (att as any).cid,
        }));
        console.log(
          `Sending bulk email with ${mail.attachments.length} attachment(s) to ${mail.to}`,
        );
      }

      return bulkTransporter.sendMail(mailOptions);
    });
    try {
      await Promise.all(emailPromises);
      console.log(`Successfully sent ${body.length} bulk email(s)`);
    } catch (error) {
      console.error('Error sending bulk emails:', error);
    } finally {
      bulkTransporter.close();
    }
  }

  async sendMail(
    sendMailDto: SendMailDto,
    userId?: string,
    companyName?: string,
    attachments?: Array<{
      filename: string;
      content: Buffer;
      contentType?: string;
    }>,
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

    try {
      const mailOptions: any = {
        to: sendMailDto.email,
        subject: sendMailDto.subject,
        html: sendMailDto.body,
        sender: {
          name: companyNameString ?? 'Grow Global Strategies Pvt Ltd',
          address: 'no-reply@growinvoice.com',
        },
      };

      // Add attachments if provided
      if (attachments && attachments.length > 0) {
        mailOptions.attachments = attachments.map((att) => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType || 'application/pdf',
          cid: (att as any).cid,
        }));
        console.log(
          `Sending email with ${attachments.length} attachment(s) to ${sendMailDto.email}`,
        );
      }

      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${sendMailDto.email}`);
    } catch (error: any) {
      // Log SMTP errors but don't throw - let the caller handle it
      console.error('SMTP email sending failed:', {
        error: error?.message,
        code: error?.code,
        response: error?.response,
        email: sendMailDto.email,
      });
      // Re-throw so caller can handle (they should catch it)
      throw error;
    }
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
      // Log error but don't throw - this is a non-critical operation
      console.error('Error sending welcome mail (non-blocking):', {
        error: error?.message,
        response: error?.error?.response,
        email: email,
      });
      // Return null instead of throwing - caller should handle gracefully
      return null;
    }
  }

  async sendPromotionalMail(
    subject: string,
    html: string,
    customerIds: string[] = [],
    sendToAllCustomers = false,
    isTest = false,
    userId?: string,
    attachments: {
      filename: string;
      content: string;
      contentType: string;
      cid?: string;
    }[] = [],
  ) {
    let recipients: { email: string; name?: string }[] = [];

    console.log('Promotional Email Request:', {
      subject,
      customerIds,
      sendToAllCustomers,
      isTest,
      userId,
    });

    if (isTest) {
      console.log('Test mode requested (note: hardcoded list removed).');
    }

    if (sendToAllCustomers) {
      // For Admin, 'All Customers' often means all Users (Merchants) of the platform
      const customers = await this.prismaService.customer.findMany({
        where: { email: { not: null } },
        select: { email: true, name: true },
      });
      const users = await this.prismaService.user.findMany({
        where: {
          isActive: true, // Only send to active users
        },
        select: { email: true, name: true },
      });

      const uniqueRecipients = new Map<string, string | null>();
      customers.forEach((c) => uniqueRecipients.set(c.email!, c.name));
      users.forEach((u) => uniqueRecipients.set(u.email!, u.name));

      recipients = Array.from(uniqueRecipients.entries()).map(
        ([email, name]) => ({ email, name: name ?? undefined }),
      );
    } else if (customerIds.length > 0) {
      // Check Customers
      const customers = await this.prismaService.customer.findMany({
        where: {
          id: { in: customerIds },
          email: { not: null },
        },
        select: { email: true, name: true },
      });

      // Check Users (Admin might be selecting Merchants)
      const users = await this.prismaService.user.findMany({
        where: {
          id: { in: customerIds },
        },
        select: { email: true, name: true },
      });

      const uniqueRecipients = new Map<string, string | null>();
      customers.forEach((c) => uniqueRecipients.set(c.email!, c.name));
      users.forEach((u) => uniqueRecipients.set(u.email!, u.name));

      recipients = Array.from(uniqueRecipients.entries()).map(
        ([email, name]) => ({ email, name: name ?? undefined }),
      );
    } else if (userId && !isTest) {
      const customers = await this.prismaService.customer.findMany({
        where: {
          user_id: userId,
          email: { not: null },
        },
        select: { email: true, name: true },
      });
      recipients = customers.map((c) => ({
        email: c.email!,
        name: c.name,
      }));
    }

    if (recipients.length === 0) {
      console.log('No recipients found for promotional email. Check:', {
        customerIdsCount: customerIds?.length,
        sendToAllCustomers,
        isTest,
        userId,
      });
      return { count: 0 };
    }

    console.log(`Found ${recipients.length} recipients for promotional email.`);

    const processedAttachments = attachments.map((att) => {
      const attachment: any = {
        filename: att.filename,
        content: Buffer.from(att.content, 'base64'),
        contentType: att.contentType,
      };
      if (att.cid) {
        attachment.cid = att.cid; // For inline embedding
      }
      return attachment;
    });

    const emailBody = recipients.map((r) => ({
      to: r.email,
      subject: subject,
      html: html,
      userId: userId,
      attachments: processedAttachments,
    }));

    // Use existing bulkSendMail
    await this.bulkSendMail({ body: emailBody, userId });

    return { count: recipients.length };
  }
}
