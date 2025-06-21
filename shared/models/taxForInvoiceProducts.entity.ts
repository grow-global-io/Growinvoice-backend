import { ApiProperty } from '@nestjs/swagger';
import { InvoiceProducts } from './invoiceProducts.entity';
import { Tax } from './tax.entity';

export class TaxForInvoiceProducts {
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
  invoiceProduct_id: string;
  @ApiProperty({
    type: () => InvoiceProducts,
    required: false,
  })
  invoiceProduct?: InvoiceProducts;
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
