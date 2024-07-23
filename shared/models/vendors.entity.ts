import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { VendorsBillingAddress } from './vendorsBillingAddress.entity';
import { User } from './user.entity';
import { Expenses } from './expenses.entity';

export class Vendors {
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
  display_name: string;
  @ApiProperty({
    type: 'string',
  })
  email: string;
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
    type: 'string',
  })
  billingAddress_id: string;
  @ApiProperty({
    type: () => VendorsBillingAddress,
    required: false,
  })
  billingAddress?: VendorsBillingAddress;
  @ApiProperty({
    type: 'string',
  })
  user_id: string;
  @ApiProperty({
    type: () => User,
    required: false,
  })
  user?: User;
  @ApiHideProperty()
  expenses?: Expenses[];
}
