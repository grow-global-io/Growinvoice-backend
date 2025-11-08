import { Module } from '@nestjs/common';
import { GatewaydetailsService } from './gatewaydetails.service';
import { GatewaydetailsController } from './gatewaydetails.controller';

@Module({
  controllers: [GatewaydetailsController],
  providers: [GatewaydetailsService],
  exports: [GatewaydetailsService],
})
export class GatewaydetailsModule {}
