import { PaymentType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class PaymentDetailsDto {
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
}
