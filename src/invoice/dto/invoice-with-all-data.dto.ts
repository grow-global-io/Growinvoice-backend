import { ProductWithAllDataDto } from '@/product/dto/product-with-allproperties.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import {
  Invoice,
  InvoiceProducts,
  TaxForInvoiceProducts,
} from '@shared/models';
import { Type } from 'class-transformer';

export class InvoiceProductWithAllDataDto extends OmitType(InvoiceProducts, [
  'product',
]) {
  @Type(() => ProductWithAllDataDto)
  product?: ProductWithAllDataDto;

  @Type(() => TaxForInvoiceProducts)
  tax_forInvoiceProducts?: TaxForInvoiceProducts[];
}

export class InvoiceWithAllDataDto extends OmitType(Invoice, ['product']) {
  @Type(() => InvoiceProductWithAllDataDto)
  product?: InvoiceProductWithAllDataDto[];

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
