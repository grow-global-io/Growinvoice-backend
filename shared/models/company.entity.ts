import { ApiProperty } from '@nestjs/swagger';
import { Country } from './country.entity';
import { State } from './state.entity';
import { User } from './user.entity';

export class Company {
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
  address: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  phone: string | null;
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
  state_id: string;
  @ApiProperty({
    type: () => State,
    required: false,
  })
  state?: State;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  city: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  zip: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  vat: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  logo: string | null;
  @ApiProperty({
    type: 'string',
  })
  user_id: string;
  @ApiProperty({
    type: () => User,
    required: false,
  })
  user?: User;
}
