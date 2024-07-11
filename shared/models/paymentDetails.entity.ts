import { PaymentType } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Invoice } from './invoice.entity';
import { Payments } from './payments.entity';

export class PaymentDetails {
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
    enum: PaymentType,
  })
  paymentType: PaymentType;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  ibanNumber: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  bicNumber: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  upiId: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  ifscCode: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  account_no: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  swiftCode: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  paypalId: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  stripeId: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  razorpayId: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  mollieId: string | null;
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
  invoice?: Invoice[];
  @ApiHideProperty()
  Payments?: Payments[];
  @ApiProperty({
    type: 'boolean',
  })
  enable: boolean;
}
