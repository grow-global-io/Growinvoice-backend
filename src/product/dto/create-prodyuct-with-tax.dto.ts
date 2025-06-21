import { ApiProperty } from '@nestjs/swagger';
import { CreateProductDto } from '@shared/models';

export class CreateProductWithTaxDto extends CreateProductDto {
  @ApiProperty({
    type: String,
    description: 'List of tax id strings associated with the product',
    example: ['tax1', 'tax2'],
    required: false,
    isArray: true,
    default: [],
    nullable: true,
  })
  tax: string[];
}
