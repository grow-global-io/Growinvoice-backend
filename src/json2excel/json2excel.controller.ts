import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { Json2excelService } from './json2excel.service';
import { CreateJson2excelDto } from './dto/create-json2excel.dto';
import { UpdateJson2excelDto } from './dto/update-json2excel.dto';

@Controller('json2excel')
export class Json2excelController {
  constructor(private readonly json2excelService: Json2excelService) {}

  @Post()
  create(@Body() createJson2excelDto: CreateJson2excelDto) {
    return this.json2excelService.create(createJson2excelDto);
  }

  @Get()
  findAll() {
    return this.json2excelService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.json2excelService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJson2excelDto: UpdateJson2excelDto) {
    return this.json2excelService.update(+id, updateJson2excelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.json2excelService.remove(+id);
  }
}
