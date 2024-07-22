import { Controller, Post, Body } from '@nestjs/common';
import { Json2excelService } from './json2excel.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { IsPublic } from '@shared/decorators/public.decorator';

@ApiTags('json2excel')
@Controller('json2excel')
export class Json2excelController {
  constructor(private readonly json2excelService: Json2excelService) {}

  @IsPublic()
  @Post()
  @ApiBody({ type: Object })
  async create(@Body() data: any) {
    const buffer = await this.json2excelService.createXls(data);
    return buffer;
  }

  @IsPublic()
  @Post('csv')
  @ApiBody({ type: Object })
  async createCsv(@Body() data: any) {
    const buffer: any = await this.json2excelService.createCsv(data);
    return buffer;
  }
}
