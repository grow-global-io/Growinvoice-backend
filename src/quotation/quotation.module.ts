import { Module } from '@nestjs/common';
import { QuotationService } from './quotation.service';
import { QuotationController } from './quotation.controller';
import { PrismaService } from '@/prisma/prisma.service';
import { QuotationsettingsService } from '@/quotationsettings/quotationsettings.service';

@Module({
  controllers: [QuotationController],
  providers: [QuotationService, PrismaService, QuotationsettingsService],
})
export class QuotationModule {}
