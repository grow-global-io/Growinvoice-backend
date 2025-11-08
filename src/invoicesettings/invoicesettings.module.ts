import { Module } from '@nestjs/common';
import { InvoicesettingsService } from './invoicesettings.service';
import { InvoicesettingsController } from './invoicesettings.controller';
import { MailService } from '@/mail/mail.service';

@Module({
  controllers: [InvoicesettingsController],
  providers: [InvoicesettingsService, MailService],
  exports: [InvoicesettingsService],
})
export class InvoicesettingsModule {}
