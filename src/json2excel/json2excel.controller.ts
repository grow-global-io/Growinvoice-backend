import { Controller, Post, Body, Res, Header } from '@nestjs/common';
import { Json2excelService } from './json2excel.service';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsPublic } from '@shared/decorators/public.decorator';
import { Response } from 'express';

@ApiTags('json2excel')
@Controller('json2excel')
export class Json2excelController {
  constructor(private readonly json2excelService: Json2excelService) {}

  @IsPublic()
  @Post()
  @ApiBody({ type: Object })
  @ApiResponse({ status: 201, description: 'Created', type: Object })
  async create(@Body() data: any, @Res() res: Response) {
    const buffer: any = await this.json2excelService.createXls(data);
    res.download(buffer);
  }

  @IsPublic()
  @Post('csv')
  @Header('Content-Type', 'text/csv')
  @ApiBody({ type: Object })
  @ApiResponse({ status: 201, description: 'Created', type: Object })
  async createCsv(@Body() data: any, @Res() res: Response) {
    const buffer: any = await this.json2excelService.createCsv(data);
    res.download(buffer);
  }
}
