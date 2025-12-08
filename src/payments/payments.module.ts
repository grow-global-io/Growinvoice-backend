import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { UserModule } from '@/user/user.module';
import { InvoiceModule } from '@/invoice/invoice.module';
import { InvoicesettingsModule } from '@/invoicesettings/invoicesettings.module';
import { MailService } from '@/mail/mail.service';
import { GatewaydetailsService } from '@/gatewaydetails/gatewaydetails.service';
import { NotificationsService } from '@/notifications/notifications.service';
import { NotificationsGateway } from '@/notifications/notifications.gateway';
import { PlansService } from '@/plans/plans.service';
import { UserplansService } from '@/userplans/userplans.service';
import { SharedService } from '@/shared/shared.service';
//this is a test push
@Module({
  imports: [UserModule, InvoiceModule, InvoicesettingsModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
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
