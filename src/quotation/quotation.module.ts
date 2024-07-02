import { Module } from '@nestjs/common';
import { QuotationService } from './quotation.service';
import { QuotationController } from './quotation.controller';
import { PrismaService } from '@/prisma/prisma.service';
import { QuotationsettingsService } from '@/quotationsettings/quotationsettings.service';
import { MailService } from '@/mail/mail.service';

@Module({
  controllers: [QuotationController],
  providers: [
    QuotationService,
    PrismaService,
    QuotationsettingsService,
    MailService,
  ],
})
export class QuotationModule {}
