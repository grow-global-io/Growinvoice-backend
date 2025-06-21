import { ApiProperty } from '@nestjs/swagger';
import { Product } from './product.entity';
import { Currencies } from './currencies.entity';

export class ProductPriceBook {
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
    type: 'number',
    format: 'float',
  })
  price: number;
  @ApiProperty({
    type: 'string',
  })
  currency_id: string;
  @ApiProperty({
    type: () => Currencies,
    required: false,
  })
  currency?: Currencies;
}
