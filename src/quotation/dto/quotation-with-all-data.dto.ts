import { ApiProperty } from '@nestjs/swagger';
import { Quotation, QuotationProducts } from '@shared/models';
import { Type } from 'class-transformer';

export class QuotationWithAllDataDto extends Quotation {
  @Type(() => QuotationProducts)
  product?: QuotationProducts[];

  @ApiProperty({
    nullable: true,
  })
  companyAddress?: string;

  @ApiProperty({
    nullable: true,
  })
  customerBillingAddress?: string;

  @ApiProperty({
    nullable: true,
  })
  customerShippingAddress?: string;
}
