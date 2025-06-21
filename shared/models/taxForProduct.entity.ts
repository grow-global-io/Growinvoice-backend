import { ApiProperty } from '@nestjs/swagger';
import { Product } from './product.entity';
import { Tax } from './tax.entity';

export class TaxForProduct {
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  updatedAt: Date | null;
  @ApiProperty({
    type: 'boolean',
  })
  isExist: boolean;
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  product_id: string;
  @ApiProperty({
    type: () => Product,
    required: false,
  })
  product?: Product;
  @ApiProperty({
    type: 'string',
  })
  tax_id: string;
  @ApiProperty({
    type: () => Tax,
    required: false,
  })
  tax?: Tax;
}
