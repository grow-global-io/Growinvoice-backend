import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Country } from './country.entity';
import { BillingAddress } from './billingAddress.entity';
import { ShippingAddress } from './shippingAddress.entity';

export class State {
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
  country_id: string;
  @ApiProperty({
    type: () => Country,
    required: false,
  })
  country?: Country;
  @ApiHideProperty()
  BillingAddress?: BillingAddress[];
  @ApiHideProperty()
  ShippingAddress?: ShippingAddress[];
}
