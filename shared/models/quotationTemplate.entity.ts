import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Quotation } from './quotation.entity';
import { QuotationSettings } from './quotationSettings.entity';

export class QuotationTemplate {
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
  quotation?: Quotation[];
  @ApiHideProperty()
  quotationSettings?: QuotationSettings[];
}
