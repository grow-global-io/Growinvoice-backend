import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { PrismaService } from '@/prisma/prisma.service';
import { InvoicesettingsService } from '@/invoicesettings/invoicesettings.service';

@Module({
  controllers: [InvoiceController],
  providers: [InvoiceService, PrismaService, InvoicesettingsService],
})
export class InvoiceModule {}
