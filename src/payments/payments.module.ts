import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PrismaService } from '@/prisma/prisma.service';
import { InvoiceService } from '@/invoice/invoice.service';
import { InvoicesettingsService } from '@/invoicesettings/invoicesettings.service';
import { UserService } from '@/user/user.service';
import { MailService } from '@/mail/mail.service';
import { GatewaydetailsService } from '@/gatewaydetails/gatewaydetails.service';
import { NotificationsService } from '@/notifications/notifications.service';
import { NotificationsGateway } from '@/notifications/notifications.gateway';

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PrismaService,
    InvoiceService,
    InvoicesettingsService,
    UserService,
    MailService,
    GatewaydetailsService,
    NotificationsService,
    NotificationsGateway,
  ],
})
export class PaymentsModule {}
