import { Module } from '@nestjs/common';
import { QuotationService } from './quotation.service';
import { QuotationController } from './quotation.controller';
import { PrismaService } from '@/prisma/prisma.service';
import { QuotationsettingsService } from '@/quotationsettings/quotationsettings.service';
import { MailService } from '@/mail/mail.service';
import { InvoiceService } from '@/invoice/invoice.service';
import { InvoicesettingsService } from '@/invoicesettings/invoicesettings.service';
import { InvoicetemplateService } from '@/invoicetemplate/invoicetemplate.service';

@Module({
  controllers: [QuotationController],
  providers: [
    QuotationService,
    PrismaService,
    QuotationsettingsService,
    MailService,
    InvoiceService,
    InvoicesettingsService,
    InvoicetemplateService,
  ],
})
export class QuotationModule {}
