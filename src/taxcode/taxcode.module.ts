import { Module } from '@nestjs/common';
import { TaxcodeService } from './taxcode.service';
import { TaxcodeController } from './taxcode.controller';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  controllers: [TaxcodeController],
  providers: [TaxcodeService, PrismaService],
})
export class TaxcodeModule {}
