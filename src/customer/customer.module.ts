import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { PrismaService } from '@/prisma/prisma.service';
import { SharedService } from '@/shared/shared.service';

@Module({
  controllers: [CustomerController],
  providers: [CustomerService, PrismaService, SharedService],
})
export class CustomerModule {}
