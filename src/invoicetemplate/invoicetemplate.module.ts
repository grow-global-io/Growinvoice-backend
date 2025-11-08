import { Module } from '@nestjs/common';
import { InvoicetemplateService } from './invoicetemplate.service';
import { InvoicetemplateController } from './invoicetemplate.controller';

@Module({
  controllers: [InvoicetemplateController],
  providers: [InvoicetemplateService],
  exports: [InvoicetemplateService],
})
export class InvoicetemplateModule {}
