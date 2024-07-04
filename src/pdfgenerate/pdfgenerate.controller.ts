import { Controller, Get, Res } from '@nestjs/common';
import { PdfgenerateService } from './pdfgenerate.service';
import { IsPublic } from '@shared/decorators/public.decorator';
import { Response } from 'express';

@Controller('pdfgenerate')
export class PdfgenerateController {
  constructor(private readonly pdfgenerateService: PdfgenerateService) {}

  @IsPublic()
  @Get('testhtml')
  async testhtml(@Res() res?: Response) {
    const pdf = await this.pdfgenerateService.createWithHtmlPdf(res);
    return pdf;
  }

  @IsPublic()
  @Get('testpuppeteer')
  async testpuppeteer(@Res() res?: Response) {
    const pdf = await this.pdfgenerateService.createPdfInOneFile();
    res.setHeader('Content-disposition', 'attachment; filename=chart.pdf');
    res.setHeader('Content-type', 'application/pdf');

    res.send(pdf);
  }
}
