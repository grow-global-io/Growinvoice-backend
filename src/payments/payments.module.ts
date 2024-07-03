import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PrismaService } from '@/prisma/prisma.service';
import { InvoiceService } from '@/invoice/invoice.service';
import { InvoicesettingsService } from '@/invoicesettings/invoicesettings.service';

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PrismaService,
    InvoiceService,
    InvoicesettingsService,
  ],
})
export class PaymentsModule {}
