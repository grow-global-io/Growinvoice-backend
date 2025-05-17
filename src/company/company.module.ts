import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { PrismaService } from '@/prisma/prisma.service';
import { PaymentsModule } from '@/payments/payments.module';

@Module({
  imports: [PaymentsModule],
  controllers: [CompanyController],
  providers: [CompanyService, PrismaService],
})
export class CompanyModule {}
