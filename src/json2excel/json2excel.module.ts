import { Module } from '@nestjs/common';
import { Json2excelService } from './json2excel.service';
import { Json2excelController } from './json2excel.controller';

@Module({
  controllers: [Json2excelController],
  providers: [Json2excelService],
})
export class Json2excelModule {}
