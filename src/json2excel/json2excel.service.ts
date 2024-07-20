import { Injectable } from '@nestjs/common';
import { CreateJson2excelDto } from './dto/create-json2excel.dto';
import { UpdateJson2excelDto } from './dto/update-json2excel.dto';

@Injectable()
export class Json2excelService {
  create(createJson2excelDto: CreateJson2excelDto) {
    return 'This action adds a new json2excel';
  }

  findAll() {
    return `This action returns all json2excel`;
  }

  findOne(id: number) {
    return `This action returns a #${id} json2excel`;
  }

  update(id: number, updateJson2excelDto: UpdateJson2excelDto) {
    return `This action updates a #${id} json2excel`;
  }

  remove(id: number) {
    return `This action removes a #${id} json2excel`;
  }
}
