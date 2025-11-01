import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { State } from './state.entity';
import { Country } from './country.entity';
import { Customer } from './customer.entity';

export class BillingAddress {
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
    nullable: true,
  })
  state_id: string | null;
  @ApiProperty({
    type: () => State,
    required: false,
    nullable: true,
  })
  state?: State | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  state_name: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  country_id: string | null;
  @ApiProperty({
    type: () => Country,
    required: false,
    nullable: true,
  })
  country?: Country | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  country_name: string | null;
  @ApiProperty({
    type: 'string',
  })
  zip: string;
  @ApiHideProperty()
  customer?: Customer[];
}
