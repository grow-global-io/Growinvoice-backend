import { Module } from '@nestjs/common';
import { TaxcodeService } from './taxcode.service';
import { TaxcodeController } from './taxcode.controller';
import { SharedService } from '@/shared/shared.service';

@Module({
  controllers: [TaxcodeController],
  providers: [TaxcodeService, SharedService],
})
export class TaxcodeModule {}
