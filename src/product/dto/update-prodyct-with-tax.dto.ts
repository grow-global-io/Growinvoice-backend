import { ApiProperty } from '@nestjs/swagger';
import { CreateProductPriceBookDto, UpdateProductDto } from '@shared/models';

export class UpdateProductWithTaxDto extends UpdateProductDto {
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

  priceBook: CreateProductPriceBookDto[];
}
