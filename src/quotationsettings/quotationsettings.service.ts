import { MailService } from '@/mail/mail.service';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import {
  CreateQuotationSettingsDto,
  QuotationSettingsDto,
  UpdateQuotationSettingsDto,
  User,
} from '@shared/models';
import { plainToInstance } from 'class-transformer';
import * as moment from 'moment';
import { Cron } from '@nestjs/schedule';
import { QuotationService } from '@/quotation/quotation.service';

@Injectable()
export class QuotationsettingsService {
  private readonly logger = new Logger(PrismaService.name);
  constructor(
    private prismaService: PrismaService,
    private mailService: MailService,
  ) {}
  async create(createQuotationsettingDto: CreateQuotationSettingsDto) {
    const quotationsetting = await this.prismaService.quotationSettings.create({
      data: createQuotationsettingDto,
    });
    return plainToInstance(QuotationSettingsDto, quotationsetting);
  }

  async findAll(user_id: string) {
    const quotationsettings =
      await this.prismaService.quotationSettings.findMany({
        where: { user_id },
      });
    return plainToInstance(QuotationSettingsDto, quotationsettings);
  }

  async findOne(id: string) {
    const quotationsetting =
      await this.prismaService.quotationSettings.findUnique({
        where: { id },
      });
    return plainToInstance(QuotationSettingsDto, quotationsetting);
  }

  async update(
    id: string,
    updateQuotationsettingDto: UpdateQuotationSettingsDto,
  ) {
    const quotationsetting = await this.prismaService.quotationSettings.update({
      where: { id },
      data: updateQuotationsettingDto,
    });
    return plainToInstance(QuotationSettingsDto, quotationsetting);
  }

  async remove(id: string) {
    await this.prismaService.quotationSettings.delete({ where: { id } });
    return {
      message: 'Quotation setting deleted successfully',
    };
  }

  async findFirst(user_id: string) {
    const quotationsetting =
      await this.prismaService.quotationSettings.findFirst({
        where: { user_id },
      });
    return plainToInstance(QuotationSettingsDto, quotationsetting);
  }

  @Cron('* * 0 * * *')
  async findAllByUserToStatusUpdate() {
    try {
      const overdueDate = moment().subtract(30, 'days').toDate();
      const users = await this.prismaService.user.findMany({
        where: {
          QuotationSettings: {
            some: {
              autoArchive: true,
            },
          },
        },
        include: {
          quotation: {
            where: {
              status: 'Draft',
              expiry_at: {
                lt: overdueDate,
              },
            },
          },
        },
      });
      for (const user of users) {
        await this.prismaService.quotation.updateMany({
          where: {
            user_id: user.id,
            status: 'Draft',
            expiry_at: {
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
      return plainToInstance(User, users);
    } catch (error) {
      this.logger.error(
        'Error executing findAllByUserToStatusUpdate method:',
        error,
      );
    }
  }

  @Cron('* * 0 * * *')
  async findAllByUserToMail() {
    try {
      const currentDate = moment().startOf('day');
      const users = await this.prismaService.user.findMany({
        where: {
          QuotationSettings: {
            some: {},
          },
        },
        include: {
          quotation: {
            where: {
              status: 'Draft',
            },
          },
          QuotationSettings: true,
        },
      });

      for (const user of users) {
        const quotationSettings = user.QuotationSettings[0];
        for (const quotation of user.quotation) {
          const dueDate = moment(quotation.expiry_at);
          const noticeDate = dueDate.subtract(
            quotationSettings.dueNotice,
            'days',
          );
          if (currentDate.isSame(noticeDate, 'day')) {
            const sendMailDto = {
              email: user.email,
              subject: 'Quotation Expiry Notice',
              body: `Dear ${user.name},<br><br>Your quotation will expiry at ${moment(quotation.expiry_at).format('YYYY-MM-DD')} is approaching its expiry date. Please take the necessary actions.<br><br>Best Regards,<br>Grow Global Strategies Pvt Ltd`,
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
