import { Module } from '@nestjs/common';
import { ShiprocketService } from './shiprocket.service';
import { ShiprocketController } from './shiprocket.controller';

@Module({
  providers: [ShiprocketService],
  controllers: [ShiprocketController],
  exports: [ShiprocketService],
})
export class ShiprocketModule {}
