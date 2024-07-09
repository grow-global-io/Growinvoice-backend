import { Module } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { OpenaiController } from './openai.controller';
import { PrismaService } from '@/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { DashboardsService } from '@/dashboards/dashboards.service';

@Module({
  controllers: [OpenaiController],
  providers: [OpenaiService, PrismaService, ConfigService, DashboardsService],
})
export class OpenaiModule {}
