import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Tax } from './tax.entity';
import { User } from './user.entity';
import { Product } from './product.entity';
import { InvoiceProducts } from './invoiceProducts.entity';
import { QuotationProducts } from './quotationProducts.entity';

export class HSNCode {
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
  code: string;
  @ApiProperty({
    type: 'string',
  })
  tax_id: string;
  @ApiProperty({
    type: () => Tax,
    required: false,
  })
  tax?: Tax;
  @ApiProperty({
    type: 'string',
  })
  user_id: string;
  @ApiProperty({
    type: () => User,
    required: false,
  })
  user?: User;
  @ApiHideProperty()
  Product?: Product[];
  @ApiHideProperty()
  InvoiceProducts?: InvoiceProducts[];
  @ApiHideProperty()
  QuotationProducts?: QuotationProducts[];
}
