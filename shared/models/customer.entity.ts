import { CustomerOption } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Currencies } from './currencies.entity';
import { BillingAddress } from './billingAddress.entity';
import { ShippingAddress } from './shippingAddress.entity';
import { User } from './user.entity';
import { Invoice } from './invoice.entity';
import { Quotation } from './quotation.entity';

export class Customer {
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
    type: 'boolean',
  })
  fromStore: boolean;
  @ApiProperty({
    type: 'string',
  })
  name: string;
  @ApiProperty({
    type: 'string',
  })
  display_name: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  email: string | null;
  @ApiProperty({
    type: 'string',
  })
  phone: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  website: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  gstIn: string | null;
  @ApiProperty({
    enum: CustomerOption,
  })
  option: CustomerOption;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  currencies_id: string | null;
  @ApiProperty({
    type: () => Currencies,
    required: false,
    nullable: true,
  })
  currencies?: Currencies | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  billingAddress_id: string | null;
  @ApiProperty({
    type: () => BillingAddress,
    required: false,
    nullable: true,
  })
  billingAddress?: BillingAddress | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  shippingAddress_id: string | null;
  @ApiProperty({
    type: () => ShippingAddress,
    required: false,
    nullable: true,
  })
  shippingAddress?: ShippingAddress | null;
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
  invoice?: Invoice[];
  @ApiHideProperty()
  Quatation?: Quotation[];
}
