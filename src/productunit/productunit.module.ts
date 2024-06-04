import { Module } from '@nestjs/common';
import { ProductunitService } from './productunit.service';
import { ProductunitController } from './productunit.controller';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  controllers: [ProductunitController],
  providers: [ProductunitService, PrismaService],
})
export class ProductunitModule {}
