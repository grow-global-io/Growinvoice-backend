import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { PaymentsModule } from '@/payments/payments.module';

@Module({
  imports: [PaymentsModule],
  controllers: [CompanyController],
  providers: [CompanyService],
})
export class CompanyModule {}
