import { ProductDto, ProductUnitDto } from '@shared/models';
import { Type } from 'class-transformer';

export class ProductWithAllDataDto extends ProductDto {
  @Type(() => ProductUnitDto)
  unit?: ProductUnitDto;
}
