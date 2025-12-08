import { forwardRef, Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { InvoicesettingsModule } from '@/invoicesettings/invoicesettings.module';
import { MailService } from '@/mail/mail.service';
import { SharedService } from '@/shared/shared.service';

@Module({
  imports: [forwardRef(() => InvoicesettingsModule)],
  controllers: [InvoiceController],
  providers: [InvoiceService, MailService, SharedService],
  exports: [InvoiceService],
})
export class InvoiceModule {}
