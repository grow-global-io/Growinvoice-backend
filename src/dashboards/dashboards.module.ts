import { Module } from '@nestjs/common';
import { DashboardsService } from './dashboards.service';
import { DashboardsController } from './dashboards.controller';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  controllers: [DashboardsController],
  providers: [DashboardsService, PrismaService],
  exports: [DashboardsService],
})
export class DashboardsModule {}
