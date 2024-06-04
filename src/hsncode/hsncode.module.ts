import { Module } from '@nestjs/common';
import { HsncodeService } from './hsncode.service';
import { HsncodeController } from './hsncode.controller';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  controllers: [HsncodeController],
  providers: [HsncodeService, PrismaService],
})
export class HsncodeModule {}
