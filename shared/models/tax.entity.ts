import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Product } from './product.entity';
import { Invoice } from './invoice.entity';
import { Quotation } from './quotation.entity';
import { HSNCode } from './hSNCode.entity';
import { InvoiceProducts } from './invoiceProducts.entity';

export class Tax {
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
    type: 'number',
    format: 'float',
  })
  percentage: number;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  description: string | null;
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
  Invoice?: Invoice[];
  @ApiHideProperty()
  Quatation?: Quotation[];
  @ApiHideProperty()
  hsnCode?: HSNCode[];
  @ApiHideProperty()
  InvoiceProducts?: InvoiceProducts[];
}
