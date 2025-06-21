import {
  CurrenciesDto,
  ProductDto,
  ProductUnitDto,
  TaxForProduct,
} from '@shared/models';
import { Type } from 'class-transformer';

export class ProductWithAllDataDto extends ProductDto {
  @Type(() => ProductUnitDto)
  unit?: ProductUnitDto;

  @Type(() => CurrenciesDto)
  currency?: CurrenciesDto;

  @Type(() => TaxForProduct)
  tax?: TaxForProduct[];
}
