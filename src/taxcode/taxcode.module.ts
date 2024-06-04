import { Module } from '@nestjs/common';
import { TaxcodeService } from './taxcode.service';
import { TaxcodeController } from './taxcode.controller';

@Module({
  controllers: [TaxcodeController],
  providers: [TaxcodeService],
})
export class TaxcodeModule {}
