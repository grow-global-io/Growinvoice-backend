import { ApiProperty } from '@nestjs/swagger';

export class InvoiceProductsDto {
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
    type: 'string',
  })
  product_id: string;
  @ApiProperty({
    type: 'number',
    format: 'float',
  })
  quantity: number;
  @ApiProperty({
    type: 'number',
    format: 'float',
  })
  tax: number;
  @ApiProperty({
    type: 'number',
    format: 'float',
  })
  hsnCode: number;
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
