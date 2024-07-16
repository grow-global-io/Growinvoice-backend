import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Currencies } from './currencies.entity';
import { Company } from './company.entity';
import { Product } from './product.entity';
import { HSNCode } from './hSNCode.entity';
import { Tax } from './tax.entity';
import { ProductUnit } from './productUnit.entity';
import { Customer } from './customer.entity';
import { Invoice } from './invoice.entity';
import { PaymentDetails } from './paymentDetails.entity';
import { Quotation } from './quotation.entity';
import { InvoiceSettings } from './invoiceSettings.entity';
import { OpenAiHistory } from './openAiHistory.entity';
import { QuotationSettings } from './quotationSettings.entity';
import { Payments } from './payments.entity';
import { GateWayDetails } from './gateWayDetails.entity';
import { AIDashboard } from './aIDashboard.entity';
import { Notification } from './notification.entity';

export class User {
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
  email: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  name: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  phone: string | null;
  @ApiProperty({
    type: 'string',
  })
  password: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  resetToken: string | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  resetTokenExpiry: Date | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  currency_id: string | null;
  @ApiProperty({
    type: () => Currencies,
    required: false,
    nullable: true,
  })
  currency?: Currencies | null;
  @ApiHideProperty()
  company?: Company[];
  @ApiHideProperty()
  product?: Product[];
  @ApiHideProperty()
  hsnCode?: HSNCode[];
  @ApiHideProperty()
  tax?: Tax[];
  @ApiHideProperty()
  productUnit?: ProductUnit[];
  @ApiHideProperty()
  customer?: Customer[];
  @ApiHideProperty()
  invoice?: Invoice[];
  @ApiHideProperty()
  paymentDetails?: PaymentDetails[];
  @ApiHideProperty()
  quotation?: Quotation[];
  @ApiHideProperty()
  InvoiceSettings?: InvoiceSettings[];
  @ApiHideProperty()
  OpenAiHistory?: OpenAiHistory[];
  @ApiHideProperty()
  QuotationSettings?: QuotationSettings[];
  @ApiHideProperty()
  Payments?: Payments[];
  @ApiHideProperty()
  GateWayDetails?: GateWayDetails[];
  @ApiHideProperty()
  AIDashboard?: AIDashboard[];
  @ApiHideProperty()
  Notification?: Notification[];
}
