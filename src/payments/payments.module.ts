import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PrismaService } from '@/prisma/prisma.service';
import { InvoiceService } from '@/invoice/invoice.service';
import { InvoicesettingsService } from '@/invoicesettings/invoicesettings.service';
import { PaymentdetailsService } from '@/paymentdetails/paymentdetails.service';
import { UserService } from '@/user/user.service';
import { MailService } from '@/mail/mail.service';
import { GatewaydetailsService } from '@/gatewaydetails/gatewaydetails.service';

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PrismaService,
    InvoiceService,
    InvoicesettingsService,
    PaymentdetailsService,
    UserService,
    MailService,
    GatewaydetailsService,
  ],
})
export class PaymentsModule {}
