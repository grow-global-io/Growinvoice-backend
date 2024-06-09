import { CustomerOption } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CustomerDto {
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
    type: 'string',
  })
  billingAddress_id: string;
  @ApiProperty({
    type: 'string',
  })
  shippingAddress_id: string;
  @ApiProperty({
    type: 'string',
  })
  user_id: string;
}
