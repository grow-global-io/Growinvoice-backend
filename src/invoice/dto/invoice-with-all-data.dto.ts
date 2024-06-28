import { ApiProperty } from '@nestjs/swagger';
import { Invoice, InvoiceProducts } from '@shared/models';
import { Type } from 'class-transformer';

export class InvoiceWithAllDataDto extends Invoice {
  @Type(() => InvoiceProducts)
  product?: InvoiceProducts[];

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
