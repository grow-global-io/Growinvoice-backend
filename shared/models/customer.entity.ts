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
    type: 'string',
  })
  name: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  display_name: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  email: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  phone: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  website: string | null;
  @ApiProperty({
    enum: CustomerOption,
  })
  option: CustomerOption;
  @ApiProperty({
    type: 'string',
  })
  currencies_id: string;
  @ApiProperty({
    type: () => Currencies,
    required: false,
  })
  currencies?: Currencies;
  @ApiProperty({
    type: 'string',
  })
  billingAddress_id: string;
  @ApiProperty({
    type: () => BillingAddress,
    required: false,
  })
  billingAddress?: BillingAddress;
  @ApiProperty({
    type: 'string',
  })
  shippingAddress_id: string;
  @ApiProperty({
    type: () => ShippingAddress,
    required: false,
  })
  shippingAddress?: ShippingAddress;
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
