import { PartialType } from '@nestjs/swagger';
import { CreateProductunitDto } from './create-productunit.dto';

export class UpdateProductunitDto extends PartialType(CreateProductunitDto) {}
