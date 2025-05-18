import { Module } from '@nestjs/common';
import { SharedService } from './shared.service';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  providers: [SharedService, PrismaService],
  exports: [SharedService],
})
export class SharedModule {}
