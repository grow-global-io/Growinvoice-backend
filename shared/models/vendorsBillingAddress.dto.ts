import { ApiProperty } from '@nestjs/swagger';

export class VendorsBillingAddressDto {
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
    type: 'string',
    nullable: true,
  })
  country_id: string | null;
  @ApiProperty({
    type: 'string',
  })
  zip: string;
}
