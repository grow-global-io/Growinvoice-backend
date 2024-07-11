import { Module } from '@nestjs/common';
import { PaymentdetailsService } from './paymentdetails.service';
import { PaymentdetailsController } from './paymentdetails.controller';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  controllers: [PaymentdetailsController],
  providers: [PaymentdetailsService, PrismaService],
  exports: [PaymentdetailsService],
})
export class PaymentdetailsModule {}
