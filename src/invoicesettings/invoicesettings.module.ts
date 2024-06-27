import { Module } from '@nestjs/common';
import { InvoicesettingsService } from './invoicesettings.service';
import { InvoicesettingsController } from './invoicesettings.controller';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  controllers: [InvoicesettingsController],
  providers: [InvoicesettingsService, PrismaService],
  exports: [InvoicesettingsService],
})
export class InvoicesettingsModule {}
