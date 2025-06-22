import { ProductWithAllDataDto } from '@/product/dto/product-with-allproperties.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import {
  Quotation,
  QuotationProducts,
  TaxForQuotationProducts,
} from '@shared/models';
import { Type } from 'class-transformer';

export class QuotationProductsWithAllDataDto extends OmitType(
  QuotationProducts,
  ['product'],
) {
  @Type(() => ProductWithAllDataDto)
  product?: ProductWithAllDataDto;

  @Type(() => TaxForQuotationProducts)
  tax_forQuotationProducts?: TaxForQuotationProducts[];
}

export class QuotationWithAllDataDto extends Quotation {
  @Type(() => QuotationProductsWithAllDataDto)
  product?: QuotationProductsWithAllDataDto[];

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

export class QuotationTotalCountDto {
  @ApiProperty()
  total: number;
}
