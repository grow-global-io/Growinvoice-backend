import { InvoiceRecurring, paidStatus } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Customer } from './customer.entity';
import { User } from './user.entity';
import { PaymentDetails } from './paymentDetails.entity';
import { InvoiceProducts } from './invoiceProducts.entity';
import { Tax } from './tax.entity';
import { InvoiceTemplate } from './invoiceTemplate.entity';

export class Invoice {
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
  customer_id: string;
  @ApiProperty({
    type: () => Customer,
    required: false,
  })
  customer?: Customer;
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
  invoice_number: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  reference_number: string | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  date: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  due_date: Date;
  @ApiProperty({
    type: 'boolean',
  })
  is_recurring: boolean;
  @ApiProperty({
    enum: InvoiceRecurring,
    nullable: true,
  })
  recurring: InvoiceRecurring | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  paymentId: string | null;
  @ApiProperty({
    type: () => PaymentDetails,
    required: false,
    nullable: true,
  })
  payment?: PaymentDetails | null;
  @ApiHideProperty()
  product?: InvoiceProducts[];
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  notes: string | null;
  @ApiProperty({
    type: 'number',
    format: 'float',
  })
  sub_total: number;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  tax_id: string | null;
  @ApiProperty({
    type: () => Tax,
    required: false,
    nullable: true,
  })
  tax?: Tax | null;
  @ApiProperty({
    type: 'number',
    format: 'float',
    nullable: true,
  })
  discountPercentage: number | null;
  @ApiProperty({
    type: 'number',
    format: 'float',
  })
  total: number;
  @ApiProperty({
    enum: paidStatus,
  })
  paid_status: paidStatus;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  status: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  template_id: string | null;
  @ApiProperty({
    type: () => InvoiceTemplate,
    required: false,
    nullable: true,
  })
  template?: InvoiceTemplate | null;
}
