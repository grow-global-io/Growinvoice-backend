import { ApiProperty } from '@nestjs/swagger';

export class ShippingAddressDto {
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
    type: 'string',
  })
  country_id: string;
  @ApiProperty({
    type: 'string',
  })
  zip: string;
}
