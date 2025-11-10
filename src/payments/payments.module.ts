import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { InvoiceService } from '@/invoice/invoice.service';
import { InvoicesettingsService } from '@/invoicesettings/invoicesettings.service';
import { UserModule } from '@/user/user.module';
import { MailService } from '@/mail/mail.service';
import { GatewaydetailsService } from '@/gatewaydetails/gatewaydetails.service';
import { NotificationsService } from '@/notifications/notifications.service';
import { NotificationsGateway } from '@/notifications/notifications.gateway';
import { PlansService } from '@/plans/plans.service';
import { UserplansService } from '@/userplans/userplans.service';
import { SharedService } from '@/shared/shared.service';

@Module({
  imports: [UserModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    InvoiceService,
    InvoicesettingsService,
    MailService,
    GatewaydetailsService,
    NotificationsService,
    NotificationsGateway,
    PlansService,
    UserplansService,
    SharedService,
  ],
  exports: [PaymentsService, PaymentsModule],
})
export class PaymentsModule {}
