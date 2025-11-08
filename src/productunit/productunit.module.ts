import { Module } from '@nestjs/common';
import { ProductunitService } from './productunit.service';
import { ProductunitController } from './productunit.controller';
import { SharedService } from '@/shared/shared.service';

@Module({
  controllers: [ProductunitController],
  providers: [ProductunitService, SharedService],
})
export class ProductunitModule {}
