import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail/mail.service';
import { CompanyModule } from './company/company.module';
import { ProductModule } from './product/product.module';
import { ProductunitModule } from './productunit/productunit.module';
import { HsncodeModule } from './hsncode/hsncode.module';
import { TaxcodeModule } from './taxcode/taxcode.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TaskserviceService } from './taskservice/taskservice.service';
import { CurrencyModule } from './currency/currency.module';
import { CustomerModule } from './customer/customer.module';
import { UploadModule } from './upload/upload.module';
import { PaymentdetailsModule } from './paymentdetails/paymentdetails.module';
import { InvoiceModule } from './invoice/invoice.module';
import { QuotationModule } from './quotation/quotation.module';
import { MailController } from './mail/mail.controller';
import { InvoicetemplateModule } from './invoicetemplate/invoicetemplate.module';
import { InvoicesettingsModule } from './invoicesettings/invoicesettings.module';
import { OpenaiModule } from './openai/openai.module';
import { QuotationtemplateModule } from './quotationtemplate/quotationtemplate.module';
import { QuotationsettingsModule } from './quotationsettings/quotationsettings.module';
import { PaymentsModule } from './payments/payments.module';
import { DashboardsModule } from './dashboards/dashboards.module';
import { GatewaydetailsModule } from './gatewaydetails/gatewaydetails.module';
import { NotificationsModule } from './notifications/notifications.module';
import { Json2excelModule } from './json2excel/json2excel.module';
import { PlansModule } from './plans/plans.module';
import { UserplansModule } from './userplans/userplans.module';
import { VendorsModule } from './vendors/vendors.module';
import { ExpensesModule } from './expenses/expenses.module';
import { ReportsModule } from './reports/reports.module';
import { TestModule } from './test/test.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CompanyModule,
    ProductModule,
    ProductunitModule,
    HsncodeModule,
    TaxcodeModule,
    ScheduleModule.forRoot(),
    CurrencyModule,
    CustomerModule,
    UploadModule,
    PaymentdetailsModule,
    InvoiceModule,
    QuotationModule,
    InvoicetemplateModule,
    InvoicesettingsModule,
    OpenaiModule,
    QuotationtemplateModule,
    QuotationsettingsModule,
    PaymentsModule,
    DashboardsModule,
    GatewaydetailsModule,
    NotificationsModule,
    Json2excelModule,
    PlansModule,
    UserplansModule,
    VendorsModule,
    ExpensesModule,
    ReportsModule,
    TestModule,
  ],
  controllers: [MailController],
  providers: [MailService, TaskserviceService],
})
export class AppModule {}
