import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { QuotationTemplate } from './quotationTemplate.entity';

export class QuotationSettings {
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
    type: () => User,
    required: false,
  })
  user?: User;
  @ApiProperty({
    type: 'string',
  })
  quotationTemplateId: string;
  @ApiProperty({
    type: () => QuotationTemplate,
    required: false,
  })
  quotationTemplate?: QuotationTemplate;
  @ApiProperty({
    type: 'string',
  })
  quotationPrefix: string;
  @ApiProperty({
    type: 'boolean',
  })
  autoArchive: boolean;
  @ApiProperty({
    type: 'boolean',
  })
  autoConvert: boolean;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  footer: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  notes: string | null;
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
