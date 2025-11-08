import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { InvoicesettingsService } from '@/invoicesettings/invoicesettings.service';
import { MailService } from '@/mail/mail.service';
import { SharedService } from '@/shared/shared.service';

@Module({
  controllers: [InvoiceController],
  providers: [
    InvoiceService,
    InvoicesettingsService,
    MailService,
    SharedService,
  ],
  exports: [InvoiceService],
})
export class InvoiceModule {}
