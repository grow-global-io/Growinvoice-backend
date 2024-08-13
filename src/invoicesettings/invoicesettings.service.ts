import { MailService } from '@/mail/mail.service';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import {
  CreateInvoiceSettingsDto,
  InvoiceSettingsDto,
  UpdateInvoiceSettingsDto,
  User,
} from '@shared/models';
import { plainToInstance } from 'class-transformer';
import * as moment from 'moment';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class InvoicesettingsService {
  private readonly logger = new Logger(PrismaService.name);
  constructor(
    private prismaService: PrismaService,
    private mailService: MailService,
  ) {}

  async create(createInvoicesettingDto: CreateInvoiceSettingsDto) {
    const setting = await this.prismaService.invoiceSettings.create({
      data: createInvoicesettingDto,
    });
    return plainToInstance(InvoiceSettingsDto, setting);
  }

  async findAll(user_id: string) {
    const settings = await this.prismaService.invoiceSettings.findMany({
      where: {
        user_id,
      },
    });
    return plainToInstance(InvoiceSettingsDto, settings);
  }

  async findFirst(user_id: string) {
    const setting = await this.prismaService.invoiceSettings.findFirst({
      where: {
        user_id,
      },
    });
    return plainToInstance(InvoiceSettingsDto, setting);
  }

  async findOne(id: string) {
    const setting = await this.prismaService.invoiceSettings.findUnique({
      where: {
        id,
      },
    });
    return plainToInstance(InvoiceSettingsDto, setting);
  }

  async update(id: string, updateInvoicesettingDto: UpdateInvoiceSettingsDto) {
    const setting = await this.prismaService.invoiceSettings.update({
      where: {
        id,
      },
      data: updateInvoicesettingDto,
    });
    return plainToInstance(InvoiceSettingsDto, setting);
  }

  async remove(id: string) {
    return this.prismaService.invoiceSettings.delete({
      where: {
        id,
      },
    });
  }

  @Cron('* * 0 * * *')
  async findAllByUserToStatusUpdate() {
    try {
      const overdueDate = moment().subtract(30, 'days').toDate();
      console.log(overdueDate, 'overdute');
      const users = await this.prismaService.user.findMany({
        where: {
          InvoiceSettings: {
            some: {
              autoArchive: true,
            },
          },
        },
        include: {
          invoice: {
            where: {
              paid_status: 'Unpaid',
              due_date: {
                lt: overdueDate,
              },
            },
          },
        },
      });
      for (const user of users) {
        await this.prismaService.invoice.updateMany({
          where: {
            user_id: user.id,
            paid_status: 'Unpaid',
            due_date: {
              lt: overdueDate,
            },
          },
          data: {
            status: 'Rejected',
          },
        });
      }
      this.logger.log(
        'findAllByUserToStatusUpdate method executed successfully.',
      );
    } catch (error) {
      this.logger.error(
        'Error executing findAllByUserToStatusUpdate method:',
        error,
      );
    }
    // return plainToInstance(User, users);
  }

  @Cron('* * 0 * * *')
  async findAllByUserToMail() {
    try {
      const currentDate = moment().startOf('day');
      const users = await this.prismaService.user.findMany({
        where: {
          InvoiceSettings: {
            some: {},
          },
        },
        include: {
          invoice: {
            where: {
              paid_status: 'Unpaid',
            },
          },
          InvoiceSettings: true,
        },
      });

      for (const user of users) {
        const invoiceSettings = user.InvoiceSettings[0];
        for (const invoice of user.invoice) {
          const dueDate = moment(invoice.due_date);
          const noticeDate = dueDate.subtract(
            invoiceSettings.dueNotice,
            'days',
          );
          if (currentDate.isSame(noticeDate, 'day')) {
            const sendMailDto = {
              email: user.email,
              subject: 'Invoice Due Date Notice',
              body: `Dear ${user.name},<br><br>Your invoice with due date ${moment(invoice.due_date).format('YYYY-MM-DD')} is approaching its due date. Please take the necessary actions.<br><br>Best Regards,<br>Grow Global Strategies Pvt Ltd`,
            };
            await this.mailService.sendMail(sendMailDto);
          }
        }
      }
      this.logger.log('findAllByUserToMail method executed successfully.');
    } catch (error) {
      this.logger.error('Error executing findAllByUserToMail method:', error);
    }
    // return plainToInstance(User, users);
  }
}
