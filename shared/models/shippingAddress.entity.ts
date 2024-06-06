import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { State } from './state.entity';
import { Country } from './country.entity';
import { Customer } from './customer.entity';

export class ShippingAddress {
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
  address: string;
  @ApiProperty({
    type: 'string',
  })
  city: string;
  @ApiProperty({
    type: 'string',
  })
  state_id: string;
  @ApiProperty({
    type: () => State,
    required: false,
  })
  state?: State;
  @ApiProperty({
    type: 'string',
  })
  country_id: string;
  @ApiProperty({
    type: () => Country,
    required: false,
  })
  country?: Country;
  @ApiProperty({
    type: 'string',
  })
  zip: string;
  @ApiHideProperty()
  customer?: Customer[];
}
