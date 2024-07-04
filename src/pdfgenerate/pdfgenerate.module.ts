import { Module } from '@nestjs/common';
import { PdfgenerateService } from './pdfgenerate.service';
import { PdfgenerateController } from './pdfgenerate.controller';

@Module({
  imports: [],
  controllers: [PdfgenerateController],
  providers: [PdfgenerateService],
})
export class PdfgenerateModule {}
