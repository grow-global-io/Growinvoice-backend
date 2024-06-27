import { ApiProperty } from '@nestjs/swagger';

export class InvoiceSettingsDto {
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
  user_id: string;
  @ApiProperty({
    type: 'string',
  })
  invoiceTemplateId: string;
  @ApiProperty({
    type: 'string',
  })
  invoicePrefix: string;
  @ApiProperty({
    type: 'boolean',
  })
  autoArchive: boolean;
  @ApiProperty({
    type: 'string',
  })
  footer: string;
  @ApiProperty({
    type: 'string',
  })
  notes: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  dueNotice: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  overDueNotice: number;
  @ApiProperty({
    type: 'string',
  })
  companyAddressTemplate: string;
  @ApiProperty({
    type: 'string',
  })
  customerBillingAddressTemplate: string;
  @ApiProperty({
    type: 'string',
  })
  customerShippingAddressTemplate: string;
}
