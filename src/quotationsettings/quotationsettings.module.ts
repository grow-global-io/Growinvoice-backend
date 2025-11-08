import { Module } from '@nestjs/common';
import { QuotationsettingsService } from './quotationsettings.service';
import { QuotationsettingsController } from './quotationsettings.controller';
import { MailService } from '@/mail/mail.service';

@Module({
  controllers: [QuotationsettingsController],
  providers: [QuotationsettingsService, MailService],
  exports: [QuotationsettingsService],
})
export class QuotationsettingsModule {}
