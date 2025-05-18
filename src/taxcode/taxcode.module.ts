import { Module } from '@nestjs/common';
import { TaxcodeService } from './taxcode.service';
import { TaxcodeController } from './taxcode.controller';
import { PrismaService } from '@/prisma/prisma.service';
import { SharedService } from '@/shared/shared.service';

@Module({
  controllers: [TaxcodeController],
  providers: [TaxcodeService, PrismaService, SharedService],
})
export class TaxcodeModule {}
