import { Module } from '@nestjs/common';
import { InvoicetemplateService } from './invoicetemplate.service';
import { InvoicetemplateController } from './invoicetemplate.controller';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  controllers: [InvoicetemplateController],
  providers: [InvoicetemplateService, PrismaService],
})
export class InvoicetemplateModule {}
