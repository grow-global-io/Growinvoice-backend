import { ApiProperty } from '@nestjs/swagger';
import { QuotationProducts } from './quotationProducts.entity';
import { Tax } from './tax.entity';

export class TaxForQuotationProducts {
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
  quotationProduct_id: string;
  @ApiProperty({
    type: () => QuotationProducts,
    required: false,
  })
  quotationProduct?: QuotationProducts;
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
