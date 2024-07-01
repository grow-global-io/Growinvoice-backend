import { Module } from '@nestjs/common';
import { QuotationsettingsService } from './quotationsettings.service';
import { QuotationsettingsController } from './quotationsettings.controller';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  controllers: [QuotationsettingsController],
  providers: [QuotationsettingsService, PrismaService],
})
export class QuotationsettingsModule {}
