import {
  CurrenciesDto,
  HSNCode,
  ProductDto,
  ProductPriceBook,
  ProductUnitDto,
  TaxForProduct,
} from '@shared/models';
import { Type } from 'class-transformer';

export class ProductWithAllDataDto extends ProductDto {
  @Type(() => ProductUnitDto)
  unit?: ProductUnitDto;

  @Type(() => CurrenciesDto)
  currency?: CurrenciesDto;

  @Type(() => HSNCode)
  hsnCode?: HSNCode;

  @Type(() => TaxForProduct)
  tax?: TaxForProduct[];

  @Type(() => ProductPriceBook)
  priceBook?: ProductPriceBook[];
}
