import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { State } from './state.entity';
import { BillingAddress } from './billingAddress.entity';
import { ShippingAddress } from './shippingAddress.entity';
import { Company } from './company.entity';

export class Country {
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
  })
  code: string;
  @ApiProperty({
    type: 'string',
  })
  phone_code: string;
  @ApiHideProperty()
  state?: State[];
  @ApiHideProperty()
  BillingAddress?: BillingAddress[];
  @ApiHideProperty()
  ShippingAddress?: ShippingAddress[];
  @ApiHideProperty()
  Company?: Company[];
}
