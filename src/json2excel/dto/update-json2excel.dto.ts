import { PartialType } from '@nestjs/swagger';
import { CreateJson2excelDto } from './create-json2excel.dto';

export class UpdateJson2excelDto extends PartialType(CreateJson2excelDto) {}
