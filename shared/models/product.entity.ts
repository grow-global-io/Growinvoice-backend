import { ProductType } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { ProductUnit } from './productUnit.entity';
import { HSNCode } from './hSNCode.entity';
import { User } from './user.entity';
import { InvoiceProducts } from './invoiceProducts.entity';
import { QuotationProducts } from './quotationProducts.entity';
import { TaxForProduct } from './taxForProduct.entity';
import { ProductPriceBook } from './productPriceBook.entity';
import { Inventory } from './inventory.entity';

export class Product {
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
    isArray: true,
  })
  images: string[];
  @ApiProperty({
    type: 'string',
  })
  name: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  description: string | null;
  @ApiProperty({
    enum: ProductType,
  })
  type: ProductType;
  @ApiProperty({
    type: 'boolean',
  })
  includeStore: boolean;
  @ApiProperty({
    type: 'boolean',
  })
  includeQsr: boolean;
  @ApiProperty({
    type: 'string',
  })
  unit_id: string;
  @ApiProperty({
    type: () => ProductUnit,
    required: false,
  })
  unit?: ProductUnit;
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
    type: 'string',
  })
  user_id: string;
  @ApiProperty({
    type: () => User,
    required: false,
  })
  user?: User;
  @ApiHideProperty()
  invoice?: InvoiceProducts[];
  @ApiHideProperty()
  Quatation?: QuotationProducts[];
  @ApiHideProperty()
  tax?: TaxForProduct[];
  @ApiHideProperty()
  priceBook?: ProductPriceBook[];
  @ApiHideProperty()
  inventory?: Inventory | null;
}
