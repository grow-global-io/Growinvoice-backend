import { Module } from '@nestjs/common';
import { InvoicesettingsService } from './invoicesettings.service';
import { InvoicesettingsController } from './invoicesettings.controller';

@Module({
  controllers: [InvoicesettingsController],
  providers: [InvoicesettingsService],
})
export class InvoicesettingsModule {}
