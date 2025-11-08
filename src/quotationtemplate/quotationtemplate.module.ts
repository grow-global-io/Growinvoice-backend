import { Module } from '@nestjs/common';
import { QuotationtemplateService } from './quotationtemplate.service';
import { QuotationtemplateController } from './quotationtemplate.controller';

@Module({
  controllers: [QuotationtemplateController],
  providers: [QuotationtemplateService],
})
export class QuotationtemplateModule {}
