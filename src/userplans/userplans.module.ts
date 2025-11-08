import { Module } from '@nestjs/common';
import { UserplansService } from './userplans.service';
import { UserplansController } from './userplans.controller';

@Module({
  controllers: [UserplansController],
  providers: [UserplansService],
  exports: [UserplansService],
})
export class UserplansModule {}
