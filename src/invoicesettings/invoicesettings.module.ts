import { forwardRef, Module } from '@nestjs/common';
import { InvoiceModule } from '@/invoice/invoice.module';
import { InvoicesettingsService } from './invoicesettings.service';
import { InvoicesettingsController } from './invoicesettings.controller';
import { MailService } from '@/mail/mail.service';

@Module({
  imports: [forwardRef(() => InvoiceModule)],
  controllers: [InvoicesettingsController],
  providers: [InvoicesettingsService, MailService],
  exports: [InvoicesettingsService],
})
export class InvoicesettingsModule {}
