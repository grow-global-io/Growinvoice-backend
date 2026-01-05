import { Module } from '@nestjs/common';
import { QuotationService } from './quotation.service';
import { QuotationController } from './quotation.controller';
import { QuotationsettingsService } from '@/quotationsettings/quotationsettings.service';
import { MailService } from '@/mail/mail.service';
import { SharedService } from '@/shared/shared.service';
import { InvoiceModule } from '@/invoice/invoice.module';
import { InvoicesettingsModule } from '@/invoicesettings/invoicesettings.module';
import { InvoicetemplateService } from '@/invoicetemplate/invoicetemplate.service';

@Module({
  imports: [InvoiceModule, InvoicesettingsModule],
  controllers: [QuotationController],
  providers: [
    QuotationService,
    QuotationsettingsService,
    MailService,
    InvoicetemplateService,
    SharedService,
  ],
})
export class QuotationModule {}
