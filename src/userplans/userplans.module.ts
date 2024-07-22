import { Module } from '@nestjs/common';
import { UserplansService } from './userplans.service';
import { UserplansController } from './userplans.controller';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  controllers: [UserplansController],
  providers: [UserplansService, PrismaService],
})
export class UserplansModule {}
