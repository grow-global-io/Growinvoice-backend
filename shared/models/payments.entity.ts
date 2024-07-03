import { ApiProperty } from '@nestjs/swagger';
import { PaymentDetails } from './paymentDetails.entity';
import { User } from './user.entity';
import { Invoice } from './invoice.entity';

export class Payments {
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
    format: 'date-time',
  })
  paymentDate: Date;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  reference_number: string | null;
  @ApiProperty({
    type: 'number',
    format: 'float',
  })
  amount: number;
  @ApiProperty({
    type: 'string',
  })
  paymentDetails_id: string;
  @ApiProperty({
    type: () => PaymentDetails,
    required: false,
  })
  paymentDetails?: PaymentDetails;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  notes: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  private_notes: string | null;
  @ApiProperty({
    type: 'string',
  })
  user_id: string;
  @ApiProperty({
    type: () => User,
    required: false,
  })
  user?: User;
  @ApiProperty({
    type: 'string',
  })
  invoice_id: string;
  @ApiProperty({
    type: () => Invoice,
    required: false,
  })
  invoice?: Invoice;
}
