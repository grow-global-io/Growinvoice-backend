import { Module } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { MailService } from '@/mail/mail.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [PrismaModule],
  controllers: [StoreController],
  providers: [StoreService, MailService, ConfigService],
})
export class StoreModule {}
