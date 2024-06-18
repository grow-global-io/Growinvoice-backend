import { ApiProperty } from '@nestjs/swagger';

export class CompanyDto {
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
    nullable: true,
  })
  country_id: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  state_id: string | null;
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
}
