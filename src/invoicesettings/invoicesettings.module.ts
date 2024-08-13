import { Module } from '@nestjs/common';
import { InvoicesettingsService } from './invoicesettings.service';
import { InvoicesettingsController } from './invoicesettings.controller';
import { PrismaService } from '@/prisma/prisma.service';
import { MailService } from '@/mail/mail.service';

@Module({
  controllers: [InvoicesettingsController],
  providers: [PrismaService, InvoicesettingsService, MailService],
  exports: [InvoicesettingsService],
})
export class InvoicesettingsModule {}
