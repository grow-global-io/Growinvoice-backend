import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PrismaService } from '@/prisma/prisma.service';
import { SharedService } from '@/shared/shared.service';

@Module({
  controllers: [ProductController],
  providers: [ProductService, PrismaService, SharedService],
})
export class ProductModule {}
