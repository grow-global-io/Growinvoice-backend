import { Module } from '@nestjs/common';
import { GatewaydetailsService } from './gatewaydetails.service';
import { GatewaydetailsController } from './gatewaydetails.controller';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  controllers: [GatewaydetailsController],
  providers: [GatewaydetailsService, PrismaService],
  exports: [GatewaydetailsService],
})
export class GatewaydetailsModule {}
