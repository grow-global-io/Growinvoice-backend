import { Module } from '@nestjs/common';
import { QuotationsettingsService } from './quotationsettings.service';
import { QuotationsettingsController } from './quotationsettings.controller';
import { PrismaService } from '@/prisma/prisma.service';
import { MailService } from '@/mail/mail.service';

@Module({
  controllers: [QuotationsettingsController],
  providers: [QuotationsettingsService, PrismaService, MailService],
  exports: [QuotationsettingsService],
})
export class QuotationsettingsModule {}
