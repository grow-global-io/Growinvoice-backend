import { ApiProperty } from '@nestjs/swagger';
import { Invoice } from './invoice.entity';
import { Product } from './product.entity';
import { Tax } from './tax.entity';
import { HSNCode } from './hSNCode.entity';

export class InvoiceProducts {
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
  invoice_id: string;
  @ApiProperty({
    type: () => Invoice,
    required: false,
  })
  invoice?: Invoice;
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
  quantity: number;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  tax_id: string | null;
  @ApiProperty({
    type: () => Tax,
    required: false,
    nullable: true,
  })
  tax?: Tax | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  hsnCode_id: string | null;
  @ApiProperty({
    type: () => HSNCode,
    required: false,
    nullable: true,
  })
  hsnCode?: HSNCode | null;
  @ApiProperty({
    type: 'number',
    format: 'float',
  })
  price: number;
  @ApiProperty({
    type: 'number',
    format: 'float',
  })
  total: number;
}
