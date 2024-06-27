import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Invoice } from './invoice.entity';
import { InvoiceSettings } from './invoiceSettings.entity';

export class InvoiceTemplate {
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
  view: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  path: string | null;
  @ApiHideProperty()
  invoice?: Invoice[];
  @ApiHideProperty()
  InvoiceSettings?: InvoiceSettings[];
}
