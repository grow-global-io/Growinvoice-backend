import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { SharedService } from '@/shared/shared.service';

@Module({
  controllers: [ProductController],
  providers: [ProductService, SharedService],
})
export class ProductModule {}
