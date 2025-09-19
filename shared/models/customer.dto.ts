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
    type: 'boolean',
  })
  fromStore: boolean;
  @ApiProperty({
    type: 'string',
  })
  name: string;
  @ApiProperty({
    type: 'string',
  })
  display_name: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  email: string | null;
  @ApiProperty({
    type: 'string',
  })
  phone: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  website: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  gstIn: string | null;
  @ApiProperty({
    enum: CustomerOption,
  })
  option: CustomerOption;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  currencies_id: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  billingAddress_id: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  shippingAddress_id: string | null;
  @ApiProperty({
    type: 'string',
  })
  user_id: string;
}
