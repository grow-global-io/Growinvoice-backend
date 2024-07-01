import { Module } from '@nestjs/common';
import { QuotationtemplateService } from './quotationtemplate.service';
import { QuotationtemplateController } from './quotationtemplate.controller';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  controllers: [QuotationtemplateController],
  providers: [QuotationtemplateService, PrismaService],
})
export class QuotationtemplateModule {}
