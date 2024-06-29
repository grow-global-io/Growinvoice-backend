import { Module } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { OpenaiController } from './openai.controller';
import { PrismaService } from '@/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [OpenaiController],
  providers: [OpenaiService, PrismaService, ConfigService],
})
export class OpenaiModule {}
