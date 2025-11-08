import { Module } from '@nestjs/common';
import { HsncodeService } from './hsncode.service';
import { HsncodeController } from './hsncode.controller';
import { SharedService } from '@/shared/shared.service';

@Module({
  controllers: [HsncodeController],
  providers: [HsncodeService, SharedService],
})
export class HsncodeModule {}
