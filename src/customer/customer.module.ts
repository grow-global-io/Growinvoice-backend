import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { SharedService } from '@/shared/shared.service';

@Module({
  controllers: [CustomerController],
  providers: [CustomerService, SharedService],
})
export class CustomerModule {}
